import { Card } from '../components/Card';
import { EventBus } from '../EventBus';
import { GameClient } from './GameClient';

export class CPUClient extends GameClient {
    private firstCard: Card | null = null;
    private secondCard: Card | null = null;
    private availableCards: Card[] = [];

    constructor(roomId: string, myId: string, opponentId: string) {
        super(roomId, myId, opponentId, false);
    }

    setAvailableCards(cards: Card[]): void {
        this.availableCards = cards.filter(card => !card.isFaceUp() && !card.isPaired());
    }

    async processMove(): Promise<void> {
        // CPUの手番処理を開始
        await this.delay(1000);
        
        if (this.availableCards.length >= 2) {
            // カード選択イベントを発行
            await this.selectFirstCard();
        } else {
            // 選択可能なカードがない場合はプレイヤーのターンに
            this.switchToPlayerTurn();
        }
    }

    private async selectFirstCard(): Promise<void> {
        // 最初のカードをランダムに選択
        this.firstCard = this.availableCards[Math.floor(Math.random() * this.availableCards.length)];
        
        EventBus.emit('cpu-select-card', {
            roomId: this.getRoomId(),
            playerId: this.getMyId(),
            cardIndex: this.availableCards.indexOf(this.firstCard),
            isFirstCard: true
        });

        await this.delay(500);
        
        // 次に2枚目のカードを選択
        await this.selectSecondCard();
    }

    private async selectSecondCard(): Promise<void> {
        // 2枚目のカードを選択（firstCardと異なるもの）
        const remainingCards = this.availableCards.filter(card => 
            card !== this.firstCard && !card.isFaceUp() && !card.isPaired()
        );
        
        if (remainingCards.length > 0) {
            this.secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
            
            EventBus.emit('cpu-select-card', {
                roomId: this.getRoomId(),
                playerId: this.getMyId(),
                cardIndex: this.availableCards.indexOf(this.secondCard),
                isFirstCard: false
            });

            await this.delay(1000);
            
            // カードのペアを確認
            this.checkPair();
        } else {
            // 2枚目のカードがない場合はプレイヤーのターンに
            this.switchToPlayerTurn();
        }
    }

    private async checkPair(): Promise<void> {
        if (!this.firstCard || !this.secondCard) {
            this.switchToPlayerTurn();
            return;
        }

        // ペアの判定
        if (this.firstCard.getValue() === this.secondCard.getValue()) {
            // マッチした場合
            EventBus.emit('cpu-match-pair', {
                roomId: this.getRoomId(),
                playerId: this.getMyId(),
                firstCardIndex: this.availableCards.indexOf(this.firstCard),
                secondCardIndex: this.availableCards.indexOf(this.secondCard)
            });
            
            // 続けてCPUのターン
            await this.delay(1000);
            this.endTurn();
        } else {
            // マッチしなかった場合
            await this.delay(1000);
            
            EventBus.emit('cpu-mismatch-pair', {
                roomId: this.getRoomId(),
                playerId: this.getMyId(),
                firstCardIndex: this.availableCards.indexOf(this.firstCard),
                secondCardIndex: this.availableCards.indexOf(this.secondCard)
            });
            
            // プレイヤーのターンに切り替え
            this.switchToPlayerTurn();
        }
        
        // カード状態をリセット
        this.firstCard = null;
        this.secondCard = null;
    }
    
    private switchToPlayerTurn(): void {
        // プレイヤーのターンに直接切り替え
        EventBus.emit('turn-start', {
            roomId: this.getRoomId(),
            playerId: this.getOpponentId(),
            opponentId: this.getMyId()
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
} 