<template>
  <div>
    <Navbar
      :muted=muted
      :cameraOn=cameraOn
      :onShareRoom="isHost() ? shareRoom : null"
      :onStartTriviaGame="isHost()  ? play : null"
      :onOpenShareYoutube="showShareYoutubeUrl"
      :onToggleMic="toggleMic"
      :onToggleCamera="toggleCamera" />
    <UserNameModal v-if=!username :onUsernamePicked=handleUsernamePicked />

    <RoomNotification :type=notificationType />

    <div :class='showMinimizedView
      ? "room-session-container room-session-container__minimized"
      : "room-session-container"'>
      <div v-if=showYoutubeVideoURLInput class='youtube-video-url-container'>
        <input id="youtubeVideoUrl" type="text" placeholder="youtube url"/>
        <button class="btn material-icons shadow-blue-btn" v-on:click="shareYoutubeVideo">share</button>
      </div>
      <div id='user-video-cam-container'
        :class='showMinimizedView
          ? "user-video-cam-container"
          : "user-video-cam-container col-xs-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3"'/>
    </div>
    <div v-if="!showMinimizedView && (youtubeVideoUrl || question)" class="maximize-button-container"><button v-on:click="maximize" class="btn shadow-blue-btn material-icons ">open_in_full</button></div>

    <div class="shared-content-container" v-if="showMinimizedView">
      <div class="shared-content-wallpaper"/>
      <div class="minimize-button-container"><button v-on:click="minimize" class="btn shadow-blue-btn material-icons ">close_fullscreen</button></div>
      <YoutubeVideo v-if="youtubeVideoUrl && !question" :url=youtubeVideoUrl />
      <TriviaGame :question=question :score=score :onAnswer=handleGameAnswer />
    </div>
  </div>
</template>

<script>

import Peer from 'peerjs';

import RoomNotification, { NotificationTypes } from '../components/RoomNotification';
import Navbar from '../components/Navbar';
import YoutubeVideo from '../components/YoutubeVideo';
import TriviaGame from '../components/trivia/TriviaGame';
import UserNameModal from '../components/UserNameModal';
import P2PHost from '../p2p/p2pHost.js';
import P2PJoiner from '../p2p/p2pJoiner.js';

navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

export default {
  name: 'room',
  components: {
    Navbar,
    RoomNotification,
    YoutubeVideo,
    TriviaGame,
    UserNameModal,
  },
  data() {
    return {
      roomId: null,
      localStream: null,
      hostService: null,
      joinerService: null,
      muted: false,
      cameraOn: true,
      showMinimizedView: false,
      userVideoElements: [],
      connectedStreams: new Set(),
      // TODO(TM): Place these things in configuration of fetch the data from the backend server response.
      peerServer: {
        key: 'peerjs',
        host: 'localhost',
        port: 9000,
        path: 'myapp',
      },
      username: null,
      question: null,
      score: null,
      youtubeVideoUrl: null,
      showShareableLinkModal: false,
      showYoutubeVideoURLInput: false,
      notificationType: null,
    };
  },
  methods: {
    getP2PService() {
      return this.joinerService || this.hostService;
    },
    shareRoom() {
      const invitationCode = this.hostService.createTmpInvitationCode();
      const shareableLink = `${window.location.origin}/room/${this.roomId}?code=${invitationCode}`;
      navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
            navigator.clipboard.writeText(shareableLink).then(() => {
              alert("Shareable link copied to cliboard!")
            });
        }
      });
    },
    showShareYoutubeUrl() {
      this.showYoutubeVideoURLInput = !this.showYoutubeVideoURLInput;
    },
    shareYoutubeVideo() {
      const youtubeVideoUrl = document.getElementById('youtubeVideoUrl').value.trim();
      this.getP2PService().sendYoutubeVideo(youtubeVideoUrl);
      this.showYoutubeVideoURLInput = false;
    },
    handleYoutubeVideoUrl(youtubeVideoUrl) {
      this.youtubeVideoUrl = youtubeVideoUrl;
      this.adaptUserVideosDisplay(true);
    },
    handleGameScore(score) {
      this.score = score;
    },
    handleStartGame() {
      setTimeout(() => this.hostService.sendQuestion(), 2000);
    },
    handleNextQuestion(question) {
      if(!this.question) {
        this.adaptUserVideosDisplay(true);
      }
      this.notificationType = null;
      this.score = null;
      this.question = question;
    },
    handleGameInvite() {
      this.notificationType = NotificationTypes.INVITED_FOR_TRIVIA_GAME;
    },
    handleGameAnswer(answer) {
      if(this.isHost()) {
        this.hostService.handleAnswer(answer);
        return;
      }
      this.joinerService.sendAnswer(answer);
    },
    host(username) {
      navigator.getUserMedia({ audio: true, video: true },
        (stream) => {
          this.localStream = stream;

          this.peer = new Peer(this.peerServer);
          this.peer.on('open', (id) => {
            this.roomId = id;
            this.addUserVideoCam(id, stream);
            this.hostService = new P2PHost(
              this.peer,
              username,
              this.handleStartGame,
              this.handleNextQuestion,
              this.handleGameScore,
              this.handleYoutubeVideoUrl);
            this.hostService.start();
            this.peer.on('call', (call) => {
              if(!this.hostService.isAuthorized(call.peer)) {
                // unauthorized connection
                call.close();
                return;
              }
              call.answer(stream);
              call.on('stream', (peerStream) => this.addUserVideoCam(call.peer, peerStream));
              call.on('close', () => this.removeUserVideoCam(call.peer));
            });
          });
        },
        function(err) {
         console.log("The following error occurred: " + err.name);
        }
      );
    },
    play() {
      this.notificationType = NotificationTypes.INVITING_FOR_TRIVIA_GAME;
      this.hostService.inviteToGame();
    },
    addUserVideoCam(peerId, stream) {
      if(!this.userVideoElements[peerId]) {
        const newVideo = document.createElement("video");
        newVideo.srcObject = stream;
        newVideo.muted = stream.id === this.localStream.id;
        newVideo.onloadedmetadata = function() {
          newVideo.play();
        };
        document.getElementById('user-video-cam-container').appendChild(newVideo);
        this.userVideoElements[peerId] = newVideo;
        this.adaptUserVideosDisplay();
      }
    },
    removeUserVideoCam(peerId) {
      this.userVideoElements[peerId].remove();
      delete this.userVideoElements[peerId];
    },
    minimize() {
      this.showMinimizedView = false;
      this.adaptUserVideosDisplay();
    },
    maximize() {
      this.showMinimizedView = true;
      this.adaptUserVideosDisplay(true);
    },
    adaptUserVideosDisplay(forceMinimize=false) {
      const numberOfVideos = Object.keys(this.userVideoElements).length;
      var numberOfRows = 1;
      var minimize = false || forceMinimize;

      if(window.innerHeight > window.innerWidth){
        // portrait
        if(numberOfVideos > 8) {
          minimize = true;
        }
        else if(numberOfVideos > 6) {
          numberOfRows = 4;
        }
        else if(numberOfVideos > 4) {
          numberOfRows = 3;
        }
        else if(numberOfVideos > 1) {
          numberOfRows = 2;
        }
      } else {
        // landscape
        if(numberOfVideos > 20) {
          // put everything with scroll under same row
          minimize = true;
        }
        else if(numberOfVideos > 12) {
          numberOfRows = 4;
        }
        else if(numberOfVideos > 8) {
          numberOfRows = 3;
        }
        else if(numberOfVideos > 2) {
          numberOfRows = 2;
        }
      }

      if(minimize) {
        this.showMinimizedView = true;
        if(minimize) {
          Object.values(this.userVideoElements).forEach((userVideoElement) => {
            userVideoElement.style.width = 'auto';
            userVideoElement.style.maxHeight = '96%';
            userVideoElement.style.height = '96%';
          });
          return;
        }
      } else {
        this.showMinimizedView = false;
      }

      const videosPerRow = Math.ceil(numberOfVideos / numberOfRows);
      const marginXBetweenVideos = 1;
      const marginYBetweenVideos = 2;

      const videoWidthPerc = Math.ceil((100 / videosPerRow) - (marginXBetweenVideos * videosPerRow));
      const videoHeightPerc = Math.min(Math.round((100 / numberOfRows) - (marginYBetweenVideos * numberOfRows)), videoWidthPerc);

      Object.values(this.userVideoElements).forEach((userVideoElement) => {
        userVideoElement.style.width = `${videoWidthPerc}%`;
        userVideoElement.style.maxHeight = `${videoHeightPerc}%`;
        userVideoElement.style.height = 'auto';
      });
    },
    toggleMic() {
      this.muted = !this.muted;
      this.localStream.getTracks().forEach((t) => {
        if (t.kind === 'audio') {
          t.enabled = !this.muted;
        }
      });
    },
    toggleCamera() {
      this.cameraOn = !this.cameraOn;
      this.localStream.getTracks().forEach((t) => {
        if (t.kind === 'video') {
          t.enabled = this.cameraOn;
        }
      });
    },
    isHost() {
      return !!this.hostService;
    },
    handleUsernamePicked(username) {
      const url = new URL(window.location);
      const roomId = url.pathname.substring("/room/".length);
      const invitationCode = url.searchParams.get("code");

      this.username = username;

      if(!roomId) {
        // Host
        this.host(username);
      } else if(invitationCode) {
        this.join(roomId, invitationCode, username);
      }
    },
    join(roomId, invitationCode, username) {
      this.roomId = roomId;
      navigator.getUserMedia({ audio: true, video: true },
        (stream) => {
          this.localStream = stream;
          this.peer = new Peer(this.peerServer);

          this.peer.on('open', (id) => {
            this.addUserVideoCam(id, stream);
            this.joinerService = new P2PJoiner(
              this.peer,
              this.roomId,
              this.localStream,
              this.handleNextQuestion,
              this.handleGameScore,
              this.handleYoutubeVideoUrl,
              this.addUserVideoCam,
              this.removeUserVideoCam,
              this.handleGameInvite);
            this.joinerService.start(invitationCode, username);
          });
        },
        function(err) {
         console.log("The following error occurred: " + err.name);
        }
      );
    },
  },
}
</script>

<style>

.shared-content-container {
  height: 73vh;
  padding: 48px 4px;
  position: relative;
}

.shared-content-wallpaper {
  background-image: url(/img/pattern.png);
  background-size: contain;
  height: 100%;
  left: 0;
  opacity: 0.4;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
}

.room-session-container {
  background-color: #39373a;
  height: calc(100vh - 60px);
  transition: height 1s;
}

.room-session-container__minimized {
  height: 20vh;
}

.user-video-cam-container {
  align-content: center;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  justify-content: center;
  padding: 14px;
}

.room-session-container__minimized .user-video-cam-container {
  flex-wrap: nowrap;
  justify-content: flex-start;
  overflow-x: auto;
}

.user-video-cam-container >video {
  border-radius: 4px;
  margin: 2px;
  transition: width 0.7s, height 0.7s;
}

.youtube-video-url-container {
  align-items: center;
  background-color: #F0F3F5;
  border: 1px solid #F0F3F5;
  border-radius: 2px;
  display: flex;
  overflow: hidden;
  right: 2px;
  padding: 2px 4px;
  position: absolute;
  top: 64px;
  width: calc(100% - 4px);
  z-index: 1;
}

.youtube-video-url-container >input {
  border: 1px solid #63707e;
  flex-grow: 1;
  height: 36px;
  outline: none;
  padding: 8px;
}

.youtube-video-url-container .btn {
  width: 64px;
  margin-left: 2px;
}

.youtube-video-url-container >input:focus {
  border: 1px solid #63707e;
}

.minimize-button-container {
  right: 2px;
  position: absolute;
  top: 4px;
}

.maximize-button-container {
  margin-top: -42px;
  right: 2px;
  position: absolute;
}

</style>
