export default class GameScore {

    constructor(scores, isGameFinished) {
        this.scores = scores.sort((a,b) => b.score - a.score);
        this.isGameFinished =isGameFinished;
    }

}
