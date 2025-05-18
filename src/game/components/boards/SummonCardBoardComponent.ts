
import Phaser from 'phaser';
import { CardComponent } from '../CardComponent';

export class SummonCardBoardComponent {
    private scene: Phaser.Scene;
    private _cardComponents: CardComponent[];
    private rows: number;
    private cols: number;
    private margin: number;
    private centerX: number;
    private centerY: number;
  
    public get cardComponents(): CardComponent[] {
      return this._cardComponents;
    }
  
    constructor(
      scene: Phaser.Scene,
      cardComponents: CardComponent[],
      rows: number,
      cols: number,
      margin: number,
      centerX: number,
      centerY: number
    ) {
      this.scene = scene;
      this._cardComponents = cardComponents;
      this.rows = rows;
      this.cols = cols;
      this.margin = margin;
      this.centerX = centerX;
      this.centerY = centerY;
  
      this.layoutCards();
    }
  
    private layoutCards() {
      if (this.cardComponents.length === 0) return;
  
      const cardWidth = this.cardComponents[0].size.width;
      const cardHeight = this.cardComponents[0].size.height;
  
  
      // カード全体の幅と高さを計算
      const totalWidth = this.cols * (cardWidth + this.margin) - this.margin;
      const totalHeight = this.rows * (cardHeight + this.margin) - this.margin;
  
      // 開始位置を計算（左上のカードの中心座標）
      const startX = this.centerX - totalWidth / 2 + cardWidth / 2;
      const startY = this.centerY - totalHeight / 2 + cardHeight / 2;
  
      const mids = Math.floor(this.cols/2) - 2;
      let pos = 0;
      for (let i = 0; i < this.cardComponents.length; i++) {
        const col = pos % this.cols;
  
        // if(mids === col){
        //   pos += 2;
        // }
  
        const row = Math.floor(pos / this.cols);
  
        const x = startX + col * (cardWidth + this.margin);
        const y = startY + row * (cardHeight + this.margin);
  
        this.cardComponents[i].setPosition(x, y);
        pos ++;
      }
    }
  
    setInteractive(interactive: boolean = true) {
      this.cardComponents.forEach(card => {
        if (interactive) {
          card.setInteractive();
        } else {
          card.disableInteractive();
        }
      });
    }
}