import { generateStringUuid, sleep, unexpectError } from '@/utils/functions';
import { tSize } from '@/utils/types';
import { tCardFullInfo, tCardKnownInfo, tRule } from '../clients/GameClient';
import { eGamePhase, tCardPhase } from '../managers/PhaseManager';

const CARD_SIZE:tSize = {
  width: 100, 
  height: 150,
}

export enum eAssetFolderType {
  FRONT = 'front',
  BACK = 'back',
  REAL = 'real'
}


// export const _teams = ["spade", "heart"];
export const _allPairCount = 13;
export const _disCardPairCount = 1;
export const _usePairCount = _allPairCount - _disCardPairCount;
export const _spellCount = 10;
// export const _spellFrontPadId = "null";
// export const _spellBackPadId = "null";

// export const _spellFrontIds = {
//   spade: [
//   ],
//   heart: [
//   "shuffle.0", 

//   "scan.1.0", 
//   "scan.3.3", 
//   "scan.5.0", 
//   "scan.7.0", 
//   "scan.10.10", 

//   "defence.+.2", 
//   "defence.+.5", 

//   "cost.-.-1", 
//   "cost.-.-1", 
//   "cost.+.10", 

//   "attack.-.5", 
//   "attack.+.3", 
//   "attack.+.10", 
//   ]
// }
// export const _spellBackIds = {
//   spade: [
//     "design.0"
//   ],
//   heart: [
//     "design.0"
//   ]
// }

export type tCardInfo = {
  front: string;
  back: string;
  real: string;
}

export const myMemoryCardInfos: tCardInfo[] = [
  {
    front: "normal.heart.0",
    back: "normal.1", 
    real: "normal.heart.0"
  },
  {
    front: "normal.heart.1",
    back: "normal.1", 
    real: "normal.heart.1"
  },
  {
    front: "normal.heart.2",
    back: "normal.1", 
    real: "normal.heart.2"
  },
  {
    front: "normal.heart.3",
    back: "normal.1", 
    real: "normal.heart.3"
  },
  {
    front: "normal.heart.4",
    back: "normal.1", 
    real: "normal.heart.4"
  },
  {
    front: "normal.heart.5",
    back: "normal.1", 
    real: "normal.heart.5"
  },
  {
    front: "normal.heart.6",
    back: "normal.1", 
    real: "normal.heart.6"
  },
  {
    front: "normal.heart.7",
    back: "normal.1", 
    real: "normal.heart.7"
  },
  {
    front: "normal.heart.8",
    back: "normal.1", 
    real: "normal.heart.8"
  },
  {
    front: "normal.heart.9",
    back: "normal.1", 
    real: "normal.heart.9"
  },
  {
    front: "normal.heart.10",
    back: "normal.1", 
    real: "normal.heart.10"
  },
  {
    front: "normal.heart.11",
    back: "normal.1", 
    real: "normal.heart.11"
  },
  {
    front: "normal.heart.12",
    back: "normal.1", 
    real: "normal.heart.12"
  },
  {
    front: "normal.heart.13",
    back: "normal.1", 
    real: "normal.heart.13"
  }
];

export const opponentMemoryCardInfos: tCardInfo[] = [
  {
    front: "normal.spade.0",
    back: "normal.2", 
    real: "normal.spade.0"
  },
  {
    front: "normal.spade.1",
    back: "normal.2", 
    real: "normal.spade.1"
  },
  {
    front: "normal.spade.2",
    back: "normal.2", 
    real: "normal.spade.2"
  },
  {
    front: "normal.spade.3",
    back: "normal.2", 
    real: "normal.spade.3"
  },
  {
    front: "normal.spade.4",
    back: "normal.2", 
    real: "normal.spade.4"
  },
  {
    front: "normal.spade.5",
    back: "normal.2", 
    real: "normal.spade.5"
  },
  {
    front: "normal.spade.6",
    back: "normal.2", 
    real: "normal.spade.6"
  },
  {
    front: "normal.spade.7",
    back: "normal.2", 
    real: "normal.spade.7"
  },
  {
    front: "normal.spade.8",
    back: "normal.2", 
    real: "normal.spade.8"
  },
  {
    front: "normal.spade.9",
    back: "normal.2", 
    real: "normal.spade.9"
  },
  {
    front: "normal.spade.10",
    back: "normal.2", 
    real: "normal.spade.10"
  },
  {
    front: "normal.spade.11",
    back: "normal.2", 
    real: "normal.spade.11"
  },
  {
    front: "normal.spade.12",
    back: "normal.2", 
    real: "normal.spade.12"
  },
  {
    front: "normal.spade.13",
    back: "normal.2", 
    real: "normal.spade.13"
  }
];

export const mySpellCardInfos: tCardInfo[] = [
  {
    front: "shuffle.0",
    back: "normal.0",
    real: "shuffle.0"
  }, 
  {
    front: "defence.+.2",
    back: "normal.0",
    real: "defence.+.2"
  },
  {
    front: "defence.+.5",
    back: "normal.0",
    real: "defence.+.5"
  },
  {
    front: "cost.-.-1",
    back: "normal.0",
    real: "cost.-.-1"
  },
  {
    front: "cost.-.-1",
    back: "normal.0",
    real: "cost.-.-1"
  },
  {
    front: "cost.+.10",
    back: "normal.0",
    real: "cost.+.10"
  },
  {
    front: "attack.-.5",
    back: "normal.0",
    real: "attack.-.5"
  },
  {
    front: "attack.+.3",
    back: "normal.0",
    real: "attack.+.3"
  },
  {
    front: "attack.+.10",
    back: "normal.0",
    real: "attack.+.10"
  },
  {
    front: "scan.1.0",
    back: "normal.0",
    real: "scan.1.0"
  },
  {
    front: "scan.3.3",
    back: "normal.0",
    real: "scan.3.3"
  },
  {
    front: "scan.5.0",
    back: "normal.0",
    real: "scan.5.0"
  },
  {
    front: "scan.7.0",
    back: "normal.0",
    real: "scan.7.0"
  },
  {
    front: "scan.10.10",
    back: "normal.0",
    real: "scan.10.10"
  }
  
];

export const opponentSpellCardInfos: tCardInfo[] = [
  {
    front: "shuffle.0",
    back: "normal.-1",
    real: "shuffle.0"
  }, 
  {
    front: "defence.+.2",
    back: "normal.-1",
    real: "defence.+.2"
  },
  {
    front: "defence.+.5",
    back: "normal.-1",
    real: "defence.+.5"
  },
  {
    front: "cost.-.-1",
    back: "normal.-1",
    real: "cost.-.-1"
  },
  {
    front: "cost.-.-1",
    back: "normal.-1",
    real: "cost.-.-1"
  },
  {
    front: "cost.+.10",
    back: "normal.-1",
    real: "cost.+.10"
  },
  {
    front: "attack.-.5",
    back: "normal.-1",
    real: "attack.-.5"
  },
  {
    front: "attack.+.3",
    back: "normal.-1",
    real: "attack.+.3"
  },
  {
    front: "attack.+.10",
    back: "normal.-1",
    real: "attack.+.10"
  },
  {
    front: "scan.1.0",
    back: "normal.-1",
    real: "scan.1.0"
  },
  {
    front: "scan.3.3",
    back: "normal.-1",
    real: "scan.3.3"
  },
  {
    front: "scan.5.0",
    back: "normal.-1",
    real: "scan.5.0"
  },
  {
    front: "scan.7.0",
    back: "normal.-1",
    real: "scan.7.0"
  },
  {
    front: "scan.10.10",
    back: "normal.-1",
    real: "scan.10.10"
  }
  
];

export class LocalServer {
  private roomId: string;
  private myId: string;
  private opponentId: string;
  private rule: tRule;
  private cardKnownInfos: tCardKnownInfo[];
  private cardFullInfos: tCardFullInfo[];
  private discardedCards: tCardFullInfo[];
  private discardedPairCards: tCardFullInfo[];
  private spellKnownInfos: tCardKnownInfo[];
  private spellFullInfos: tCardFullInfo[];
  public get isMyTurn(): boolean {
    return this.rule.isMyTurn;
  }


  constructor(roomId: string, myId: string, opponentId: string) {
    this.roomId = roomId;
    this.myId = myId;
    this.opponentId = opponentId;
    this.discardedCards = [];
    this.discardedPairCards = [];

    this.createRule();
    this.createCard();
    this.createSpell();
  }

  private createSpell(){
    this.spellKnownInfos = [];
    this.spellFullInfos = [];
    // まず全てのカードを作成
    for (const isMyCard of [true, false]) {
      for (let i = 0; i <= this.rule.spellCount; i++) {
        const idFrontBack = generateStringUuid();
        const spellCardInfo = isMyCard ? mySpellCardInfos[i] : opponentSpellCardInfos[i];
        const known: tCardKnownInfo = {
          id: `${isMyCard ? "my" : "opponent"}-${generateStringUuid()}`,
          idFrontBack: idFrontBack,
          isMyCard: isMyCard,
          idImageBack: `${spellCardInfo.back}`,
          isSpellDeck: true,
          debug: {
            pair_id: i, 
            spell_id: spellCardInfo.real
          }
        };
        const full: tCardFullInfo = {
          id: `${isMyCard ? "my" : "opponent"}-${generateStringUuid()}`,
          idFrontBack: idFrontBack,
          pair_id: i,
          image_id: {
            front: `${spellCardInfo.front}`,
            real: `${spellCardInfo.real}`,
            back: `${spellCardInfo.back}`
          },
          cost: 0,
          attack: 0,
          isMyCard: isMyCard,
          spell_id: spellCardInfo.real, 
          isSpellDeck: true
        };
        this.spellKnownInfos.push(known);
        this.spellFullInfos.push(full);
      }
    }
  }

  private createCard(){
    this.cardKnownInfos = [];
    this.cardFullInfos = [];
    this.discardedCards = [];

    // まず全てのカードを作成
    for (const isMyCard of [true, false]) {
      for (let i = 0; i <= this.rule.allPairCount; i++) {
        const idFrontBack = generateStringUuid();
        const memoryCardInfo = isMyCard ? myMemoryCardInfos[i] : opponentMemoryCardInfos[i];
        const known: tCardKnownInfo = {
          id: `${isMyCard ? "my" : "opponent"}-${generateStringUuid()}`,
          idFrontBack: idFrontBack,
          isMyCard: isMyCard,
          idImageBack: `${memoryCardInfo.back}`,
          isSpellDeck: false,
          debug: {
            pair_id: i, 
            spell_id: (i===0) ? `shuffle.0` : undefined
          }
        };
        const full: tCardFullInfo = {
          id: `${isMyCard ? "my" : "opponent"}-${generateStringUuid()}`,
          idFrontBack: idFrontBack,
          pair_id: i,
          image_id: {
            front: `${memoryCardInfo.front}`,
            real: `${memoryCardInfo.real}`,
            back: `${memoryCardInfo.back}`
          },
          cost: i,
          attack: this.rule.allPairCount - i,
          isMyCard: isMyCard,
          spell_id: (i===0) ? `shuffle.0` : undefined,
          isSpellDeck: false
        };
        this.cardKnownInfos.push(known);
        this.cardFullInfos.push(full);
      }
    }

    // 各チームから指定された枚数のカードをランダムにdiscard
    for (const isMyCard of [true, false]) {
      const teamCards = this.cardFullInfos.filter(card => card.isMyCard === isMyCard && card.pair_id !== 0);
      const shuffledTeamCards = [...teamCards].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < this.rule.disCardPairCount; i++) {
        if (shuffledTeamCards[i]) {
          this.discardedCards.push(shuffledTeamCards[i]);
          // 同じpair_idの別チームのカードを探す
          const pairCard = this.cardFullInfos.filter(card => 
            card.isMyCard !== shuffledTeamCards[i].isMyCard && 
            card.pair_id === shuffledTeamCards[i].pair_id
          );
          if (pairCard) {
            this.discardedPairCards.push(...pairCard);
          }else{
            unexpectError("pairCard is undefined");
          }
          // cardKnownInfosとcardFullInfosから該当カードを削除
          this.cardKnownInfos = this.cardKnownInfos.filter(card => card.idFrontBack !== shuffledTeamCards[i].idFrontBack);
          this.cardFullInfos = this.cardFullInfos.filter(card => card.idFrontBack !== shuffledTeamCards[i].idFrontBack);
        }
      }
    }
  }

  private createRule(){
    this.rule = {
      isMyTurn: true, //Math.random() < 0.5
      allPairCount: _allPairCount,
      disCardPairCount: _disCardPairCount,
      usePairCount: _usePairCount,
      spellCount: _spellCount
    }
  }

  private shuffleCard(){
    // カードをシャッフル
    const shuffled = [...this.cardKnownInfos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.cardKnownInfos = shuffled;
  }
  
  async fetchShuffledSpellKnownInfoAsync(): Promise<tCardKnownInfo[]> {
    await sleep(100);

    return this.spellKnownInfos;
  }


  async fetchShuffledCardKnownInfoAsync(): Promise<tCardKnownInfo[]> {
    await sleep(100);
    //// カードをシャッフル
    // this.shuffleCard();
    return this.cardKnownInfos;
  }

  fetchSpecificCardFullInfo(idFrontBack: string): tCardFullInfo|undefined {
    const card = [...this.cardFullInfos, ...this.spellFullInfos].find(card => card.idFrontBack === idFrontBack);
    if(card){
      return card;
    }else{
      unexpectError("card is undefined");
      return undefined;
    }
  }


  fetchRule(): tRule {
    return this.rule;
  }


  private firstFlag = true;
  private secondFlag = true;
  async receiveOpponentCardFullInfo(cardPhases:tCardPhase[]): Promise<tCardFullInfo|undefined> {

    // await sleep(100);
    if(this.firstFlag){
      this.firstFlag = false;
      return await this.getCheatingPairCard(cardPhases);
    }
    if(this.secondFlag){
      this.secondFlag = false;
      return await this.getCheatingPairCard(cardPhases);
    }
  
// return await this.getCheatingPairCard(cardPhases);

    if(Math.random() < 0.5){
      return this.getRandomPairCard(cardPhases);
    }else{
      return this.getCheatingPairCard(cardPhases);
    }
  }
  private selectedRandomCard: tCardFullInfo | undefined;

  getRandomPairCard(cardPhases: tCardPhase[]): tCardFullInfo|undefined {
    if (this.selectedRandomCard) {
      const cardToReturn = this.selectedRandomCard;
      this.selectedRandomCard = undefined;
      return cardToReturn;
    }
    // MEMORY_GAMEフェーズのカードのみ抽出
    const memoryGameCards = cardPhases.filter(phase => 
        phase.status === eGamePhase.MEMORY_GAME

    );

    // ランダムに2枚のカードを選択
    const randomIndex1 = Math.floor(Math.random() * memoryGameCards.length);
    let randomIndex2 = Math.floor(Math.random() * (memoryGameCards.length - 1));
    if (randomIndex2 >= randomIndex1) randomIndex2++;

    const selectedCard1 = memoryGameCards[randomIndex1];
    const selectedCard2 = memoryGameCards[randomIndex2];

    // 両方のカードのフル情報を取得
    const selectedCardFull1 = this.fetchSpecificCardFullInfo(selectedCard1.info.cardKnownInfo.idFrontBack);
    const selectedCardFull2 = this.fetchSpecificCardFullInfo(selectedCard2.info.cardKnownInfo.idFrontBack);

    if (!selectedCardFull1 || !selectedCardFull2)
    {
      unexpectError("selectedCardFull1 or selectedCardFull2 is undefined");
      return undefined;
    }

    // 1枚目を保存し、もう1枚を返す
    this.selectedRandomCard = selectedCardFull1;
    return selectedCardFull2;

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
    // ランダムにカードを1枚選択
    // discardedCards以外のカードをフィルタリング
    const availableCards = memoryGameCards.filter(card => 
        !this.discardedCards.some(discarded => 
            (discarded.idFrontBack === card.info.cardKnownInfo.idFrontBack)
        ) &&
        !this.discardedPairCards.some(discarded => 
            (discarded.idFrontBack === card.info.cardKnownInfo.idFrontBack)
        )
    );

    if(availableCards.length === 0) {
        unexpectError("使用可能なカードがありません");
        return undefined;
    }
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];
    
    // 選択したカードのフル情報を取得
    const selectedCardFull = this.fetchSpecificCardFullInfo(selectedCard.info.cardKnownInfo.idFrontBack);

    // 選択したカードと同じpair_idを持つカードを探す
    const pairCards = memoryGameCards.filter(card => {
        const cardFull = this.fetchSpecificCardFullInfo(card.info.cardKnownInfo.idFrontBack);
        return cardFull && 
               cardFull.pair_id === selectedCardFull?.pair_id && 
               cardFull.idFrontBack !== selectedCardFull?.idFrontBack;
    });
    if(pairCards.length === 0){
      debugger;
      unexpectError("pairCards is empty");
      return undefined;
    }
    // ペアとなるカードをランダムに選択
    const randomPairIndex = Math.floor(Math.random() * pairCards.length);
    const selectedPairCardInfo = this.fetchSpecificCardFullInfo(pairCards[randomPairIndex].info.cardKnownInfo.idFrontBack);

    // 2枚目のカードを保存
    this.selectedCheatingPairCard = selectedPairCardInfo;

    if(!selectedCardFull || !selectedPairCardInfo){
      unexpectError("selectedCardFull or selectedPairCardInfo is undefined");
      return undefined;
    }

    // 1枚目のカードを返す
    return selectedCardFull;
}


  public async fetchOpponentCostCardAsync(): Promise<tCardFullInfo|undefined> {
    // if(this.selectedCheatingPairCard) {
    //   return this.selectedCheatingPairCard;
    // }
    return undefined;
  }

  public async postMyCostCardAsync(card: tCardFullInfo): Promise<void> {
    if(this.selectedRandomCard) {
      // return this.selectedRandomCard;
    }
  }

}
