import { tSize } from "@/utils/types";
import { tCardFullInfo, tCardKnownInfo } from "../clients/GameClient";
import { HandCardComponent } from "./HandCardComponent";

export type tHandTablePosition = {
    x: number;
    y: number;
    size: tSize;
}

export class HandCardTableComponent extends Phaser.GameObjects.Container {
    private cards: HandCardComponent[] = [];
    private _size: tSize;
    private maxRotation: number = 60;
    private maxOffset: number = 100;
    private tablePosition: tHandTablePosition;
    private isOpposite: boolean;

    constructor(
        scene: Phaser.Scene, 
        position: tHandTablePosition,
        opposite: boolean
    ) {
        super(scene);
        this._size = position.size;
        this.tablePosition = position;
        this.isOpposite = opposite;
        
        // コンテナの位置を設定
        this.setPosition(position.x, position.y);
        scene.add.existing(this);
    }

    public setCards(cardInfos: { known: tCardKnownInfo; full: tCardFullInfo }[]): void {
        // 既存のカードをクリア
        this.cards.forEach(card => card.destroy());
        this.cards = [];
        this.removeAll();

        // 新しいカードを追加
        cardInfos.forEach((info, index) => {
            const card = new HandCardComponent(
                this.scene,
                info.known,
                info.full,
                { width: 100, height: 150 }
            );

            // カードの位置を計算
            const rotation = this.getCardRotation(index, cardInfos.length);
            const offset = this.getCardPosition(index, cardInfos.length);

            // カードの配置
            const yPosition = this.isOpposite ? 50 : this.tablePosition.size.height - 50;
            card.setPosition(
                this.tablePosition.size.width / 2 + offset,
                yPosition
            );
            card.setRotation(Phaser.Math.DegToRad(rotation));
            
            // カードの絵柄を180度回転
            if (this.isOpposite) {
                card.setRotation(card.rotation + Math.PI);
            }

            this.cards.push(card);
            this.add(card);
        });
    }

    private getCardRotation(index: number, totalCards: number): number {
        const angleStep = this.maxRotation / (totalCards - 1 || 1);
        const baseRotation = -this.maxRotation / 2 + angleStep * index;
        return this.isOpposite ? -baseRotation : baseRotation;
    }

    private getCardPosition(index: number, totalCards: number): number {
        const offsetStep = this.maxOffset / (totalCards - 1 || 1);
        return -this.maxOffset / 2 + offsetStep * index;
    }

    public get size(): tSize {
        return this._size;
    }

    public destroy(): void {
        this.cards.forEach(card => card.destroy());
        this.cards = [];
        super.destroy();
    }
} 