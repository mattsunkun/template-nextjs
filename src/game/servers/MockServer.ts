import { generateStringUuid, sleep, unexpectError } from '@/utils/functions';
import { tSize } from '@/utils/types';
import { tCardFullInfo, tCardKnownInfo, tRule } from '../clients/GameClient';
import { eGamePhase, tCardPhase } from '../managers/PhaseManager';

const CARD_SIZE:tSize = {
  width: 100, 
  height: 150,
}


export const _teams = ["spade", "heart"];
export const _allPairCount = 13;
export const _disCardPairCount = 1;
export const _usePairCount = _allPairCount - _disCardPairCount;

export class LocalServer {
  private roomId: string;
  private myId: string;
  private opponentId: string;
  private rule: tRule;
  private cardKnownInfos: tCardKnownInfo[];
  private cardFullInfos: tCardFullInfo[];
  private discardedCards: tCardFullInfo[];
  private discardedPairCards: tCardFullInfo[];

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
  }

  private createCard(){
    this.cardKnownInfos = [];
    this.cardFullInfos = [];
    this.discardedCards = [];

    // まず全てのカードを作成
    for (const team of this.rule.teams) {
      for (let i = 0; i <= this.rule.allPairCount; i++) {
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
          attack: this.rule.allPairCount - i,
          team: team
        };
        this.cardKnownInfos.push(known);
        this.cardFullInfos.push(full);
      }
    }

    // 各チームから指定された枚数のカードをランダムにdiscard
    for (const team of this.rule.teams) {
      const teamCards = this.cardFullInfos.filter(card => card.team === team && card.pair_id !== 0);
      const shuffledTeamCards = [...teamCards].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < this.rule.disCardPairCount; i++) {
        if (shuffledTeamCards[i]) {
          this.discardedCards.push(shuffledTeamCards[i]);
          // 同じpair_idの別チームのカードを探す
          const pairCard = this.cardFullInfos.filter(card => 
            card.team !== shuffledTeamCards[i].team && 
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
      isMyTurn: false, //Math.random() < 0.5
      teams: _teams, 
      allPairCount: _allPairCount,
      disCardPairCount: _disCardPairCount,
      usePairCount: _usePairCount
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


  fetchShuffledCardKnownInfo(): tCardKnownInfo[] {
    this.shuffleCard();
    return this.cardKnownInfos;
  }

  fetchSpecificCardFullInfo(idFrontBack: string): tCardFullInfo|undefined {
    const card = this.cardFullInfos.find(card => card.idFrontBack === idFrontBack);
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

    await sleep(500);
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

}
