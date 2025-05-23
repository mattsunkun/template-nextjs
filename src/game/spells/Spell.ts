import { sleep } from "@/utils/functions";
import { PhaseManager } from "../managers/PhaseManager";

export const spell = async (phaseManager: PhaseManager, spellId: string):Promise<void> => {
    console.log("spell 発動")
    console.log(spellId)

    phaseManager.spellLabel.txt = `${spellId} 発動`;
    await sleep(1000);
    phaseManager.spellLabel.txt = '';

    const [mainId, ...args] = spellId.split('.');

    switch(mainId){
        case 'shuffle':
            phaseManager.table.shuffleBoard();
            break;
        default:
            console.warn(`未実装の呪文ID: ${mainId}`);
            break;
    }
    return Promise.resolve();
    // return Promise.resolve();
}