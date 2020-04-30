export default class GameSession {

  constructor(peerIds, questions) {
    this.peerIds = peerIds;
    this.questions = questions;
    this.confirmedPeerIds = new Set();
    this.currentQuestionId = -1;
    this.peersIdsAnswers = new Set();
    this.score = {};
  }

  addAnswer(peerId, answer) {
    if(answer === this.getCurrentQuestion().correct_answer) {
      this.score[peerId]++;
    }
    this.peersIdsAnswers.add(peerId);
  }

  confirmPlayer(peerId) {
    this.score[peerId] = 0;
    this.confirmedPeerIds.add(peerId);
  }

  getScoreBoard() {
    return Object.keys(this.score)
      .map(peerId => {
        return { peerId,  score: this.score[peerId]};
      })
      .sort((a,b) => b.score - a.score);
  }

  hasEveryoneAnswered() {
    return this.peersIdsAnswers.size === this.peerIds.length;
  }

  hasNextQuestion() {
    return this.currentQuestionId < this.questions.length - 1;
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionId];
  }

  getNextQuestion() {
    this.currentQuestionId++;
    this.peersIdsAnswers = new Set();
    const nextQuestion = this.getCurrentQuestion();

    return {
      question: `${this.currentQuestionId + 1}. ${nextQuestion.question}`,
      possibleAnswers: [nextQuestion.correct_answer, ...nextQuestion.incorrect_answers]
        .map((a) => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value),
      correctAnswer: nextQuestion.correct_answer
    };
  }

  isReadyToStart() {
    return this.confirmedPeerIds.length === this.peerIds.size;
  }
}
