import { DataConnection } from "peerjs";
import P2PRequest from "./p2pRequest";

export default class P2PClient {
  
  peerConnection: DataConnection;

  constructor(peerConnection: DataConnection) {
    this.peerConnection = peerConnection;
  }

  /**
   * @param {P2PRequest} p2pRequest
   */
  send(p2pRequest: P2PRequest) {
    this.peerConnection.send(JSON.stringify(p2pRequest));
  }
}
