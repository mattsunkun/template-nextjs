import { LocalServer } from "../servers/LocalServer";
import { AbstractSubClient } from "./AbstractSubClient";
import { tCardAddInfo, tGameClient } from "./GameClient";

export class MemoryGameClient extends AbstractSubClient {

  constructor(idGameClient: tGameClient, localServer: LocalServer) {
    super(idGameClient, localServer);
  }

  
  async receiveOpponentCardFullInfoAsync(): Promise<tCardAddInfo|undefined> {
    if(this.localServer) {
        // debugger;
      return await this.localServer.fetchOpponentTableCardChoiceAsync();
    } else {
      return undefined;
    }
  }
}