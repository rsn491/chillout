const express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

const {RoomRepo} = require('./backend/infrastructure/roomRepo.js');
const {TriviaRepo} = require('./backend/infrastructure/triviaRepo.js');

const app = express();
const port = 3000;
const jsonParser = bodyParser.json();

const roomRepo = new RoomRepo();
const trivaRepo = new TriviaRepo();

app.use(cors());

app.get('/api/trivia', jsonParser, async function (req, res) {
  const numberOfQuestions = req.query.numberOfQuestions;

  const triviaQuestions = await trivaRepo.getTriviaQuestions(numberOfQuestions);

  res.json(triviaQuestions);
});

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
