<template>
  <div class="hello">
    <div v-if=!roomId>
      <button v-on:click="host">host</button>
      Room:<input id="roomid" style="text"/><button v-on:click="join">join</button>
    </div>
    <div class='navbar' v-if=roomId>
      <div class='room-id'>Room: {{roomId}}</div>

      <button class="btn material-icons" v-on:click="shareYoutubeVideo">
        theaters
      </button>
      <input id="youtubeVideoUrl" type="text" placeholder="youtube url"/>
      <button v-on:click="toggleMic">{{muted ? 'unmute': 'mute'}}</button>
      <button v-on:click="play">play</button>
    </div>
    <div :class='showMinimizedView
      ? "room-session-container room-session-container__minimized"
      : "room-session-container"'>
      <div id='user-video-cam-container'
        :class='showMinimizedView
          ? "user-video-cam-container"
          : "user-video-cam-container col-xs-12 col-md-10 offset-md-1 col-lg-8 offset-lg-2"'/>
    </div>
    <div class="container video-container" v-if="youtubeVideoId">
      <iframe id="ytplayer" type="text/html"
        :src="`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&origin=http://example.com`"
        frameborder="0">
      </iframe>
    </div>
    <div class='container game-container' v-if="question">
      <div v-if="!score">
        <div class='question-container'>
          <h4>{{question.question}}</h4>
          <circular-count-down-timer
            :initial-value=20
            :show-minute=false
            :show-hour=false
            :size=60
            second-label=""
            seconds-stroke-color="#297373"
            underneath-stroke-color="#39393a"
            @finish="submitAnswer(-1)"
          ></circular-count-down-timer>
        </div>
        <div class="possible-answer-container">
          <div v-bind:class='getClassForPossibleAnswer(possibleAnswer)'
            v-for="possibleAnswer in question.possibleAnswers" :key="possibleAnswer"
            v-on:click="() => submittedAnswer === null && submitAnswer(possibleAnswer)">
            {{possibleAnswer}}
          </div>
        </div>
      </div>
      <div class="container player-score-container" v-if="score">
        <h3>Leaderboard</h3>
        <div class="player-score" v-for="(peerScore, index) in score" :key="peerScore.peerId">
          <div class="game-badge">
            {{index === 0 ? '🏆' : ''}}
            {{index === 1 ? '🥈' : ''}}
            {{index === 2 ? '🥉' : ''}}
          </div>
          <div class="flex-grow-1">
            {{`${index + 1}. ${peerScore.peerId}`}}
          </div>
          <div>
            {{peerScore.score}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import P2PHost from '../p2p/p2pHost.js'
import P2PJoiner from '../p2p/p2pJoiner.js'

import Peer from 'peerjs';

navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

export default {
  name: 'HelloWorld',
  data() {
    return {
      roomId: null,
      localStream: null,
      hostService: null,
      joinerService: null,
      muted: false,
      showMinimizedView: false,
      userVideoElements: [],
      connectedStreams: new Set(),
      apiBaseEndpoint: 'http://localhost:3000', // ''
      peerServer: {key: 'peerjs', host: 'localhost', port: 9000, path: 'myapp'}, //{key: 'peerjs', host: 'e8be7c9a.ngrok.io', port: 443, path: 'myapp'},
      question: null,
      score: null,
      possibleAnswers: null,
      submittedAnswer: null,
      youtubeVideoId: null,
    };
  },
  methods: {
    getP2PService() {
      return this.joinerService || this.hostService;
    },
    shareYoutubeVideo() {
      const youtubeVideoUrl = document.getElementById('youtubeVideoUrl').value.trim();

      this.getP2PService().sendYoutubeVideo(youtubeVideoUrl);
    },
    handleYoutubeVideoUrl(youtubeVideoUrl) {
      if(!this.youtubeVideoId) {
        this.adaptUserVideosDisplay(true);
      }
      const url = new URL(youtubeVideoUrl);
      const queryParams = new URLSearchParams(url.search);

      this.youtubeVideoId = queryParams.has("v")
        ? queryParams.get("v")
        : url.pathname.substring(1);
    },
    getClassForPossibleAnswer(possibleAnswer) {
      if(this.submittedAnswer == null) {
        return 'possible-answer';
      }
      if(possibleAnswer !== this.submittedAnswer) {
        return 'possible-answer bg-light text-muted'
      }
      return this.submittedAnswer === this.question.correctAnswer
        ? 'possible-answer bg-success text-white'
        : 'possible-answer bg-danger text-white';
    },
    handleGameScore(score) {
      this.score = score;
    },
    submitAnswer(answer) {
      if(this.submittedAnswer != null) {
        // answer is already submitted
        return;
      }

      this.submittedAnswer = answer;
      if(this.joinerService) {
        // joiner
        this.joinerService.sendAnswer(answer);
        return;
      }
      // host
      this.hostService.handleAnswer(answer);
    },
    handleStartGame() {
      this.hostService.sendQuestion();
    },
    handleNextQuestion(question) {
      if(!this.question) {
        this.adaptUserVideosDisplay(true);
      }
      this.score = null;
      this.submittedAnswer = null;
      this.question = question;
    },
    host() {
      navigator.getUserMedia({ audio: true, video: true },
        (stream) => {
          this.localStream = stream;
          this.addVideo(stream);
          const peer = new Peer(this.peerServer);
          peer.on('open', (id) => {
            fetch(`${this.apiBaseEndpoint}/room`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                peerId: id
              })
            }).then(res => {
              res.json().then(json => this.roomId = json.roomId)
            });

            this.hostService = new P2PHost(
              peer,
              this.handleStartGame,
              this.handleNextQuestion,
              this.handleGameScore,
              () => console.log('game ended'),
              this.handleYoutubeVideoUrl);
            this.hostService.start();

            peer.on('call', (call) => {
              call.answer(stream);
              call.on('stream', (peerStream) => this.addVideo(peerStream));
            });
          });
        },
        function(err) {
         console.log("The following error occurred: " + err.name);
        }
      );
    },
    play() {
      this.hostService.inviteToGame();
    },
    addVideo(stream) {
      if(!this.connectedStreams.has(stream.id)) {
        const newVideo = document.createElement("video");
        newVideo.srcObject = stream;
        newVideo.muted = stream.id === this.localStream.id;
        newVideo.onloadedmetadata = function() {
          newVideo.play();
        };
        document.getElementById('user-video-cam-container').appendChild(newVideo);
        this.connectedStreams.add(stream.id);
        this.userVideoElements.push(newVideo);
        this.adaptUserVideosDisplay();
      }
    },
    adaptUserVideosDisplay(forceMinimize=false) {
      const numberOfVideos = this.userVideoElements.length;
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
        else if(numberOfVideos > 2) {
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
          this.userVideoElements.forEach((userVideoElement) => {
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
      const videoHeightPerc = Math.round((100 / numberOfRows) - (marginYBetweenVideos * numberOfRows));

      this.userVideoElements.forEach((userVideoElement) => {
        userVideoElement.style.width = `${videoWidthPerc}%`;
        userVideoElement.style.maxHeight = `${videoHeightPerc}%`;
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
    callPeer(peerId, ownStream) {
      const call = this.peer.call(peerId, ownStream);
      call.on('stream', (peerStream) => this.addVideo(peerStream));
    },
    join() {
      const roomId = document.getElementById('roomid').value.trim();
      navigator.getUserMedia({ audio: true, video: true },
        (stream) => {
          this.localStream = stream;
          this.addVideo(stream);
          this.peer = new Peer(this.peerServer);
          this.peer.on('call', (call) => {
            call.answer(stream);
            call.on('stream', (peerStream) => this.addVideo(peerStream));
          });

          this.peer.on('open', (id) => {
            fetch(`${this.apiBaseEndpoint}/room/${roomId}/join`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                peerId: id
              })
            }).then(res => {
              this.roomId = roomId;
              res.json().then(json => {
                // connect with media stream to all peers
                this.callPeer(json.host, stream);
                json.peers.forEach(remotePeer => this.callPeer(remotePeer, stream));
                this.joinerService = new P2PJoiner(
                  this.peer,
                  json.host,
                  this.handleNextQuestion,
                  this.handleGameScore,
                  () => console.log('game ended'),
                  this.handleYoutubeVideoUrl);
                this.joinerService.start();
              });
            });
          });
        },
        function(err) {
         console.log("The following error occurred: " + err.name);
        }
      );
    }
  },
  props: {
    msg: String
  }
}
</script>

<style>

.game-container {
  background-color: #fefefe;
  border: 1px solid #39393a;
  border-radius: 4px;
  padding: 12px;
  border-radius: 2px;
  margin-top: 24px;
}

.player-score-container h3{
  margin-bottom: 16px;
  margin-top: 8px;
}

.player-score {
  display: flex;
  padding: 8px 0;
}

.player-score .game-badge {
  width: 24px;
}

.navbar {
  background-color: #297373;
  color: #fffffa;
  display: flex;
  align-content: center;
  padding: 8px;
  height: 60px;
}

.room-id {
  flex-grow: 1;
}

.room-session-container {
  background-color: #39393a;
  height: calc(100vh - 60px);
  transition: height 1s;
}

.room-session-container__minimized {
  height: 140px;
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
  margin: 1% 1%;
  transition: width 0.7s, height 0.7s;
}

.question-container {
  display: flex;
  padding: 16px;
}

.question-container h4 {
  flex-grow: 1;
}

.question-container div {
  text-align: center;
}

.possible-answer {
  border: 1px solid #297373;
  border-radius: 4px;
  cursor: pointer;
  padding: 8px;
  text-align: center;
  margin: 8px 16px;
}

.possible-answer:hover {
  background-color: #e9d758;
  opacity: 0.5;
}

.video-container {
  height: 60vh;
  display: flex;
}

.video-container iframe {
  height: auto;
  padding-top: 16px;
  width: 100%;
}

</style>
