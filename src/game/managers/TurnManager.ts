// import { TextLabel } from "../components/utils/TextLabel";
// import { PhaseManager } from "./PhaseManager";



// // ゲームフェーズを定義
// export enum eGamePhase {
//   COST_SUMMON_SPELL = 'cost-summon-spell', // コスト変換・キャラ召喚・呪文詠唱フェーズ
//   MEMORY_GAME = 'memory-game',            // 神経衰弱フェーズ
//   ATTACK = 'attack',                      // 攻撃フェーズ
//   GAME_END = 'game-end'                   // ゲーム終了
// }

// export class TurnManager {
//   private _isMyTurn: boolean;
//   private readonly isFirstTurn: boolean;
//   public _currentPhase: eGamePhase; // 神経衰弱フェーズから開始

//   private scene: Phaser.Scene;
//   private textLabelPhase: TextLabel;
//   private textLabelTurn: TextLabel;
//   private phaseManager: PhaseManager;

//   constructor(scene: Phaser.Scene, isMyTurn: boolean, defaultPhase: eGamePhase, phaseManager: PhaseManager) {
//     this.scene = scene;
//     this.createLabelText();
    
//     this.isMyTurn = isMyTurn;
//     this.isFirstTurn = isMyTurn;
//     this.phaseManager = phaseManager;
//     this.currentPhase = defaultPhase;

//   }


//   createLabelText(){
//     this.textLabelPhase = new TextLabel(this.scene, this.scene.scale.width * 2/3, 30, '神経衰弱', {
//         fontSize: '32px',
//         color: '#ffffff',
//         backgroundColor: '#000000',
//     }).setOrigin(0.5);

//     this.textLabelTurn = new TextLabel(this.scene, this.scene.scale.width * 1/3, 30, 'ターン', {
//         fontSize: '32px',
//         color: '#ffffff',
//         backgroundColor: '#000000',
//     }).setOrigin(0.5);
// }

//   public get isMyTurn(): boolean {
//     return this._isMyTurn;
//   }

//   public set isMyTurn(isMyTurn: boolean) {
//     this._isMyTurn = isMyTurn;
//     this.textLabelTurn.text = isMyTurn ? '自分のターン' : '相手のターン';
//   }

//   public get currentPhase(): eGamePhase {
//     return this._currentPhase;
//   }

//   public set currentPhase(phase: eGamePhase) {
//     this._currentPhase = phase;
//     this.textLabelPhase.text = this.currentPhase;
//     switch(phase){
//       case eGamePhase.MEMORY_GAME:
//         this.phaseManager.memoryPhaseManager.startTurn();
//         break;
//       case eGamePhase.COST_SUMMON_SPELL:
//         this.textLabelPhase.text = 'コスト変換・キャラ召喚・呪文詠唱';
//     }
//   }

//   public nextTurn() {

//     this.isMyTurn = !this.isMyTurn;

//     if(this.isFirstTurn === this._isMyTurn) {
//       this.nextPhase();
//     }
//   }


//   private nextPhase() {
//     switch (this.currentPhase) {
//         case eGamePhase.MEMORY_GAME:
//             this.currentPhase = eGamePhase.COST_SUMMON_SPELL;
//             break;
//         case eGamePhase.COST_SUMMON_SPELL:
//             this.currentPhase = eGamePhase.ATTACK;
//             break;
//         case eGamePhase.ATTACK:
//             this.currentPhase = eGamePhase.MEMORY_GAME;
//             break;
//     }
//   }
// }
