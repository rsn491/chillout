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
        <Leaderboard v-if=score :playerScores=score.scores :isGameFinished=score.isGameFinished :onPodiumAnimationFinished=onGameFinished />
    </div>
</template>

<script>

import Leaderboard from './Leaderboard';

export default {
  name: 'TriviaGame',
  components: {
    Leaderboard,
  },
  props: {
    question: Object,
    score: Object,
    onAnswer: Function,
    onGameFinished: Function,
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
