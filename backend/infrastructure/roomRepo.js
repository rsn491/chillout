const uuidv4 = require('uuid/v4')

class RoomRepo {

  constructor() {
    this.rooms = {};
  }

  createRoom(peerId) {
    const roomId = uuidv4();
    this.rooms[roomId] = { host: peerId, peers: []};
    return roomId;
  }

  addPeer(roomId, peerId) {
    const room = {...this.rooms[roomId]};
    this.rooms[roomId].peers.push(peerId);
    return room;
  }
}

exports.RoomRepo = RoomRepo;
