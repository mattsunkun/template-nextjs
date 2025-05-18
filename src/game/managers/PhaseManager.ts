import { unexpectError } from '@/utils/functions';
import { GameClient, tCardFullInfo, tCardKnownInfo } from '../clients/GameClient';
import { HandCardTableComponent } from "../components/css/HandCardTableComponent";
import { TextLabel } from '../components/utils/TextLabel';
import { CSSPhaseManager } from './CSSPhaseManager';
import { MemoryPhaseManager } from './MemoryPhaseManager';

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


// ゲームフェーズを定義
export enum eGamePhase {
    COST_SUMMON_SPELL = 'cost-summon-spell', // コスト変換・キャラ召喚・呪文詠唱フェーズ
    MEMORY_GAME = 'memory-game',            // 神経衰弱フェーズ
    ATTACK = 'attack',                      // 攻撃フェーズ
    GAME_END = 'game-end'                   // ゲーム終了
  }


export class PhaseManager {
    private _isMyTurn: boolean;
    private isFirstTurn: boolean;
    public _currentPhase: eGamePhase; // 神経衰弱フェーズから開始
  
    private textLabelPhase: TextLabel;
    private textLabelTurn: TextLabel;
    public scene: Phaser.Scene;

    public memoryPhaseManager: MemoryPhaseManager;
    public cssPhaseManager: CSSPhaseManager;
    public gameClient: GameClient;
    public cardPhases: tCardPhase[];
    public spellCardPhases: tCardPhase[];
    public handTable: HandCardTableComponent;

    constructor(scene: Phaser.Scene, gameClient:GameClient) {
        this.scene = scene;

        // this.createScoreText();
        this.gameClient = gameClient;
    }


    async create(){

        const defaultPhase = eGamePhase.MEMORY_GAME;
        const defaultWho = undefined;


        const cardKnownInfo = await this.gameClient.fetchShuffledCardKnownInfoAsync();
        this.cardPhases = cardKnownInfo.map((cardKnownInfo) => {
            return {
                info: {
                    cardKnownInfo: cardKnownInfo,
                    cardFullInfo: undefined
                },
                status: defaultPhase, 
                who: defaultWho, 
            }
        });
        const spellCardKnownInfo = await this.gameClient.fetchShuffledSpellKnownInfoAsync();
        this.spellCardPhases = spellCardKnownInfo.map((spellCardKnownInfo) => {
            return {
                info: {
                    cardKnownInfo: spellCardKnownInfo,
                    cardFullInfo: undefined
                },
                status: defaultPhase, 
                who: defaultWho, 
            }
        });

        this.memoryPhaseManager = new MemoryPhaseManager({phaseManager: this});
        this.cssPhaseManager = new CSSPhaseManager(this);


    this.createLabelText();
    
        this.isMyTurn = this.gameClient.isMyTurn;
        this.isFirstTurn = this.gameClient.isMyTurn;
        this.currentPhase = defaultPhase;
        // this.turnManager = new TurnManager(this.scene, this.gameClient.isMyTurn, defaultPhase, this);
    }

    public updateCardPhase(cardIdFrontBack: string, who:eWho, status: eGamePhase,cardFullInfo?:tCardFullInfo) {
        const cardPhase = [...this.cardPhases, ...this.spellCardPhases].find(card => card.info.cardKnownInfo.idFrontBack === cardIdFrontBack);
        if (cardPhase) {
            cardPhase.status = status;
            cardPhase.info.cardFullInfo = cardFullInfo;
            cardPhase.who = who;
        }else{
            unexpectError("cardPhase is undefined");
        }
    }
    

  createLabelText(){
    this.textLabelPhase = new TextLabel(this.scene, this.scene.scale.width * 2/3, 30, '神経衰弱', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
    }).setOrigin(0.5);

    this.textLabelTurn = new TextLabel(this.scene, this.scene.scale.width * 1/3, 30, 'ターン', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
    }).setOrigin(0.5);
}

  public get isMyTurn(): boolean {
    return this._isMyTurn;
  }

  public set isMyTurn(isMyTurn: boolean) {
    this._isMyTurn = isMyTurn;
    this.textLabelTurn.text = isMyTurn ? '自分のターン' : '相手のターン';
  }

  public get currentPhase(): eGamePhase {
    return this._currentPhase;
  }

  public set currentPhase(phase: eGamePhase) {
    this._currentPhase = phase;
    this.textLabelPhase.text = this.currentPhase;
    switch(phase){
      case eGamePhase.MEMORY_GAME:
        this.memoryPhaseManager.startPhase();
        break;
      case eGamePhase.COST_SUMMON_SPELL:
        this.memoryPhaseManager.endPhase();
        this.cssPhaseManager.startPhase();
        break;
    }
  }

  public nextTurn():boolean {

    this.isMyTurn = !this.isMyTurn;

    if(this.isFirstTurn === this._isMyTurn) {
      this.nextPhase();
      return false;
    }else{
        return true;
    }
  }


  public nextPhase() {
    switch (this.currentPhase) {
        case eGamePhase.MEMORY_GAME:
            this.currentPhase = eGamePhase.COST_SUMMON_SPELL;
            break;
        case eGamePhase.COST_SUMMON_SPELL:
            this.currentPhase = eGamePhase.ATTACK;
            break;
        case eGamePhase.ATTACK:
            this.currentPhase = eGamePhase.MEMORY_GAME;
            break;
    }
  }
} 