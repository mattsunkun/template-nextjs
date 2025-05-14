import { Scene } from 'phaser';
import { CPUClient } from '../clients/CPUClient';
import { GameClient } from '../clients/GameClient';

export class GameStart extends Scene {
    private startButton: Phaser.GameObjects.Text;
    private roomId: string = '';
    private myId: string = '';
    private opponentId: string = '';

    constructor() {
        super('GameStart');
    }

    create() {
        // タイトル表示
        this.add.text(this.scale.width / 2, 100, '神経衰弱', {
            fontSize: '64px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // 開始ボタン
        this.startButton = this.add.text(this.scale.width / 2, 300, 'ゲーム開始', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.startGame();
        })
        .on('pointerover', () => {
            this.startButton.setStyle({ backgroundColor: '#333333' });
        })
        .on('pointerout', () => {
            this.startButton.setStyle({ backgroundColor: '#000000' });
        });
    }

    private startGame() {
        // ルームIDとプレイヤーIDを生成
        this.roomId = `room_${Math.random().toString(36).substr(2, 9)}`;
        this.myId = `player_${Math.random().toString(36).substr(2, 9)}`;
        this.opponentId = `cpu_${Math.random().toString(36).substr(2, 9)}`;

        // プレイヤーとCPUのGameClientを生成
        const playerClient = new GameClient(this.roomId, this.myId, this.opponentId, true);
        const cpuClient = new CPUClient(this.roomId, this.opponentId, this.myId);

        // ゲームシーンに遷移
        this.scene.start('GameScene', {
            roomId: this.roomId,
            playerClient: playerClient,
            cpuClient: cpuClient
        });
    }
} 