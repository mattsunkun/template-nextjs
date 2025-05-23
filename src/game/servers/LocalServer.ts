import { numNull } from '@/utils/const';
import { generateStringUuid, sleep, unexpectError } from '@/utils/functions';
import { CardStatus, eCardArea, eWho, tCardAddInfo, tCardInfo, tGameClient, tPlace, tRule } from '../clients/GameClient';
import { myMemoryCardInfos, mySpellCardInfos, opponentMemoryCardInfos, opponentSpellCardInfos } from './CardData';


export enum eAssetFolderType {
  FRONT = 'front',
  BACK = 'back',
  REAL = 'real'
}

// export const __startPhase = eGamePhase.COST_SUMMON_SPELL;
export const __FULL_DEBUG = true;
export const _allPairCount = 13;
export const _disCardPairCount = 1;
export const _usePairCount = _allPairCount - _disCardPairCount;
export const _spellCount = 10;
export const _isMyTurn = true;
export const _shuffle = false;
export type tCardRawInfo = {
  front: string;
  back: string;
  real: string;
}


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
            area: eCardArea.DECK, 
            position: -1, 
            cardStatus: CardStatus.BACK
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
            nowAttack: 0
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
      let position = 0;
      const tmpTableCardInfos: tCardInfo[] = [];
      for (let i = 0; i <= this.rule.allPairCount; i++) {
        const idFrontBack = generateStringUuid();
        const memoryCardInfo = isMyCard ? myMemoryCardInfos[i] : opponentMemoryCardInfos[i];
        const cardInfo: tCardInfo = {
          idFrontBack: idFrontBack,
          idImageBack: `${memoryCardInfo.back}`,

          place: {
            who: isMyCard ? eWho.MY : eWho.OPPONENT,
            area: eCardArea.TABLE,
            position: position, 
            cardStatus: CardStatus.BACK
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
            cost: this.rule.allPairCount - i,
            attack: i,
            spell_id: (i===0) ? `shuffle.0` : undefined,
            isSpellable: (i===0) ? true : false,
            nowAttack: i,
          }
        };
        tmpTableCardInfos.push(cardInfo);
        position++;
      }
      // 0番目以外からランダムで1枚選んでdiscardに変更
      const nonZeroCards = tmpTableCardInfos.filter(card => card.debug?.pair_id !== 0);
      const randomCard = Phaser.Math.RND.pick(nonZeroCards);
      randomCard.place.area = eCardArea.DISCARD;
      randomCard.place.cardStatus = CardStatus.VANISHED;

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
    // 各エリアとwhoごとに位置をランダムに割り当て
    const areaWhoGroups = new Map<string, tCardInfo[]>();
    
    // カードをエリアとwhoでグループ化
    this.cardInfos.forEach(card => {
      let key: string;
      if(card.place.area === eCardArea.TABLE){
        key = `${card.place.area}`;
      }else{
        key = `${card.place.area}-${card.place.who}`;
      }
      if (!areaWhoGroups.has(key)) {
        areaWhoGroups.set(key, []);
      }
      areaWhoGroups.get(key)!.push(card);
    });
    
    // 各グループ内で位置を割り当て
    areaWhoGroups.forEach((cards, key) => {
      cards.sort((a, b) => (a.addInfo?.pair_id ?? 0) - (b.addInfo?.pair_id ?? 0));
      let positions: number[];
      if (_shuffle) {
        // ランダムな順番で位置を割り当て
        positions = Array.from({length: cards.length}, (_, i) => i);
        Phaser.Utils.Array.Shuffle(positions);
      } else {
        // 前から順番に位置を割り当て
        positions = Array.from({length: cards.length}, (_, i) => i);
      }
      
      cards.forEach((card, index) => {
        card.place.position = positions[index];
      });
    });

    // カード全体をシャッフル
    if(_shuffle){
      this.cardInfos = Phaser.Utils.Array.Shuffle([...this.cardInfos]);
    }else{
      this.cardInfos = this.cardInfos.sort((a, b) => a.place.position - b.place.position);
    }
    
    console.log(this.cardInfos.map(card => card.place.position));

    let cardInfosWithoutAddInfo = this.cardInfos.map(card => ({
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

  async fetchSpecificCardFullInfo(idFrontBack: string): Promise<tCardAddInfo> {
    await sleep(100);
    const card = this.cardInfos.find(card => card.idFrontBack === idFrontBack);
    if(card){
      if(card.addInfo){
        return card.addInfo;
      }else{
        unexpectError("card.addInfo is undefined");
      }
    }else{
      unexpectError("card is undefined");
    }
    throw new Error("card is undefined");
  }


  async fetchRuleAsync(): Promise<tRule> {
    await sleep(100);
    return this.rule;
  }

  private selectedCardInfos: tCardInfo[] = [];

  private firstFlag = true;
  private secondFlag = true;
  async fetchOpponentTableCardChoiceAsync(): Promise<string> {

    await sleep(100);

    if(this.firstFlag){
      this.firstFlag = false;
      return this.getCheatingPairCard().idFrontBack;
    }
    if(this.secondFlag){
      this.secondFlag = false;
      return this.getCheatingPairCard().idFrontBack;
    }
  
// return await this.getCheatingPairCard(cardPhases);

    if(Math.random() < 0.8){
      return this.getRandomPairCard().idFrontBack;
    }else{
      return this.getCheatingPairCard().idFrontBack;
    }
  }

  getRandomPairCard(): tCardAddInfo {
    // テーブル上のカードをフィルタリング
    const tableCards = this.cardInfos.filter(card => 
      card.place.area === eCardArea.TABLE &&
      !this.selectedCardInfos.some(selected => selected.idFrontBack === card.idFrontBack)
    );

    if(tableCards.length === 0) {
      throw new Error("テーブル上に選択可能なカードがありません");
    }

    // ランダムに1枚選択
    const selectedCard = Phaser.Math.RND.pick(tableCards);
    this.selectedCardInfos.push(selectedCard);

    // 2枚になったら空にする。
    if(this.selectedCardInfos.length === 2){
      this.selectedCardInfos = [];
    }

    if(selectedCard.addInfo){
      return selectedCard.addInfo;
    }else{
      throw new Error("selectedCard.addInfo is undefined");
    }
  }


  getCheatingPairCard(): tCardAddInfo {
    // テーブル上のカードのみをフィルタリング
    const tableCards = this.cardInfos.filter(card => card.place.area === eCardArea.TABLE);

    // 選択済みカードが0または1枚の場合
    if (this.selectedCardInfos.length == 0) {

      // 選択済みが0枚の場合は、新しいペアを探す
      for (const card of tableCards) {
        const pairCard = tableCards.find(c => 
          c.addInfo?.pair_id === card.addInfo?.pair_id && //ペアを見つける
          c.idFrontBack !== card.idFrontBack // 自分自身はペアにできない
        );

        if (pairCard) {
          this.selectedCardInfos.push(card);
          this.selectedCardInfos.push(pairCard);
          if(card.addInfo){
            return card.addInfo;
          }else{
            unexpectError("card.addInfo is undefined");
          }
        }
      }
    }

    // 2枚選択済みの場合は2枚目を返して配列をクリア
    else if (this.selectedCardInfos.length === 2) {
      const secondCard = this.selectedCardInfos[1];
      this.selectedCardInfos = [];
      if(secondCard.addInfo){
        return secondCard.addInfo;
      }else{
        unexpectError("secondCard.addInfo is undefined");
      }
    }
debugger;

    unexpectError("getCheatingPairCard is undefined");
    throw new Error("getCheatingPairCard is undefined");
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
        (card.addInfo?.nowAttack ?? numNull()) > 0
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
