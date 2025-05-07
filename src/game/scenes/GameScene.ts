import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { Card } from '../components/Card';
import { Table } from '../components/Table';

import { tSize } from '@/utils/types';

export const teams = ["spade", "heart"];

export type tCardGen = {
  pair: number;
  cost: number;
  attack: number;
  team: string;
  size: tSize;
}

const CARD_SIZE:tSize = {
    width: 100, 
    height: 150,
  }
export class GameScene extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    numAllPair:number = 10;

    constructor ()
    {
        super('GameScene');
    }

    preload(){
        for (const team of teams) {
            this.load.image(`card_back/${team}/`, `assets/card_back/${team}.png`);
            for (let i = 0; i <= this.numAllPair; i++) {
              this.load.image(`card_front/${team}/${i}`, `assets/card_front/${team}/${i}.png`);
            }
            
        }
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        const margin = 15;
    
        const cards: Card[] = [];

        const cardGen = this.generateShuffledPairs(this.numAllPair); // 6ペア（計12枚）
    
        for (let i = 0; i < 10; i++) {
        //   const card = new Card(this, 0, 0, i); // 位置はあとでTableで決める
        //   card.setDisplaySize(cardWidth, cardHeight);
        //   cards.push(card);
            // const x = (this.scale.width - cols*CARD_SIZE.width)/2 + (i % cols) * (CARD_SIZE.width + CARD_PADDING);
            // const y = CARD_OFFEST_Y + Math.floor(i / cols) * (CARD_SIZE.height + CARD_PADDING);
            const card = new Card(this, 0,0, cardGen[i]);
    
            // card.on("cardClicked", this.onCardClicked, this);
            cards.push(card);
        }
    
        // 表示位置を Table に任せる
        const table = new Table(this, cards, 50, 100, 700, 400, margin);

        EventBus.emit('current-scene-ready', this);
    }


  private generateShuffledPairs(pairCount: number): tCardGen[] {
    const cardGen:tCardGen[] = [];
    let offset = 0
    for (const team of teams){
      for (let i = 0; i <= pairCount; i++) {
        cardGen.push({
          pair: i,
          cost: i,
          attack: this.numAllPair - i,
          team: team, 
          size: CARD_SIZE,
        });
      }
      const _rejected = cardGen.splice(Phaser.Math.Between(offset, offset + pairCount-1), 1)[0];
      offset += pairCount;
    }
   
    return Phaser.Utils.Array.Shuffle(cardGen);
    // return cardGen;
  }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
