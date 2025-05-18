import { LocalServer } from "../servers/LocalServer";
import { AbstractSubClient } from "./AbstractSubClient";
import { tCardAddInfo, tGameClient } from "./GameClient";

export class CSSGameClient extends AbstractSubClient {

    constructor(gameClient: tGameClient, localServer?: LocalServer) {
        super(gameClient, localServer);
    }

    public async fetchOpponentCostCardsAsync(): Promise<tCardAddInfo[]> {
        if(this.localServer) {
            return await this.localServer.fetchOpponentCostCardsAsync();
        } else {
            return [];
        }
    }

    public async fetchOpponentSummonCardsAsync(): Promise<tCardAddInfo[]> {
        if(this.localServer) {
            return await this.localServer.fetchOpponentSummonCardsAsync();
        } else {
            return [];
        }
    }
    public async fetchOpponentSpellCardsAsync(): Promise<tCardAddInfo[]> {
        if(this.localServer) {
            return await this.localServer.fetchOpponentSpellCardsAsync();
        } else {
            return [];
        }
    }
    
    
}