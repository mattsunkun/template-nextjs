import { unexpectError } from "@/utils/functions";
import { GameClient } from "../clients/GameClient";
import { CostLabelComponent } from "../components/css/CostLabelComponent";
import { HandCardComponent } from "../components/css/HandCardComponent";
import { HandCardTableComponent } from "../components/css/HandCardTableComponent";
import { eGamePhase, eWho, PhaseManager } from "./PhaseManager";

enum eCSSPhase {
    COST = "COST-Phase",
    SUMMON = "SUMMON-Phase",
    SPELL = "SPELL-Phase",
    END = "END-Phase"
}

export class CSSPhaseManager {
    private scene: Phaser.Scene;
    private phaseManager: PhaseManager;
    private gameClient: GameClient;
    private myHandTable: HandCardTableComponent;
    private opponentHandTable: HandCardTableComponent;
    private _selectedCards: HandCardComponent[] = [];
    private myCostLabel: CostLabelComponent;
    private opponentCostLabel: CostLabelComponent;
    private nextButton: Phaser.GameObjects.Text;
    private _phase: eCSSPhase;

    private get phase(): eCSSPhase {
        return this._phase;
    }

    private set phase(newPhase: eCSSPhase) {
        this._phase = newPhase;
        if(!this.phaseManager.isMyTurn){
            this.opponentTurn();
        }
        switch(this.phase){
            case eCSSPhase.COST:

                break;
        }
    }

    private opponentTurn(): void {
        switch(this.phase){
            case eCSSPhase.COST:
                
                break;
            case eCSSPhase.SUMMON:
                break;
            case eCSSPhase.SPELL:
                break;
        }
    }

    private get selectedCards(): HandCardComponent[] {
        return this._selectedCards;
    }

    private set selectedCards(newCards: HandCardComponent[]) {
        switch(this.phase){
            case eCSSPhase.COST:
                this.myCostLabel.addCostChange(-this._selectedCards.reduce((sum, card) => sum + card.fullInfo.cost, 0));
                break;
            case eCSSPhase.SUMMON:
                break;
        }

this._selectedCards = newCards

        switch(this.phase){
            case eCSSPhase.COST:
                this.myCostLabel.addCostChange(+newCards.reduce((sum, card) => sum + card.fullInfo.cost, 0));
                break;
        }
    }

    constructor(phaseManager: PhaseManager) {
        this.phaseManager = phaseManager;
        this.scene = phaseManager.scene;
        this.gameClient = phaseManager.gameClient;
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const handTableWidth = 800;
        const handTableHeight = 300;

        // 中央下に配置
        const myX = (screenWidth - handTableWidth) / 2;
        const myY = screenHeight - handTableHeight - 50;

        // 中央上に配置 
        const opponentX = (screenWidth - handTableWidth) / 2;
        const opponentY = 50;

        this.myHandTable = new HandCardTableComponent(this.scene, {x: myX, y: myY, size: {width: 800, height: 300}},false);
        this.opponentHandTable = new HandCardTableComponent(this.scene, {x: opponentX, y: opponentY, size: {width: 800, height: 300}}, true);

        // コスト表示のラベルを追加
        this.myCostLabel = new CostLabelComponent(this.scene, myX - 50, myY + handTableHeight/2, '自分のコスト\n');
        this.opponentCostLabel = new CostLabelComponent(this.scene, myX + handTableWidth + 50, myY + handTableHeight/2, '相手のコスト\n');

        // Nextボタンの作成
        this.nextButton = this.scene.add.text(screenWidth / 2, myY + handTableHeight + 50, 'Next', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', this.handleNextClick, this);

        this.setupCardInteractions();
        this.setHandTable();

        this.phase = eCSSPhase.END;
    }

    public startPhase(){
        this.myHandTable.setInteractive(true);
        this.opponentHandTable.setInteractive(true);
        this.setHandTable();
        this.phase = eCSSPhase.COST;
        this.updateNextButtonVisibility();
    }

    public endPhase(){
        this.myHandTable.setInteractive(false);
        this.opponentHandTable.setInteractive(false);
        this.nextButton.setVisible(false);
        this.clearSelection();
    }

    private isSelectOk(card: HandCardComponent): boolean {
        switch(this.phase){
            case eCSSPhase.COST:
                return (this.selectedCards.length === 0)
            case eCSSPhase.SUMMON:
                return (this.selectedCards.length === 1)
            case eCSSPhase.SPELL:
                return (this.selectedCards.length === 1)
            case eCSSPhase.END:
                unexpectError("END-Phase is not selectable");
                return false;
        }
    }

    private isSubmitOk(): boolean {
        switch(this.phase){
            case eCSSPhase.COST:
                return true;
            case eCSSPhase.SUMMON:
                return true;
            case eCSSPhase.SPELL:
                return true;
            case eCSSPhase.END:
                unexpectError("END-Phase is not submitable");
                return false;
        }
    }

    private handleCardClick(card: HandCardComponent): void {
        console.log('card clicked', card);
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


    private selectCard(card: HandCardComponent): void {
        this.selectedCards.push(card);
        // カードを少し上に移動
        card.setY(card.y - 20);
        // 選択状態の視覚的フィードバック
        card.setTint(0xffff00);
        // コストの変化を追加
        this.myCostLabel.addCostChange(card.fullInfo.cost);
    }

    private deselectCard(card: HandCardComponent): void {
        const index = this.selectedCards.indexOf(card);
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
            // カードを元の位置に戻す
            card.setY(card.y + 20);
            // 選択状態の解除
            card.clearTint();
            // コストの変化を元に戻す
            this.myCostLabel.addCostChange(-card.fullInfo.cost);
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

    private handleNextClick(): void {

        switch(this.phase){
            case eCSSPhase.COST:
                this.myCostLabel.applyCostChange();
                break;
            case eCSSPhase.SUMMON:
                break;
            case eCSSPhase.SPELL:
                break;
            case eCSSPhase.END:
                unexpectError("END-Phase is not nextable");
                break;
        }
        this.clearSelection();

        if(this.phaseManager.isMyTurn){
            this.opponentTurn();
        }

        switch(this.phase){
            case eCSSPhase.COST:
                this.phase = eCSSPhase.SUMMON;
                break;
            case eCSSPhase.SUMMON:
                this.phase = eCSSPhase.SPELL;
                break;
            case eCSSPhase.SPELL:
                this.phase = eCSSPhase.END;
                break;

        }

    }

    public getSelectedCards(): HandCardComponent[] {
        return this.selectedCards;
    }

    public setHandTable(): void {
        const cssPhaseCards = [...this.phaseManager.cardPhases, ...this.phaseManager.spellCardPhases]
            .filter(cardPhase => 
                (cardPhase.status === eGamePhase.COST_SUMMON_SPELL) &&
                cardPhase.info.cardFullInfo !== undefined
            )
            .map(cardPhase => ({
                known: cardPhase.info.cardKnownInfo,
                full: cardPhase.info.cardFullInfo!,
                who: cardPhase.who
            }));
        
        this.myHandTable.setCards(cssPhaseCards
            .filter(card => card.who === eWho.MY)
            .map((cardInfo) => {
                const card = new HandCardComponent(this.scene, cardInfo.known, cardInfo.full);
                card.on('cardClicked', this.handleCardClick, this);
                return card;
            })
        );
        this.opponentHandTable.setCards(cssPhaseCards
            .filter(card => card.who === eWho.OPPONENT)
            .map((cardInfo) => {
                const card = new HandCardComponent(this.scene, cardInfo.known, cardInfo.full);
                // card.on('cardClicked', this.handleCardClick, this);
                card.setInteractive(false);
                return card;
            })
        );
    }

    private setupCardInteractions(): void {
        // カードのクリックイベントを設定
        this.myHandTable.on('cardClicked', (card: HandCardComponent) => {
            this.handleCardClick(card);
        });
        // this.opponentHandTable.on('cardClicked', (card: HandCardComponent) => {
        //     this.handleCardClick(card);
        // });
    }

    create() {
    }
}
