import { numNull } from "@/utils/const";
import { CardStatus, eCardArea, eWho, tCardAddInfo } from "../clients/GameClient";
import { CardComponent } from "../components/CardComponent";
import { spell } from "../spells/Spell";
import { AbstractSubManager, eTurnStatus } from "./AbstractSubManager";
import { PhaseManager } from "./PhaseManager";

enum eCSSPhase {
    COST = "COST-Phase",
    SUMMON = "SUMMON-Phase",
    SPELL = "SPELL-Phase",
}

export class CSSPhaseManager extends AbstractSubManager {
    private nextButton: Phaser.GameObjects.Text;

    private _phase: eCSSPhase;
    private _selectedIdFrontBacks: string[] = [];

    private get costSign(): number {
        return (this.phase === eCSSPhase.COST) ? 1 : -1;
    }

    
    private get phase(): eCSSPhase {
        return this._phase;
    }

    private set phase(newPhase: eCSSPhase) {
        this._phase = newPhase;
        this.nextButton.setText(`Finish: ${this.phase}`);
        this._phase = newPhase;
    }

    protected async opponentChooseAsync(): Promise<string[]> {
        let opponentCards: tCardAddInfo[] = [];
        switch(this.phase){
            case eCSSPhase.COST:
                opponentCards = await this.phaseManager.gameClient.cssGameClient.fetchOpponentCostCardsAsync();
                break;
            case eCSSPhase.SUMMON:
                opponentCards = await this.phaseManager.gameClient.cssGameClient.fetchOpponentSummonCardsAsync();
                break;
            case eCSSPhase.SPELL:
                opponentCards = await this.phaseManager.gameClient.cssGameClient.fetchOpponentSpellCardsAsync();
                break;
        }
        // this.setSelectedIdFrontBacks(opponentCards.map(card => card.idFrontBack), false);
        opponentCards.forEach(card => {
            this.selectCard(this.phaseManager.getCardComponent(card.idFrontBack), false);
        });
        return this.selectedIdFrontBacks;
            
    }

    protected async applyChooseAsync(idFrontBacks: string[], isMyTurn:boolean): Promise<eTurnStatus>{
        console.log(idFrontBacks, isMyTurn)
        // debugger
        // const hand = isMyTurn ? this.phaseManager.myHand : this.phaseManager.opponentHand;
        const costLabel = this.phaseManager.getCostLabel(isMyTurn);
        for(const idFrontBack of idFrontBacks){
            
            console.log(idFrontBack)
            const addInfo = this.phaseManager.getCardComponent(idFrontBack).addInfo;
            // コスト消費
            costLabel.applyPartialCostChange(addInfo.cost);
            // 呪文の効果発動
            const spellId = addInfo.spell_id;
            if(spellId){
                await spell(this.phaseManager, spellId);
            }

            // カードの移動
            const cardArea = this.phase === eCSSPhase.SUMMON ?
                eCardArea.SUMMON : 
                eCardArea.TOMB;
            const cardStatus = this.phase === eCSSPhase.SUMMON ? 
                CardStatus.FRONT : 
                CardStatus.VANISHED
            // const cardArea = eCardArea.TABLE;
            // const cardStatus = CardStatus.STAND;
                const position = this.phaseManager.getBoardComponent(cardArea, isMyTurn ? eWho.MY : eWho.OPPONENT).getLeastPosition()
                console.log(position)
            this.phaseManager.updateCardPlace(
                idFrontBack, {
                    area: cardArea,
                    who: isMyTurn ? eWho.MY : eWho.OPPONENT, 
                    position: position,
                    cardStatus: cardStatus,
                }
            );
            this.deselectCard(this.phaseManager.getCardComponent(idFrontBack));
        }

       return eTurnStatus.DONE;
    }


    private async handleNextClickAsync(): Promise<void> {


    }
    
    private get selectedIdFrontBacks(): string[] {
        return this._selectedIdFrontBacks;
    }

    private setSelectedIdFrontBacks(newIdFrontBacks: string[], isMe: boolean) {
      
        this.phaseManager.getCostLabel(isMe).setCostChange(0);

        this._selectedIdFrontBacks = newIdFrontBacks
        this.phaseManager.getCostLabel(isMe).setCostChange(this.costSign * this.selectedIdFrontBacks.reduce((sum, idFrontBack) => sum + (this.phaseManager.getCardComponent(idFrontBack).addInfo.cost), 0));
    }


    constructor(phaseManager: PhaseManager) {
        super(phaseManager);
        
        this.createNextButton();
        this._phase = eCSSPhase.COST;
    }

    createNextButton(){
        this.nextButton = this.phaseManager.scene.add.text(
            this.phaseManager.scene.scale.width / 2, 
            this.phaseManager.scene.scale.height / 2 + 300, 
            'Next', {
                fontSize: 32,
                fontFamily: 'Arial',
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: {
                    left: 10,
                    right: 10,
                    top: 5,
                    bottom: 5
                }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', this.handleNextClickAsync, this)
        .on('pointerover', () => this.nextButton.setAlpha(0.5))
        .on('pointerout', () => this.nextButton.setAlpha(1.0));

        this.nextButton.setVisible(false);
    }

    async startPhaseAsync(){
        let turnStatus = eTurnStatus.AGAIN;
        for(const phase of [
            eCSSPhase.COST,
            eCSSPhase.SUMMON,
            eCSSPhase.SPELL,
            ]){
            this.phase = phase;
            for(const isMyTurn of [
                this.phaseManager.isMeFirst, 
                !this.phaseManager.isMeFirst
            ]){

                turnStatus = eTurnStatus.AGAIN;
                while(turnStatus === eTurnStatus.AGAIN){
                    turnStatus = await this.eachTurnAsync(isMyTurn);
                }
                if(turnStatus === eTurnStatus.END){
                    break;
                }
            }
            if(turnStatus === eTurnStatus.END){
                break;
            }
        }

        await this.endPhaseAsync();
    }

    protected async myChooseAsync(): Promise<string[]>{
        const isMe = true;
        this.nextButton.setVisible(true);
        this.phaseManager.hand.get(isMe).isInteractive = true;

        // 自分のカードだけ設定する。
        this.phaseManager.hand.get(isMe).cardComponents.forEach(card => {
            card.removeAllListeners('pointerdown');
            card.on('pointerdown', () => this.handleCardClick(card));
        });

        await new Promise<void>((resolve) => {
            const clickHandler = () => {
                resolve();
            };
            this.nextButton.once('pointerdown', () => clickHandler());
        });


        // 全部のカードから消す
        this.phaseManager.cardComponents.forEach(card => {
            card.removeAllListeners('pointerdown');
        });

        this.nextButton.setVisible(false);
        this.phaseManager.hand.get(isMe).isInteractive = false;
        return this.selectedIdFrontBacks;
        
    }

    async endPhaseAsync(){
        this.nextButton.setVisible(false);
        const isMe = true;
        this.phaseManager.hand.get(isMe).isInteractive = false;
        this.phaseManager.nextTurn();

    }

    private isSelectOk(card: CardComponent): boolean {
        if(this.phase === eCSSPhase.SUMMON && (card.addInfo.nowAttack ?? numNull()) <= 0){
            return false;
        }
        if(this.phase === eCSSPhase.SPELL && !card.addInfo.isSpellable){
            return false;
        }
        switch(this.phase){
            case eCSSPhase.COST:
                return (this.selectedIdFrontBacks.length === 0)
            case eCSSPhase.SUMMON:
            case eCSSPhase.SPELL:
                const totalCost = this.selectedIdFrontBacks.reduce((sum, idFrontBack) => sum + (this.phaseManager.getCardComponent(idFrontBack).addInfo.cost), 0);
                const newTotalCost = totalCost + (card.addInfo.cost);
                return (0<= this.phaseManager.costLabel.get(true).cost + this.costSign*newTotalCost);
            
        }
    }

    private handleCardClick(card: CardComponent): void {
        const index = this.selectedIdFrontBacks.indexOf(card.idFrontBack);
        
        if (index !== -1) {
            // カードが既に選択されている場合は選択解除
            this.deselectCard(card);
        } else {
            // 新しいカードを選択
            if (this.isSelectOk(card)) {
                this.selectCard(card, true);
            }
        }
    }


    private selectCard(card: CardComponent, isMe: boolean): void {
        this.setSelectedIdFrontBacks([...this.selectedIdFrontBacks, card.idFrontBack], isMe);
        // カードを少し上に移動
        card.setY(card.y - 20);
        // 選択状態の視覚的フィードバック

        card.setTint(0xffff00);
        // コストの変化を追加
    }

    private deselectCard(card: CardComponent): void {
        const index = this.selectedIdFrontBacks.indexOf(card.idFrontBack);
        if (index !== -1) {
            this.setSelectedIdFrontBacks(this.selectedIdFrontBacks.filter(id => id !== card.idFrontBack), this.phaseManager.isMeFirst);
            // カードを元の位置に戻す
            card.setY(card.y + 20);
            // 選択状態の解除
            card.clearTint();
        }else{
            throw Error("deselect card index is -1")
        }
    }
}
