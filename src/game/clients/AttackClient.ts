import { sleep } from "@/utils/functions";
import { LocalServer } from "../servers/LocalServer";
import { AbstractSubClient } from "./AbstractSubClient";
import { GameClient, tGameClient } from "./GameClient";

export class AttackClient extends AbstractSubClient {
    constructor(gameClient: GameClient, idGameClient: tGameClient, localServer: LocalServer) {
        super(gameClient, idGameClient, localServer);
    }


    public async fetchOpponentMyReadyCardIdFrontBacksAsync(): Promise<string[]> {
        if(this.localServer) {
            await sleep(this.localServer.sleepTime);
            return [Phaser.Math.RND.pick(this.gameClient.phaseManager.attackPhaseManager.readyCardIdFrontBacks.get(true).idFrontBacks)]
        }
        return [];
    }

    public async fetchOpponentOpponentReadyCardIdFrontBacksAsync(): Promise<string[]> {
        if(this.localServer) {
            await sleep(this.localServer.sleepTime);
            return [Phaser.Math.RND.pick(this.gameClient.phaseManager.attackPhaseManager.readyCardIdFrontBacks.get(false).idFrontBacks)]
        }
        return [];
    }

    
}