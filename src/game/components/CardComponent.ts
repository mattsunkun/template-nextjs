import { eAssetFolderType } from "@/game/servers/LocalServer";
import { getLoadKey } from "@/utils/functions";
import { tSize } from "@/utils/types";
import { tCardAddInfo, tCardInfo } from "../clients/GameClient";
export enum CardStatus {
  FRONT = "front",
  BACK = "back",
  REAL = "real",
  VANISHED = "vanished"

}

export class CardComponent extends Phaser.GameObjects.Container {
    private diImages: Record<eAssetFolderType, Phaser.GameObjects.Image>;
    private label: Phaser.GameObjects.Text;
    private _status: CardStatus;
    private _size: tSize;
    private _cardInfo: tCardInfo;


    public get cardInfo(): tCardInfo {
        return this._cardInfo;
    }

    public get cardAddInfo(): tCardAddInfo|undefined {
        return this._cardInfo.addInfo;
    }

    public set cardAddInfo(cardAddInfo: tCardAddInfo) {
        this.diImages[eAssetFolderType.BACK].setTexture(getLoadKey(eAssetFolderType.BACK, cardAddInfo.image_id.back));
        this.diImages[eAssetFolderType.FRONT].setTexture(getLoadKey(eAssetFolderType.FRONT, cardAddInfo.image_id.front));
        this.diImages[eAssetFolderType.REAL].setTexture(getLoadKey(eAssetFolderType.REAL, cardAddInfo.image_id.real));

        // サイズの設定
        this.diImages[eAssetFolderType.BACK].setDisplaySize(this.size.width, this.size.height);
        this.diImages[eAssetFolderType.FRONT].setDisplaySize(this.size.width, this.size.height);
        this.diImages[eAssetFolderType.REAL].setDisplaySize(this.size.width, this.size.height);

        this._cardInfo.addInfo = cardAddInfo;
    }

    constructor(scene: Phaser.Scene, cardInfo: tCardInfo, size: tSize) {
        super(scene);
        this._cardInfo = cardInfo;
        this._size = size;

        this.diImages = {
            [eAssetFolderType.BACK]: scene.add.image(0, 0, getLoadKey(eAssetFolderType.BACK, cardInfo.idImageBack)),
            [eAssetFolderType.FRONT]: scene.add.image(0, 0, getLoadKey(eAssetFolderType.FRONT, cardInfo.addInfo?.image_id.front ?? "")),
            [eAssetFolderType.REAL]: scene.add.image(0, 0, getLoadKey(eAssetFolderType.REAL, cardInfo.addInfo?.image_id.real ?? "")),
        };

        // サイズの設定
        this.diImages[eAssetFolderType.BACK].setDisplaySize(size.width, size.height);
        this.diImages[eAssetFolderType.FRONT].setDisplaySize(size.width, size.height);
        this.diImages[eAssetFolderType.REAL].setDisplaySize(size.width, size.height);

        
        // ラベルの初期化
        const label = `<debug>\n${cardInfo.debug?.spell_id}\n${cardInfo.debug?.pair_id}\n</debug>`
        // let label = "";
        // switch(cardInfo.place.area) {
        //     case eCardArea.TABLE:
        //         label = `debug\n${cardInfo.debug?.pair_id}`;
        //         break;
        //     case eCardArea.DISCARD:
        //         label = `debug\n${cardInfo.debug?.spell_id}`;
        //         break;
        // }
        this.label = scene.add.text(0, 0, label, {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#000', 
            align: 'center',
        }).setOrigin(0.5);

        // コンテナにオブジェクトを追加
        this.add([...Object.values(this.diImages), this.label]);
        this.setSize(size.width, size.height);

        // 初期状態を設定
        this.status = CardStatus.BACK;

        // インタラクティブの設定
        this.setInteractive();
        this.setupInteractions();

        scene.add.existing(this);

        // ラベルを非表示にする
        this.label.setVisible(false);
    }

    private setupInteractions(): void {
        this.on("pointerdown", () => {
            this.emit("cardClicked", this);
        });

        this.on("pointerover", () => {
            this.diImages[eAssetFolderType.BACK].alpha = 0.8;
            this.scene.input.setDefaultCursor("pointer");
            this.label.setVisible(true);
        });

        this.on("pointerout", () => {
            this.diImages[eAssetFolderType.BACK].alpha = 1.0;
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
        this.diImages[eAssetFolderType.BACK].setDisplaySize(size.width, size.height);
        this.diImages[eAssetFolderType.FRONT].setDisplaySize(size.width, size.height);
        this.diImages[eAssetFolderType.REAL].setDisplaySize(size.width, size.height);
    }

    public get status(): CardStatus {
        return this._status;
    }

    public set status(state: CardStatus) {
        switch(state) {
            case CardStatus.FRONT:
                this.diImages[eAssetFolderType.FRONT].setVisible(true);
                this.diImages[eAssetFolderType.BACK].setVisible(false);
                this.diImages[eAssetFolderType.REAL].setVisible(false);
                this.label.setVisible(false);
                break;
            case CardStatus.BACK:
                this.diImages[eAssetFolderType.FRONT].setVisible(false);
                this.diImages[eAssetFolderType.BACK].setVisible(true);
                this.diImages[eAssetFolderType.REAL].setVisible(false);
                this.label.setVisible(false);
                break;
            case CardStatus.REAL:
                this.diImages[eAssetFolderType.FRONT].setVisible(false);
                this.diImages[eAssetFolderType.BACK].setVisible(false);
                this.diImages[eAssetFolderType.REAL].setVisible(true);
                this.label.setVisible(false);
                break;
            case CardStatus.VANISHED:
                this.diImages[eAssetFolderType.FRONT].setVisible(false);
                this.diImages[eAssetFolderType.BACK].setVisible(false);
                this.diImages[eAssetFolderType.REAL].setVisible(false);
                this.label.setVisible(false);
                this.setVisible(false);
                this.setInteractive(false);
                break;
        }
        this._status = state;
    }




    public setTint(color: number): void {
        this.diImages[eAssetFolderType.FRONT].setTint(color);
        this.diImages[eAssetFolderType.BACK].setTint(color);
        this.diImages[eAssetFolderType.REAL].setTint(color);
    }

    public clearTint(): void {
        this.diImages[eAssetFolderType.FRONT].clearTint();
        this.diImages[eAssetFolderType.BACK].clearTint();
        this.diImages[eAssetFolderType.REAL].clearTint();
    }
}
  