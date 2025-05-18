import { tSize } from "@/utils/types";
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
    private isOpponent: boolean;

    constructor(
        scene: Phaser.Scene, 
        position: tHandTablePosition,
        isOpponent: boolean
    ) {
        super(scene);
        this._size = position.size;
        this.tablePosition = position;
        this.isOpponent = isOpponent;
        
        // コンテナの位置を設定
        this.setPosition(position.x, position.y);
        // コンテナのサイズを設定
        this.setSize(position.size.width, position.size.height);
        scene.add.existing(this);
    }

    public setCards(handCardComponents: HandCardComponent[]): void {
        // 既存のカードをクリア
        // this.cards.forEach(card => card.destroy());
        this.cards = [];
        this.removeAll();

        // 新しいカードを追加
        handCardComponents.forEach((handCardComponent, index, array) => {
            const card = handCardComponent;

            // カードの位置を計算
            const rotation = this.getCardRotation(index, array.length);
            const offset = this.getCardPosition(index, array.length);

            // カードの配置
            const yPosition = this.isOpponent ? 50 : this.tablePosition.size.height - 50;
            card.setPosition(
                this.tablePosition.size.width / 2 + offset,
                yPosition
            );
            card.setRotation(Phaser.Math.DegToRad(rotation));
            
            // カードの絵柄を180度回転
            if (this.isOpponent) {
                card.setRotation(card.rotation + Math.PI);
            }

            this.cards.push(card);
            this.add(card);
        });
    }

    private getCardRotation(index: number, totalCards: number): number {
        const angleStep = this.maxRotation / (totalCards - 1 || 1);
        const baseRotation = -this.maxRotation / 2 + angleStep * index;
        return this.isOpponent ? -baseRotation : baseRotation;
    }

    private getCardPosition(index: number, totalCards: number): number {
        const offsetStep = this.maxOffset / (totalCards - 1 || 1);
        return -this.maxOffset / 2 + offsetStep * index;
    }

    public get size(): tSize {
        return this._size;
    }

    // public destroy(): void {
    //     this.cards.forEach(card => card.destroy());
    //     this.cards = [];
    //     super.destroy();
    // }

    public setInteractive(interactive: boolean = true): this {
        if (interactive) {
            super.setInteractive();
        } else {
            this.disableInteractive();
        }
        return this;
    }

    // public removeCardByIdFrontBack(idFrontBack: string): void {
    //     const cardIndex = this.cards.findIndex(card => card.cardInfo.idFrontBack === idFrontBack);
    //     if (cardIndex !== -1) {
    //         const card = this.cards[cardIndex];
    //         card.destroy();
    //         this.cards.splice(cardIndex, 1);
    //         this.remove(card);
    //     }
    // }

    public removeCards(idFrontBacks: string[]): void {
        const remainingCards = this.cards.filter(card => 
            !idFrontBacks.some(idFrontBack => 
                idFrontBack === card.cardInfo.idFrontBack
            )
        );
        this.setCards(remainingCards);
    }
} 