import { PhaseManager } from "./PhaseManager";


export enum eTurnStatus {
    AGAIN = "AGAIN",
    DONE = "DONE", 
    END = "END"
}


export abstract class AbstractSubManager {
    protected phaseManager: PhaseManager;

    constructor(phaseManager: PhaseManager){
        this.phaseManager = phaseManager;
    }

    public abstract startPhaseAsync(): Promise<void>;

    public abstract endPhaseAsync(): Promise<void>;
  
    protected async eachTurnAsync(isMyTurn:boolean): Promise<eTurnStatus>{
        const idFrontBacks = isMyTurn ?
         await this.myChooseAsync() :
          await this.opponentChooseAsync();
        return await this.applyChooseAsync(idFrontBacks, isMyTurn);
    };

    protected abstract myChooseAsync(): Promise<string[]>;
    
    protected abstract opponentChooseAsync(): Promise<string[]>;

    protected abstract applyChooseAsync(idFrontBacks: string[], isMyTurn:boolean): Promise<eTurnStatus>;
  }  
