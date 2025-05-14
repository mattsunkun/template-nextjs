import { GameClient } from '../clients/GameClient';
import { UIManager } from './UIManager';

export class TurnManager {
  private scene: Phaser.Scene;
  private uiManager: UIManager;
  private apiClient: GameClient;
  private isMyTurn: boolean = false;

  constructor(scene: Phaser.Scene, uiManager: UIManager, apiClient: GameClient) {
    this.scene = scene;
    this.uiManager = uiManager;
    this.apiClient = apiClient;
  }

  startMyTurn() {
    this.isMyTurn = true;
    this.uiManager.showMyTurnUI();
  }

  endMyTurn() {
    this.isMyTurn = false;
    // this.apiClient.sendMyMove(); // 自分の行動をサーバーに送信
    this.uiManager.showOpponentTurnUI();
    this.waitForOpponent();
  }

  async waitForOpponent() {
    const move = await this.apiClient.getOpponentMove();
    // 取得した相手の行動を処理
    this.startMyTurn();
  }
}
