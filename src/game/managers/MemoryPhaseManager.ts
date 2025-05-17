import { sleep, unexpectError } from "@/utils/functions";
import { GameClient } from "../clients/GameClient";
import { MemoryCardComponent, MemoryCardStatus } from "../components/MemoryCardComponent";
import { Table } from "../components/MemoryCardTableComponent";
import { eGamePhase, eWho, PhaseManager, tCardPhase } from "./PhaseManager";


export class MemoryPhaseManager {
    private scene: Phaser.Scene;
    private memoryCardComponents: MemoryCardComponent[];
    private table: Table;
    
    private pairAmount: number = 2;
    private selectedCardId: string[] = [];
    private isProcessing: boolean = false;
    private gameClient: GameClient;
    private phaseManager: PhaseManager;

    constructor(data: {phaseManager: PhaseManager}){
        this.scene = data.phaseManager.scene;
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

        

        this.table = new Table(this.scene, this.memoryCardComponents, 4, 7, 10);

    }

    public startPhase(){
        this.table.setInteractive(this.phaseManager.isMyTurn);
        this.eachTurn();
    }

    private async onCardClicked(cardComponent: MemoryCardComponent) {

        // 裏じゃないやつは選べない。
        if (cardComponent.status !== MemoryCardStatus.BACK) return;
        await this.flipAsync(cardComponent, true);
    }

    private async flipAsync(cardComponent: MemoryCardComponent, again:boolean){


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

        

        }
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
            console.log("eachTurn");
            for(let i = 0; i < this.pairAmount; i++){

                const cardFullInfo = await this.gameClient.receiveOpponentCardFullInfo(this.phaseManager.cardPhases);
                if(cardFullInfo) {
                    const targetCard = this.memoryCardComponents.find(card => card.cardKnownInfo.idFrontBack === cardFullInfo.idFrontBack);
                    if(targetCard){
                        await this.flipAsync(targetCard, true);
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
