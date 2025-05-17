// components/Table.ts
import Phaser from 'phaser';
import { MemoryCardComponent } from './MemoryCardComponent';
export class Table {
  private scene: Phaser.Scene;
  private cards: MemoryCardComponent[];
  private rows: number;
  private cols: number;
  private margin: number;

  constructor(
    scene: Phaser.Scene,
    cards: MemoryCardComponent[],
    rows: number,
    cols: number,
    margin: number
  ) {
    this.scene = scene;
    this.cards = cards;
    this.rows = rows;
    this.cols = cols;
    this.margin = margin;

    this.layoutCards();
  }

  private layoutCards() {
    if (this.cards.length === 0) return;

    const cardWidth = this.cards[0].size.width;
    const cardHeight = this.cards[0].size.height;

    // 画面の中央座標を取得
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // カード全体の幅と高さを計算
    const totalWidth = this.cols * (cardWidth + this.margin) - this.margin;
    const totalHeight = this.rows * (cardHeight + this.margin) - this.margin;

    // 開始位置を計算（左上のカードの中心座標）
    const startX = centerX - totalWidth / 2 + cardWidth / 2;
    const startY = centerY - totalHeight / 2 + cardHeight / 2;

    for (let i = 0; i < this.cards.length; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);

      const x = startX + col * (cardWidth + this.margin);
      const y = startY + row * (cardHeight + this.margin);

      this.cards[i].setPosition(x, y);
    }
  }

  setInteractive(interactive: boolean = true) {
    this.cards.forEach(card => {
      if (interactive) {
        card.setInteractive();
      } else {
        card.disableInteractive();
      }
    });
  }
}
