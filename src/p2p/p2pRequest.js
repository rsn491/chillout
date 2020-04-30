export default class P2PRequest {
  constructor(messageType, jsonData = {}) {
    this.messageType = messageType
    this.jsonData = jsonData
  }

  toJSON() {
    return {
      messageType: this.messageType,
      ...this.jsonData
    };
  }
}
