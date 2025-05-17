import { GameClient } from "../clients/GameClient";
import { HandCardComponent } from "../components/HandCardComponent";
import { HandCardTableComponent } from "../components/HandCardTableComponent";
import { eGamePhase, eWho, PhaseManager } from "./PhaseManager";

export class CSSPhaseManager {
    private scene: Phaser.Scene;
    private phaseManager: PhaseManager;
    private gameClient: GameClient;
    private myHandTable: HandCardTableComponent;
    private opponentHandTable: HandCardTableComponent;
    private selectedCard: HandCardComponent | null = null;

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
        this.setupCardInteractions();
        this.setHandTable();
    }

    public startPhase(){
        this.setHandTable();
        console.log("startPhase");
    }

    public setHandTable(): void {
        const cssPhaseCards = this.phaseManager.cardPhases
            .filter(cardPhase => 
                (cardPhase.status === eGamePhase.COST_SUMMON_SPELL) &&
                cardPhase.info.cardFullInfo !== undefined
            )
            .map(cardPhase => ({
                known: cardPhase.info.cardKnownInfo,
                full: cardPhase.info.cardFullInfo!,
                who: cardPhase.who
            }));
        
        this.myHandTable.setCards(cssPhaseCards.filter(card => card.who === eWho.MY));
        this.opponentHandTable.setCards(cssPhaseCards.filter(card => card.who === eWho.OPPONENT));
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

    private handleCardClick(card: HandCardComponent): void {
        if (this.selectedCard === card) {
            // 同じカードを再度クリックした場合は選択解除
            this.deselectCard();
        } else {
            // 新しいカードを選択
            if (this.selectedCard) {
                this.deselectCard();
            }
            this.selectCard(card);
        }
    }

    private selectCard(card: HandCardComponent): void {
        this.selectedCard = card;
        // カードを少し上に移動
        card.setY(card.y - 20);
        // 選択状態の視覚的フィードバック
        card.setTint(0xffff00);
    }

    private deselectCard(): void {
        if (this.selectedCard) {
            // カードを元の位置に戻す
            this.selectedCard.setY(this.selectedCard.y + 20);
            // 選択状態の解除
            this.selectedCard.clearTint();
            this.selectedCard = null;
        }
    }

    public getSelectedCard(): HandCardComponent | null {
        return this.selectedCard;
    }

    public clearSelection(): void {
        this.deselectCard();
    }

    create() {
    }
}
