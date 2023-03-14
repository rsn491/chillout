import P2PClient from '../p2pClient.ts';
import P2PRequest from '../p2pRequest.js';
import MESSAGE_TYPE from '../messageTypes';

export default class MultimediaClient extends P2PClient {
  constructor(peerConnection) {
    super(peerConnection);
  }

  sendYoutubeVideo(url) {
    this.send(new P2PRequest(MESSAGE_TYPE.youtubeVideo, {url}));
  }

}
