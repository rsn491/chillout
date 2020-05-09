import P2PClient from '../p2pClient.js';
import P2PRequest from '../p2pRequest.js';
import MESSAGE_TYPE from '../messageTypes';

export default class AuthClient extends P2PClient {
  constructor(peerConnection) {
    super(peerConnection);
  }

  requestRoomAccess(invitationCode) {
    this.send(new P2PRequest(MESSAGE_TYPE.roomAccess, {invitationCode}));
  }

  acceptRoomAccess(peerConnections) {
    this.send(new P2PRequest(MESSAGE_TYPE.roomAccessGranted, {peers: peerConnections.map(p => p.peer)}));
  }

  isPeerAuthorized(peerId) {
    this.send(new P2PRequest(MESSAGE_TYPE.isPeerAuthorized, {peerId}));
  }

  authorizedPeer(peerId) {
    this.send(new P2PRequest(MESSAGE_TYPE.authorizedPeer, {peerId}));
  }

  unauthorizedPeer(peerId) {
    this.send(new P2PRequest(MESSAGE_TYPE.unauthorizedPeer, {peerId}));
  }

}
