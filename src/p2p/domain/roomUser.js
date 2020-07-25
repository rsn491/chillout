export default class RoomUser {

    constructor(username, peerConnection) {
        this.username = username;
        this.peerConnection = peerConnection;
    }

    getPeerId() {
        return this.peerConnection.id || this.peerConnection.peer;
    }
    
}