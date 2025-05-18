import { tCardPhase } from "../managers/PhaseManager";
import { LocalServer } from "../servers/LocalServer";
import { CSSGameClient } from "./CSSGameClient";

export type tCardFullInfo = {
  id: string;

  idFrontBack: string;
  pair_id: number;

  image_id: tImageId;


  cost: number;
  attack: number;
  isMyCard: boolean;

  spell_id?: string;

  isSpellDeck: boolean;
}

export type tImageId = {
  front: string;
  real: string;
  back: string;
}

export type tRule = {
  isMyTurn: boolean;
  allPairCount: number;
  disCardPairCount: number;
  usePairCount: number;
  spellCount: number;
}

export type tPreference = {
  cardBackId: string;
}

export type tCardKnownInfo = {
  idFrontBack: string;
  id: string;
  isMyCard: boolean;
  
  idImageBack: string;

  isSpellDeck: boolean;

  debug?: {
    pair_id: number;
    spell_id?: string;
  }
}

export enum eMode {
  LOCAL = "local",
  ONLINE = "online",
}

export type tGameClient = {
  roomId: string;
  myId: string;
  opponentId: string;
  
}

export class GameClient {
  private roomId: string;
  private myId: string;
  private opponentId: string;
  private _isMyTurn: boolean;
  private localServer: LocalServer;

  public cssGameClient: CSSGameClient;

  public get isMyTurn(): boolean {
    return this._isMyTurn;
  }
  

  constructor(gameClient: tGameClient) {
    this.roomId = gameClient.roomId;
    this.myId = gameClient.myId;
    this.opponentId = gameClient.opponentId;
    if(this.roomId.substring(0, 6) === "local-") {
      this.localServer = new LocalServer(this.roomId, this.myId, this.opponentId);
    }

    this.cssGameClient = new CSSGameClient(gameClient, this.localServer);

    this.fetchRule().then(rule => {
      this._isMyTurn = rule.isMyTurn;
    });
  }

  private async fetch(name:string): Promise<any> {
    const response = await fetch(`/api/game/${name}`);
    return response.json();
  }


  async fetchShuffledCardKnownInfoAsync(): Promise<tCardKnownInfo[]> {
    if(this.localServer) {
      return await this.localServer.fetchShuffledCardKnownInfoAsync();
    } else{
      return await this.fetch("shuffled-card-known-info") as tCardKnownInfo[];
    }
  }

  async fetchShuffledSpellKnownInfoAsync(): Promise<tCardKnownInfo[]> {
    if(this.localServer) {
      return await this.localServer.fetchShuffledSpellKnownInfoAsync();
    } else{
      return await this.fetch("shuffled-spell-known-info") as tCardKnownInfo[];
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

  
  async receiveOpponentCardFullInfo(cardPhases:tCardPhase[]): Promise<tCardFullInfo|undefined> {
    if(this.localServer) {
      return await this.localServer.receiveOpponentCardFullInfo(cardPhases);

    } else {
      const response = await fetch(`/api/game/opponent-card-full-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardPhases }),
      });
      return response.json() as Promise<tCardFullInfo>;
    }
  }
}
