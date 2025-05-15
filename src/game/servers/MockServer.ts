import { generateStringUuid } from '@/utils/functions';
import { tSize } from '@/utils/types';
import { tCardFullInfo, tCardKnownInfo, tRule } from '../clients/GameClient';

const CARD_SIZE:tSize = {
  width: 100, 
  height: 150,
}


const teams = ["spade", "heart"];
const pairCount = 10;
export class LocalServer {
  private roomId: string;
  private myId: string;
  private opponentId: string;
  private _isMyTurn: boolean;
  private cardKnownInfos: tCardKnownInfo[];
  private cardFullInfos: tCardFullInfo[];

  public get isMyTurn(): boolean {
    return this._isMyTurn;
  }


  constructor(roomId: string, myId: string, opponentId: string) {
    this.roomId = roomId;
    this.myId = myId;
    this.opponentId = opponentId;

    this.createCard();
    this.createRule();
  }

  createCard(){

    this.cardKnownInfos = [];
    this.cardFullInfos = [];
    for (const team of teams) {
      for (let i = 0; i <= pairCount; i++) {
        const idFrontBack = generateStringUuid();
        const known: tCardKnownInfo = {
          id: `${team}-${i}`,
          idFrontBack: idFrontBack,
          team: team,
          debug: {
            pair_id: i
          }
        };
        const full: tCardFullInfo = {
          id: `${team}-${i}`,
          idFrontBack: idFrontBack,
          pair_id: i,
          image_id: {
            front: `${team}_${i}`,
            real: `${team}_${i}_real`
          },
          cost: i,
          attack: pairCount - i,
          team: team
        };
        this.cardKnownInfos.push(known);
        this.cardFullInfos.push(full);
      }
    }
  }

  createRule(){
    this._isMyTurn = Math.random() < 0.5
  }

  fetchShuffledCardKnownInfo(): tCardKnownInfo[] {
    // カードをシャッフル
    const shuffled = [...this.cardKnownInfos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.cardKnownInfos = shuffled;
    return this.cardKnownInfos;
  }

  fetchSpecificCardFullInfo(idFrontBack: string): tCardFullInfo|undefined {
    return this.cardFullInfos.find(card => card.idFrontBack === idFrontBack);
  }


  fetchRule(): tRule {
    return {
      isMyTurn: this.isMyTurn
    };
  }

}
