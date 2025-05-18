import { eAssetFolderType } from "@/game/servers/LocalServer";
import { getLoadKey } from "@/utils/functions";
import { tSize } from "@/utils/types";
import { tCardFullInfo, tCardKnownInfo } from "../../clients/GameClient";

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
        this.backImage = scene.add.image(0, 0, getLoadKey(eAssetFolderType.BACK, cardKnownInfo.idImageBack));
        this.frontImage = scene.add.image(0, 0, getLoadKey(eAssetFolderType.FRONT, cardFullInfo.image_id.front));
        
        // サイズの設定
        this.backImage.setDisplaySize(size.width, size.height);
        this.frontImage.setDisplaySize(size.width, size.height);
        
        // コンテナにオブジェクトを追加
        this.add([this.backImage, this.frontImage]);
        this.setSize(size.width, size.height);

        // インタラクティブの設定
        this.setInteractive(true);
        this.setupInteractions();

        scene.add.existing(this);
    }

    private isInteractive: boolean;
    public setInteractive(interactive: boolean = true): this {
        this.isInteractive = interactive;
        if (interactive) {
            super.setInteractive();
        } else {
            this.disableInteractive();
        }
        return this;
    }



    private setupInteractions(): void {
        if(this.isInteractive){
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
  