import { sleep } from "@/utils/functions";
import { CardStatus } from "../clients/GameClient";
import { PhaseManager } from "../managers/PhaseManager";

export const spell = async (phaseManager: PhaseManager, spellId: string, isMyTurn: boolean):Promise<void> => {
    console.log("spell 発動")
    console.log(spellId)

    phaseManager.spellLabel.txt = `${spellId} 発動`;
    await sleep(1000);
    phaseManager.spellLabel.txt = '';

    const [mainId, ...args] = spellId.split('.');

    switch(mainId){
        case 'giant-killing':
            console.warn("giant-killing 発動!!!!!!");
            break;
        case 'attack':
            const attack:number = Number(`${args[0]}${args[1]}`);
            phaseManager.attackedLabel.get(isMyTurn).attacked += attack;
            break;
        case 'defence':
            const defence:number = Number(`${args[0]}${args[1]}`);
            phaseManager.attackedLabel.get(!isMyTurn).attacked -= defence;
            break;
        case 'scan':
            let scan:number = Number(`${args[0]}`);
            let unknownCards = phaseManager.cardComponents
            .filter(card => card.pair_id === undefined);
            unknownCards = Phaser.Math.RND.shuffle(unknownCards);
            scan = Math.min(scan, unknownCards.length);
            // debugger
            for(let i = 0; i < scan; i++){
                const card = unknownCards[i];
                card.addInfo = await phaseManager.gameClient.fetchSpecificCardFullInfoAsync(card.idFrontBack);

                const place = {...card.place};

                place.cardStatus = CardStatus.FRONT;
                phaseManager.updateCardPlace(card.idFrontBack, place);
                // console.log(`${card.idFrontBack} が見えた`);

                await sleep(500);

                place.cardStatus = CardStatus.BACK;
                phaseManager.updateCardPlace(card.idFrontBack, place);
                // console.log(`${card.idFrontBack} が閉じた`);

            }
        case 'shuffle':
            console.warn("idFrontBack is same as is.")
            phaseManager.table.shuffleBoard();
            break;
        default:
            console.warn(`未実装の呪文ID: ${mainId}`);
            break;
    }
    return Promise.resolve();
    // return Promise.resolve();
}