import { PhaseManager } from '@/game/managers/PhaseManager';
import Phaser from 'phaser';
import { CardComponent } from '../CardComponent';

export abstract class AbstractCardBoardComponent extends Phaser.GameObjects.Container {
  protected phaseManager: PhaseManager;
  protected _cardComponents: CardComponent[];
  protected borderGraphics: Phaser.GameObjects.Graphics;
  protected _isInteractive: boolean = false;

  public get cardComponents(): CardComponent[] {
    return this._cardComponents.sort((a, b) => a.place.position - b.place.position);
  }

  constructor(
    phaseManager: PhaseManager,
    cardComponents: CardComponent[]
  ) {
    super(phaseManager.scene);
    this.phaseManager = phaseManager;
    this._cardComponents = cardComponents;

    this.borderGraphics = this.scene.add.graphics();
    // this.layoutCards();
  }

  protected abstract drawBorder(): void;

  protected abstract layoutCards(): void;

  public get isInteractive(): boolean {
    return this._isInteractive;
  }

  public set isInteractive(interactive: boolean) {
    this._isInteractive = interactive;
    this.cardComponents.forEach(card => {
      if(interactive){
        card.setInteractive();
      }else{
        card.disableInteractive();
      }
    });
  }

  public getCardLength(): number {
    return this.cardComponents.length;
  }

  public removeCard(idFrontBack: string): void {
    const index = this._cardComponents.findIndex(card => card.idFrontBack === idFrontBack);
    if (index !== -1) {
      this._cardComponents.splice(index, 1);
      this.layoutCards();
    }else{
      throw new Error("card not found");
    }
  }

  public addCard(idFrontBack: string): void {
    const card = this.phaseManager.getCardComponent(idFrontBack);
    this._cardComponents.push(card);
    this.layoutCards();
  }

  public getLeastPosition(): number {
    let pos = 0;
    while(this.cardComponents.find(card => card.place.position === pos)){
      pos++;
    }
    return pos;
  }
}
