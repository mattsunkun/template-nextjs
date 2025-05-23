import { sleep } from "@/utils/functions";
import { CardStatus, eCardArea, eWho } from "../clients/GameClient";
import { DeckCardBoardComponent } from "../components/boards/DeckCardBoardComponent";
import { CardComponent } from "../components/CardComponent";
import { spell } from "../spells/Spell";
import { AbstractSubManager, eTurnStatus } from "./AbstractSubManager";
import { PhaseManager } from "./PhaseManager";

export class MemoryPhaseManager extends AbstractSubManager {
    
    private pairAmount: number = 2;
    private selectedCardId: string[] = [];

    private isFirstTime:boolean = false;

    constructor(phaseManager: PhaseManager){
        super(phaseManager);
    }

    public async startPhaseAsync(){
        for(const isMyTurn of [
            this.phaseManager.isMeFirst, 
            !this.phaseManager.isMeFirst
        ]){
            this.isFirstTime = true;
            let turnStatus = eTurnStatus.AGAIN;
            while(turnStatus === eTurnStatus.AGAIN){
                turnStatus = await this.eachTurnAsync(isMyTurn);
            }
            if(turnStatus === eTurnStatus.END){
                break;
            }
        }
        await this.endPhaseAsync();
    }
    

    public async endPhaseAsync(){
        this.phaseManager.table.isInteractive = false;

        this.phaseManager.nextTurn();
    }

    protected async applyChooseAsync(idFrontBacks: string[], isMyTurn:boolean): Promise<eTurnStatus>{
        if(idFrontBacks.length !== 1){
            throw new Error("idFrontBacks.length !== 1");
        }
        const idFrontBack = idFrontBacks[0];
        // カードの情報を取得する。
        const cardAddInfo = await this.phaseManager.gameClient.fetchSpecificCardFullInfoAsync(idFrontBack);
        
        this.phaseManager.saveCardAddInfo(cardAddInfo);
        
        // カードを表にする
        const cardComponent = this.phaseManager.getCardComponent(idFrontBack);
        const place = {...cardComponent.place};
        place.cardStatus = CardStatus.FRONT;
        this.phaseManager.updateCardPlace(cardComponent.idFrontBack, place);

        this.selectedCardId.push(cardComponent.idFrontBack);
        // 2枚選択された場合
        if (this.selectedCardId.length === this.pairAmount) {    
            // 判定    
            const isMatch = await this.checkMatchAsync(isMyTurn);
            
            // 初回の場合、スペルデッキからカードを引く。
            if(this.isFirstTime && !isMatch){
                await this.drawDeckAsync(isMyTurn);
            }
            this.isFirstTime = false;
        
            // フェーズ終了判定
            if(this.checkPhaseDone()){
                return eTurnStatus.DONE;
            }else if(isMatch){
                return eTurnStatus.AGAIN;

            }else{
                return eTurnStatus.DONE;
            }
        }
        return eTurnStatus.AGAIN;
    }

    private _flag:number = 0;

    private async checkMatchAsync(isMe:boolean):Promise<boolean>{
        // カードの照合
        // 全てのカードコンポーネントに対して処理
        const selectedCards:CardComponent[] = this.selectedCardId.map(
            idFrontBack => this.phaseManager.getCardComponent(idFrontBack)
        );

        // マッチング判定のため少し待機
        await sleep(500);

        let isAgain = false;

        // 全てのカードのpair_idが同じか確認
        const firstPairId = selectedCards[0].addInfo.pair_id;

        //揃った時、
        if (selectedCards.every(card => card.addInfo.pair_id === firstPairId)) {
            isAgain = !selectedCards[0].addInfo.isSpellable;
            selectedCards.forEach(card => {
                // 場所を更新する。
                const place = {...card.place};
                if(isAgain){
                    
                    place.area = eCardArea.HAND;
                    place.cardStatus = CardStatus.STAND;
                    place.who = isMe ? eWho.MY : eWho.OPPONENT;
                    this.phaseManager.updateCardPlace(card.idFrontBack, place);
                }else{
                    if(card.addInfo.spell_id && 
                        ((place.who === eWho.MY) === isMe)){
                        spell(this.phaseManager, card.addInfo.spell_id);
                    }
                    place.area = eCardArea.TOMB;
                    place.cardStatus = CardStatus.VANISHED;
                    place.who = isMe ? eWho.MY : eWho.OPPONENT;
                    
                    this.phaseManager.updateCardPlace(card.idFrontBack, place);
                }
                place.position = this._flag++;

            });
        } else {
            // 全てのカードをbackに戻す
            selectedCards.forEach(card => {
                const place = {...card.place};
                place.cardStatus = CardStatus.BACK;
                this.phaseManager.updateCardPlace(card.idFrontBack, place);
            });
        }

        // 選択したカードをクリアする。
        this.selectedCardId = [];
        return isAgain;
    }

    private async drawDeckAsync(isMe:boolean){
        const deck = this.phaseManager.getBoardComponent(eCardArea.DECK, isMe ? eWho.MY : eWho.OPPONENT) as DeckCardBoardComponent;
        const idFrontBack = deck.getTopCardId();
        if(idFrontBack !== undefined){
            const cardAddInfo = await this.phaseManager.gameClient.fetchSpecificCardFullInfoAsync(idFrontBack);
                        // 敵のカードの情報が一瞬phaseManagerに格納されてしまう。。。
            this.phaseManager.saveCardAddInfo(cardAddInfo);


            this.phaseManager.updateCardPlace(idFrontBack, {
                area: eCardArea.HAND,
                who: (isMe) ? eWho.MY : eWho.OPPONENT,
                position: -1, 
                cardStatus: CardStatus.STAND
            });
        }else{
            console.log("deck is empty");
        }
        
    }

    private checkPhaseDone():boolean{
        return (this.phaseManager.table.getCardLength() <= this.pairAmount);
    }

    protected async myChooseAsync(): Promise<string[]>{
        // 自分のターンの場合は、カードクリックを待つ
        this.phaseManager.table.isInteractive = true;
        const card = await new Promise<CardComponent>((resolve) => {
            const clickHandler = (card: CardComponent) => {
                this.phaseManager.cardComponents.forEach(card => {
                    card.removeAllListeners('pointerdown');
                });
                resolve(card);
            };
            this.phaseManager.table.cardComponents
            .filter(card => card.place.cardStatus === CardStatus.BACK)
            .forEach(card => {
                card.once('pointerdown', () => clickHandler(card));
            });
        });
        const cardId = card.idFrontBack;
        this.phaseManager.table.isInteractive = false;
        return [cardId];
    }

    protected async opponentChooseAsync(): Promise<string[]>{
        // 相手のターンの場合は、カード情報を受信
        return [await this.phaseManager.gameClient.memoryGameClient.receiveOpponentCardFullInfoAsync()];
    }
}
