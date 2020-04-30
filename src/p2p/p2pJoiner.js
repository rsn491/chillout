import MESSAGE_TYPE from './messageTypes';
import GameClient from './clients/gameClient.js';

export default class P2PJoiner {

  constructor(peer, hostPeer, onNextQuestion, onGameScore,  onGameEnded) {
    this.peer = peer;
    this.peerId = peer.id;
    this.hostPeer = hostPeer;
    this.onNextQuestion = onNextQuestion;
    this.onGameEnded = onGameEnded;
    this.onGameScore = onGameScore;
    this.gameClient = null;
  }

  sendAnswer(answer) {
    this.gameClient.sendAnswer({
      peerId: this.peerId,
      answer: answer
    });
  }

  start() {
    const hostDataConnection = this.peer.connect(this.hostPeer);
    this.gameClient = new GameClient(hostDataConnection);

    hostDataConnection.on('data', (data) => {
      const json = JSON.parse(data);
      switch(json.messageType) {
        case MESSAGE_TYPE.gameInvite:
          this.gameClient.acceptGameInvite(this.peerId);
          break;
        case MESSAGE_TYPE.gameQuestion:
          this.onNextQuestion(json);
          break;
        case MESSAGE_TYPE.gameScore:
          this.onGameScore(json.score);
          break;
        case MESSAGE_TYPE.gameEnded:
          this.onGameEnded();
          break;
        default:
          console.log('could not process request: ' + data);
      }
    });
  }
}
