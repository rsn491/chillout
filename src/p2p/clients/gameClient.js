import P2PClient from '../p2pClient.js';
import P2PRequest from '../p2pRequest.js';
import MESSAGE_TYPE from '../messageTypes';

export default class GameClient extends P2PClient {
  constructor(peerConnection) {
    super(peerConnection);
  }

  sendAnswer(answer) {
    this.send(new P2PRequest(MESSAGE_TYPE.gameAnswer, answer));
  }

  sendQuestion(question) {
    this.send(new P2PRequest(MESSAGE_TYPE.gameQuestion, question));
  }

  sendScore(score) {
    this.send(new P2PRequest(MESSAGE_TYPE.gameScore, {score}));
  }

  sendGameEnded() {
    this.send(new P2PRequest(MESSAGE_TYPE.gameEnded));
  }

  sendGameInvite() {
    this.send(new P2PRequest(MESSAGE_TYPE.gameInvite));
  }

  acceptGameInvite(peerId) {
    this.send(new P2PRequest(
      MESSAGE_TYPE.gameInviteAccepted,
      {peerId}));
  }
}
