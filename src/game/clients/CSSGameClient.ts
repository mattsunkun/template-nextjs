import { sleep } from "@/utils/functions";
import { LocalServer } from "../servers/LocalServer";
import { AbstractSubClient } from "./AbstractSubClient";
import { GameClient, tGameClient } from "./GameClient";
export class CSSGameClient extends AbstractSubClient {

    constructor(gameClient: GameClient, idGameClient: tGameClient, localServer?: LocalServer) {
        super(gameClient, idGameClient, localServer);
    }

    public async fetchOpponentCostCardsAsync(): Promise<string[]> {
        if(this.localServer) {
            await sleep(this.localServer.sleepTime);
            const handCards = this.gameClient.phaseManager.hand.get(false).cardComponents;
            const costCards = handCards.filter(card => card.isSummonable);
            if (costCards.length === 0) return [];
            
            // コストが最も大きいカードを選択
            const maxCostCard = costCards.reduce((max, card) => 
                (card.addInfo?.cost ?? 0) > (max.addInfo?.cost ?? 0) ? card : max
            );
            if(maxCostCard){
                return [maxCostCard.idFrontBack];
            }else{
                return [];
            }
        }
        return [];
    }

    public async fetchOpponentSummonCardsAsync(): Promise<string[]> {
        if(this.localServer) {
            await sleep(this.localServer.sleepTime);
            const handCards = this.gameClient.phaseManager.hand.get(false).cardComponents;
            const cost = this.gameClient.phaseManager.getCostLabel(false).cost;
            
            // summonableなカードをコスト順にソート
            const summonableCards = handCards
                .filter(card => card.addInfo?.isSummonable)
                .sort((a, b) => (a.addInfo?.cost ?? 0) - (b.addInfo?.cost ?? 0));
            
            // コストの累計が上限を超えない範囲で選択
            let totalCost = 0;
            const selectedCards = summonableCards.filter(card => {
                const cardCost = card.addInfo?.cost ?? 0;
                if (totalCost + cardCost <= cost) {
                    totalCost += cardCost;
                    return true;
                }
                return false;
            });
            
            return selectedCards.map(card => card.idFrontBack);
        }
        return [];
    }

    public async fetchOpponentSpellCardsAsync(): Promise<string[]> {
        if(this.localServer) {
            await sleep(this.localServer.sleepTime);
            const handCards = this.gameClient.phaseManager.hand.get(false).cardComponents;
            const cost = this.gameClient.phaseManager.getCostLabel(false).cost;
            
            // spellableなカードをコスト順にソート
            const spellableCards = handCards
                .filter(card => card.addInfo?.isSpellable)
                .sort((a, b) => (a.addInfo?.cost ?? 0) - (b.addInfo?.cost ?? 0));
            
            // コストの累計が上限を超えない範囲で選択
            let totalCost = 0;
            const selectedCards = spellableCards.filter(card => {
                const cardCost = card.addInfo?.cost ?? 0;
                if (totalCost + cardCost <= cost) {
                    totalCost += cardCost;
                    return true;
                }
                return false;
            });
            
            return selectedCards.map(card => card.idFrontBack);
        }
        return [];
    }




//   public async fetchOpponentCostCardsAsync(): Promise<tCardAddInfo[]> {
//     const handCards = this.cardInfos.filter(card => 
//         card.place.area === eCardArea.HAND && 
//         card.place.who === eWho.OPPONENT
//     );

//     if(handCards.length > 0) {
//         const selectedCard = Phaser.Math.RND.pick(handCards);
//         if(selectedCard.addInfo){
//           return [selectedCard.addInfo];
//         }else{
//           return [];
//         }
//     }
//     return [];
//   }


//   public async fetchOpponentSummonCardsAsync(): Promise<tCardAddInfo[]> {
//     const handCards = this.cardInfos.filter(card => 
//         card.place.area === eCardArea.HAND && 
//         card.place.who === eWho.OPPONENT &&
//         (card.addInfo?.nowAttack ?? numNull()) > 0
//     );

//     if(handCards.length > 0) {
//         const selectedCard = Phaser.Math.RND.pick(handCards);
//         if(selectedCard.addInfo){
//           return [selectedCard.addInfo];
//         }else{
//           return [];
//         }
//     }
//     return [];
//   }


//   public async fetchOpponentSpellCardsAsync(): Promise<tCardAddInfo[]> {
//     const handCards = this.cardInfos.filter(card => 
//         card.place.area === eCardArea.HAND && 
//         card.place.who === eWho.OPPONENT &&
//         card.addInfo?.isSpellable === true
//     );

//     if(handCards.length > 0) {
//         const selectedCard = Phaser.Math.RND.pick(handCards);
//         if(selectedCard.addInfo){
//           return [selectedCard.addInfo];
//         }else{
//           return [];
//         }
//     }
//     return [];
//   }
    
    
}