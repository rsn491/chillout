import MESSAGE_TYPE from './messageTypes';
import GameClient from './clients/gameClient.js';
import MultimediaClient from './clients/multimediaClient.js';
import AuthClient from './clients/authClient';

export default class P2PJoiner {

  constructor(peer, hostPeer, ownStream, onNextQuestion, onGameScore,  onGameEnded, onYoutubeVideoURL,
    onPeerVideoStreamReceived, onPeerVideoStreamClosed) {
    this.peer = peer;
    this.peerId = peer.id;
    this.hostPeer = hostPeer;
    this.onNextQuestion = onNextQuestion;
    this.onGameEnded = onGameEnded;
    this.onGameScore = onGameScore;
    this.onYoutubeVideoURL = onYoutubeVideoURL;
    this.onPeerVideoStreamReceived = onPeerVideoStreamReceived;
    this.onPeerVideoStreamClosed = onPeerVideoStreamClosed;
    this.gameClient = null;
    this.multimediaClient = null;
    this.peers = [];
    this.ownStream = ownStream;
    this.callsPendingAuthorization = {};
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

  handleRoomAccessGranted(peers) {
    // connect with media stream to all peers
    this.callPeer(this.hostPeer, this.ownStream);
    peers.forEach(remotePeer => this.callPeer(remotePeer, this.ownStream));
  }

  handleAuthorizedPeer(peerId) {
    const call = this.callsPendingAuthorization[peerId];
    call.answer(this.ownStream);
    call.on('stream', (peerStream) => this.onPeerVideoStreamReceived(call.peer, peerStream));
    call.on('close', () => this.onPeerVideoStreamClosed(call.peer));
    delete this.callsPendingAuthorization[peerId];
  }

  handleUnauthorizedPeer(peerId) {
    const call = this.callsPendingAuthorization[peerId];
    call.close();
    delete this.callsPendingAuthorization[peerId];
  }

  callPeer(peerId) {
    const call = this.peer.call(peerId, this.ownStream);
    call.on('stream', (peerStream) => this.onPeerVideoStreamReceived(call.peer, peerStream));
    call.on('close', () => this.onPeerVideoStreamClosed(call.peer));
  }

  start(invitationCode) {
    const hostDataConnection = this.peer.connect(this.hostPeer);

    this.gameClient = new GameClient(hostDataConnection);
    this.multimediaClient = new MultimediaClient(hostDataConnection);

    // video stream handler
    this.peer.on('call', (call) => {
      this.callsPendingAuthorization[call.peer] = call;
      new AuthClient(hostDataConnection).isPeerAuthorized(call.peer);
    });

    hostDataConnection.on('open', () => {

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
          case MESSAGE_TYPE.roomAccessGranted:
            this.handleRoomAccessGranted(json.peers);
            break;
          case MESSAGE_TYPE.authorizedPeer:
            this.handleAuthorizedPeer(json.peerId);
            break;
          case MESSAGE_TYPE.unauthorizedPeer:
            this.handleUnauthorizedPeer(json.peerId);
            break;
          default:
            console.log('could not process request: ' + data);
        }
      });     

      hostDataConnection.on('error', (err) => console.log(err));
      hostDataConnection.on('close', () => console.log("closed ..."));

      // request access
      new AuthClient(hostDataConnection).requestRoomAccess(invitationCode); 
    });
  }
}
