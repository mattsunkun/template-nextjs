import { LocalServer } from "../servers/MockServer";

export type tCardFullInfo = {
  id: string;

  idFrontBack: string;
  pair_id: number;

  image_id: tImageId;


  cost: number;
  attack: number;
  team: string;
}

export type tImageId = {
  front: string;
  real: string;
}

export type tRule = {
  isMyTurn: boolean;
}

export type tPreference = {
  cardBackId: string;
}

export type tCardKnownInfo = {
  idFrontBack: string;
  id: string;
  team: string;

  debug?: {
    pair_id: number;
  }
}

export enum eMode {
  LOCAL = "local",
  ONLINE = "online",
}

export class GameClient {
  private roomId: string;
  private myId: string;
  private opponentId: string;
  private _isMyTurn: boolean;
  private localServer: LocalServer;

  public get isMyTurn(): boolean {
    return this._isMyTurn;
  }
  

  constructor(roomId: string, myId: string, opponentId: string) {
    this.roomId = roomId;
    this.myId = myId;
    this.opponentId = opponentId;
    if(this.roomId.substring(0, 6) === "local-") {
      this.localServer = new LocalServer(this.roomId, this.myId, this.opponentId);
    }

    this.fetchRule().then(rule => {
      this._isMyTurn = rule.isMyTurn;
    });


  }

  private async fetch(name:string): Promise<any> {
    const response = await fetch(`/api/game/${name}`);
    return response.json();
  }


  async fetchShuffledCardKnownInfo(): Promise<tCardKnownInfo[]> {
    if(this.localServer) {
      return this.localServer.fetchShuffledCardKnownInfo();
    } else{
      return await this.fetch("shuffled-card-known-info") as tCardKnownInfo[];
    }
  }

  async fetchSpecificCardFullInfo(idFrontBack: string): Promise<tCardFullInfo|undefined> {
    if(this.localServer) {
      return this.localServer.fetchSpecificCardFullInfo(idFrontBack);
    } else{
      return await this.fetch("specific-card-full-info") as tCardFullInfo;
    }
  }

  async fetchRule(): Promise<tRule> {
    if(this.localServer) {
      return this.localServer.fetchRule();
    } else{
      return await this.fetch("rule") as tRule;
    }

  }

  // startGame() {
  //   // プレイヤー1から開始
  //   if (this.isMyTurn) {
  //     EventBus.emit('turn-start', { 
  //       roomId: this.roomId,
  //       playerId: this.myId,
  //       opponentId: this.opponentId 
  //     });
  //   }
  // }

  // async endTurn() {
  //   this.isMyTurn = false;
  //   await this.sendMyMove({ 
  //     type: 'end-turn',
  //     roomId: this.roomId,
  //     playerId: this.myId
  //   });
  //   EventBus.emit('turn-end', { 
  //     roomId: this.roomId,
  //     playerId: this.myId,
  //     opponentId: this.opponentId 
  //   });
  // }

  // async getOpponentMove(): Promise<any> {
  //   // モックサーバーからの応答をシミュレート
  //   return {
  //     move: 'attack',
  //     cardId: Math.floor(Math.random() * 10),
  //     position: { x: Math.random() * 700, y: Math.random() * 400 },
  //     roomId: this.roomId,
  //     playerId: this.opponentId
  //   };
  // }
  
  // async sendMyMove(move: any): Promise<void> {
  //   // モックサーバーへの送信をシミュレート
  //   console.log('Sending move to mock server:', {
  //     ...move,
  //     roomId: this.roomId,
  //     playerId: this.myId
  //   });
  // }
  
  // async getOpponentStatus(): Promise<any> {
  //   // モックサーバーからの応答をシミュレート
  //   return {
  //     roomId: this.roomId,
  //     playerId: this.opponentId,
  //     health: 100,
  //     cards: Array(5).fill(null).map(() => ({
  //       id: Math.floor(Math.random() * 10),
  //       attack: Math.floor(Math.random() * 10),
  //       defense: Math.floor(Math.random() * 10)
  //     }))
  //   };
  // }

  // isCurrentTurn(): boolean {
  //   return this.isMyTurn;
  // }

  // getRoomId(): string {
  //   return this.roomId;
  // }

  // getMyId(): string {
  //   return this.myId;
  // }

  // getOpponentId(): string {
  //   return this.opponentId;
  // }
}
