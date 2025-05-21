import { PhaseManager } from "@/game/managers/PhaseManager";
import { tSize } from "@/utils/types";
import Phaser from "phaser";
import { CardComponent, CardStatus } from "../CardComponent";
import { AbstractCardBoardComponent } from "./AbstractCardBoardComponent";

export type tHandTablePosition = {
    x: number;
    y: number;
    size: tSize;
}

export class HandCardBoardComponent extends AbstractCardBoardComponent {
    private _size: tSize;
    private maxRotation: number = 60;
    private maxOffset: number = 100;
    private tablePosition: tHandTablePosition;
    private isOpponent: boolean;

    constructor(
        phaseManager: PhaseManager,
        cardComponents: CardComponent[],
        position: tHandTablePosition,
        isOpponent: boolean
    ) {
        super(phaseManager, cardComponents);
        this._size = position.size;
        this.tablePosition = position;
        this.isOpponent = isOpponent;
        
        // コンテナの位置を設定
        this.setPosition(position.x, position.y);
        // コンテナのサイズを設定
        this.setSize(position.size.width, position.size.height);
        this.scene.add.existing(this);
        
        this.layoutCards();
        this.drawBorder();
    }

    protected drawBorder(): void {
        this.borderGraphics.clear();
        this.borderGraphics.lineStyle(4, 0x00ff00, 1);
        this.borderGraphics.strokeRect(
            this.tablePosition.x, 
            this.tablePosition.y,
            this.tablePosition.size.width,
            this.tablePosition.size.height
        );
    }

    public layoutCards(): void {

        // 新しいカードを追加
        this.cardComponents.forEach((card, index, array) => {
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

            this.add(card);
        });
    }

    public updateVisualizer(cardComponents: CardComponent[]): void {
        this._cardComponents = cardComponents;
        this.layoutCards();
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

    public removeCards(idFrontBacks: string[]): void {
        const remainingCards = this._cardComponents.filter(card => 
            !idFrontBacks.some(idFrontBack => 
                idFrontBack === card.cardInfo.idFrontBack
            )
        );
        const removedCards = this._cardComponents.filter(card => 
            idFrontBacks.some(idFrontBack => 
                idFrontBack === card.cardInfo.idFrontBack
            )
        );
        removedCards.forEach(card => card.status = CardStatus.VANISHED);
        
        this._cardComponents = remainingCards;
        this.layoutCards();
    }
} 