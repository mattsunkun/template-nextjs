import { tSize } from "@/utils/types";
import { tCardFullInfo, tCardKnownInfo } from "../clients/GameClient";

export class HandCardComponent extends Phaser.GameObjects.Container {
    private frontImage: Phaser.GameObjects.Image;
    private backImage: Phaser.GameObjects.Image;
    private cardKnownInfo: tCardKnownInfo;
    private cardFullInfo: tCardFullInfo;
    private _size: tSize;

    constructor(scene: Phaser.Scene, cardKnownInfo: tCardKnownInfo, cardFullInfo: tCardFullInfo, size:tSize = { width: 100, height: 150 }) {
        super(scene);
        this._size = size;
        this.cardKnownInfo = cardKnownInfo;
        this.cardFullInfo = cardFullInfo;

        // 画像オブジェクトの初期化
        this.backImage = scene.add.image(0, 0, `card_back/${cardKnownInfo.team}/`);
        this.frontImage = scene.add.image(0, 0, cardFullInfo ? `card_front/${cardFullInfo.team}/${cardFullInfo.pair_id}` : '');
        
        // サイズの設定
        this.backImage.setDisplaySize(size.width, size.height);
        this.frontImage.setDisplaySize(size.width, size.height);
        
        // コンテナにオブジェクトを追加
        this.add([this.backImage, this.frontImage]);
        this.setSize(size.width, size.height);

        // インタラクティブの設定
        this.setInteractive();
        this.setupInteractions();

        scene.add.existing(this);
    }

    private setupInteractions(): void {
        this.on("pointerdown", () => {
            this.emit("cardClicked", this);
        });

        this.on("pointerover", () => {
            this.scene.input.setDefaultCursor("pointer");
        });

        this.on("pointerout", () => {
            this.scene.input.setDefaultCursor("default");
        });
    }

    public get size(): tSize {
        return this._size;
    }

    public get cardInfo(): tCardKnownInfo {
        return this.cardKnownInfo;
    }

    public get fullInfo(): tCardFullInfo {
        return this.cardFullInfo;
    }

    public setTint(color: number): void {
        this.frontImage.setTint(color);
        this.backImage.setTint(color);
    }

    public clearTint(): void {
        this.frontImage.clearTint();
        this.backImage.clearTint();
    }
}
  