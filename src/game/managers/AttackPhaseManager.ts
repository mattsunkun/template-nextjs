import { unexpectError } from "@/utils/functions";
import { CardStatus, eCardArea } from "../clients/GameClient";
import { InstanceSelector } from "../components/utils/InstanceSelector";
import { spell } from "../spells/Spell";
import { AbstractSubManager, eTurnStatus } from "./AbstractSubManager";
import { PhaseManager } from "./PhaseManager";

export class ReadyCard {
    public idFrontBacks: string[] = [];
}

export class AttackPhaseManager extends AbstractSubManager {
    private _myReadyCardIdFrontBacks: ReadyCard;
    private _opponentReadyCardIdFrontBacks: ReadyCard;

    public readyCardIdFrontBacks: InstanceSelector<ReadyCard>;

    private currentChooseCardIdFrontBacks: string[] = [];

    constructor(phaseManager: PhaseManager) {
        super(phaseManager);
        this._myReadyCardIdFrontBacks = new ReadyCard();
        this._opponentReadyCardIdFrontBacks = new ReadyCard();

        this.readyCardIdFrontBacks = new InstanceSelector({
            my: this._myReadyCardIdFrontBacks,
            opponent: this._opponentReadyCardIdFrontBacks
        });
    }

    public async startPhaseAsync(): Promise<void> {
        for(const isMyTurn of [true, false]){
            this.readyCardIdFrontBacks.get(isMyTurn).idFrontBacks = this.phaseManager.summon.get(isMyTurn).cardComponents.map(card => card.idFrontBack);
        }
        let turnStatus = eTurnStatus.AGAIN;
        // debugger
        while(
            this.readyCardIdFrontBacks.get(true).idFrontBacks.length !== 0 || 
            this.readyCardIdFrontBacks.get(false).idFrontBacks.length !== 0
        ){
            for(const isMyTurn of [
                this.phaseManager.isMeFirst, 
                !this.phaseManager.isMeFirst
            ]){
                this.phaseManager.isMyTurn = isMyTurn;
                if(isMyTurn && this.readyCardIdFrontBacks.get(true).idFrontBacks.length === 0){
                    continue;
                }
                if(!isMyTurn && this.readyCardIdFrontBacks.get(false).idFrontBacks.length === 0){
                    continue;
                }

                // 自分の使ったカードは伏せる
                this.phaseManager.summon.get(isMyTurn).cardComponents
                .filter(card => !(this.readyCardIdFrontBacks.get(isMyTurn).idFrontBacks).includes(card.idFrontBack) )
                .forEach(card => {
                    const place = {...card.place}
                    place.cardStatus = CardStatus.BACK;
                    this.phaseManager.updateCardPlace(card.idFrontBack, place);
                });
                turnStatus = await this.eachTurnAsync(isMyTurn);
                // カードをもとに戻す
                this.phaseManager.summon.get(isMyTurn).cardComponents
                .forEach(card => {
                    const place = {...card.place}
                    place.cardStatus = CardStatus.REAL;
                    this.phaseManager.updateCardPlace(card.idFrontBack, place);
                });
                if(turnStatus === eTurnStatus.END){
                    break;
                }
            }
            if(turnStatus === eTurnStatus.END){
                break;
            }
        }

        await this.endPhaseAsync();
    }

    public async endPhaseAsync(): Promise<void> {
        this.phaseManager.cardComponents.forEach(card => {
            card.removeAllListeners('pointerdown');
        });
        this.phaseManager.nextTurn();
    }

    protected async myChooseAsync(): Promise<string[]> {
        const isMe = true;
        this.phaseManager.summon.get(isMe).isInteractive = true;
        const idFrontBacks: string[] =[
            await this.chooseCard(true)
        ]
        this.phaseManager.summon.get(isMe).isInteractive = false;

        if(this.readyCardIdFrontBacks.get(false).idFrontBacks.length !== 0){
            this.phaseManager.summon.get(!isMe).isInteractive = true;
            idFrontBacks.push(
                await this.chooseCard(false)
            )
            this.phaseManager.summon.get(!isMe).isInteractive = false;
        }

        return idFrontBacks;
    }

    private async chooseCard(isMe: boolean): Promise<string> {
        return await new Promise<string>((resolve) => {
            const clickHandler = (idFrontBack: string) => {
                this.phaseManager.cardComponents.forEach(card => {
                    card.removeAllListeners('pointerdown');
                });
                resolve(idFrontBack);
            };
            this.phaseManager.summon.get(isMe).cardComponents
            .filter(card => (this.readyCardIdFrontBacks.get(isMe).idFrontBacks)
            .includes(card.idFrontBack) )
            .forEach(card => {
                card.removeAllListeners('pointerdown');
                card.on('pointerdown', () => clickHandler(card.idFrontBack));
            });
        });
    }
    

    protected async opponentChooseAsync(): Promise<string[]> {
        const idFrontBacks: string[] = [];
        if(this.readyCardIdFrontBacks.get(false).idFrontBacks.length > 0) {
            idFrontBacks.push(
                ...await this.phaseManager.gameClient.attackClient.fetchOpponentOpponentReadyCardIdFrontBacksAsync()
            );
        }
        if(this.readyCardIdFrontBacks.get(true).idFrontBacks.length > 0) {
            idFrontBacks.push(
                ...await this.phaseManager.gameClient.attackClient.fetchOpponentMyReadyCardIdFrontBacksAsync()
            );
        }
        return idFrontBacks;
    }

    protected async applyChooseAsync(idFrontBacks: string[], isMyTurn: boolean): Promise<eTurnStatus> {
        let attackIdFrontBack: string = "";
        let defendIdFrontBack: string = "";
        switch(idFrontBacks.length){
            case 1:
                attackIdFrontBack = idFrontBacks[0];
                break;
            case 2:
                if(isMyTurn === this.readyCardIdFrontBacks.get(true).idFrontBacks.includes(idFrontBacks[0])){
                    attackIdFrontBack = idFrontBacks[0];
                    defendIdFrontBack = idFrontBacks[1];
                }else{
                    attackIdFrontBack = idFrontBacks[1];
                    defendIdFrontBack = idFrontBacks[0];
                }
                
                break;
            default:
                unexpectError("idFrontBacks.length is not 1 or 2");
                break;
        }

        const attack = this.phaseManager.getCardComponent(attackIdFrontBack).nowAttack;
                const defend = defendIdFrontBack ? 
                this.phaseManager.getCardComponent(defendIdFrontBack).nowAttack :
                0;
                // debugger
                let damage = attack - defend;
                if(
                    defendIdFrontBack &&
                    ["little", "gigant"].includes(this.phaseManager.getCardComponent(defendIdFrontBack).addInfo.ability ?? "") && 
                    ["little", "gigant"].includes(this.phaseManager.getCardComponent(attackIdFrontBack).addInfo.ability ?? "")
            ){
                    await spell(this.phaseManager, "giant-killing");
                    damage = 0;
                }

                if(damage >= 0){
                    this.phaseManager.attackedLabel.get(isMyTurn).attacked += damage;
                    if(defendIdFrontBack){
                        const place = {...this.phaseManager.getCardComponent(defendIdFrontBack).place}
                        place.area = eCardArea.TOMB
                        this.phaseManager.updateCardPlace(defendIdFrontBack, place)
                    }
                }else{
                    // 防御が成功した場合、差分を保持
                    this.phaseManager.getCardComponent(defendIdFrontBack).nowAttack = Math.abs(damage);
                }

                // 攻撃カードのnowAttackを0に設定
                const attackCard = this.phaseManager.getCardComponent(attackIdFrontBack);
                attackCard.nowAttack = 0;
                const place = {...attackCard.place}
                place.area = eCardArea.TOMB
                this.phaseManager.updateCardPlace(attackIdFrontBack, place)

                // 使用したカードをreadyCardから除外
                if(isMyTurn){
                    this.readyCardIdFrontBacks.get(true).idFrontBacks = this.readyCardIdFrontBacks.get(true).idFrontBacks.filter(id => id !== attackIdFrontBack);
                    this.readyCardIdFrontBacks.get(false).idFrontBacks = this.readyCardIdFrontBacks.get(false).idFrontBacks.filter(id => id !== defendIdFrontBack);
                }else{
                    this.readyCardIdFrontBacks.get(true).idFrontBacks = this.readyCardIdFrontBacks.get(true).idFrontBacks.filter(id => id !== defendIdFrontBack);
                    this.readyCardIdFrontBacks.get(false).idFrontBacks = this.readyCardIdFrontBacks.get(false).idFrontBacks.filter(id => id !== attackIdFrontBack);
                }
        return eTurnStatus.DONE;
    }
}