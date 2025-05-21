import { PhaseManager } from '@/game/managers/PhaseManager';
import { tSize } from '@/utils/types';
import Phaser from 'phaser';
import { CardComponent } from '../CardComponent';
import { AbstractCardBoardComponent } from './AbstractCardBoardComponent';

export class SummonCardBoardComponent extends AbstractCardBoardComponent {
    private rows: number;
    private cols: number;
    private margin: number;
    private _size: tSize;
    private _x: number;
    private _y: number;
    private pad: number;
  
    public get cardComponents(): CardComponent[] {
      return this._cardComponents;
    }
  
    constructor(
      phaseManager: PhaseManager,
      cardComponents: CardComponent[],
      rows: number,
      cols: number,
      margin: number,
      size: tSize,
      x: number,
      y: number
    ) {
      super(phaseManager, cardComponents);
      this.rows = rows;
      this.cols = cols;
      this.margin = margin;
      this._size = size;
      this._x = x;
      this._y = y;
      this.pad = 11;

  
      this.layoutCards();
      this.drawBorder();
    }
  
    protected drawBorder(): void {
      const startX = this._x - this._size.width / 2;
      const startY = this._y - this._size.height / 2;

      this.borderGraphics.clear();
      this.borderGraphics.lineStyle(4, 0x00ff00, 1);
      this.borderGraphics.strokeRect(startX, startY, this._size.width, this._size.height);
    }
  
    public layoutCards() {
      if (this.cardComponents.length === 0) return;
  
      const cardWidth = this.cardComponents[0].size.width;
      const cardHeight = this.cardComponents[0].size.height;
  
    //   // カード全体の幅と高さを計算
    //   const totalWidth = this.cols * (cardWidth + this.margin) - this.margin;
    //   const totalHeight = this.rows * (cardHeight + this.margin) - this.margin;
  
      // 開始位置を計算（左上のカードの中心座標）
      const startX = this._x - this._size.width / 2 + cardWidth / 2;
      const startY = this._y - this._size.height / 2 + cardHeight / 2;
      const mid = 3
      for (const card of this.cardComponents) {
        let pos = card.cardInfo.place.position;
        let col = pos % this.cols;
        if(mid<=col){
            col += this.pad;
        }
        const row = Math.floor(pos / this.cols);
  
        const x = startX + col * (cardWidth + this.margin);
        const y = startY + row * (cardHeight + this.margin);
  
        card.setPosition(x, y);
      }
    }
  
    setInteractive(hitArea?: any, callback?: Phaser.Types.Input.HitAreaCallback, dropZone?: boolean): this {
      this.cardComponents.forEach(card => {
        card.setInteractive(hitArea, callback, dropZone);
      });
      return this;
    }
}