import { PhaseManager } from "@/game/managers/PhaseManager";
import { tSize } from "@/utils/types";
import { CardComponent } from "../CardComponent";
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
        
        // // コンテナの位置を設定
        // this.setPosition(position.x, position.y);
        // // コンテナのサイズを設定
        // this.setSize(position.size.width, position.size.height);
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
        const cardWidth = this.phaseManager.cardComponents[0].width;
        const totalCards = this.cardComponents.length;
        const availableWidth = this.tablePosition.size.width;
        const totalCardWidth = cardWidth * totalCards;
        
        // カード間の間隔を計算（必要に応じて負の値になることもある）
        const cardSpacing = (availableWidth - totalCardWidth) / (totalCards - 1 || 1);
        const startX = -this.tablePosition.size.width / 2 + cardWidth / 2;

        this.cardComponents.forEach((card, index) => {
            // カードの位置を計算
            const xPosition = this.tablePosition.x+ startX + (index * (cardWidth + cardSpacing));
            const yPosition = this.tablePosition.y+(this.isOpponent ? 50 : this.tablePosition.size.height - 50);

            // カードの配置
            card.setPosition(
                this.tablePosition.size.width / 2 + xPosition,
                yPosition
            );
            
            // カードの絵柄を180度回転
            if (this.isOpponent) {
                card.setRotation(Math.PI);
            } else {
                card.setRotation(0);
            }

            this.add(card);
        });
    }

    // public updateVisualizer(cardComponents: CardComponent[]): void {
    //     this._cardComponents = cardComponents;
    //     this.layoutCards();
    // }

    public get size(): tSize {
        return this._size;
    }

    // public removeCards(idFrontBacks: string[]): void {
    //     const remainingCards = this._cardComponents.filter(card => 
    //         !idFrontBacks.some(idFrontBack => 
    //             idFrontBack === card.idFrontBack
    //         )
    //     );
    //     const removedCards = this._cardComponents.filter(card => 
    //         idFrontBacks.some(idFrontBack => 
    //             idFrontBack === card.idFrontBack
    //         )
    //     );
    //     removedCards.forEach(card => card.place.cardStatus = CardStatus.VANISHED);
        
    //     this._cardComponents = remainingCards;
    //     this.layoutCards();
    // }
} 