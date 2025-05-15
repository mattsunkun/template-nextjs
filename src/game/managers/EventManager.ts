import { MemoryCardComponent } from "../components/MemoryCardComponent";
import { PhaseManager } from "./PhaseManager";
export class EventManager {
    private scene: Phaser.Scene;
    private isProcessing: boolean = false;

    private phaseManager: PhaseManager;
    constructor(scene: Phaser.Scene, phaseManager: PhaseManager) {
        this.scene = scene;
        this.phaseManager = phaseManager;
    }



    private setupEventListeners() {
        // EventBus.on('turn-start', this.onTurnStart, this);
        // EventBus.on('turn-end', this.onTurnEnd, this);
        // EventBus.on('cpu-select-card', this.onCpuSelectCard, this);
        // EventBus.on('cpu-match-pair', this.onCpuMatchPair, this);
        // EventBus.on('cpu-mismatch-pair', this.onCpuMismatchPair, this);
    }

    private async onCardClicked(cardComponent: MemoryCardComponent) {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        this.phaseManager.onCardClicked(cardComponent);
        this.isProcessing = false;

        
        // card.reveal();

        // if (!this.firstCard) {
        //     this.firstCard = card;
        // } else {
        //     this.secondCard = card;
        //     this.isProcessing = true;

        //     // カードのペアをチェック
        //     if (this.firstCard.getValue() === this.secondCard.getValue()) {
        //         // ペアが見つかった場合
        //         this.score += 10;
        //         this.updateScoreText();
                
        //         this.firstCard.match();
        //         this.secondCard.match();

        //         // ゲームクリアチェック
        //         const allCards = this.table.getCards();
        //         const isGameClear = allCards.every(card => card.isPaired());
        //         if (isGameClear) {
        //             this.handleGameClear();
        //         }
        //     } else {
        //         // ペアが見つからなかった場合
        //         await this.delay(1000);
        //         this.firstCard.hide();
        //         this.secondCard.hide();
        //         // ターンをCPUに切り替え
        //         this.playerClient.endTurn();
        //     }

        //     this.firstCard = null;
        //     this.secondCard = null;
        //     this.isProcessing = false;
        // }
    }



}