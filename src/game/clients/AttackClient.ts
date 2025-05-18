import { LocalServer } from "../servers/LocalServer";
import { AbstractSubClient } from "./AbstractSubClient";
import { tGameClient } from "./GameClient";

export class AttackClient extends AbstractSubClient {
    constructor(idGameClient: tGameClient, localServer: LocalServer) {
        super(idGameClient, localServer);
    }



    
}