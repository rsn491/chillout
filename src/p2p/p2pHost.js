import { v4 as uuidv4 } from 'uuid';

import GameClient from './clients/gameClient.js';
import MultimediaClient from './clients/multimediaClient.js';
import GameSessionRepo from './infrastructure/gameSessionRepo.js';
import MESSAGE_TYPE from './messageTypes';
import AuthClient from './clients/authClient.js';
import RoomUser from './domain/roomUser.js';

export default class P2PHost {

  constructor(hostPeer, username, onGameReadyToStart, onNextQuestion, onGameScore, onYoutubeVideoURL) {
    this.hostUser = new RoomUser(username, hostPeer);
    this.peerId = hostPeer.id;
    this.roomUsers = [];
    this.gameSessionRepo = new GameSessionRepo();
    this.onGameReadyToStart = onGameReadyToStart;
    this.onNextQuestion = onNextQuestion;
    this.onGameScore = onGameScore;
    this.onYoutubeVideoURL = onYoutubeVideoURL;
    this.tmpRoomInvitationCode = null;
    this.tmpRoomInvitationCodeExpDate = null;
  }

  sendToAllPeers(sendToPeerFunction) {
    this.roomUsers.forEach((user) => sendToPeerFunction(user.peerConnection));
  }

  async inviteToGame() {
    const session = await this.gameSessionRepo.createNewSessionAsync([this.hostUser, ...this.roomUsers], 2);
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
    const scoreBoard = session.getScoreBoard();

    this.sendToAllPeers((peer) => new GameClient(peer).sendScore(scoreBoard));
    this.onGameScore(scoreBoard);

    if(!scoreBoard.isGameFinished) {
      setTimeout(() => {
        const question = session.getNextQuestion();
        this.sendToAllPeers((peer) => new GameClient(peer).sendQuestion(question));
        this.onNextQuestion(question);
      }, 3000);
    }
  }

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

  handleRoomAccess(peerConnection, invitationCode, username) {
    if(!this.tmpRoomInvitationCode || !this.tmpRoomInvitationCodeExpDate) {
      return false;
    }
    if(invitationCode === this.tmpRoomInvitationCode
      && Date.now() < this.tmpRoomInvitationCodeExpDate) {
        // invitation code is valid
        this.roomUsers.push(new RoomUser(username, peerConnection));
        new AuthClient(peerConnection).acceptRoomAccess(this.roomUsers);
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
    return this.roomUsers.find(authorizedPeer => authorizedPeer.peerConnection.peer === peerId);
  }

  attachDataAPIHandler(peerConnection) {
    peerConnection.on('data', (data) => {
      const json = JSON.parse(data);
      if(json.messageType === MESSAGE_TYPE.roomAccess) {
        this.handleRoomAccess(peerConnection, json.invitationCode, json.username);
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
    this.hostUser.peerConnection.on('connection', (newPeerConnection) => {
      newPeerConnection.on('open', () => {
        if(this.isAuthorized(newPeerConnection)) {
          new AuthClient(newPeerConnection).acceptRoomAccess(this.roomUsers);
        }
      });
      
      this.attachDataAPIHandler(newPeerConnection);

      newPeerConnection.on('error', (err) => console.log(err))
      newPeerConnection.on('close', () => console.log("closed ..."))
    });
  }
}
