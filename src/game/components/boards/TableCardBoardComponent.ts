// components/Table.ts
import { PhaseManager } from '@/game/managers/PhaseManager';
import { CardComponent } from '../CardComponent';
import { AbstractCardBoardComponent } from './AbstractCardBoardComponent';

export class TableCardBoardComponent extends AbstractCardBoardComponent {
  private rows: number;
  private cols: number;
  private margin: number;

  public get cardComponents(): CardComponent[] {
    return this._cardComponents;
  }

  constructor(
    phaseManager: PhaseManager,
    cardComponents: CardComponent[],
    rows: number,
    cols: number,
    margin: number,
  ) {
    super(phaseManager, cardComponents);
    this.rows = rows;
    this.cols = cols;
    this.margin = margin;


    this.layoutCards();
    this.drawBorder();
  }


  protected drawBorder(): void {
    // if (this.cardComponents.length === 0) return;
    const cardSample = this.phaseManager.cardComponents[0];

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    const w = this.cols + 2;
    const h = this.rows;

    const totalWidth = cardSample.size.width*w + this.margin*(w-1);
    const totalHeight = cardSample.size.height*h + this.margin*(h-1);

    const startX = centerX - totalWidth / 2;
    const startY = centerY - totalHeight / 2;

    this.borderGraphics.clear();
    this.borderGraphics.lineStyle(4, 0x00ff00, 1);
    this.borderGraphics.strokeRect(startX, startY, totalWidth, totalHeight);
  }

  public layoutCards() {
    // console.log("layoutCards", this.cardComponents.length);
    // if (this.cardComponents.length === 0) return;
    const cardSample = this.phaseManager.cardComponents[0];
    const cardWidth = cardSample.size.width;
    const cardHeight = cardSample.size.height;

    // 画面の中央座標を取得
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // カード全体の幅と高さを計算
    const totalWidth = this.cols * (cardWidth + this.margin) - this.margin;
    const totalHeight = this.rows * (cardHeight + this.margin) - this.margin;

    // 開始位置を計算（左上のカードの中心座標）
    const startX = centerX - totalWidth / 2 + cardWidth / 2;
    const startY = centerY - totalHeight / 2 + cardHeight / 2;

    let pos = 0;
    const mids = 4
    const pad = 2;
    for (const card of this.cardComponents) {
      let pos = card.place.position;
      let col = pos % this.cols;
      if(mids<=col){
          col += pad;
      }
      const row = Math.floor(pos / (this.cols));

      const x = startX + (col-1) * (cardWidth + this.margin);
      const y = startY + row * (cardHeight + this.margin);

      card.setPosition(x, y);
    }
  }
}
