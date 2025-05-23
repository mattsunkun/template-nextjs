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
export let debug = true;
export let _isMyTurn = true;
export let _shuffle = false;
export let _allPairCount = 13;
export const _disCardPairCount = 1;
export const _usePairCount = _allPairCount - _disCardPairCount;
export const _spellCount = 10;
export type tCardRawInfo = {
  front: string;
  back: string;
  real: string;
}


export class LocalServer {
  public sleepTime = 100;
  private gameClient: tGameClient;
  private rule: tRule;
  private cardInfos: tCardInfo[];

  public static setAllPairCount(count: number) {
    _allPairCount = count;
  }

  public static setDebugMode(enabled: boolean) {
    debug = enabled;
  }

  public static setIsMyTurn(enabled: boolean) {
    _isMyTurn = enabled;
  }

  public static setShuffle(enabled: boolean) {
    _shuffle = enabled;
  }

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
            area: eCardArea.HAND, 
            position: -1, 
            cardStatus: CardStatus.STAND
          },

          debug: debug ? {
            pair_id: i, 
            spell_id: spellCardInfo.real
          } : undefined,

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
            ability: spellCardInfo.real,
            isSpellable: true,
            isSummonable: false,
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
          debug: debug ? {
            pair_id: i, 
            spell_id: (i===0) ? `shuffle.0` : undefined
          } : undefined,

          addInfo: {
            idFrontBack: idFrontBack,
            pair_id: i,
            image_id: {
            front: `${memoryCardInfo.front}`,
            real: `${memoryCardInfo.real}`,
            back: `${memoryCardInfo.back}`
          },
            cost: this.rule.allPairCount - i + 1,
            attack: i,
            ability:
            (i===0) ? "shuffle" : 
            (i===1) ? "little" :
            (i===this.rule.allPairCount) ? "gigant" :
            undefined,
            isSpellable: (i===0) ? true : false,
            isSummonable: (i!==0) ? true : false,
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



}
