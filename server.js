const express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')

const {RoomRepo} = require('./backend/infrastructure/roomRepo.js')

const app = express()
const port = 3000

const roomRepo = new RoomRepo();

var jsonParser = bodyParser.json()

app.use(cors())

app.post('/api/room', jsonParser, function (req, res) {
  const peerId = req.body.peerId;

  const roomId = roomRepo.createRoom(peerId);

  res.json({ roomId });
});

app.post('/api/room/:roomId/join', jsonParser, function (req, res) {
  const peerId = req.body.peerId;
  const roomId = req.params.roomId;

  const room = roomRepo.addPeer(roomId, peerId);

  res.json(room);
});

app.use('/', express.static('dist'))

app.use('*', express.static('dist/index.html'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
