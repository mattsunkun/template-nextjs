import { PhaseManager } from "../managers/PhaseManager";
import { LocalServer } from "../servers/LocalServer";
import { AttackClient } from "./AttackClient";
import { CSSGameClient } from "./CSSGameClient";
import { MemoryGameClient } from "./MemoryGameClient";

export enum eCardArea {
  TABLE = "table",
  DECK = "deck",
  HAND = "hand",
  SUMMON = "summon",
  TOMB = "tomb",
  DISCARD = "discard",
}

export enum CardStatus {
  FRONT = "front",
  BACK = "back",
  REAL = "real",
  STAND = "stand",
  VANISHED = "vanished"
}

export enum eWho {
  MY = "my",
  OPPONENT = "opponent",
}

export type tCardInfo = {
  
  // つがいのid
  readonly idFrontBack: string;

  // 裏面の表示
  readonly idImageBack: string;

  // 位置
  place: tPlace;

  // デバッグ用
  debug?: {
    pair_id: number;
    spell_id?: string;
  }

  // 追加情報
  addInfo?: tCardAddInfo
}

export type tPlace = {
  who: eWho;
  area: eCardArea;
  position: number;
  cardStatus: CardStatus;
}

export type tCardAddInfo = {

  // つがいのid
  readonly idFrontBack: string;


  readonly pair_id: number;
  readonly image_id: tImageId;
  readonly cost: number;
  readonly attack: number;
  readonly ability?: string;
  readonly isSpellable: boolean;
  readonly isSummonable: boolean;

  nowAttack: number;
}

// export type tCardFullInfo = {

//   idFrontBack: string;
//   pair_id: number;

//   image_id: tImageId;


//   cost: number;
//   attack: number;
//   isMyCard: boolean;

//   spell_id?: string;

//   area: eCardArea;
// }

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

// export type tCardKnownInfo = {
//   idFrontBack: string;
//   id: string;
//   isMyCard: boolean;
  
//   idImageBack: string;

//   isSpellDeck: boolean;

//   debug?: {
//     pair_id: number;
//     spell_id?: string;
//   }
// }



export type tGameClient = {
  roomId: string;
  myId: string;
  opponentId: string;  
}

export class GameClient {
  public phaseManager:PhaseManager;
  private idGameClient: tGameClient;
  private _isMyTurn: boolean;
  private localServer: LocalServer;

  public attackClient: AttackClient;
  public memoryGameClient: MemoryGameClient;
  public cssGameClient: CSSGameClient;  

  constructor(idGameClient: tGameClient, phaseManager: PhaseManager) {
    this.idGameClient = idGameClient;

    this.phaseManager = phaseManager;

    if(this.idGameClient.roomId.substring(0, 6) === "local-") {
      this.localServer = new LocalServer(this.idGameClient);
    }

    this.attackClient = new AttackClient(this, this.idGameClient, this.localServer);
    this.memoryGameClient = new MemoryGameClient(this, this.idGameClient, this.localServer);
    this.cssGameClient = new CSSGameClient(this, this.idGameClient, this.localServer);

  }

  // public setPhaseManager(phaseManager: PhaseManager) {
  //   debugger
  //   this.phaseManager = phaseManager;
  // }

  private async fetch(name:string): Promise<any> {
    const response = await fetch(`/api/game/${name}`);
    return response.json();
  }

  async postCardInfoPlaceAsync(cardIdFrontBack: string, place: tPlace): Promise<void> {
    if(this.localServer) {
      await this.localServer.postCardInfosAsync(cardIdFrontBack, place);
    } else{
      throw new Error("localServer is undefined");
    }
  }


  async fetchShuffledCardKnownInfoAsync(): Promise<tCardInfo[]> {
    if(this.localServer) {
      return await this.localServer.fetchShuffledCardKnownInfoAsync();
    } else{
      return await [];
    }
  }

  async fetchSpecificCardFullInfoAsync(idFrontBack: string): Promise<tCardAddInfo> {
    if(this.localServer) {
      return await this.localServer.fetchSpecificCardFullInfo(idFrontBack);
    } else{
      throw new Error("localServer is undefined");
    }
  }

  async fetchRuleAsync(): Promise<tRule> {
    if(this.localServer) {
      return await this.localServer.fetchRuleAsync();
    } else{
      return await this.fetch("rule") as tRule;
    }
  }

}
