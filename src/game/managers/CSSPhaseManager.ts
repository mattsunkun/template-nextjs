import { unexpectError } from "@/utils/functions";
import { eCardArea, eWho, tCardAddInfo } from "../clients/GameClient";
import { CardComponent } from "../components/CardComponent";
import { spell } from "../spells/Spell";
import { AbstractSubManager, eTurnStatus } from "./AbstractSubManager";
import { PhaseManager } from "./PhaseManager";

enum eCSSPhase {
    COST = "COST-Phase",
    SUMMON = "SUMMON-Phase",
    SPELL = "SPELL-Phase",
    END = "END-Phase"
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
        return opponentCards.map(card => card.idFrontBack);
            
    }

    protected async applyChooseAsync(idFrontBacks: string[], isMyTurn:boolean): Promise<eTurnStatus>{
        // const hand = isMyTurn ? this.phaseManager.myHand : this.phaseManager.opponentHand;
        const costLabel = this.phaseManager.getCostLabel(isMyTurn);
        for(const idFrontBack of idFrontBacks){
            const addInfo = this.phaseManager.getCardComponent(idFrontBack).cardAddInfo;
            // コスト消費
            costLabel.applyPartialCostChange(addInfo.cost);
            // 呪文の効果発動
            const spellId = addInfo.spell_id;
            if(spellId){
                await spell(this.phaseManager, spellId);
            }

            // カードの移動
            this.phaseManager.updateCardPlace(
                idFrontBack, {
                    area: this.phase === eCSSPhase.SUMMON ?
                     eCardArea.SUMMON : 
                     eCardArea.TOMB, 
                    who: isMyTurn ? eWho.MY : eWho.OPPONENT, 
                    position: this.phaseManager.myHand.length
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

    private set selectedIdFrontBacks(newIdFrontBacks: string[]) {
        console.log(this.costSign, this.phase)
        this.phaseManager.getCostLabel(this.phaseManager.isMeFirst).addCostChange(-this.costSign * this._selectedIdFrontBacks.reduce((sum, idFrontBack) => sum + (this.phaseManager.getCardComponent(idFrontBack).cardAddInfo.cost), 0));

        this._selectedIdFrontBacks = newIdFrontBacks
        this.phaseManager.myCostLabel.addCostChange(+this.costSign * this._selectedIdFrontBacks.reduce((sum, idFrontBack) => sum + (this.phaseManager.getCardComponent(idFrontBack).cardAddInfo.cost), 0));
    }


    constructor(phaseManager: PhaseManager) {
        super(phaseManager);
        
        this.createNextButton();
        this._phase = eCSSPhase.END;
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

                let turnStatus = eTurnStatus.AGAIN;
                while(turnStatus === eTurnStatus.AGAIN){
                    turnStatus = await this.eachTurnAsync(isMyTurn);
                }
                if(turnStatus === eTurnStatus.DONE){
                    await this.endPhaseAsync();
                }
            }
        }
    }

    protected async myChooseAsync(): Promise<string[]>{
        this.nextButton.setVisible(true);
        this.phaseManager.myHand.isInteractive = true;

        // 自分のカードだけ設定する。
        this.phaseManager.cardComponents.forEach(card => {
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
        this.phaseManager.myHand.isInteractive = false;
        return this.selectedIdFrontBacks;
        
    }

    async endPhaseAsync(){
        this.nextButton.setVisible(false);
        this.phaseManager.myHand.isInteractive = false;
        this.phaseManager.nextTurn();

    }

    private isSelectOk(card: CardComponent): boolean {
        if(this.phase === eCSSPhase.SUMMON && !card.cardInfo.addInfo?.isSummonable){
            return false;
        }
        if(this.phase === eCSSPhase.SPELL && !card.cardInfo.addInfo?.isSpellable){
            return false;
        }
        switch(this.phase){
            case eCSSPhase.COST:
                return (this.selectedIdFrontBacks.length === 0)
            case eCSSPhase.SUMMON:
            case eCSSPhase.SPELL:
                const totalCost = this.selectedIdFrontBacks.reduce((sum, idFrontBack) => sum + (this.phaseManager.getCardComponent(idFrontBack).cardAddInfo.cost), 0);
                const newTotalCost = totalCost + (card.cardAddInfo.cost);
                return (0<= this.phaseManager.myCostLabel.cost + this.costSign*newTotalCost);
            case eCSSPhase.END:
                debugger;
                unexpectError("END-Phase is not selectable");
                return false;
        }
    }

    private handleCardClick(card: CardComponent): void {
        const index = this.selectedIdFrontBacks.indexOf(card.cardInfo.idFrontBack);
        
        if (index !== -1) {
            // カードが既に選択されている場合は選択解除
            this.deselectCard(card);
        } else {
            // 新しいカードを選択
            if (this.isSelectOk(card)) {
                this.selectCard(card);
            }
        }
    }


    private selectCard(card: CardComponent): void {
        // debugger
        this.selectedIdFrontBacks = [...this.selectedIdFrontBacks, card.cardInfo.idFrontBack];
        // カードを少し上に移動
        card.setY(card.y - 20);
        // 選択状態の視覚的フィードバック

        console.log(card.cardInfo.addInfo?.cost);
        card.setTint(0xffff00);
        // コストの変化を追加
    }

    private deselectCard(card: CardComponent): void {
        const index = this.selectedIdFrontBacks.indexOf(card.cardInfo.idFrontBack);
        if (index !== -1) {
            this.selectedIdFrontBacks = this.selectedIdFrontBacks.filter(id => id !== card.cardInfo.idFrontBack);
            // カードを元の位置に戻す
            card.setY(card.y + 20);
            // 選択状態の解除
            card.clearTint();
        }else{
            throw Error("deselect card index is -1")
        }
    }
}
