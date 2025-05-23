import { PhaseManager } from "../managers/PhaseManager";

export const spell = (phaseManager: PhaseManager, spellId: string):Promise<void> => {
    console.log("spell 発動")
    console.log(spellId)
    return Promise.resolve();
    // return Promise.resolve();
}