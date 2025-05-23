import { CardStatus } from '@/game/clients/GameClient';
import { PhaseManager } from '@/game/managers/PhaseManager';
import { CardComponent } from '../CardComponent';
import { AbstractCardBoardComponent } from './AbstractCardBoardComponent';

export class DeckCardBoardComponent extends AbstractCardBoardComponent {
  public x: number;
  public y: number;

  constructor(
    phaseManager: PhaseManager,
    x: number,
    y: number,
    cardComponents: CardComponent[]
  ) {
    super(phaseManager, cardComponents);
    this.x = x;
    this.y = y;
    this.displayCards();
    this.drawBorder();
  }

  private displayCards(): void {
    // カードを裏面で積み重ねて表示
    this.cardComponents.forEach((card, index) => {
      card.setPosition(this.x, this.y);
      card.setDepth(index); // 後ろのカードが下に表示されるように
      card.place.cardStatus = CardStatus.BACK
    });
  }

  protected drawBorder(): void {
    if (this.cardComponents.length === 0) return;

    this.borderGraphics.clear();
    this.borderGraphics.lineStyle(4, 0x00ff00, 1);
    this.borderGraphics.strokeRect(
      this.x - this.cardComponents[0].size.width / 2,
      this.y - this.cardComponents[0].size.height / 2,
      this.cardComponents[0].size.width,
      this.cardComponents[0].size.height
    );
  }

  public layoutCards(): void {
    this.displayCards();
  }

  public getTopCardId(): string|undefined {
    if (this.cardComponents.length === 0) {
      return undefined;
    }
    return this.cardComponents[this.cardComponents.length - 1].idFrontBack;
  }
}
