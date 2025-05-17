import { sleep, unexpectError } from "@/utils/functions";
import { GameClient } from "../clients/GameClient";
import { MemoryCardComponent, MemoryCardStatus } from "../components/MemoryCardComponent";
import { Table } from "../components/MemoryCardTableComponent";
import { eWho, PhaseManager, tCardPhase } from "./PhaseManager";
import { eGamePhase, TurnManager } from "./TurnManager";


export class MemoryPhaseManager {
    private scene: Phaser.Scene;
    private memoryCardComponents: MemoryCardComponent[];
    private table: Table;
    
    private pairAmount: number = 2;
    private selectedCardId: string[] = [];
    private isProcessing: boolean = false;

    private turnManager: TurnManager;
    private gameClient: GameClient;
    private phaseManager: PhaseManager;

    constructor(data: {phaseManager: PhaseManager}){
        this.scene = data.phaseManager.scene;
        this.turnManager = data.phaseManager.turnManager; 
        this.gameClient = data.phaseManager.gameClient;
        this.phaseManager = data.phaseManager;
        // this.table = new Table(scene);
        // カードの状態を初期化
        this.memoryCardComponents = data.phaseManager.cardPhases
            .filter((cardPhase: tCardPhase) => cardPhase.status === eGamePhase.MEMORY_GAME)
            .map((cardPhase: tCardPhase) => {
                const cardComponent = new MemoryCardComponent(this.scene, cardPhase.info.cardKnownInfo, cardPhase.info.cardFullInfo);
                cardComponent.on('cardClicked', this.onCardClicked, this);
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

        

        this.table = new Table(this.scene, this.memoryCardComponents, tableX, tableY, tableWidth, tableHeight, margin);

        this.eachTurn(this.turnManager.isMyTurn);
    }

    private async onCardClicked(cardComponent: MemoryCardComponent) {
        await this.flip(cardComponent, this.turnManager.isMyTurn, true);
    }

    private async flip(cardComponent: MemoryCardComponent, isMyTurn:boolean, again:boolean){

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

                        this.phaseManager.updateCardPhase(card.cardKnownInfo.idFrontBack, isMyTurn ? eWho.MY : eWho.OPPONENT, eGamePhase.COST_SUMMON_SPELL, card.cardFullInfo);
                    });

                    this.phaseManager.cssPhaseManager.setHandTable();
                    // 再挑戦が許されているかどうか。
                    if(again){
                        this.selectedCardId = [];
                        this.eachTurn(isMyTurn);
                        return;
                    }
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
            this.table.setInteractive(false);
            if(this.turnManager.currentPhase === eGamePhase.MEMORY_GAME){
                this.eachTurn(this.turnManager.isMyTurn);
            }
        

        }
    }

    public async eachTurn(isMyTurn:boolean){
        
        this.table.setInteractive(isMyTurn);
        if(isMyTurn) {

        }else{
            for(let i = 0; i < this.pairAmount; i++){
                await sleep(300);

                const cardFullInfo = await this.gameClient.receiveOpponentCardFullInfo(this.phaseManager.cardPhases);
                if(cardFullInfo) {
                    const targetCard = this.memoryCardComponents.find(card => card.cardKnownInfo.idFrontBack === cardFullInfo.idFrontBack);
                    if(targetCard){
                        await this.flip(targetCard, isMyTurn, true);
                    }
                }else{
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
