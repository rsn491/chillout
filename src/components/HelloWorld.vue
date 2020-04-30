<template>
  <div class="hello">
    <div v-if=!roomId>
      <button v-on:click="host">host</button>
      Room:<input id="roomid" style="text"/><button v-on:click="join">join</button>
    </div>
    <div class='navbar' v-if=roomId>
      <div class='room-id'>Room: {{roomId}}</div>
      <button v-on:click="toggleMic">{{muted ? 'unmute': 'mute'}}</button>
      <button v-on:click="play">play</button>
    </div>
    <div id='video-row' class='video-row'/>
    <div class='container game-container' v-if="question">
      <div v-if="!score">
        <div class='question-container'>
          <h4>{{question.question}}</h4>
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
        <div class="player-score" v-for="(peerScore, index) in score" :key="peerScore">
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
      connectedStreams: new Set(),
      apiBaseEndpoint: 'http://localhost:3000', // ''
      peerServer: {key: 'peerjs', host: 'localhost', port: 9000, path: 'myapp'}, //{key: 'peerjs', host: 'e8be7c9a.ngrok.io', port: 443, path: 'myapp'},
      question: null,
      score: null,
      possibleAnswers: null,
      submittedAnswer: null,
    };
  },
  methods: {
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
      this.submittedAnswer = answer;
      setTimeout(() => {
        if(this.joinerService) {
          // joiner
          this.joinerService.sendAnswer(answer);
          return;
        }
        // host
        this.hostService.handleAnswer(answer);
      }, 5000);
    },
    handleStartGame() {
      this.hostService.sendQuestion();
    },
    handleNextQuestion(question) {
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
              () => console.log('game ended'));
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
        document.getElementById('video-row').appendChild(newVideo);
        this.connectedStreams.add(stream.id);
      }
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
                  () => console.log('game ended'));
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
  padding: 8px;
}

.room-id {
  flex-grow: 1;
}

.video-row {
  display: flex;
  overflow: auto;
  background-color: #39393a;
  height: 140px;
  padding: 14px;
}

.video-row >video {
  border-radius: 4px;
  height: 100%;
  margin: 0 8px;
}

.question-container {
  padding: 16px;
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

</style>
