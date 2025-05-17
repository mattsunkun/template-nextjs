import { unexpectError } from '@/utils/functions';
import { GameClient, tCardFullInfo, tCardKnownInfo } from '../clients/GameClient';
import { HandCardTableComponent } from "../components/HandCardTableComponent";
import { CSSPhaseManager } from './CSSPhaseManager';
import { MemoryPhaseManager } from './MemoryPhaseManager';
import { eGamePhase, TurnManager } from './TurnManager';

export enum eWho {
   MY = "MY",
   OPPONENT = "OPPONENT"
}

export type tCardPhase = {
    info: tCardInfo;
    status: eGamePhase;
    who?: eWho;
}

export type tCardInfo = {
    cardKnownInfo: tCardKnownInfo;
    cardFullInfo?: tCardFullInfo;
}


export class PhaseManager {
    public scene: Phaser.Scene;

    public memoryPhaseManager: MemoryPhaseManager;
    public cssPhaseManager: CSSPhaseManager;
    public turnManager: TurnManager;
    public gameClient: GameClient;
    public cardPhases: tCardPhase[];
    public handTable: HandCardTableComponent;

    constructor(scene: Phaser.Scene, gameClient:GameClient) {
        this.scene = scene;

        // this.createScoreText();
        this.gameClient = gameClient;
    }


    async create(){

        const defaultPhase = eGamePhase.MEMORY_GAME;

        this.turnManager = new TurnManager(this.scene, this.gameClient.isMyTurn, defaultPhase);
        const cardKnownInfo = await this.gameClient.fetchShuffledCardKnownInfo();
        this.cardPhases = cardKnownInfo.map((cardKnownInfo) => {
            return {
                info: {
                    cardKnownInfo: cardKnownInfo,
                    cardFullInfo: undefined
                },
                status: defaultPhase
            }
        });

        this.memoryPhaseManager = new MemoryPhaseManager({phaseManager: this});
        this.cssPhaseManager = new CSSPhaseManager(this);
    }

    public updateCardPhase(cardIdFrontBack: string, who:eWho, status: eGamePhase,cardFullInfo?:tCardFullInfo) {
        const cardPhase = this.cardPhases.find(card => card.info.cardKnownInfo.idFrontBack === cardIdFrontBack);
        if (cardPhase) {
            cardPhase.status = status;
            cardPhase.info.cardFullInfo = cardFullInfo;
            cardPhase.who = who;
        }else{
            unexpectError("cardPhase is undefined");
        }
    }
    
} 