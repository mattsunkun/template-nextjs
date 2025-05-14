import { tCardGen, teams } from '@/game/scenes/GameScene';
import { tSize } from '@/utils/types';

const CARD_SIZE:tSize = {
  width: 100, 
  height: 150,
}
export function generateShuffledPairs(pairCount: number): tCardGen[] {
    const cardGen:tCardGen[] = [];
    let offset = 0
    for (const team of teams){
      for (let i = 0; i <= pairCount; i++) {
        cardGen.push({
          pair: i,
          cost: i,
          attack: pairCount - i,
          team: team, 
          size: CARD_SIZE,
        });
      }
      const _rejected = cardGen.splice(Phaser.Math.Between(offset, offset + pairCount-1), 1)[0];
      offset += pairCount;
    }
   
    return Phaser.Utils.Array.Shuffle(cardGen);
  }