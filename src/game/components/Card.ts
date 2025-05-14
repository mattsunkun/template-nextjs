import { tCardGen } from "@/game/scenes/GameScene";

const DEBUG: boolean = true;

export class Card extends Phaser.GameObjects.Container {
    private frontImage: Phaser.GameObjects.Image;
    private backImage: Phaser.GameObjects.Image;
    private label: Phaser.GameObjects.Text;
    private isRevealed: boolean = false;
    private isMatched: boolean = false;
    public readonly value: number;
    public readonly cardGen: tCardGen;
  
    constructor(scene: Phaser.Scene, x: number, y: number, cardGen: tCardGen) {
      super(scene, x, y);
      this.value = cardGen.pair;
      this.cardGen = cardGen;
  
      this.backImage = scene.add.image(0, 0, `card_back/${cardGen.team}/`).setDisplaySize(100, 150);
      this.frontImage = scene.add.image(0, 0, `card_front/${cardGen.team}/${this.value}`).setDisplaySize(100, 150);
      this.frontImage.setVisible(false);
  
      this.label = scene.add.text(0, 0, this.value.toString(), {
        fontSize: '32px',
        color: '#fff'
      }).setOrigin(0.5);
      this.label.setVisible(DEBUG);
  
      this.add([this.backImage, this.frontImage, this.label]);
      this.setSize(100, 150);
      this.setInteractive();
  
      this.on("pointerdown", () => {
        if (!this.isRevealed && !this.isMatched) {
          this.emit("cardClicked", this);
        }
      });
  
      this.on("pointerover", () => {
        if (!this.isRevealed && !this.isMatched) {
          this.backImage.alpha = 0.8;
          this.scene.input.setDefaultCursor("pointer");
        }
      });
  
      this.on("pointerout", () => {
        this.backImage.alpha = 1.0;
        this.scene.input.setDefaultCursor("default");
      });
  
      scene.add.existing(this);
    }
  
    reveal() {
      if (!this.isMatched) {
        this.isRevealed = true;
        this.backImage.setVisible(false);
        this.frontImage.setVisible(true);
      }
    }
  
    hide() {
      if (!this.isMatched) {
        this.isRevealed = false;
        this.frontImage.setVisible(false);
        this.backImage.setVisible(true);
      }
    }
  
    match() {
      this.isMatched = true;
      this.frontImage.setTint(0x00ff00);
      this.backImage.setTint(0x00ff00);
      this.disableInteractive();
    }
  
    isFaceUp(): boolean {
      return this.isRevealed;
    }

    isPaired(): boolean {
      return this.isMatched;
    }

    getValue(): number {
      return this.value;
    }
}
  