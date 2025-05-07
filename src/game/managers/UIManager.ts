export class UIManager {
    private scene: Phaser.Scene;
  
    constructor(scene: Phaser.Scene) {
      this.scene = scene;
    }
  
    showMyTurnUI() {
      // ボタンなど表示
    }
  
    showOpponentTurnUI() {
      // 相手ターン中の表示切り替え
    }
  
    showMessage(text: string) {
      // 汎用メッセージ表示
    }
  }
  