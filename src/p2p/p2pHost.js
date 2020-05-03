import GameClient from './clients/gameClient.js';
import MultimediaClient from './clients/multimediaClient.js';
import GameSessionRepo from './infrastructure/gameSessionRepo.js';
import MESSAGE_TYPE from './messageTypes';

export default class P2PHost {

  constructor(serverPeer, onGameReadyToStart, onNextQuestion, onGameScore, onGameEnded, onYoutubeVideoURL) {
    this.serverPeer = serverPeer;
    this.peerId = serverPeer.id;
    this.peers = [];
    this.gameSessionRepo = new GameSessionRepo();
    this.onGameReadyToStart = onGameReadyToStart;
    this.onNextQuestion = onNextQuestion;
    this.onGameScore = onGameScore;
    this.onGameEnded = onGameEnded;
    this.onYoutubeVideoURL = onYoutubeVideoURL;
  }

  sendToAllPeers(sendToPeerFunction) {
    this.peers.forEach((peer) => sendToPeerFunction(peer));
  }

  inviteToGame() {
    const session = this.gameSessionRepo.createNewSession([this.peerId, ...this.peers.map(p => p.peer)]);
    // confirm self
    session.confirmPlayer(this.peerId);
    this.sendToAllPeers((peer) => new GameClient(peer).sendGameInvite());
  }

  sendYoutubeVideo(url) {
    this.sendToAllPeers((peer) => new MultimediaClient(peer).sendYoutubeVideo(url));
    this.onYoutubeVideoURL(url);
  }

  sendQuestion() {
    const session = this.gameSessionRepo.getSession();

    if(!session.hasNextQuestion()) {
      this.sendToAllPeers((peer) => new GameClient(peer).sendGameEnded());
      this.onGameEnded();
      return;
    }

    const scoreBoard = session.getScoreBoard();
    this.sendToAllPeers((peer) => new GameClient(peer).sendScore(scoreBoard));
    this.onGameScore(scoreBoard);
    setTimeout(() => {
      const question = session.getNextQuestion();
      this.sendToAllPeers((peer) => new GameClient(peer).sendQuestion(question));
      this.onNextQuestion(question);
    }, 5000);
  }

  // eslint-disable-next-line no-unused-vars
  handleAnswer(answer, peerId = this.peerId) {
    const session = this.gameSessionRepo.getSession();
    session.addAnswer(peerId, answer);
    if(session.hasEveryoneAnswered()) {
      this.sendQuestion();
    }
  }

  handleGameInviteAccepted(peerId) {
    const session = this.gameSessionRepo.getSession();
    session.confirmPlayer(peerId);
    if(session.isReadyToStart()) {
      this.onGameReadyToStart();
    }
  }

  handleYoutubeVideoURL(url) {
    this.sendYoutubeVideo(url);
  }

  attachDataAPIHandler(peerConnection) {
    peerConnection.on('data', (data) => {
      const json = JSON.parse(data);
      switch(json.messageType) {
        case MESSAGE_TYPE.gameInviteAccepted:
          this.handleGameInviteAccepted(json.peerId);
          break;
        case MESSAGE_TYPE.gameAnswer:
          this.handleAnswer(json.answer, json.peerId);
          break;
        case MESSAGE_TYPE.youtubeVideo:
          this.handleYoutubeVideoURL(json.url);
          break;
        default:
          console.log('could not process request: ' + data);
      }
    });
  }

  start() {
    this.serverPeer.on('connection', (newPeerConnection) => {
      this.peers.push(newPeerConnection);
      this.attachDataAPIHandler(newPeerConnection);
    });
  }
}
