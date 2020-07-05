export default class GameScore {

    constructor(scores, isGameFinished) {
        this.scores = scores.sort((a,b) => b.score - a.score);
        this.isGameFinished =isGameFinished;
    }

    getFirstPlaceScore() {
        return this.scores[0] && this.scores[0].score;
    }

    getFirstPlaceUserName() {
        return this.scores[0] && this.scores[0].peerId;
    }

    getSecondPlaceScore() {
        return this.scores[1] && this.scores[1].score;
    }

    getSecondPlaceUserName() {
        return this.scores[1] && this.scores[1].peerId;
    }

    getThirdPlaceScore() {
        return this.scores[2] && this.scores[2].score;
    }

    getThirdPlaceUserName() {
        return this.scores[2] && this.scores[2].peerId;
    }

}