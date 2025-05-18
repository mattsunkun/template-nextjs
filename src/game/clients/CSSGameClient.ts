import { LocalServer } from "../servers/LocalServer";
import { tCardFullInfo, tGameClient } from "./GameClient";

export class CSSGameClient  {
    private gameClient: tGameClient;
    private localServer: LocalServer|undefined;

    constructor(gameClient: tGameClient, localServer?: LocalServer) {
        this.gameClient = gameClient;
        this.localServer = localServer;
    }

    public async fetchOpponentCostCardAsync(): Promise<tCardFullInfo|undefined> {
        if(this.localServer) {
            return await this.localServer.fetchOpponentCostCardAsync();
        } else {
            throw new Error("LocalServer is undefined");
            return undefined;
        }
    }

    public async postMyCostUsedAsync(cardIdFrontBacks: string[]): Promise<void> {
        if(this.localServer) {
            await this.localServer.postMyCostCardAsync(cardIdFrontBacks);
        } else {
            throw new Error("LocalServer is undefined");
        }
    }

    
    
}