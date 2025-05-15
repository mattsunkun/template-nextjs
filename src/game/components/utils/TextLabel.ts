
export class TextLabel extends Phaser.GameObjects.Text {
    private value: string;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string = '', style: Phaser.Types.GameObjects.Text.TextStyle = {}) {
        const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '24px',
            color: '#ffffff',
            ...style
        };
        
        super(scene, x, y, text, defaultStyle);
        this.value = text;
        this.setOrigin(0.5);
        scene.add.existing(this);
    }
    
    set txt(value: string) {
        this.value = value;
        super.setText(value);
    }

    get txt(): string {
        return this.value;
    }
}
