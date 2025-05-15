import { sleep } from "@/utils/functions";
import { GameClient, tCardKnownInfo } from "../clients/GameClient";
import { MemoryCardComponent, MemoryCardStatus } from "../components/MemoryCardComponent";
import { Table } from "../components/MemoryCardTableComponent";
import { TurnManager } from "./TurnManager";


export class MemoryPhaseManager {
    private scene: Phaser.Scene;
    private memoryCardComponents: MemoryCardComponent[];
    private table: Table;
    
    private pairAmount: number = 2;
    private selectedCardId: string[] = [];
    private isProcessing: boolean = false;

    private turnManager: TurnManager;
    private gameClient: GameClient;

    constructor(scene: Phaser.Scene, cardKnownInfos:tCardKnownInfo[], turnManager:TurnManager, gameClient:GameClient){
        this.scene = scene;
        this.turnManager = turnManager; 
        this.gameClient = gameClient;
        // this.table = new Table(scene);
        // カードの状態を初期化
        this.memoryCardComponents = cardKnownInfos.map((cardKnownInfo: tCardKnownInfo) => {
            const cardComponent = new MemoryCardComponent(scene, cardKnownInfo, undefined);
            cardComponent.on('cardClicked', this.onCardClicked, this);
            return cardComponent;
        });

        // 画面中央に盤面を配置
        const margin = 15;
        const screenWidth = scene.scale.width;
        const screenHeight = scene.scale.height;
        const tableWidth = 700;
        const tableHeight = 400;
        const tableX = (screenWidth - tableWidth) / 2;
        const tableY = (screenHeight - tableHeight) / 2 + 50; // 上部に余白を設ける

        

        this.table = new Table(scene, this.memoryCardComponents, tableX, tableY, tableWidth, tableHeight, margin);

    }

    private async onCardClicked(cardComponent: MemoryCardComponent) {
        // if(!this.turnManager.isMyTurn)return;
        
        // 裏じゃないやつは選べない。
        if (cardComponent.status !== MemoryCardStatus.BACK) return;

        // カードの情報を取得する。
        cardComponent.cardFullInfo = await this.gameClient.fetchSpecificCardFullInfo(cardComponent.cardKnownInfo.idFrontBack);

        // カードを表にする
        cardComponent.status = MemoryCardStatus.FRONT;

        this.selectedCardId.push(cardComponent.cardKnownInfo.idFrontBack);

        // 2枚選択された場合
        if (this.selectedCardId.length === this.pairAmount) {
            this.isProcessing = true;

            // カードの照合
            // 全てのカードコンポーネントに対して処理
            const selectedCards = this.memoryCardComponents.filter(card => 
                this.selectedCardId.includes(card.cardKnownInfo.idFrontBack)
            );

            if (selectedCards) {
                // マッチング判定のため少し待機
                await sleep(500);

                // 全てのカードのpair_idが同じか確認
                const firstPairId = selectedCards[0].cardFullInfo?.pair_id;

                if (selectedCards.every(card => card.cardFullInfo?.pair_id === firstPairId)) {
                    // 全てのカードをmatchedに変更
                    selectedCards.forEach(card => {
                        card.status = MemoryCardStatus.MATCHED;
                    });
                } else {
                    // 全てのカードをbackに戻す
                    selectedCards.forEach(card => {
                        card.status = MemoryCardStatus.BACK;
                    });
                }


            }

            // 選択状態をリセット
            this.selectedCardId = [];
            this.turnManager.nextTurn();
        }
    }
    
    // ゲーム終了判定
    public isGameComplete(): boolean {
        return this.memoryCardComponents.every(card => !card.visible);
    }
}
