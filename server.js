const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {RoomRepo} = require('./src/server/roomRepo.js');
const {TriviaRepo} = require('./src/server/triviaRepo.js');

const app = express();
const port = 3000;
const jsonParser = bodyParser.json();

const roomRepo = new RoomRepo();
const triviaRepo = new TriviaRepo();

app.use(cors());

app.get('/api/trivia', jsonParser, async function (req, res) {
  const numberOfQuestions = req.query.numberOfQuestions;

  const triviaQuestions = await triviaRepo.getTriviaQuestions(numberOfQuestions);
  res.json(triviaQuestions);
});

app.post('/api/room', jsonParser, function (req, res) {
  const peerId = req.body.peerId;

  const roomId = roomRepo.create(peerId);
  res.json({ roomId });
});

app.post('/api/room/:roomId/join', jsonParser, function (req, res) {
  const roomId = req.params.roomId;

  res.json(roomRepo.get(roomId));
});

app.use('/', express.static('dist'))
app.use('*', express.static('dist/index.html'))

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
