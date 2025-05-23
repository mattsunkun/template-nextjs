import { CardStatus } from '@/game/clients/GameClient';
import { PhaseManager } from '@/game/managers/PhaseManager';
import { CardComponent } from '../CardComponent';
import { AbstractCardBoardComponent } from './AbstractCardBoardComponent';

export class TombCardBoardComponent extends AbstractCardBoardComponent {

  constructor(
    phaseManager: PhaseManager,
    cardComponents: CardComponent[]
  ) {
    super(phaseManager, cardComponents);
    this.layoutCards();
  }


  protected drawBorder(): void {
    
  }

  protected layoutCards(): void {
    this.cardComponents.forEach((card, index) => {
        card.setPosition(0, 0);
        card.setDepth(-1); // 後ろのカードが下に表示されるように
        card.place.cardStatus = CardStatus.VANISHED
        card.setInteractive(false);
        card.disableInteractive();
        card.visible = false;
      });
  }
}
