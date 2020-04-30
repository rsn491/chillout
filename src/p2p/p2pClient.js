// import P2PRequest from './p2pRequest';

export default class P2PClient {

  constructor(peerConnection) {
    this.peerConnection = peerConnection;
  }

  /**
   * @param {P2PRequest} p2pRequest
   */
  send(p2pRequest) {
    this.peerConnection.send(JSON.stringify(p2pRequest));
  }
}
