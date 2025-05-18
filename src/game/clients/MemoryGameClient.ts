import { LocalServer } from "../servers/LocalServer";
import { tCardAddInfo, tGameClient } from "./GameClient";

export class MemoryGameClient {
  private idGameClient: tGameClient;
  private localServer: LocalServer;

  constructor(idGameClient: tGameClient, localServer: LocalServer) {
    this.idGameClient = idGameClient;
    this.localServer = localServer;
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