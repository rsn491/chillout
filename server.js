const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {TriviaRepo} = require('./src/server/triviaRepo.js');

const app = express();
const port = process.env.PORT || 3000;
const jsonParser = bodyParser.json();

const triviaRepo = new TriviaRepo();

app.use(cors());

app.get('/api/trivia', jsonParser, async function (req, res) {
  const numberOfQuestions = req.query.numberOfQuestions;

  const triviaQuestions = await triviaRepo.getTriviaQuestions(numberOfQuestions);
  res.json(triviaQuestions);
});

app.use('/', express.static('dist'))
app.use('*', express.static('dist/index.html'))

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
