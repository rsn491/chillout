import P2PClient from '../p2pClient.ts';
import P2PRequest from '../p2pRequest.js';
import MESSAGE_TYPE from '../messageTypes';

export default class AuthClient extends P2PClient {
  constructor(peerConnection) {
    super(peerConnection);
  }

  requestRoomAccess(invitationCode, username) {
    this.send(new P2PRequest(MESSAGE_TYPE.roomAccess, {invitationCode, username}));
  }

  acceptRoomAccess(roomUsers) {
    this.send(new P2PRequest(MESSAGE_TYPE.roomAccessGranted, {
      peers: roomUsers.map(user => {
        return {
          peerConnection: user.peerConnection.peer,
          username: user.username,
        };
      })
    }));
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
