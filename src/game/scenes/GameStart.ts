import { generateStringUuid } from '@/utils/functions';
import { Scene } from 'phaser';
import { GameClient } from '../clients/GameClient';
export class GameStart extends Scene {
    private memoryGameButton: Phaser.GameObjects.Text;
    private cardGameButton: Phaser.GameObjects.Text;
    private roomId: string = '';
    private myId: string = '';
    private opponentId: string = '';

    constructor() {
        super('GameStart');
    }

    create() {
        // タイトル表示
        this.add.text(this.scale.width / 2, 100, 'ミニゲームコレクション', {
            fontSize: '48px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // 神経衰弱ゲームボタン
        this.memoryGameButton = this.add.text(this.scale.width / 2, 250, '神経衰弱', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.startMemoryGame();
        })
        .on('pointerover', () => {
            this.memoryGameButton.setStyle({ backgroundColor: '#333333' });
        })
        .on('pointerout', () => {
            this.memoryGameButton.setStyle({ backgroundColor: '#000000' });
        });

        this.startMemoryGame();
    }

    private startMemoryGame() {
        // ルームIDとプレイヤーIDを生成
        this.roomId = `local-${generateStringUuid()}`;
        this.myId = `player-${generateStringUuid()}`;
        this.opponentId = `cpu-${generateStringUuid()}`;

        // プレイヤーとCPUのGameClientを生成
        const isMyTurn = Math.random() < 0.5;

        const gameClient = new GameClient({
            roomId: this.roomId,
            myId: this.myId,
            opponentId: this.opponentId
        });

        // 通常の神経衰弱ゲームシーンに遷移
        this.scene.start('GameScene', gameClient);
    }

} 