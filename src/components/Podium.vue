<template>
<div class="podium-container">
  <canvas id="podium-canvas"/>
  <h3 v-if="showUserNames">Congratulations<br>{{firstPlaceUserName}}!</h3>
  <div class="podium-row">
    <div :class="startPodiumAnimation ? 
      'podium-row-col podium-row-col__silver' :
      'podium-row-col podium-row-col__silver podium-row-col__silver--minimized'">
      <div>{{secondPlaceScore}}</div>
      <p v-if="showUserNames">{{secondPlaceUserName}}</p>
    </div>
    <div :class="startPodiumAnimation ? 
      'podium-row-col podium-row-col__gold' :
      'podium-row-col podium-row-col__gold podium-row-col__gold--minimized'">
      <div>{{firstPlaceScore}}</div>
      <p v-if="showUserNames">{{firstPlaceUserName}}</p>
    </div>
    <div v-if="thirdPlaceUserName" :class="startPodiumAnimation ? 
      'podium-row-col podium-row-col__bronze' :
      'podium-row-col podium-row-col__bronze podium-row-col__bronze--minimized'">
      <div>{{thirdPlaceScore}}</div>
      <p v-if="showUserNames">{{thirdPlaceUserName}}</p>
    </div>
  </div>
</div>
</template>

<script>

import confetti from 'canvas-confetti';
import GameScore from '../p2p/domain/gameScore';

export default {
    name: 'Podium',
    props: {
      score: GameScore,
    },
    data() {
      return {
        canvasElement: null,
        startPodiumAnimation: false,
        showUserNames: false,
        firstPlaceUserName: this.$props.score.getFirstPlaceUserName(),
        firstPlaceScore: this.$props.score.getFirstPlaceScore(),
        secondPlaceUserName: this.$props.score.getSecondPlaceUserName(),
        secondPlaceScore: this.$props.score.getSecondPlaceScore(),
        thirdPlaceUserName: this.$props.score.getThirdPlaceUserName(),
        thirdPlaceScore: this.$props.score.getThirdPlaceScore(),
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
      this.canvasElement = document.getElementById("podium-canvas");
      this.canvasElement.confetti = this.canvasElement.confetti || confetti.create(this.canvasElement, { resize: true });

      setTimeout(() => this.startPodiumAnimation = true, 2000);
      setTimeout(() => this.showUserNames = true, 5000)
      setTimeout(this.throwSideConfetti, 6000);
    },
};

</script>

<style scoped>

  .podium-container {
    padding: 8px 16px;
  }

  canvas {
    height: 0;
  }

  .podium-container h3 {
    color: #3E5C76 ;
    margin-bottom: 48px;
    text-align: center;
  }

  .podium-row {
    align-items: flex-end;
    display: flex;
    min-height: 160px;
    justify-content: center;
  }

  .podium-row-col {
    align-items: center;
    display: flex;
    flex-direction: column;
    margin: 8px;
    overflow: hidden;
    width: 120px;
  }

  .podium-row-col >div {
    align-items: center;
    color: #3E5C76;
    display: flex;
    justify-content: center;
    width: 120px; 
  }

  .podium-row-col__silver >div {
    transition: height 1.5s;
    background-image: linear-gradient(to bottom right, silver, #EFF7FF);
    height: 60px;
  }

  .podium-row-col__silver--minimized >div {
    height: 0;
  }

  .podium-row-col__gold >div {
    transition: height 3s;
    background-image:  linear-gradient(to bottom right, gold, #F2D398);
    height: 120px;
  }

  .podium-row-col__gold--minimized >div {
    height: 0;
  }

  .podium-row-col__bronze >div {
    transition: height 0.7s;
    background-image: linear-gradient(to bottom right, brown, #F4A261);
    height: 40px;
  }

  .podium-row-col__bronze--minimized >div {
    height: 0;
  }

</style>