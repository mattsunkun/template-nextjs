import { GameClient, tCardFullInfo, tCardKnownInfo } from '../clients/GameClient';
import { MemoryPhaseManager } from './MemoryPhaseManager';
import { eGamePhase, TurnManager } from './TurnManager';


export type tCardPhase = {
    info: tCardInfo;
    status: eGamePhase;
}

export type tCardInfo = {
    cardKnownInfo: tCardKnownInfo;
    cardFullInfo?: tCardFullInfo;
}


export class PhaseManager {
    private scene: Phaser.Scene;

    private memoryPhaseManager: MemoryPhaseManager;
    private turnManager: TurnManager;
    private gameClient: GameClient;
    public cardPhases: tCardPhase[];

    constructor(scene: Phaser.Scene, gameClient:GameClient) {
        this.scene = scene;

        // this.createScoreText();
        this.gameClient = gameClient;
        
    }


    async create(){

        this.turnManager = new TurnManager(this.scene, this.gameClient.isMyTurn);
        const cardKnownInfo = await this.gameClient.fetchShuffledCardKnownInfo();
        this.cardPhases = cardKnownInfo.map((cardKnownInfo) => {
            return {
                info: {
                    cardKnownInfo: cardKnownInfo,
                    cardFullInfo: undefined
                },
                status: eGamePhase.MEMORY_GAME
            }
        });

        this.memoryPhaseManager = new MemoryPhaseManager(this.scene, cardKnownInfo, this.turnManager, this.gameClient, this);
    }

    public updateCardPhase(cardIdFrontBack: string, status: eGamePhase,cardFullInfo?:tCardFullInfo) {
        const cardPhase = this.cardPhases.find(card => card.info.cardKnownInfo.idFrontBack === cardIdFrontBack);
        if (cardPhase) {
            cardPhase.status = status;
            cardPhase.info.cardFullInfo = cardFullInfo;
        }
    }
    
} 