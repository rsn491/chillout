import GameSession from "../domain/gameSession";
import {questions} from "./gameSessionExample.js";

export default class GameSessionRepo {

  constructor() {
    this.gameSession = null;
  }

  getSession() {
    return this.gameSession;
  }

  createNewSession(peerIds) {
    this.gameSession = new GameSession(peerIds, questions);
    return this.gameSession;
  }
}
