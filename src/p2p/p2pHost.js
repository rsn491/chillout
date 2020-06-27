import { v4 as uuidv4 } from 'uuid';

import GameClient from './clients/gameClient.js';
import MultimediaClient from './clients/multimediaClient.js';
import GameSessionRepo from './infrastructure/gameSessionRepo.js';
import MESSAGE_TYPE from './messageTypes';
import AuthClient from './clients/authClient.js';

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
    this.tmpRoomInvitationCode = null;
    this.tmpRoomInvitationCodeExpDate = null;
  }

  sendToAllPeers(sendToPeerFunction) {
    this.peers.forEach((peer) => sendToPeerFunction(peer));
  }

  async inviteToGame() {
    const session = await this.gameSessionRepo.createNewSessionAsync([this.peerId, ...this.peers.map(p => p.peer)], 10);
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
    }, 3000);
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

  handleRoomAccess(peerConnection, invitationCode) {
    if(!this.tmpRoomInvitationCode || !this.tmpRoomInvitationCodeExpDate) {
      return false;
    }
    if(invitationCode === this.tmpRoomInvitationCode
      && Date.now() < this.tmpRoomInvitationCodeExpDate) {
        // invitation code is valid
        this.peers.push(peerConnection);
        new AuthClient(peerConnection).acceptRoomAccess(this.peers);
    }
    // ignore request for now
    return;
  }

  handleIsPeerAuthorized(peerConnection, peerId) {
    const isPeerAuthorized = this.isAuthorized(peerId);

    if(isPeerAuthorized) {
      new AuthClient(peerConnection).authorizedPeer(peerId);
    } else {
      new AuthClient(peerConnection).unauthorizedPeer(peerId);
    }
  }

  createTmpInvitationCode() {
    this.tmpRoomInvitationCode = uuidv4();
    // new code is valid for 10 mins
    this.tmpRoomInvitationCodeExpDate = new Date(Date.now() + 10*60000);
    return this.tmpRoomInvitationCode;
  }

  isAuthorized(peerId) {
    return this.peers.find(authorizedPeer => authorizedPeer.peer === peerId);
  }

  attachDataAPIHandler(peerConnection) {
    peerConnection.on('data', (data) => {
      const json = JSON.parse(data);
      if(json.messageType === MESSAGE_TYPE.roomAccess) {
        this.handleRoomAccess(peerConnection, json.invitationCode);
        return;
      }
      if(!this.isAuthorized(peerConnection.peer)) {
        // ignore unauthorized for now
        return;
      }
      switch(json.messageType) {
        case MESSAGE_TYPE.isPeerAuthorized:
          this.handleIsPeerAuthorized(peerConnection, json.peerId);
          break;
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
      newPeerConnection.on('open', () => {
        if(this.peers.find(p => p == newPeerConnection)) {
          new AuthClient(newPeerConnection).acceptRoomAccess(this.peers);
        }
      });
      
      this.attachDataAPIHandler(newPeerConnection);

      newPeerConnection.on('error', (err) => console.log(err))
      newPeerConnection.on('close', () => console.log("closed ..."))
    });
  }
}
