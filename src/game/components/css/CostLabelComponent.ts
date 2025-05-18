import Phaser from 'phaser';

export class CostLabelComponent extends Phaser.GameObjects.Container {
    private costText: Phaser.GameObjects.Text;
    private _cost: number = 0;
    private costChange: number = 0;
    private label: string;

    public get cost(): number {
        return this._cost;
    }
    private set cost(newCost: number) {
        this._cost = newCost;
        this.updateText();
    }

    constructor(scene: Phaser.Scene, x: number, y: number, label: string = 'コスト') {
        super(scene, x, y);
        this.label = label;

        // コスト表示用のテキストを作成
        this.costText = scene.add.text(0, 0, this.getDisplayText(), {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }, 
            align: 'center'
        }).setOrigin(0.5);

        // コンテナにテキストを追加
        this.add(this.costText);
        scene.add.existing(this);
    }

    public setCostChange(costChange: number): void {
        this.costChange = costChange;
        this.updateText();
    }

    public addCostChange(change: number): void {
        this.costChange += change;
        this.updateText();
    }

    public clearCostChange(): void {
        this.costChange = 0;
        this.updateText();
    }

    public applyCostChange(): void {
        this.cost += this.costChange;
        this.updateText();
    }

    private getDisplayText(): string {
        let text = `${this.label}${this.cost}`;
        if (this.costChange !== 0) {
            let sign = '';
            if(this.costChange > 0){
                sign = '+';
            }else if(this.costChange < 0){
                sign = '-';
            }else{
                sign = '';
            }
            text += ` (${sign}${this.costChange})`;
        }
        return text;
    }

    private updateText(): void {
        this.costText.setText(this.getDisplayText());
    }

    public destroy(): void {
        this.costText.destroy();
        super.destroy();
    }
} 