import { LocalServer } from "../servers/LocalServer";
import { GameClient, tGameClient } from "./GameClient";

export abstract class AbstractSubClient {
    public gameClient:GameClient;
    private idGameClient:tGameClient;
    protected localServer?:LocalServer;

    constructor(gameClient:GameClient,idGameClient:tGameClient, localServer?:LocalServer) {
        this.gameClient = gameClient;
        this.idGameClient = idGameClient;
        this.localServer = localServer;

        
    }
}