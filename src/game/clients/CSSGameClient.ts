import { LocalServer } from "../servers/LocalServer";
import { tCardFullInfo, tGameClient } from "./GameClient";

export class CSSGameClient  {
    private gameClient: tGameClient;
    private localServer: LocalServer|undefined;

    constructor(gameClient: tGameClient, localServer?: LocalServer) {
        this.gameClient = gameClient;
        this.localServer = localServer;
    }

    public async fetchOpponentCostCardAsync(): Promise<tCardFullInfo> {
        if(this.localServer) {
            const response = await this.localServer.fetchOpponentCostCardAsync();
            return response.card;
        } else {
            throw new Error("LocalServer is undefined");
        }
    }

    public async postMyCostCardAsync(card: tCardFullInfo): Promise<void> {
        if(this.localServer) {
            await this.localServer.postMyCostCardAsync(card);
        } else {
            throw new Error("LocalServer is undefined");
        }
    }

    
    
}