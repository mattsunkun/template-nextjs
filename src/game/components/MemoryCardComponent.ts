import { tSize } from "@/utils/types";
import { tCardFullInfo, tCardKnownInfo } from "../clients/GameClient";

export enum MemoryCardStatus {
  FRONT = "front",
  BACK = "back",
  MATCHED = "matched"
}

export class MemoryCardComponent extends Phaser.GameObjects.Container {
    private frontImage: Phaser.GameObjects.Image;
    private backImage: Phaser.GameObjects.Image;
    private label: Phaser.GameObjects.Text;
    private _cardKnownInfo: tCardKnownInfo;
    private _cardFullInfo?: tCardFullInfo;
    private _status: MemoryCardStatus;
    private _size: tSize;

    constructor(scene: Phaser.Scene, cardKnownInfo: tCardKnownInfo, cardFullInfo?: tCardFullInfo, size:tSize = { width: 100, height: 150 }) {
        super(scene);
        this._size = size;

        // 画像オブジェクトの初期化
        this.backImage = scene.add.image(0, 0, `card_back/${cardKnownInfo.team}/`);
        this.frontImage = scene.add.image(0, 0, cardFullInfo ? `card_front/${cardFullInfo.team}/${cardFullInfo.pair_id}` : '');
        
        // サイズの設定
        this.backImage.setDisplaySize(size.width, size.height);
        this.frontImage.setDisplaySize(size.width, size.height);
        
        // ラベルの初期化
        this.label = scene.add.text(0, 0, cardKnownInfo.debug?.pair_id.toString() ?? "", {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#000'
        }).setOrigin(0.5);

        // カード情報の設定
        this._cardKnownInfo = cardKnownInfo;
        this._cardFullInfo = cardFullInfo;

        // コンテナにオブジェクトを追加
        this.add([this.backImage, this.frontImage, this.label]);
        this.setSize(size.width, size.height);

        // 初期状態を設定
        this._status = MemoryCardStatus.BACK;
        this.status = MemoryCardStatus.BACK;

        // インタラクティブの設定
        this.setInteractive();
        this.setupInteractions();

        scene.add.existing(this);
        this.label.setVisible(false);
    }

    private setupInteractions(): void {
        this.on("pointerdown", () => {
            if (this.status === MemoryCardStatus.BACK) {
                this.emit("cardClicked", this);
            }
        });

        this.on("pointerover", () => {
            if (this.status === MemoryCardStatus.BACK) {
                this.backImage.alpha = 0.8;
                this.scene.input.setDefaultCursor("pointer");
                this.label.setVisible(true);
            }
        });

        this.on("pointerout", () => {
            this.backImage.alpha = 1.0;
            this.scene.input.setDefaultCursor("default");
            this.label.setVisible(false);
        });
    }

    public get size(): tSize {
        return this._size;
    }

    public set size(size: tSize) {
        this._size = size;
        this.setSize(size.width, size.height);
        this.backImage.setDisplaySize(size.width, size.height);
        this.frontImage.setDisplaySize(size.width, size.height);
    }

    public get cardKnownInfo(): tCardKnownInfo {
        return this._cardKnownInfo;
    }

    public set cardKnownInfo(cardKnownInfo: tCardKnownInfo) {
        this._cardKnownInfo = cardKnownInfo;
        this.backImage.setTexture(`card_back/${cardKnownInfo.team}/`);
    }

    public get cardFullInfo(): tCardFullInfo|undefined {
        return this._cardFullInfo;
    }

    public set cardFullInfo(cardFullInfo: tCardFullInfo|undefined) {
        this._cardFullInfo = cardFullInfo;
        if (cardFullInfo) {
            this.frontImage.setTexture(`card_front/${cardFullInfo.team}/${cardFullInfo.pair_id}`);
            this.frontImage.setDisplaySize(this.size.width, this.size.height);
        }
    }

    public get status(): MemoryCardStatus {
        return this._status;
    }

    public set status(state: MemoryCardStatus) {
        switch(state) {
            case MemoryCardStatus.FRONT:
                this.frontImage.setVisible(true);
                this.backImage.setVisible(false);
                this.label.setVisible(false);
                break;
            case MemoryCardStatus.BACK:
                this.frontImage.setVisible(false);
                this.backImage.setVisible(true);
                this.label.setVisible(false);
                break;
            case MemoryCardStatus.MATCHED:
                this.frontImage.setVisible(false);
                this.backImage.setVisible(false);
                this.label.setVisible(false);
                break;
        }
        this._status = state;
    }
}
  