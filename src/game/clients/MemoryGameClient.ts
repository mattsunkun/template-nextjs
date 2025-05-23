import { unexpectError } from "@/utils/functions";
import { LocalServer } from "../servers/LocalServer";
import { AbstractSubClient } from "./AbstractSubClient";
import { GameClient, tGameClient } from "./GameClient";

export class MemoryGameClient extends AbstractSubClient {

  constructor(gameClient: GameClient, idGameClient: tGameClient, localServer: LocalServer) {
    super(gameClient, idGameClient, localServer);
  }




  
  async receiveOpponentCardFullInfoAsync(): Promise<string> {
    if(this.localServer) {
      if(this.pairIdFrontBacks.length === 2){
        const pairIdFrontBack = this.pairIdFrontBacks[1];
        this.pairIdFrontBacks = [];
        return pairIdFrontBack;
      }
        // const candidateIdFrontBacks = this.gameClient.phaseManager.table.cardComponents
        // .filter(card => card.pair_id !== undefined)
        // .map(card => card.idFrontBack);


        // debugger;
        const knownPairIds = this.gameClient.phaseManager.table.cardComponents
        .filter(card => card.pair_id !== undefined)
        .map(card => card.pair_id)
        .filter(pairId => pairId !== undefined)

        const mapSamePairIdCount = new Map<number, number>();

        for(const pairId of knownPairIds){
          mapSamePairIdCount.set(pairId, (mapSamePairIdCount.get(pairId) ?? 0) + 1);
        }

        for (const [pairId, count] of mapSamePairIdCount.entries()) {
          if(count === 2){
            const pairIdFrontBacks = this.gameClient.phaseManager.table.cardComponents
            .filter(card => card.pair_id === pairId)
            .map(card => card.idFrontBack);

            if(pairIdFrontBacks.length === 2){
              const pairIdFrontBack = pairIdFrontBacks[0];
              this.pairIdFrontBacks.push(...pairIdFrontBacks);
              return pairIdFrontBack;
            }else{
              unexpectError("pairIdFrontBacks.length is not 2");
            }
          }
        }


        const noCandidateIdFrontBacks = this.gameClient.phaseManager.table.cardComponents
        .filter(card => card.pair_id === undefined)
        .map(card => card.idFrontBack);

        if(noCandidateIdFrontBacks.length === 0){
          unexpectError("noCandidateIdFrontBacks.length is 0");
        }

        const selectedCard = Phaser.Math.RND.pick(noCandidateIdFrontBacks);
        return selectedCard;

        unexpectError("noCandidateIdFrontBacks.length is not 0");
        

    } else {
      throw new Error("localServer is undefined");
    }
  }

  private pairIdFrontBacks: string[] = [];

//   private firstFlag = true;
//   private secondFlag = true;
//   async fetchOpponentTableCardChoiceAsync(): Promise<string> {

//     await sleep(100);

//     if(this.firstFlag){
//       this.firstFlag = false;
//       return this.getCheatingPairCard().idFrontBack;
//     }
//     if(this.secondFlag){
//       this.secondFlag = false;
//       return this.getCheatingPairCard().idFrontBack;
//     }
  
// // return await this.getCheatingPairCard(cardPhases);

//     if(Math.random() < 0.8){
//       return this.getRandomPairCard().idFrontBack;
//     }else{
//       return this.getCheatingPairCard().idFrontBack;
//     }
//   }

//   getRandomPairCard(): tCardAddInfo {
//     // テーブル上のカードをフィルタリング
//     const tableCards = this.cardInfos.filter(card => 
//       card.place.area === eCardArea.TABLE &&
//       !this.selectedCardInfos.some(selected => selected.idFrontBack === card.idFrontBack)
//     );

//     if(tableCards.length === 0) {
//       throw new Error("テーブル上に選択可能なカードがありません");
//     }

//     // ランダムに1枚選択
//     const selectedCard = Phaser.Math.RND.pick(tableCards);
//     this.selectedCardInfos.push(selectedCard);

//     // 2枚になったら空にする。
//     if(this.selectedCardInfos.length === 2){
//       this.selectedCardInfos = [];
//     }

//     if(selectedCard.addInfo){
//       return selectedCard.addInfo;
//     }else{
//       throw new Error("selectedCard.addInfo is undefined");
//     }
//   }


//   getCheatingPairCard(): tCardAddInfo {
//     // テーブル上のカードのみをフィルタリング
//     const tableCards = this.cardInfos.filter(card => card.place.area === eCardArea.TABLE);

//     // 選択済みカードが0または1枚の場合
//     if (this.selectedCardInfos.length == 0) {

//       // 選択済みが0枚の場合は、新しいペアを探す
//       for (const card of tableCards) {
//         const pairCard = tableCards.find(c => 
//           c.addInfo?.pair_id === card.addInfo?.pair_id && //ペアを見つける
//           c.idFrontBack !== card.idFrontBack // 自分自身はペアにできない
//         );

//         if (pairCard) {
//           this.selectedCardInfos.push(card);
//           this.selectedCardInfos.push(pairCard);
//           if(card.addInfo){
//             return card.addInfo;
//           }else{
//             unexpectError("card.addInfo is undefined");
//           }
//         }
//       }
//     }

//     // 2枚選択済みの場合は2枚目を返して配列をクリア
//     else if (this.selectedCardInfos.length === 2) {
//       const secondCard = this.selectedCardInfos[1];
//       this.selectedCardInfos = [];
//       if(secondCard.addInfo){
//         return secondCard.addInfo;
//       }else{
//         unexpectError("secondCard.addInfo is undefined");
//       }
//     }
// debugger;

//     unexpectError("getCheatingPairCard is undefined");
//     throw new Error("getCheatingPairCard is undefined");
//   }

}