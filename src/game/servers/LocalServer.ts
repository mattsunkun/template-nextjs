import { generateStringUuid, sleep, unexpectError } from '@/utils/functions';
import { eCardArea, eWho, tCardAddInfo, tCardInfo, tGameClient, tPlace, tRule } from '../clients/GameClient';


export enum eAssetFolderType {
  FRONT = 'front',
  BACK = 'back',
  REAL = 'real'
}

export const _allPairCount = 13;
export const _disCardPairCount = 1;
export const _usePairCount = _allPairCount - _disCardPairCount;
export const _spellCount = 10;
export const _isMyTurn = true;

export type tCardRawInfo = {
  front: string;
  back: string;
  real: string;
}

export const myMemoryCardInfos: tCardRawInfo[] = [
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

export const opponentMemoryCardInfos: tCardRawInfo[] = [
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

export const mySpellCardInfos: tCardRawInfo[] = [
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

export const opponentSpellCardInfos: tCardRawInfo[] = [
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
  private gameClient: tGameClient;
  private rule: tRule;
  private cardInfos: tCardInfo[];

  public get isMyTurn(): boolean {
    return this.rule.isMyTurn;
  }


  constructor(gameClient: tGameClient) {
    this.gameClient = gameClient;

    this.createRule();
    this.cardInfos = [...this.createTableCard(), ...this.createDeckCard()];
  }

  private createDeckCard():tCardInfo[]{
    const deckCardInfos: tCardInfo[] = [];
    // まず全てのカードを作成
    for (const isMyCard of [true, false]) {
      for (let i = 0; i <= this.rule.spellCount; i++) {
        const idFrontBack = generateStringUuid();
        const spellCardInfo = isMyCard ? mySpellCardInfos[i] : opponentSpellCardInfos[i];
        const cardInfo: tCardInfo = {

          idFrontBack: idFrontBack,

          idImageBack: `${spellCardInfo.back}`,

          place: {
            who: isMyCard ? eWho.MY : eWho.OPPONENT,
            area: eCardArea.DECK
          },

          debug: {
            pair_id: i, 
            spell_id: spellCardInfo.real
          },

          addInfo: {
            idFrontBack: idFrontBack,
            pair_id: i,
            image_id: {
              front: `${spellCardInfo.front}`,
              real: `${spellCardInfo.real}`,
              back: `${spellCardInfo.back}`
            },
            cost: 0,
            attack: 0,
            spell_id: spellCardInfo.real,
            isSpellable: true,
            isSummonable: false
          }

        };
        deckCardInfos.push(cardInfo);
      }
    }
    return deckCardInfos;
  }

  private createTableCard():tCardInfo[]{
    const tableCardInfos: tCardInfo[] = [];

    // まず全てのカードを作成
    for (const isMyCard of [true, false]) {
      const tmpTableCardInfos: tCardInfo[] = [];
      for (let i = 0; i <= this.rule.allPairCount; i++) {
        const idFrontBack = generateStringUuid();
        const memoryCardInfo = isMyCard ? myMemoryCardInfos[i] : opponentMemoryCardInfos[i];
        const cardInfo: tCardInfo = {
          idFrontBack: idFrontBack,
          idImageBack: `${memoryCardInfo.back}`,

          place: {
            who: isMyCard ? eWho.MY : eWho.OPPONENT,
            area: eCardArea.TABLE
          },
          debug: {
            pair_id: i, 
            spell_id: (i===0) ? `shuffle.0` : undefined
          },

          addInfo: {
            idFrontBack: idFrontBack,
            pair_id: i,
            image_id: {
            front: `${memoryCardInfo.front}`,
            real: `${memoryCardInfo.real}`,
            back: `${memoryCardInfo.back}`
          },
            cost: i,
            attack: this.rule.allPairCount - i,
            spell_id: (i===0) ? `shuffle.0` : undefined,
            isSpellable: false,
            isSummonable: true
          }
        };
        tmpTableCardInfos.push(cardInfo);
      }
      // 0番目以外からランダムで1枚選んでdiscardに変更
      const nonZeroCards = tmpTableCardInfos.filter(card => card.debug?.pair_id !== 0);
      const randomCard = Phaser.Math.RND.pick(nonZeroCards);
      randomCard.place.area = eCardArea.DISCARD;

      tableCardInfos.push(...tmpTableCardInfos);
    }
    return tableCardInfos;
  }

  private createRule(){
    this.rule = {
      isMyTurn: _isMyTurn,
      allPairCount: _allPairCount,
      disCardPairCount: _disCardPairCount,
      usePairCount: _usePairCount,
      spellCount: _spellCount
    }
  }

  private shuffledCardKnownInfos():tCardInfo[]{
    // shuffle
    this.cardInfos = Phaser.Utils.Array.Shuffle([...this.cardInfos]);
    const cardInfosWithoutAddInfo = this.cardInfos.map(card => ({
      ...card,
      addInfo: undefined
    }));
    
    return cardInfosWithoutAddInfo;
  }

  async postCardInfosAsync(cardIdFrontBack: string, place: tPlace): Promise<void> {
    await sleep(100);
    this.cardInfos = this.cardInfos.map(card => {
      if (card.idFrontBack === cardIdFrontBack) {
        return {
          ...card,
          place: place,
        };
      }else{
        return card;
      }
    });
  }

  async fetchShuffledCardKnownInfoAsync(): Promise<tCardInfo[]> {
    await sleep(100);
    return this.shuffledCardKnownInfos();
  }

  async fetchSpecificCardFullInfo(idFrontBack: string): Promise<tCardAddInfo|undefined> {
    await sleep(100);
    const card = this.cardInfos.find(card => card.idFrontBack === idFrontBack);
    if(card){
      return card.addInfo;
    }else{
      unexpectError("card is undefined");
      return undefined;
    }
  }


  async fetchRuleAsync(): Promise<tRule> {
    await sleep(100);
    return this.rule;
  }

  private selectedCardInfos: tCardInfo[] = [];

  private firstFlag = true;
  private secondFlag = true;
  async fetchOpponentTableCardChoiceAsync(): Promise<tCardAddInfo|undefined> {

    await sleep(100);

    if(this.firstFlag){
      this.firstFlag = false;
      return this.getCheatingPairCard();
    }
    if(this.secondFlag){
      this.secondFlag = false;
      return this.getCheatingPairCard();
    }
  
// return await this.getCheatingPairCard(cardPhases);

    if(Math.random() < 0.8){
      return this.getRandomPairCard();
    }else{
      return this.getCheatingPairCard();
    }
  }

  getRandomPairCard(): tCardAddInfo|undefined {
    // テーブル上のカードをフィルタリング
    const tableCards = this.cardInfos.filter(card => 
      card.place.area === eCardArea.TABLE &&
      !this.selectedCardInfos.some(selected => selected.idFrontBack === card.idFrontBack)
    );

    if(tableCards.length === 0) {
      unexpectError("テーブル上に選択可能なカードがありません");
      return undefined;
    }

    // ランダムに1枚選択
    const selectedCard = Phaser.Math.RND.pick(tableCards);
    this.selectedCardInfos.push(selectedCard);

    // 2枚になったら空にする。
    if(this.selectedCardInfos.length === 2){
      this.selectedCardInfos = [];
    }

    return selectedCard.addInfo;
  }


  getCheatingPairCard(): tCardAddInfo | undefined {
    // テーブル上のカードのみをフィルタリング
    const tableCards = this.cardInfos.filter(card => card.place.area === eCardArea.TABLE);

    // 選択済みカードが0または1枚の場合
    if (this.selectedCardInfos.length <= 1) {

      // 選択済みが0枚の場合は、新しいペアを探す
      for (const card of tableCards) {
        const pairCard = tableCards.find(c => 
          c.addInfo?.pair_id === card.addInfo?.pair_id && 
          c.idFrontBack !== card.idFrontBack
        );

        if (pairCard) {
          this.selectedCardInfos.push(card);
          this.selectedCardInfos.push(pairCard);
          return card.addInfo;
        }
      }
    }

    // 2枚選択済みの場合は2枚目を返して配列をクリア
    if (this.selectedCardInfos.length === 2) {
      const secondCard = this.selectedCardInfos[1];
      this.selectedCardInfos = [];
      return secondCard.addInfo;
    }

    unexpectError("getCheatingPairCard is undefined");
    return undefined;
}


  public async fetchOpponentCostCardsAsync(): Promise<tCardAddInfo[]> {
    const handCards = this.cardInfos.filter(card => 
        card.place.area === eCardArea.HAND && 
        card.place.who === eWho.OPPONENT
    );

    if(handCards.length > 0) {
        const selectedCard = Phaser.Math.RND.pick(handCards);
        if(selectedCard.addInfo){
          return [selectedCard.addInfo];
        }else{
          return [];
        }
    }
    return [];
  }


  public async fetchOpponentSummonCardsAsync(): Promise<tCardAddInfo[]> {
    const handCards = this.cardInfos.filter(card => 
        card.place.area === eCardArea.HAND && 
        card.place.who === eWho.OPPONENT &&
        card.addInfo?.isSummonable === true
    );

    if(handCards.length > 0) {
        const selectedCard = Phaser.Math.RND.pick(handCards);
        if(selectedCard.addInfo){
          return [selectedCard.addInfo];
        }else{
          return [];
        }
    }
    return [];
  }


  public async fetchOpponentSpellCardsAsync(): Promise<tCardAddInfo[]> {
    const handCards = this.cardInfos.filter(card => 
        card.place.area === eCardArea.HAND && 
        card.place.who === eWho.OPPONENT &&
        card.addInfo?.isSpellable === true
    );

    if(handCards.length > 0) {
        const selectedCard = Phaser.Math.RND.pick(handCards);
        if(selectedCard.addInfo){
          return [selectedCard.addInfo];
        }else{
          return [];
        }
    }
    return [];
  }

  // public async postMyCostCardAsync(cardIdFrontBacks: string[]): Promise<void> {
  //   const cardMyCostCards = this.cardFullInfos.filter(card => !cardIdFrontBacks.includes(card.idFrontBack));
  //   if(cardMyCostCards){
  //     cardMyCostCards.forEach(card => {
  //       const cardPhase = this.cardPhases.find(phase => phase.info.cardFullInfo?.idFrontBack === card.idFrontBack);
  //       if(cardPhase){
  //         cardPhase.status = eGamePhase.GAME_END;
  //       }else{
  //         unexpectError("cardPhase is undefined");
  //       }
  //     });
  //   }else{
  //     unexpectError("cardMyCostCards is empty");
  //   }
  // }

}
