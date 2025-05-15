import { Scene } from 'phaser';
import { CPUClient } from '../clients/CPUClient';
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

        // カードゲームボタン
        this.cardGameButton = this.add.text(this.scale.width / 2, 350, 'カードバトル', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.startCardGame();
        })
        .on('pointerover', () => {
            this.cardGameButton.setStyle({ backgroundColor: '#333333' });
        })
        .on('pointerout', () => {
            this.cardGameButton.setStyle({ backgroundColor: '#000000' });
        });
    }

    private startMemoryGame() {
        // ルームIDとプレイヤーIDを生成
        this.roomId = `room_${Math.random().toString(36).substr(2, 9)}`;
        this.myId = `player_${Math.random().toString(36).substr(2, 9)}`;
        this.opponentId = `cpu_${Math.random().toString(36).substr(2, 9)}`;

        // プレイヤーとCPUのGameClientを生成
        const playerClient = new GameClient(this.roomId, this.myId, this.opponentId, true);
        const cpuClient = new CPUClient(this.roomId, this.opponentId, this.myId);

        // 通常の神経衰弱ゲームシーンに遷移
        this.scene.start('GameScene', {
            roomId: this.roomId,
            playerClient: playerClient,
            cpuClient: cpuClient
        });
    }

    private startCardGame() {
        // カードバトルゲームシーンに遷移
        this.scene.start('CardGameScene');
    }
} 