import { sleep, unexpectError } from "@/utils/functions";
import { tSize } from "@/utils/types";
import { eCardArea, eWho, tCardInfo } from "../clients/GameClient";
import { DeckCardBoardComponent } from "../components/boards/DeckCardBoardComponent";
import { TableCardBoardComponent } from "../components/boards/TableCardBoardComponent";
import { CardComponent, CardStatus } from "../components/CardComponent";
import { AbstractSubManager } from "./AbstractSubManager";
import { PhaseManager } from "./PhaseManager";


export class MemoryPhaseManager extends AbstractSubManager {
    private scene: Phaser.Scene;
    private phaseManager: PhaseManager;
    
    private table: TableCardBoardComponent;
    private myDeck: DeckCardBoardComponent;
    private opponentDeck: DeckCardBoardComponent;
    
    private pairAmount: number = 2;
    private selectedCardId: string[] = [];
    private cardSize: tSize;

    constructor(data: {phaseManager: PhaseManager}){
        super();
        this.scene = data.phaseManager.scene;
        this.phaseManager = data.phaseManager;

        // this.table = new Table(scene);

        this.cardSize = { width: 100, height: 150 };

        // 画面中央に盤面を配置
        const margin = 15;
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const tableWidth = 700;
        const tableHeight = 400;
        const tableX = (screenWidth - tableWidth) / 2;
        const tableY = (screenHeight - tableHeight) / 2 + 50; // 上部に余白を設ける

        const deckCardComponent = this.phaseManager.cardInfos
            .filter((cardPhase: tCardInfo) => cardPhase.place.area === eCardArea.DECK)
            .map((cardPhase: tCardInfo) => {
                const cardComponent = new CardComponent(this.scene, cardPhase, this.cardSize);
                // cardComponent.on('cardClicked', this.onCardClicked, this);
                return cardComponent;
            });

        const tableCardComponent = this.phaseManager.cardInfos
            .filter((cardPhase: tCardInfo) => cardPhase.place.area === eCardArea.TABLE)
            .map((cardPhase: tCardInfo) => {
                const cardComponent = new CardComponent(this.scene, cardPhase, this.cardSize);
                cardComponent.on('cardClicked', this.onCardClicked, this);
                return cardComponent;
            });

        this.table = new TableCardBoardComponent(this.scene, tableCardComponent, 4, 10, 10);

        // デッキの位置を画面中央に配置
        const deckX = screenWidth / 2;
        const myDeckY = screenHeight - 400; // 下部に配置
        const opponentDeckY = 400; // 上部に配置

        this.myDeck = new DeckCardBoardComponent(this.scene, deckX, myDeckY, deckCardComponent.filter(card => card.cardInfo.place.who === eWho.MY));
        this.opponentDeck = new DeckCardBoardComponent(this.scene, deckX, opponentDeckY, deckCardComponent.filter(card => card.cardInfo.place.who === eWho.OPPONENT));

    }

    private isMyFirstTime:boolean = false;
    private isOpponentFirstTime:boolean = false;

    public async startPhaseAsync(){
        this.table.setInteractive(this.phaseManager.isMyTurn);
        this.isMyFirstTime = true;
        this.isOpponentFirstTime = true;
        await this.eachTurn();
    }

    public updateVisualizer(){
        // this.table.updateVisualizer(this.phaseManager.cardInfos.filter(card => card.place.area === eCardArea.TABLE).map(card => new CardComponent(this.scene, card, this.cardSize)));
        // this.myDeck.updateVisualizer(this.phaseManager.cardInfos.filter(card => card.place.area === eCardArea.DECK && card.place.who === eWho.MY).map(card => new CardComponent(this.scene, card, this.cardSize)));
        // this.opponentDeck.updateVisualizer(this.phaseManager.cardInfos.filter(card => card.place.area === eCardArea.DECK && card.place.who === eWho.OPPONENT).map(card => new CardComponent(this.scene, card, this.cardSize)));
    }

    private async onCardClicked(cardComponent: CardComponent) {

        // 裏じゃないやつは選べない。
        if (cardComponent.status !== CardStatus.BACK) return;
        await this.flipAsync(cardComponent, true, true);
    }

    private async flipAsync(cardComponent: CardComponent, again:boolean, isMe:boolean){


        // カードの情報を取得する。
        const cardAddInfo = await this.phaseManager.gameClient.fetchSpecificCardFullInfoAsync(cardComponent.cardInfo.idFrontBack);
        if(cardAddInfo){
            cardComponent.cardAddInfo = cardAddInfo;
        }else{
            unexpectError("cardAddInfo is undefined");
        }

        // カードを表にする
        cardComponent.status = CardStatus.FRONT;

        this.selectedCardId.push(cardComponent.cardInfo.idFrontBack);

        // 2枚選択された場合
        if (this.selectedCardId.length === this.pairAmount) {

            // カードの照合
            // 全てのカードコンポーネントに対して処理
            const selectedCards = this.table.cardComponents.filter(card => 
                this.selectedCardId.includes(card.cardInfo.idFrontBack)
            );

            if (selectedCards) {
                // マッチング判定のため少し待機
                await sleep(500);

                let isMatch = false;

                // 全てのカードのpair_idが同じか確認
                const firstPairId = selectedCards[0].cardInfo.addInfo?.pair_id;

                if(firstPairId === undefined){
                    debugger;
                    unexpectError("firstPairId is undefined");
                }

                if (selectedCards.every(card => card.cardInfo.addInfo?.pair_id === firstPairId)) {
                    isMatch = true;
                    // 全てのカードをmatchedに変更
                    selectedCards.forEach(card => {
                        card.status = CardStatus.VANISHED;

                        console.warn("asyncで更新する。")
                        this.phaseManager.updateCardPlace(card.cardInfo.idFrontBack, {
                            area: eCardArea.HAND,
                            who: (this.phaseManager.isMyTurn) ? eWho.MY : eWho.OPPONENT,
                        });

                    });

                    // this.phaseManager.cssPhaseManager.setHandTable();

                } else {
                    // 全てのカードをbackに戻す
                    selectedCards.forEach(card => {
                        card.status = CardStatus.BACK;
                    });
                }

                if(isMe){
                    if(this.isMyFirstTime && !isMatch){
                        await this.drawDeckAsync(isMe);
                    }
                    this.isMyFirstTime = false;
                }else{
                    if(this.isOpponentFirstTime && !isMatch){
                        await this.drawDeckAsync(isMe);
                    }
                    this.isOpponentFirstTime = false;
                    
                }

                if(this.checkPhaseDone()){
                    return;
                }

                this.selectedCardId = [];

                if(isMatch && again){
                    return await this.eachTurn();
                }else{
                    this.nextTurn();
                }

            }else{
                unexpectError("selectedCards is undefined");
            }

        

        }else{
            // まだ１枚しか選択してない
        }
    }

    private async drawDeckAsync(isMe:boolean){
        const deck = isMe ? this.myDeck : this.opponentDeck;
        const card = deck.removeTopCard();
        if(card){
            card.cardInfo.addInfo = await this.phaseManager.gameClient.fetchSpecificCardFullInfoAsync(card.cardInfo.idFrontBack);

            card.status = CardStatus.VANISHED;
            this.phaseManager.updateCardPlace(card.cardInfo.idFrontBack, {
                area: eCardArea.HAND,
                who: (isMe) ? eWho.MY : eWho.OPPONENT,
            });
        }else{
            unexpectError("card is undefined");
        }
        
    }

    private async nextTurn(){
       if(this.phaseManager.nextTurn()){
            await this.startPhaseAsync();
       }
    }

    private checkPhaseDone():boolean{
        const memoryGameCards = this.phaseManager.cardInfos.filter(card => 
            card.place.area === eCardArea.TABLE
        );
        if(memoryGameCards.length <= 2) {
            this.phaseManager.nextPhase();
            return true;
        }else{
            return false;
        }
    }

    public async endPhaseAsync(){
        this.table.setInteractive(false);
    }

    public async eachTurn(){
    
        if(this.phaseManager.isMyTurn) {

        }else{

            for(let i = 0; i < this.pairAmount; i++){

                const cardFullInfo = await this.phaseManager.gameClient.memoryGameClient.receiveOpponentCardFullInfoAsync();
                if(cardFullInfo) {
                    const targetCard = this.table.cardComponents.find(card => card.cardInfo.idFrontBack === cardFullInfo.idFrontBack);
                    if(targetCard){
                        await this.flipAsync(targetCard, true, false);
                    }else{
                        unexpectError("targetCard is undefined");
                    }
                }else{
                    debugger;
                    unexpectError("cardFullInfo is undefined");
                }
            }
        }
    }
    
    // // ゲーム終了判定
    // public isGameComplete(): boolean {
    //     return this.memoryCardComponents.every(card => !card.visible);
    // }
}
