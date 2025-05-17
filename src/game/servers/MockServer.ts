import { generateStringUuid } from '@/utils/functions';
import { tSize } from '@/utils/types';
import { tCardFullInfo, tCardKnownInfo, tRule } from '../clients/GameClient';
import { tCardPhase } from '../managers/PhaseManager';
import { eGamePhase } from '../managers/TurnManager';

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
    this._isMyTurn = false; //Math.random() < 0.5
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

  
  receiveOpponentCardFullInfo(cardPhases:tCardPhase[]): tCardFullInfo|undefined {
    if(Math.random() < 0.5){
      return this.getRandomPairCard(cardPhases);
    }else{
      return this.getCheatingPairCard(cardPhases);
    }
  }
  private selectedRandomCard: tCardFullInfo | undefined;

  getRandomPairCard(cardPhases: tCardPhase[]): tCardFullInfo | undefined {
    if (this.selectedRandomCard) {
      const cardToReturn = this.selectedRandomCard;
      this.selectedRandomCard = undefined;
      return cardToReturn;
    }
    // MEMORY_GAMEフェーズのカードのみ抽出
    const memoryGameCards = cardPhases.filter(phase => 
        phase.status === eGamePhase.MEMORY_GAME

    );

    if (memoryGameCards.length === 0) {
        return undefined;
    }

    // ランダムに2枚のカードを選択
    const randomIndex1 = Math.floor(Math.random() * memoryGameCards.length);
    let randomIndex2 = Math.floor(Math.random() * (memoryGameCards.length - 1));
    if (randomIndex2 >= randomIndex1) randomIndex2++;

    const selectedCard1 = memoryGameCards[randomIndex1];
    const selectedCard2 = memoryGameCards[randomIndex2];

    // 両方のカードのフル情報を取得
    const selectedCardFull1 = this.fetchSpecificCardFullInfo(selectedCard1.info.cardKnownInfo.idFrontBack);
    const selectedCardFull2 = this.fetchSpecificCardFullInfo(selectedCard2.info.cardKnownInfo.idFrontBack);

    if (!selectedCardFull1 || !selectedCardFull2) return undefined;

    // 1枚目を保存し、もう1枚を返す
    this.selectedRandomCard = selectedCardFull1;
    return selectedCardFull2;
    // // すでに1枚目が選択されている場合は、それを返して初期化
    // if (this.selectedRandomCard) {
    //     const cardToReturn = this.selectedRandomCard;
    //     this.selectedRandomCard = undefined;
    //     return cardToReturn;
    // }

    // // MEMORY_GAMEフェーズのカードのみ抽出
    // const memoryGameCards = cardPhases.filter(phase => 
    //     phase.status === eGamePhase.MEMORY_GAME
    // );

    // if (memoryGameCards.length === 0) {
    //     return undefined;
    // }

    // // ランダムにカードを1枚選択
    // const randomIndex = Math.floor(Math.random() * memoryGameCards.length);
    // const selectedCard = memoryGameCards[randomIndex];

    // // 選択したカードのフル情報を取得
    // const selectedCardFull = this.fetchSpecificCardFullInfo(selectedCard.info.cardKnownInfo.idFrontBack);
    // if (!selectedCardFull) return undefined;

    // // 1枚目として保存
    // this.selectedRandomCard = selectedCardFull;
    // return selectedCardFull;
  }

private selectedCheatingPairCard: tCardFullInfo | undefined;

getCheatingPairCard(cardPhases: tCardPhase[]): tCardFullInfo | undefined {
    // すでに1枚目が選択されている場合は、それを返して初期化
    if (this.selectedCheatingPairCard) {
        const cardToReturn = this.selectedCheatingPairCard;
        this.selectedCheatingPairCard = undefined;
        return cardToReturn;
    }

    // MEMORY_GAMEフェーズのカードのみ抽出
    const memoryGameCards = cardPhases.filter(phase => 
        phase.status === eGamePhase.MEMORY_GAME
    );

    if (memoryGameCards.length === 0) {
        return undefined;
    }

    // ランダムにカードを1枚選択
    const randomIndex = Math.floor(Math.random() * memoryGameCards.length);
    const selectedCard = memoryGameCards[randomIndex];
    
    // 選択したカードのフル情報を取得
    const selectedCardFull = this.fetchSpecificCardFullInfo(selectedCard.info.cardKnownInfo.idFrontBack);
    if (!selectedCardFull) return undefined;

    // 選択したカードと同じpair_idを持つカードを探す
    const pairCards = memoryGameCards.filter(card => {
        const cardFull = this.fetchSpecificCardFullInfo(card.info.cardKnownInfo.idFrontBack);
        return cardFull && 
               cardFull.pair_id === selectedCardFull.pair_id && 
               cardFull.idFrontBack !== selectedCardFull.idFrontBack;
    });

    if (pairCards.length === 0) {
        return undefined;
    }

    // ペアとなるカードをランダムに選択
    const randomPairIndex = Math.floor(Math.random() * pairCards.length);
    const selectedPairCardInfo = this.fetchSpecificCardFullInfo(pairCards[randomPairIndex].info.cardKnownInfo.idFrontBack);

    if (!selectedPairCardInfo) return undefined;

    // 2枚目のカードを保存
    this.selectedCheatingPairCard = selectedPairCardInfo;

    // 1枚目のカードを返す
    return selectedCardFull;
}

}
