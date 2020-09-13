import GameScore from './gameScore';

export default class GameSession {

  constructor(users, questions) {
    this.users = users;
    this.peerIds = users.map(user => user.getPeerId());
    this.questions = questions;
    this.confirmedPeerIds = new Set();
    this.currentQuestionId = -1;
    this.peersIdsAnswers = new Set();
    this.score = {};
  }

  addAnswer(peerId, answer) {
    if(answer === this.getCurrentQuestion().correctAnswer) {
      this.score[peerId]++;
    }
    this.peersIdsAnswers.add(peerId);
  }

  confirmPlayer(peerId) {
    this.score[peerId] = 0;
    this.confirmedPeerIds.add(peerId);
  }

  getScoreBoard() {
    const scores = Object.keys(this.score)
      .map(peerId => {
        return {
          peerId,
          username: this.users.find(user => user.getPeerId() === peerId).username,
          score: this.score[peerId]
        };
      });
    return new GameScore(scores, !this.hasNextQuestion());
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
      possibleAnswers: [nextQuestion.correctAnswer, ...nextQuestion.incorrectAnswers]
        .map((a) => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value),
      correctAnswer: nextQuestion.correctAnswer
    };
  }

  isReadyToStart() {
    return this.confirmedPeerIds.size === this.peerIds.length;
  }
}
