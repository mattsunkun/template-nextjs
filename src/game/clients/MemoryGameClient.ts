import { LocalServer } from "../servers/LocalServer";
import { AbstractSubClient } from "./AbstractSubClient";
import { tGameClient } from "./GameClient";

export class MemoryGameClient extends AbstractSubClient {

  constructor(idGameClient: tGameClient, localServer: LocalServer) {
    super(idGameClient, localServer);
  }

  
  async receiveOpponentCardFullInfoAsync(): Promise<string> {
    if(this.localServer) {
        return await this.localServer.fetchOpponentTableCardChoiceAsync();
    } else {
      throw new Error("localServer is undefined");
    }
  }
}