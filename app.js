const PORT = process.env.port || 3400
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const app = express()
const io = require('socket.io')(app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
}))

const Twit = require('twit')

const T = new Twit({
  consumer_key:         '8fLUpQLvymdpXwSdU8E0ICALf',
  consumer_secret:      'Y6HM1hqn2hGgHI8O7wiePpgN9SEuRBC4iinaoset6P8huF6l4M',
  access_token:         '1215291257880268801-n8tRxAYoZLPSQrqpMjp3mu4ywp6W71',
  access_token_secret:  'IXdtiNrz79lMaIlG6d39VstjOLcAfe2vgoyTj8NXHgKr0'
})

const fetch = require("node-fetch")

const {checkWhoScored} = require("./helperFunctions")

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get("/", (req, res) => {
  res.render("index")
})

app.get('/', (req, res) => {
  res.sendFile('/index.html');
});

io.on('connection', socket => {
});

let connectCounter = 0;

var game = {
  inProgress: false,
  players: [],
  round: 1,
  playersNeededToStart: 2,
  currentQuote: "",
  roundLimit: 5,
}

function reset() {
  console.log("reset");
  game.inProgress = false;
  game.players = [];
  game.round = 1;
  game.playersNeededToStart = 2;
  game.currentQuote = "";
  game.roundLimit = 5;
}

io.on('connection', (socket) => {
  if (game.players.length == 2) {
    game.inProgress = true;
    console.log("lobby is nu vol");
  }
  socket.emit("status", socket.id, game.inProgress, game.playerAmount)
  connectCounter++;

  const generateNewQuote = () => {
    console.log("ik wordt aangeroepen" + `${socket.id}` );
    T.get('search/tweets', { q: 'corona exclude:retweets', count: 4,  tweet_mode: 'extended', lang: 'en'})
    .then(data => {
        console.log(data.data.statuses[0].full_text);
        game.currentQuote = data.data.statuses[0].full_text
        console.log(game.currentQuote)

      if (game.players.length === game.playersNeededToStart) {
        console.log("De game kan beginnen");
        setTimeout(() => {
          io.emit("startGame", game.currentQuote)
        }, 300)
      } else {
        console.log(game.players.length);
        console.log(game.playersNeededToStart);
        console.log("niet genoeg mensen");
      }
    })
    return
  }

  const updateRound = () => {
      game.round++
      console.log("gameround", game.round);
      io.emit("roundUpdate", game.round)
  }

  socket.on("initiate game", username => {
    console.log("initiate Game");

    generateNewQuote()

    const {playersNeededToStart, players} = game;

    game.players.push({username: username ? username : socket.id, id: socket.id, score: 0, time: [] })

  })


  socket.on("score", (score, time) => {
    console.log("-----------------------------------------------------------")
    const {indexOfPlayerWhoWon, updatedScore} = checkWhoScored(score, socket.id, game.players)
    if ( `${game.players[indexOfPlayerWhoWon].score}`  == 2) {
      io.emit("gameOver", game.players[indexOfPlayerWhoWon].username, game.players, game.players[indexOfPlayerWhoWon].score, game.players[indexOfPlayerWhoWon].time)
      console.log("game over");
        reset()
    } else {
      console.log("game is still going");
      updateRound()

      console.log(score);

      game.players[indexOfPlayerWhoWon].score = score
      game.players[indexOfPlayerWhoWon].time = time

      console.log(`${game.players[indexOfPlayerWhoWon].username} heeft nu ${game.players[indexOfPlayerWhoWon].score} punten in ${game.players[indexOfPlayerWhoWon].time} secondes`)

      io.emit("roundOver", game.players[indexOfPlayerWhoWon].username, game.players, game.players[indexOfPlayerWhoWon].time)

      setTimeout(() => {
        generateNewQuote()
      }, 3000)
    }
  })

  socket.on("disconnect", () => {
    connectCounter--;
    if (connectCounter === 0 ) {
      reset()
    }
  })
})
