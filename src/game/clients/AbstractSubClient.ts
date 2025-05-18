import { LocalServer } from "../servers/LocalServer";
import { tGameClient } from "./GameClient";

export abstract class AbstractSubClient {
    private idGameClient:tGameClient;
    protected localServer?:LocalServer;

    constructor(idGameClient:tGameClient, localServer?:LocalServer) {
        this.idGameClient = idGameClient;
        this.localServer = localServer;
    }
}