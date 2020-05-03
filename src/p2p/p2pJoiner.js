import MESSAGE_TYPE from './messageTypes';
import GameClient from './clients/gameClient.js';
import MultimediaClient from './clients/multimediaClient.js';

export default class P2PJoiner {

  constructor(peer, hostPeer, onNextQuestion, onGameScore,  onGameEnded, onYoutubeVideoURL) {
    this.peer = peer;
    this.peerId = peer.id;
    this.hostPeer = hostPeer;
    this.onNextQuestion = onNextQuestion;
    this.onGameEnded = onGameEnded;
    this.onGameScore = onGameScore;
    this.onYoutubeVideoURL = onYoutubeVideoURL;
    this.gameClient = null;
    this.multimediaClient = null;
  }

  sendAnswer(answer) {
    this.gameClient.sendAnswer({
      peerId: this.peerId,
      answer: answer
    });
  }

  sendYoutubeVideo(url) {
    this.multimediaClient.sendYoutubeVideo(url);
  }

  handleYoutubeVideoURL(url) {
    this.onYoutubeVideoURL(url);
  }

  start() {
    const hostDataConnection = this.peer.connect(this.hostPeer);
    this.gameClient = new GameClient(hostDataConnection);
    this.multimediaClient = new MultimediaClient(hostDataConnection);

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
        case MESSAGE_TYPE.youtubeVideo:
          this.handleYoutubeVideoURL(json.url);
          break;
        default:
          console.log('could not process request: ' + data);
      }
    });
  }
}
