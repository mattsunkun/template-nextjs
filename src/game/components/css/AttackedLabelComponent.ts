import Phaser from 'phaser';

export class AttackedLabelComponent extends Phaser.GameObjects.Container {
    private attackedText: Phaser.GameObjects.Text;
    private _attacked: number = 0;
    private attackedChange: number = 0;
    private label: string;

    public get attacked(): number {
        return this._attacked;
    }
    public set attacked(newAttacked: number) {
        this._attacked = newAttacked;
        this.updateText();
    }

    constructor(scene: Phaser.Scene, x: number, y: number, label: string = 'コスト') {
        super(scene, x, y);
        this.label = label;

        // コスト表示用のテキストを作成
        this.attackedText = scene.add.text(0, 0, this.getDisplayText(), {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }, 
            align: 'center'
        }).setOrigin(0.5);

        // コンテナにテキストを追加
        this.add(this.attackedText);
        scene.add.existing(this);
    }

    public setAttackedChange(attackedChange: number): void {
        this.attackedChange = attackedChange;
        this.updateText();
    }

    public addAttackedChange(change: number): void {
        this.attackedChange += change;
        this.updateText();
    }

    public clearAttackedChange(): void {
        this.attackedChange = 0;
        this.updateText();
    }

    public applyAttackedChange(): void {
        this.attacked += this.attackedChange;
        this.updateText();
    }

    public applyPartialAttackedChange(add2realAttacked: number): void {
        this.attackedChange -= add2realAttacked;
        this.attacked += add2realAttacked;
        this.updateText();
    }

    private getDisplayText(): string {
        let text = `${this.label}${this.attacked}`;
        if (this.attackedChange !== 0) {
            let sign = '';
            if(this.attackedChange > 0){
                sign = '+';
            }else if(this.attackedChange < 0){
                sign = '';
            }else{
                sign = '';
            }
            text += ` (${sign}${this.attackedChange})`;
        }
        return text;
    }

    private updateText(): void {
        this.attackedText.setText(this.getDisplayText());
    }

    public destroy(): void {
        this.attackedText.destroy();
        super.destroy();
    }
} 