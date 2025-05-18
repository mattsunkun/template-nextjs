import Phaser from 'phaser';
import { MemoryCardComponent, MemoryCardStatus } from './MemoryCardComponent';

export class SpellCardDeckComponent {
  private scene: Phaser.Scene;
  private cards: MemoryCardComponent[];
  private x: number;
  private y: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    cards: MemoryCardComponent[]
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.cards = cards;
    this.displayCards();
  }

  private displayCards(): void {
    // カードを裏面で積み重ねて表示
    this.cards.forEach((card, index) => {
      card.setPosition(this.x, this.y);
      card.setDepth(index); // 後ろのカードが下に表示されるように
      card.status = MemoryCardStatus.BACK
    });
  }

  // // 一番上のカードを表にする
  // public async flipTopCardAsync(gameClient: GameClient): Promise<void> {
  //   if (this.cards.length > 0) {
  //     const topCard = this.cards[this.cards.length - 1];
  //     const cardFullInfo = await gameClient.fetchSpecificCardFullInfo(topCard.cardKnownInfo.idFrontBack)
  //     topCard.cardFullInfo = cardFullInfo;
  //     topCard.status = MemoryCardStatus.FRONT
  //   }
  // }

  // // 一番上のカードを裏にする
  // public flipTopCardBack(): void {
  //   if (this.cards.length > 0) {
  //     const topCard = this.cards[this.cards.length - 1];
  //     topCard.status = MemoryCardStatus.BACK
  //   }
  // }

  // 一番上のカードを取り除く
  public removeTopCard(): MemoryCardComponent | undefined {
    if (this.cards.length > 0) {
      const topCard = this.cards.pop();
      topCard?.setInteractive(false);
      return topCard;
    }
    return undefined;
  }
}
