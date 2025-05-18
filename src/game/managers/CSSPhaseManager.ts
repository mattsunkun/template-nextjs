import { errorNum } from "@/utils/const";
import { unexpectError } from "@/utils/functions";
import { tSize } from "@/utils/types";
import { eCardArea, eWho, tCardAddInfo } from "../clients/GameClient";
import { HandCardBoardComponent } from "../components/boards/HandCardBoardComponent";
import { CardComponent, CardStatus } from "../components/CardComponent";
import { CostLabelComponent } from "../components/css/CostLabelComponent";
import { AbstractSubManager } from "./AbstractSubManager";
import { PhaseManager } from "./PhaseManager";

enum eCSSPhase {
    COST = "COST-Phase",
    SUMMON = "SUMMON-Phase",
    SPELL = "SPELL-Phase",
    END = "END-Phase"
}

export class CSSPhaseManager extends AbstractSubManager {
    private scene: Phaser.Scene;
    private phaseManager: PhaseManager;
    private cardSize: tSize;

    private myHand: HandCardBoardComponent;
    private opponentHand: HandCardBoardComponent;
    private myCostLabel: CostLabelComponent;
    private opponentCostLabel: CostLabelComponent;
    private nextButton: Phaser.GameObjects.Text;

    private _phase: eCSSPhase;
    private _selectedCards: CardComponent[] = [];

    private get costSign(): number {
        return this.phase === eCSSPhase.COST ? 1 : -1;
    }

    
    private get phase(): eCSSPhase {
        return this._phase;
    }

    private async setPhase(newPhase: eCSSPhase) {
        this._phase = newPhase;
        this.nextButton.setText(`Finish: ${this.phase}`);
        if(!this.phaseManager.isMyTurn){
            await this.opponentTurnAsync();
        }
        switch(this.phase){
            case eCSSPhase.COST:

                break;
        }
    }

    public updateVisualizer(): void {
        this.setHandTable();
    }

    private async opponentTurnAsync(): Promise<void> {
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
        opponentCards?.forEach((opponentCard) => {
            this.opponentCostLabel.addCostChange(opponentCard.cost * this.costSign);
            this.opponentCostLabel.applyCostChange();
            this.opponentCostLabel.clearCostChange();
            this.opponentHand.removeCards([opponentCard.idFrontBack]);
            this.phaseManager.updateCardPlace(opponentCard.idFrontBack, {area: eCardArea.TOMB, who: eWho.OPPONENT});

        }

)
            
    }


    private async handleNextClickAsync(): Promise<void> {
        this.selectedCards.forEach((card) => {
            console.log("呪文発動", card.cardInfo.addInfo?.spell_id);
        })

// コストの変化を適用
        this.myCostLabel.applyCostChange();       
        this.selectedCards.forEach((card) => {
            this.phaseManager.updateCardPlace(card.cardInfo.idFrontBack, {area: eCardArea.TOMB, who: eWho.MY});
        })
        this.myHand.removeCards([...this.selectedCards.map(card => card.cardInfo.idFrontBack)]);

        this.clearSelection();

        if(this.phaseManager.isMyTurn){
            await this.opponentTurnAsync();
        }

        switch(this.phase){
            case eCSSPhase.COST:
                await this.setPhase(eCSSPhase.SUMMON);
                break;
            case eCSSPhase.SUMMON:
                await this.setPhase(eCSSPhase.SPELL);
                break;
            case eCSSPhase.SPELL:
                await this.setPhase(eCSSPhase.END);
                break;

        }

    }

    private set selectedCards(newCards: CardComponent[]) {
        this.myCostLabel.addCostChange(-this.costSign * this._selectedCards.reduce((sum, card) => sum + (card.cardInfo.addInfo?.cost ?? errorNum), 0));

        this._selectedCards = newCards
        this.myCostLabel.addCostChange(this.costSign * this._selectedCards.reduce((sum, card) => sum + (card.cardInfo.addInfo?.cost ?? errorNum), 0));
    }

    private get selectedCards(): CardComponent[] {
        return this._selectedCards;
    }


    constructor(phaseManager: PhaseManager) {
        super()
        this.phaseManager = phaseManager;
        this.scene = phaseManager.scene;
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const handTableWidth = 800;
        const handTableHeight = 300;
        this.cardSize = { width: 100, height: 150 };

        // 中央下に配置
        const myX = (screenWidth - handTableWidth) / 2;
        const myY = screenHeight - handTableHeight - 50;

        // 中央上に配置 
        const opponentX = (screenWidth - handTableWidth) / 2;
        const opponentY = 50;

        this.myHand = new HandCardBoardComponent(this.scene, {x: myX, y: myY, size: {width: 800, height: 300}},false);
        this.opponentHand = new HandCardBoardComponent(this.scene, {x: opponentX, y: opponentY, size: {width: 800, height: 300}}, true);

        // コスト表示のラベルを追加
        this.myCostLabel = new CostLabelComponent(this.scene, myX - 50, myY + handTableHeight/2, '自分のコスト\n');
        this.opponentCostLabel = new CostLabelComponent(this.scene, myX + handTableWidth + 50, myY + handTableHeight/2, '相手のコスト\n');

        // Nextボタンの作成
        this.nextButton = this.scene.add.text(screenWidth / 2 + 50, myY + handTableHeight, 'Next', {
            fontSize: '32px',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', this.handleNextClickAsync, this);

        this.setHandTable();

        this._phase = eCSSPhase.END;

        this.updateNextButtonVisibility();
    }

    async startPhaseAsync(){
        this.myHand.setInteractive(true);
        this.opponentHand.setInteractive(false);
        this.setHandTable();
        await this.setPhase(eCSSPhase.COST);
        this.updateNextButtonVisibility();
    }

    async endPhaseAsync(){
        this.myHand.setInteractive(false);
        this.opponentHand.setInteractive(false);
        this.nextButton.setVisible(false);
        this.clearSelection();
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
                return (this.selectedCards.length === 0)
            case eCSSPhase.SUMMON:
            case eCSSPhase.SPELL:
                const totalCost = this.selectedCards.reduce((sum, selectedCard) => sum + (selectedCard.cardInfo.addInfo?.cost ?? errorNum), 0);
                const newTotalCost = totalCost + (card.cardInfo.addInfo?.cost ?? errorNum);
                return (0<= this.myCostLabel.cost + this.costSign*newTotalCost);
            case eCSSPhase.END:
                debugger;
                unexpectError("END-Phase is not selectable");
                return false;
        }
    }

    private isSubmitOk(): boolean {
        return true;
    }

    private handleCardClick(card: CardComponent): void {
        const index = this.selectedCards.indexOf(card);
        
        if (index !== -1) {
            // カードが既に選択されている場合は選択解除
            this.deselectCard(card);
        } else {
            // 新しいカードを選択
            if (this.isSelectOk(card)) {
                this.selectCard(card);
            }
        }
        this.updateNextButtonVisibility();
    }


    private selectCard(card: CardComponent): void {
        this.selectedCards.push(card);
        // カードを少し上に移動
        card.setY(card.y - 20);
        // 選択状態の視覚的フィードバック

        console.log(card.cardInfo.addInfo?.cost);
        card.setTint(0xffff00);
        // コストの変化を追加
        this.myCostLabel.addCostChange(card.cardInfo.addInfo?.cost ?? errorNum);
    }

    private deselectCard(card: CardComponent): void {
        const index = this.selectedCards.indexOf(card);
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
            // カードを元の位置に戻す
            card.setY(card.y + 20);
            // 選択状態の解除
            card.clearTint();
            // コストの変化を元に戻す
            this.myCostLabel.addCostChange(-(card.cardInfo.addInfo?.cost ?? errorNum));
        }
    }

    private clearSelection(): void {
        this.selectedCards.forEach(card => {
            card.setY(card.y + 20);
            card.clearTint();
        });
        this.selectedCards = [];
        this.myCostLabel.clearCostChange();
        this.updateNextButtonVisibility();
    }

    private updateNextButtonVisibility(): void {
        this.nextButton.setVisible(this.isSubmitOk());
    }


    public getSelectedCards(): CardComponent[] {
        return this.selectedCards;
    }

    public setHandTable(): void {
        const cssPhaseCards = this.phaseManager.cardInfos
            .filter(cardInfo => 
                (cardInfo.place.area === eCardArea.HAND)
            )
        
        const myCards = cssPhaseCards
            .filter(cardInfo => cardInfo.place.who === eWho.MY)
            .map((cardInfo) => {
                const card = new CardComponent(this.scene, cardInfo, this.cardSize);
                card.status = CardStatus.FRONT;
                card.setInteractive(true);
                card.on('cardClicked', this.handleCardClick, this);
                return card;
            });

        const opponentCards = cssPhaseCards
            .filter(cardInfo => cardInfo.place.who === eWho.OPPONENT)
            .map((cardInfo) => {
                const card = new CardComponent(this.scene, cardInfo, this.cardSize);
                card.status = CardStatus.BACK;
                card.setInteractive(false);
                return card;
            });

        this.myHand.updateVisualizer(myCards);
        this.opponentHand.updateVisualizer(opponentCards);
    }


    create() {
    }
}
