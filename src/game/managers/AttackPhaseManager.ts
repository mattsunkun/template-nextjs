import { unexpectError } from "@/utils/functions";
import { CardStatus, eCardArea } from "../clients/GameClient";
import { AbstractSubManager, eTurnStatus } from "./AbstractSubManager";
import { PhaseManager } from "./PhaseManager";

export class AttackPhaseManager extends AbstractSubManager {
    private myReadyCardIdFrontBacks: string[] = [];
    private opponentReadyCardIdFrontBacks: string[] = [];

    private currentChooseCardIdFrontBacks: string[] = [];

    constructor(phaseManager: PhaseManager) {
        super(phaseManager);
    }

    public async startPhaseAsync(): Promise<void> {
        this.myReadyCardIdFrontBacks = this.phaseManager.summon.get(true).cardComponents.map(card => card.idFrontBack);
        this.opponentReadyCardIdFrontBacks = this.phaseManager.summon.get(false).cardComponents.map(card => card.idFrontBack);
        let turnStatus = eTurnStatus.AGAIN;
        // debugger
        while(this.myReadyCardIdFrontBacks.length !== 0 || this.opponentReadyCardIdFrontBacks.length !== 0){
            for(const isMyTurn of [
                this.phaseManager.isMeFirst, 
                !this.phaseManager.isMeFirst
            ]){
                if(isMyTurn && this.myReadyCardIdFrontBacks.length === 0){
                    continue;
                }
                if(!isMyTurn && this.opponentReadyCardIdFrontBacks.length === 0){
                    continue;
                }

                // 自分の使ったカードは伏せる
                this.phaseManager.summon.get(isMyTurn).cardComponents
                .filter(card => !(isMyTurn ? 
                    this.myReadyCardIdFrontBacks : 
                    this.opponentReadyCardIdFrontBacks
                ).includes(card.idFrontBack) )
                .forEach(card => {
                    const place = {...card.place}
                    place.cardStatus = CardStatus.BACK;
                    this.phaseManager.updateCardPlace(card.idFrontBack, place);
                });
                // console.log(this.myReadyCardIdFrontBacks, this.opponentReadyCardIdFrontBacks);
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
        // console.log(this.myReadyCardIdFrontBacks);
        this.phaseManager.summon.get(isMe).isInteractive = true;
        const idFrontBacks: string[] =[
            await this.chooseCard(true)
        ]
        // console.log("asdf")

        if(this.opponentReadyCardIdFrontBacks.length !== 0){
            idFrontBacks.push(
                await this.chooseCard(false)
            )
        }

        // console.log(idFrontBacks);

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
            .filter(card => (isMe ? 
                this.myReadyCardIdFrontBacks : 
                this.opponentReadyCardIdFrontBacks
            ).includes(card.idFrontBack) )
            .forEach(card => {
                card.removeAllListeners('pointerdown');
                card.on('pointerdown', () => clickHandler(card.idFrontBack));
            });
        });
    }
    

    protected async opponentChooseAsync(): Promise<string[]> {
        const idFrontBacks: string[] = [];
        if(this.myReadyCardIdFrontBacks.length > 0) {
            idFrontBacks.push(
                Phaser.Math.RND.pick(this.myReadyCardIdFrontBacks)
            );
        }
        if(this.opponentReadyCardIdFrontBacks.length > 0) {
            idFrontBacks.push(
                Phaser.Math.RND.pick(this.opponentReadyCardIdFrontBacks) 
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
                if(isMyTurn === this.myReadyCardIdFrontBacks.includes(idFrontBacks[0])){
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
        // console.log(attackIdFrontBack, defendIdFrontBack);
        // debugger;

        const attack = this.phaseManager.getCardComponent(attackIdFrontBack).nowAttack;
                const defend = defendIdFrontBack ? 
                this.phaseManager.getCardComponent(defendIdFrontBack).nowAttack :
                0;
                // debugger
                const damage = attack - defend;

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
                    this.myReadyCardIdFrontBacks = this.myReadyCardIdFrontBacks.filter(id => id !== attackIdFrontBack);
                    this.opponentReadyCardIdFrontBacks = this.opponentReadyCardIdFrontBacks.filter(id => id !== defendIdFrontBack);
                }else{
                    this.myReadyCardIdFrontBacks = this.myReadyCardIdFrontBacks.filter(id => id !== defendIdFrontBack);
                    this.opponentReadyCardIdFrontBacks = this.opponentReadyCardIdFrontBacks.filter(id => id !== attackIdFrontBack);
                }
        return eTurnStatus.DONE;
    }
}