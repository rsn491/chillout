const fetch = require('node-fetch');
const Entities = require('html-entities').AllHtmlEntities;

class TriviaRepo {

    constructor() {
        this.entities = new Entities();
    }

    async getTriviaQuestions(numberOfQuestions) {
        const response = await fetch('https://opentdb.com/api.php?amount=' + numberOfQuestions);
        const data = await response.json();

        return data.results.map(question => {
            return {
                question: this.entities.decode(question.question),
                correctAnswer: this.entities.decode(question.correct_answer),
                incorrectAnswers: question.incorrect_answers.map(incorrectAnswer => this.entities.decode(incorrectAnswer))
            };
        });
    }     

}

exports.TriviaRepo = TriviaRepo;
