const uuidv4 = require('uuid/v4')

class RoomRepo {

  constructor() {
    this.rooms = {};
  }

  create(peerId) {
    const roomId = uuidv4();
    this.rooms[roomId] = { host: peerId };
    return roomId;
  }

  get(roomId) {
    return this.rooms[roomId];
  }
}

exports.RoomRepo = RoomRepo;
