import { generateStringUuid } from '@/utils/functions';
import { Scene } from 'phaser';
import { LocalServer } from '../servers/LocalServer';

export class GameStart extends Scene {
    private memoryGameButton: Phaser.GameObjects.Text;
    private debugToggleButton: Phaser.GameObjects.Text;
    private myTurnToggleButton: Phaser.GameObjects.Text;
    private shuffleToggleButton: Phaser.GameObjects.Text;
    private allPairCount: Phaser.GameObjects.Text;
    private isDebugMode: boolean = false;
    private isMyTurn: boolean = true;
    private isShuffle: boolean = true;
    private roomId: string = '';
    private myId: string = '';
    private opponentId: string = '';

    constructor() {
        super('GameStart');
    }

    create() {
        this.allPairCount = this.add.text(this.scale.width / 2, 100, 'ペア数: 13', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.setAllPairCount(5);
        })
        .on('pointerover', () => {
            this.allPairCount.setStyle({ backgroundColor: '#333333' });
        })
        // デバッグモードトグルボタン
        this.debugToggleButton = this.add.text(this.scale.width / 2, 150, 'デバッグモード: OFF', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.toggleDebugMode();
        })
        .on('pointerover', () => {
            this.debugToggleButton.setStyle({ backgroundColor: '#333333' });
        })
        .on('pointerout', () => {
            this.debugToggleButton.setStyle({ backgroundColor: this.isDebugMode ? '#4CAF50' : '#000000' });
        });

        // 先手設定トグルボタン
        this.myTurnToggleButton = this.add.text(this.scale.width / 2, 200, '先手設定: ON', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.toggleMyTurn();
        })
        .on('pointerover', () => {
            this.myTurnToggleButton.setStyle({ backgroundColor: '#333333' });
        })
        .on('pointerout', () => {
            this.myTurnToggleButton.setStyle({ backgroundColor: this.isMyTurn ? '#4CAF50' : '#000000' });
        });

        // シャッフル設定トグルボタン
        this.shuffleToggleButton = this.add.text(this.scale.width / 2, 250, 'シャッフル: ON', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.toggleShuffle();
        })
        .on('pointerover', () => {
            this.shuffleToggleButton.setStyle({ backgroundColor: '#333333' });
        })
        .on('pointerout', () => {
            this.shuffleToggleButton.setStyle({ backgroundColor: this.isShuffle ? '#4CAF50' : '#000000' });
        });

        // 神経衰弱ゲームボタン
        this.memoryGameButton = this.add.text(this.scale.width / 2, 300, '神経衰弱', {
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
    }

    private setAllPairCount(count: number) {
        LocalServer.setAllPairCount(count);
        this.allPairCount.setText(`ペア数: ${count}`);
    }

    private toggleDebugMode() {
        this.isDebugMode = !this.isDebugMode;
        LocalServer.setDebugMode(this.isDebugMode);
        this.debugToggleButton.setText(`デバッグモード: ${this.isDebugMode ? 'ON' : 'OFF'}`);
        this.debugToggleButton.setStyle({ 
            backgroundColor: this.isDebugMode ? '#4CAF50' : '#000000'
        });
    }

    private toggleMyTurn() {
        this.isMyTurn = !this.isMyTurn;
        LocalServer.setIsMyTurn(this.isMyTurn);
        this.myTurnToggleButton.setText(`先手設定: ${this.isMyTurn ? 'ON' : 'OFF'}`);
        this.myTurnToggleButton.setStyle({ 
            backgroundColor: this.isMyTurn ? '#4CAF50' : '#000000'
        });
    }

    private toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        LocalServer.setShuffle(this.isShuffle);
        this.shuffleToggleButton.setText(`シャッフル: ${this.isShuffle ? 'ON' : 'OFF'}`);
        this.shuffleToggleButton.setStyle({ 
            backgroundColor: this.isShuffle ? '#4CAF50' : '#000000'
        });
    }

    private startMemoryGame() {
        // ルームIDとプレイヤーIDを生成
        this.roomId = `local-${generateStringUuid()}`;
        this.myId = `player-${generateStringUuid()}`;
        this.opponentId = `cpu-${generateStringUuid()}`;

        // プレイヤーとCPUのGameClientを生成
        const idGameClient = {
            roomId: this.roomId,
            myId: this.myId,
            opponentId: this.opponentId
        }
        // 通常の神経衰弱ゲームシーンに遷移
        this.scene.start('GameScene', idGameClient);
    }
} 