<template>
<div class="leaderboard-container">
  <canvas id="leaderboard-canvas"/>
  <div class="congratulations" v-if=show1stPlaceTrophy>
    <h4>Congratulations</h4>
    <h3>{{playerScores[0].username}}</h3>
  </div>
  <div class="container player-score-container">
    <h3 v-if=!isGameFinished>Leaderboard</h3>
    <div class="player-score" v-for="(playerScore, index) in playerScores" :key="playerScore.peerId">
      <div class="game-badge">
        <span v-if="show1stPlaceTrophy && index === 0">🏆</span>
        <span v-if="show2ndPlaceTrophy && index === 1 ">🥈</span>
        <span v-if="show3rdPlaceTrophy && index === 2">🥉</span>
      </div>
      <div class="flex-grow-1">
        {{`${index + 1}. ${playerScore.username}`}}
      </div>
      <div>
        {{playerScore.score}}
      </div>
    </div>
  </div>
</div>
</template>

<script>

import confetti from 'canvas-confetti';

export default {
    name: 'Leaderboard',
    props: {
      playerScores: Array,
      isGameFinished: Boolean,
      onPodiumAnimationFinished: Function,
    },
    data() {
      return {
        canvasElement: null,
        show3rdPlaceTrophy: false,
        show2ndPlaceTrophy: false,
        show1stPlaceTrophy: false,
      };
    },
    methods: {
      throwSideConfetti() {
        const end = Date.now() + (20 * 1000);
        const colors = ['#3E5C76', '#ffffff'];

        (function frame() {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    },
    mounted() {
        if(this.$props.isGameFinished) {
          this.canvasElement = document.getElementById("leaderboard-canvas");
          this.canvasElement.confetti = this.canvasElement.confetti || confetti.create(this.canvasElement, { resize: true });
          setTimeout(() => this.show3rdPlaceTrophy = true, 1000);
          setTimeout(() => this.show2ndPlaceTrophy = true, 2000);
          setTimeout(() => this.show1stPlaceTrophy = true, 4000);
          setTimeout(this.throwSideConfetti, 4000);
          setTimeout(this.$props.onPodiumAnimationFinished, 6000);
        }
    }
};

</script>

<style scoped>

  canvas {
    height: 0;
  }

  .congratulations {
    text-align: center;
  }

  .congratulations >h4 {
    color: #39373a;
  }

  .player-score {
    display: flex;
    padding: 8px 0;
  }

  .player-score .game-badge {
    width: 24px;
  }

  .leaderboard-container h3 {
    color: #3E5C76 ;
    margin-bottom: 48px;
    text-align: center;
  }

</style>
