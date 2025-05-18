import { GameClient, tCardInfo, tPlace, tRule } from '../clients/GameClient';
import { TextLabel } from '../components/utils/TextLabel';
import { CSSPhaseManager } from './CSSPhaseManager';
import { MemoryPhaseManager } from './MemoryPhaseManager';

// ゲームフェーズを定義
export enum eGamePhase {
    COST_SUMMON_SPELL = 'cost-summon-spell', // コスト変換・キャラ召喚・呪文詠唱フェーズ
    MEMORY_GAME = 'memory-game',            // 神経衰弱フェーズ
    ATTACK = 'attack',                      // 攻撃フェーズ
    GAME_END = 'game-end'                   // ゲーム終了
  }


export class PhaseManager {
    private _isMyTurn: boolean;
    public _currentPhase: eGamePhase; // 神経衰弱フェーズから開始
  
    private textLabelPhase: TextLabel;
    private textLabelTurn: TextLabel;
    public scene: Phaser.Scene;

    public memoryPhaseManager: MemoryPhaseManager;
    private cssPhaseManager: CSSPhaseManager;
    public gameClient: GameClient;
    public cardInfos: tCardInfo[];
    private rule:tRule;

    constructor(scene: Phaser.Scene, gameClient:GameClient) {
        this.scene = scene;

        // this.createScoreText();
        this.gameClient = gameClient;
    }


    async create(){
        this.cardInfos = await this.gameClient.fetchShuffledCardKnownInfoAsync();
        this.rule = await this.gameClient.fetchRuleAsync();


        this.memoryPhaseManager = new MemoryPhaseManager({phaseManager: this});
        this.cssPhaseManager = new CSSPhaseManager(this);


        this.createLabelText();
        this.isMyTurn = this.rule.isMyTurn;
    
        this.currentPhase = eGamePhase.MEMORY_GAME;
    }

    public async updateCardPlace(cardIdFrontBack: string, place: tPlace) {
      this.cardInfos = this.cardInfos.map(card => {
        if (card.idFrontBack === cardIdFrontBack) {
          return {
            ...card,
            place: place,
          };
        }else{
          return card;
        }
      });

    this.updateVisualizer();
      await this.gameClient.postCardInfoPlaceAsync(cardIdFrontBack, place);
        
    }

    private updateVisualizer(){
      this.memoryPhaseManager.updateVisualizer();
      this.cssPhaseManager.updateVisualizer();
    }
    

  private createLabelText(){
    this.textLabelPhase = new TextLabel(this.scene, this.scene.scale.width * 2/3, 30, '', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
    }).setOrigin(0.5);

    this.textLabelTurn = new TextLabel(this.scene, this.scene.scale.width * 1/3, 30, '', {
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
        this.memoryPhaseManager.startPhaseAsync();
        break;
      case eGamePhase.COST_SUMMON_SPELL:
        this.memoryPhaseManager.endPhaseAsync();
        this.cssPhaseManager.startPhaseAsync();
        break;
    }
  }

  public nextTurn():boolean {

    this.isMyTurn = !this.isMyTurn;

    if(this.rule.isMyTurn === this._isMyTurn) {
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