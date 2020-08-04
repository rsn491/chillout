<template>
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
              seconds-stroke-color="#748CAB"
              underneath-stroke-color="#1D2D44"
              @finish="submitAnswer(question.question, -1)"
            ></circular-count-down-timer>
          </div>
          <div class="possible-answer-container">
            <div v-bind:class='getClassForPossibleAnswer(question.question, possibleAnswer)'
              v-for="possibleAnswer in question.possibleAnswers" :key="possibleAnswer"
              v-on:click="() => submitAnswer(question.question, possibleAnswer)">
              {{possibleAnswer}}
            </div>
          </div>
        </div>
        <div class="container player-score-container" v-if="score && !score.isGameFinished">
          <h3>Leaderboard</h3>
          <div class="player-score" v-for="(peerScore, index) in score.scores" :key="peerScore.peerId">
            <div class="game-badge">
              {{index === 0 ? '🏆' : ''}}
              {{index === 1 ? '🥈' : ''}}
              {{index === 2 ? '🥉' : ''}}
            </div>
            <div class="flex-grow-1">
              {{`${index + 1}. ${peerScore.username}`}}
            </div>
            <div>
              {{peerScore.score}}
            </div>
          </div>
        </div>
        <Podium  v-if="score && score.isGameFinished" :score=score />
    </div>
</template>

<script>

import Podium from './Podium';

export default {
  name: 'TriviaGame',
  components: {
    Podium,
  },
  props: {
    question: Object,
    score: Object,
    onAnswer: Function,
  },
  data() {
    return {
      submittedAnswer: null,
    };
  },
  watch: {
    question: function() {
      this.submittedAnswer = null;
    },
  },
  methods: {
    getClassForPossibleAnswer(question, possibleAnswer) {
      if(!this.submittedAnswer) {
        return 'possible-answer';
      }
      if(possibleAnswer !== this.submittedAnswer) {
        return 'possible-answer bg-light text-muted'
      }
      return this.submittedAnswer === this.$props.question.correctAnswer
        ? 'possible-answer bg-success text-white'
        : 'possible-answer bg-danger text-white';
    },
    submitAnswer(question, answer) {
      if(this.submittedAnswer) {
        // answer is already submitted
        return;
      }
      this.submittedAnswer = answer;
      this.$props.onAnswer(answer);
    },
  },
  beforeUpdate() {

  }
};

</script>

<style scoped>

.game-container {
  background-color: white;
  border: 2px solid #748CAB;
  border-radius: 4px;
  padding: 12px;
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

.possible-answer {
  border: 1px solid #1D2D44;
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
