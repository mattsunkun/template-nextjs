import { sleep, unexpectError } from "@/utils/functions";
import { GameClient } from "../clients/GameClient";
import { MemoryCardComponent, MemoryCardStatus } from "../components/memory/MemoryCardComponent";
import { MemoryCardTableComponent } from "../components/memory/MemoryCardTableComponent";
import { SpellCardDeckComponent } from "../components/memory/SpellCardDeckComponent";
import { eGamePhase, eWho, PhaseManager, tCardPhase } from "./PhaseManager";


export class MemoryPhaseManager {
    private scene: Phaser.Scene;
    private memoryCardComponents: MemoryCardComponent[];
    private spellCardComponents: MemoryCardComponent[];
    private table: MemoryCardTableComponent;
    
    private pairAmount: number = 2;
    private selectedCardId: string[] = [];
    private gameClient: GameClient;
    private phaseManager: PhaseManager;
    private mySpellCardDeck: SpellCardDeckComponent;
    private opponentSpellCardDeck: SpellCardDeckComponent;

    constructor(data: {phaseManager: PhaseManager}){
        this.scene = data.phaseManager.scene;
        this.gameClient = data.phaseManager.gameClient;
        this.phaseManager = data.phaseManager;

        // this.table = new Table(scene);

        const cardSize = { width: 100, height: 150 };
        // カードの状態を初期化
        this.memoryCardComponents = data.phaseManager.cardPhases
            .filter((cardPhase: tCardPhase) => cardPhase.status === eGamePhase.MEMORY_GAME)
            .map((cardPhase: tCardPhase) => {
                const cardComponent = new MemoryCardComponent(this.scene, cardSize, cardPhase.info.cardKnownInfo, cardPhase.info.cardFullInfo, cardPhase.info.cardKnownInfo.debug?.pair_id.toString() ?? "");
                cardComponent.on('cardClicked', this.onCardClicked, this);
                return cardComponent;
            });

        this.spellCardComponents = data.phaseManager.spellCardPhases
            .filter((cardPhase: tCardPhase) => cardPhase.status === eGamePhase.MEMORY_GAME)
            .map((cardPhase: tCardPhase) => {
                const cardComponent = new MemoryCardComponent(this.scene, cardSize, cardPhase.info.cardKnownInfo, cardPhase.info.cardFullInfo, cardPhase.info.cardKnownInfo.debug?.spell_id?.toString() ?? "");
                cardComponent.setInteractive(false);
                return cardComponent;
            });

        // 画面中央に盤面を配置
        const margin = 15;
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const tableWidth = 700;
        const tableHeight = 400;
        const tableX = (screenWidth - tableWidth) / 2;
        const tableY = (screenHeight - tableHeight) / 2 + 50; // 上部に余白を設ける

        

        this.table = new MemoryCardTableComponent(this.scene, this.memoryCardComponents, 4, 10, 10);

        // デッキの位置を画面中央に配置
        const deckX = screenWidth / 2;
        const myDeckY = screenHeight - 400; // 下部に配置
        const opponentDeckY = 400; // 上部に配置

        this.mySpellCardDeck = new SpellCardDeckComponent(this.scene, deckX, myDeckY, this.spellCardComponents.filter(card => card.cardKnownInfo.isMyCard));
        this.opponentSpellCardDeck = new SpellCardDeckComponent(this.scene, deckX, opponentDeckY, this.spellCardComponents.filter(card => !card.cardKnownInfo.isMyCard));

    }

    private isMyFirstTime:boolean = false;
    private isOpponentFirstTime:boolean = false;

    public startPhase(){
        this.table.setInteractive(this.phaseManager.isMyTurn);
        this.isMyFirstTime = true;
        this.isOpponentFirstTime = true;
        this.eachTurn();
    }

    private async onCardClicked(cardComponent: MemoryCardComponent) {

        // 裏じゃないやつは選べない。
        if (cardComponent.status !== MemoryCardStatus.BACK) return;
        await this.flipAsync(cardComponent, true, true);
    }

    private async flipAsync(cardComponent: MemoryCardComponent, again:boolean, isMe:boolean){


        // カードの情報を取得する。
        cardComponent.cardFullInfo = await this.gameClient.fetchSpecificCardFullInfo(cardComponent.cardKnownInfo.idFrontBack);

        // カードを表にする
        cardComponent.status = MemoryCardStatus.FRONT;

        this.selectedCardId.push(cardComponent.cardKnownInfo.idFrontBack);

        // 2枚選択された場合
        if (this.selectedCardId.length === this.pairAmount) {

            // カードの照合
            // 全てのカードコンポーネントに対して処理
            const selectedCards = this.memoryCardComponents.filter(card => 
                this.selectedCardId.includes(card.cardKnownInfo.idFrontBack)
            );

            if (selectedCards) {
                // マッチング判定のため少し待機
                await sleep(500);

                let isMatch = false;

                // 全てのカードのpair_idが同じか確認
                const firstPairId = selectedCards[0].cardFullInfo?.pair_id;

                if (selectedCards.every(card => card.cardFullInfo?.pair_id === firstPairId)) {
                    isMatch = true;
                    // 全てのカードをmatchedに変更
                    selectedCards.forEach(card => {
                        card.status = MemoryCardStatus.MATCHED;

                        this.phaseManager.updateCardPhase(card.cardKnownInfo.idFrontBack, this.phaseManager.isMyTurn ? eWho.MY : eWho.OPPONENT, eGamePhase.COST_SUMMON_SPELL, card.cardFullInfo);
                    });

                    this.phaseManager.cssPhaseManager.setHandTable();
                } else {
                    // 全てのカードをbackに戻す
                    selectedCards.forEach(card => {
                        card.status = MemoryCardStatus.BACK;
                    });
                }

                if(isMe){
                    if(this.isMyFirstTime && !isMatch){
                        await this.drawSpellAsync(isMe);
                    }
                    this.isMyFirstTime = false;
                }else{
                    if(this.isOpponentFirstTime && !isMatch){
                        await this.drawSpellAsync(isMe);
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

    private async drawSpellAsync(isMe:boolean){
        if(isMe){
            const spell = this.mySpellCardDeck.removeTopCard();
            if(spell){
                spell.cardFullInfo = await this.gameClient.fetchSpecificCardFullInfo(spell.cardKnownInfo.idFrontBack);

                spell.status = MemoryCardStatus.MATCHED;
                this.phaseManager.updateCardPhase(spell.cardKnownInfo.idFrontBack, eWho.MY, eGamePhase.COST_SUMMON_SPELL, spell.cardFullInfo);
            }else{
                console.log("spell is undefined");
            }
        }else{
            const spell = this.opponentSpellCardDeck.removeTopCard();
            if(spell){
                spell.cardFullInfo = await this.gameClient.fetchSpecificCardFullInfo(spell.cardKnownInfo.idFrontBack);
                
                spell.status = MemoryCardStatus.MATCHED;
                this.phaseManager.updateCardPhase(spell.cardKnownInfo.idFrontBack, eWho.OPPONENT, eGamePhase.COST_SUMMON_SPELL, spell.cardFullInfo);
            }else{
                console.log("spell is undefined");
            }
        }
        this.phaseManager.cssPhaseManager.setHandTable();
    }

    private async nextTurn(){
       if(this.phaseManager.nextTurn()){
            this.startPhase();
       }
    }

    private checkPhaseDone():boolean{
        const memoryGameCards = this.phaseManager.cardPhases.filter(phase => 
            phase.status === eGamePhase.MEMORY_GAME
        );
        if(memoryGameCards.length <= 2) {
            this.phaseManager.nextPhase();
            return true;
        }else{
            return false;
        }
    }

    public endPhase(){
        this.table.setInteractive(false);
    }

    public async eachTurn(){
    
        if(this.phaseManager.isMyTurn) {

        }else{

            for(let i = 0; i < this.pairAmount; i++){

                const cardFullInfo = await this.gameClient.receiveOpponentCardFullInfo(this.phaseManager.cardPhases);
                if(cardFullInfo) {
                    const targetCard = this.memoryCardComponents.find(card => card.cardKnownInfo.idFrontBack === cardFullInfo.idFrontBack);
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
