import { EventBus } from '../EventBus';

export class GameClient {
  private roomId: string;
  private myId: string;
  private opponentId: string;
  private isMyTurn: boolean = false;

  constructor(roomId: string, myId: string, opponentId: string) {
    this.roomId = roomId;
    this.myId = myId;
    this.opponentId = opponentId;
  }

  startGame() {
    // プレイヤー1から開始
    if (this.isMyTurn) {
      EventBus.emit('turn-start', { 
        roomId: this.roomId,
        playerId: this.myId,
        opponentId: this.opponentId 
      });
    }
  }

  async endTurn() {
    this.isMyTurn = false;
    await this.sendMyMove({ 
      type: 'end-turn',
      roomId: this.roomId,
      playerId: this.myId
    });
    EventBus.emit('turn-end', { 
      roomId: this.roomId,
      playerId: this.myId,
      opponentId: this.opponentId 
    });
  }

  async getOpponentMove(): Promise<any> {
    // モックサーバーからの応答をシミュレート
    return {
      move: 'attack',
      cardId: Math.floor(Math.random() * 10),
      position: { x: Math.random() * 700, y: Math.random() * 400 },
      roomId: this.roomId,
      playerId: this.opponentId
    };
  }
  
  async sendMyMove(move: any): Promise<void> {
    // モックサーバーへの送信をシミュレート
    console.log('Sending move to mock server:', {
      ...move,
      roomId: this.roomId,
      playerId: this.myId
    });
  }
  
  async getOpponentStatus(): Promise<any> {
    // モックサーバーからの応答をシミュレート
    return {
      roomId: this.roomId,
      playerId: this.opponentId,
      health: 100,
      cards: Array(5).fill(null).map(() => ({
        id: Math.floor(Math.random() * 10),
        attack: Math.floor(Math.random() * 10),
        defense: Math.floor(Math.random() * 10)
      }))
    };
  }

  isCurrentTurn(): boolean {
    return this.isMyTurn;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getMyId(): string {
    return this.myId;
  }

  getOpponentId(): string {
    return this.opponentId;
  }
}
