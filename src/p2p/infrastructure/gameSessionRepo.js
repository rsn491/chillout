import GameSession from "../domain/gameSession";
import getAPIUrl from "../../shared/getAPIUrl";

export default class GameSessionRepo {

  constructor() {
    this.gameSession = null;
  }

  getSession() {
    return this.gameSession;
  }

  async createNewSessionAsync(peerIds, numberOfQuestions) {
    const response = await fetch(getAPIUrl(`trivia?numberOfQuestions=${numberOfQuestions}`));
    const questions = await response.json()

    this.gameSession = new GameSession(peerIds, questions);
    return this.gameSession;
  }
}
