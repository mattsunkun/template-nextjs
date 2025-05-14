// components/Table.ts
import Phaser from 'phaser';
import { Card } from './Card';

export class Table {
  private scene: Phaser.Scene;
  private cards: Card[];
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private margin: number;

  constructor(
    scene: Phaser.Scene,
    cards: Card[],
    x: number,
    y: number,
    width: number,
    height: number,
    margin: number = 10
  ) {
    this.scene = scene;
    this.cards = cards;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.margin = margin;

    this.layoutCards();
  }

  private layoutCards() {
    if (this.cards.length === 0) return;

    const cardWidth = this.cards[0].displayWidth;
    const cardHeight = this.cards[0].displayHeight;

    const cols = Math.floor((this.width + this.margin) / (cardWidth + this.margin));
    const rows = Math.ceil(this.cards.length / cols);

    const offsetX = this.x + (this.width  - (cols * (cardWidth + this.margin) - this.margin)) / 2;
    const offsetY = this.y + (this.height - (rows * (cardHeight + this.margin) - this.margin)) / 2;

    for (let i = 0; i < this.cards.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = offsetX + col * (cardWidth + this.margin) + cardWidth / 2;
      const y = offsetY + row * (cardHeight + this.margin) + cardHeight / 2;

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

  getCards(): Card[] {
    return this.cards;
  }
}
