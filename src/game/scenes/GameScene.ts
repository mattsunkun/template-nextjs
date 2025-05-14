import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { CPUClient } from '../clients/CPUClient';
import { GameClient } from '../clients/GameClient';
import { Card } from '../components/Card';
import { Table } from '../components/Table';

import { tSize } from '@/utils/types';
import { generateShuffledPairs } from '../servers/MockServer';

export const teams = ["spade", "heart"];

export type tCardGen = {
  pair: number;
  cost: number;
  attack: number;
  team: string;
  size: tSize;
}

export class GameScene extends Scene
{
    private camera: Phaser.Cameras.Scene2D.Camera;
    private gameText: Phaser.GameObjects.Text;
    private numAllPair: number = 10;
    private playerClient: GameClient;
    private cpuClient: CPUClient;
    private table: Table;
    private scoreText: Phaser.GameObjects.Text;
    private firstCard: Card | null = null;
    private secondCard: Card | null = null;
    private isProcessing: boolean = false;
    private score: number = 0;
    private opponentScore: number = 0;
    private turnText: Phaser.GameObjects.Text;

    constructor()
    {
        super('GameScene');
    }

    init(data: { roomId: string, playerClient: GameClient, cpuClient: CPUClient }) {
        this.playerClient = data.playerClient;
        this.cpuClient = data.cpuClient;
    }

    preload(){
        for (const team of teams) {
            this.load.image(`card_back/${team}/`, `assets/card_back/${team}.png`);
            for (let i = 0; i <= this.numAllPair; i++) {
              this.load.image(`card_front/${team}/${i}`, `assets/card_front/${team}/${i}.png`);
            }
            
        }
    }

    async create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        // イベントリスナーの設定
        this.setupEventListeners();

        const margin = 15;
    
        const cards: Card[] = [];

        const cardGen = generateShuffledPairs(this.numAllPair); // 6ペア（計12枚）
    
        for (let i = 0; i < this.numAllPair*teams.length; i++) {
        //   const card = new Card(this, 0, 0, i); // 位置はあとでTableで決める
        //   card.setDisplaySize(cardWidth, cardHeight);
        //   cards.push(card);
            // const x = (this.scale.width - cols*CARD_SIZE.width)/2 + (i % cols) * (CARD_SIZE.width + CARD_PADDING);
            // const y = CARD_OFFEST_Y + Math.floor(i / cols) * (CARD_SIZE.height + CARD_PADDING);
            const card = new Card(this, 0,0, cardGen[i]);
    
            card.on('cardClicked', this.onCardClicked, this);
            cards.push(card);
        }
    
        // 画面中央に盤面を配置
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const tableWidth = 700;
        const tableHeight = 400;
        const tableX = (screenWidth - tableWidth) / 2;
        const tableY = (screenHeight - tableHeight) / 2 + 50; // 上部に余白を設ける

        this.table = new Table(this, cards, tableX, tableY, tableWidth, tableHeight, margin);

        // スコア表示の作成（上部中央）
        this.createScoreText();
        // ターン表示の作成（上部中央）
        this.createTurnText();

        // // ターン終了ボタンの作成
        // this.createEndTurnButton();

        // ゲーム開始
        this.playerClient.startGame();

        EventBus.emit('current-scene-ready', this);
    }

    private createScoreText() {
        this.scoreText = this.add.text(this.scale.width / 2, 30, 'あなた: 0  CPU: 0', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }

    private createTurnText() {
        this.turnText = this.add.text(this.scale.width / 2, 80, 'あなたのターン', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }

    private setupEventListeners() {
        EventBus.on('turn-start', this.onTurnStart, this);
        EventBus.on('turn-end', this.onTurnEnd, this);
        EventBus.on('cpu-select-card', this.onCpuSelectCard, this);
        EventBus.on('cpu-match-pair', this.onCpuMatchPair, this);
        EventBus.on('cpu-mismatch-pair', this.onCpuMismatchPair, this);
    }

    private async onCardClicked(card: Card) {
        if (this.isProcessing || card.isFaceUp() || card.isPaired()) {
            return;
        }

        card.reveal();

        if (!this.firstCard) {
            this.firstCard = card;
        } else {
            this.secondCard = card;
            this.isProcessing = true;

            // カードのペアをチェック
            if (this.firstCard.getValue() === this.secondCard.getValue()) {
                // ペアが見つかった場合
                this.score += 10;
                this.updateScoreText();
                
                this.firstCard.match();
                this.secondCard.match();

                // ゲームクリアチェック
                const allCards = this.table.getCards();
                const isGameClear = allCards.every(card => card.isPaired());
                if (isGameClear) {
                    this.handleGameClear();
                }
            } else {
                // ペアが見つからなかった場合
                await this.delay(1000);
                this.firstCard.hide();
                this.secondCard.hide();
                // ターンをCPUに切り替え
                this.playerClient.endTurn();
            }

            this.firstCard = null;
            this.secondCard = null;
            this.isProcessing = false;
        }
    }

    private updateScoreText() {
        this.scoreText.setText(`あなた: ${this.score}  CPU: ${this.opponentScore}`);
    }

    private handleGameClear() {
        const winner = this.score > this.opponentScore ? 'あなた' : 'CPU';
        this.add.text(this.scale.width / 2, this.scale.height / 2, `${winner}の勝利！`, {
            fontSize: '64px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // 3秒後にゲームオーバー画面へ
        this.time.delayedCall(3000, () => {
            this.changeScene();
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => this.time.delayedCall(ms, resolve));
    }

    private async onTurnStart(data: { roomId: string, playerId: string, opponentId: string }) {
        console.log(`Turn started for player: ${data.playerId} in room: ${data.roomId}`);
        if (data.playerId === this.playerClient.getMyId()) {
            // プレイヤーのターン
            this.turnText.setText('あなたのターン');
            this.table.setInteractive(true);
        } else {
            // CPUのターン
            this.turnText.setText('CPUのターン');
            this.table.setInteractive(false);
            
            // 利用可能なカードをCPUに渡す
            const cards = this.table.getCards();
            this.cpuClient.setAvailableCards(cards);
            
            // CPUの行動を開始
            await this.cpuClient.processMove();
        }
    }

    private async onTurnEnd(data: { roomId: string, playerId: string, opponentId: string }) {
        console.log(`Turn ended for player: ${data.playerId} in room: ${data.roomId}`);
        // 次のプレイヤーのターンを開始
        EventBus.emit('turn-start', { 
            roomId: data.roomId,
            playerId: data.opponentId,
            opponentId: data.playerId
        });
    }

    private async onCpuSelectCard(data: { roomId: string, playerId: string, cardIndex: number, isFirstCard: boolean }) {
        const cards = this.table.getCards();
        const card = cards[data.cardIndex];
        
        if (card) {
            card.reveal();
        }
    }

    private async onCpuMatchPair(data: { roomId: string, playerId: string, firstCardIndex: number, secondCardIndex: number }) {
        const cards = this.table.getCards();
        const firstCard = cards[data.firstCardIndex];
        const secondCard = cards[data.secondCardIndex];
        
        if (firstCard && secondCard) {
            this.opponentScore += 10;
            this.updateScoreText();
            
            firstCard.match();
            secondCard.match();
            
            // ゲームクリアチェック
            const isGameClear = cards.every(card => card.isPaired());
            if (isGameClear) {
                this.handleGameClear();
            }
        }
    }

    private async onCpuMismatchPair(data: { roomId: string, playerId: string, firstCardIndex: number, secondCardIndex: number }) {
        const cards = this.table.getCards();
        const firstCard = cards[data.firstCardIndex];
        const secondCard = cards[data.secondCardIndex];
        
        if (firstCard && secondCard) {
            firstCard.hide();
            secondCard.hide();
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
