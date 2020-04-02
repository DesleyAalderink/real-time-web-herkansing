const socket = io();

const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
const timerElement = document.getElementById('timer')
const container = document.getElementById('container')
const userName = document.getElementById('username')
const popup = document.getElementById('popup')

const startButton = document.getElementById("startButton")
let id = ""
let inGame = false
let score = 0
let currentQuote = ""
let clear
const intervalFunction = () => {
  timer.innerText = getTimerTime(startTime)
}

let roundNumber = 0;
let serverRoundNumber = 1

socket.on("roundUpdate", (roundNum) => {
  serverRoundNumber = roundNum
})

socket.on("status", (SocketID, progress) => {
  id = SocketID
  if (progress == true) {
    timerElement.classList.remove("none")
    timerElement.innerHTML = "there is already a round in progress. Please wait a few seconds/minutes"
    popup.classList.add("none")
    console.log("lobby is full");
  } else {
    popup.classList.remove("none")
  }
})

startButton.addEventListener("click", () => {
  const {value} = userName
  socket.emit("initiate game", value)
  startButton.classList.add("none")
  userName.classList.add("none")
  timerElement.classList.remove("none")
  timerElement.innerHTML = "waiting for other players..."
})

socket.on("startGame", (quote) => {
  container.classList.remove("none")
  console.log("De game is begonnen");
  inGame = true
  roundNumber++

  game(quote)
})

function getTimerTime(startTime) {
  return Math.floor((new Date() - startTime) / 1000)
}

function startTimer() {
  timerElement.innerText = 0
  startTime = new Date()
  clear = setInterval(intervalFunction, 1000)
}

socket.on("roundOver", ((winner, players, time) => {
  quoteInputElement.classList.add("none")
  quoteDisplay.innerHTML = `${winner} won this round in ${time} seconds, next Round will be starting soon`
    clearInterval(clear);
}))

socket.on("gameOver", ((winner) => {
  quoteInputElement.classList.add("none")
  clearInterval(clear);
  quoteDisplay.innerHTML = `${winner} wins the game!`
  roundNumber = 0;
  serverRoundNumber = 1;
  score = 0;
  id = "";
  inGame = false;
  currentQuote = "";

  setTimeout(() => {
    startButton.classList.remove("none")
    userName.classList.remove("none")
    timerElement.classList.add("none")
    container.classList.add("none")
    popup.classList.remove("none")
    timerElement.innerText = "waiting for other players..."
  }, 3000)
}))

const quoteCorrectFalse = () => {
  quoteInputElement.addEventListener('input', () => {
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayQuoteCorrect = quoteDisplayElement.querySelectorAll('.correct')
    const arrayValue = quoteInputElement.value.split('')

    let correct = false
    arrayQuote.forEach((characterSpan, index) => {
      const character = arrayValue[index]

      if (character == null) {
        characterSpan.classList.remove('correct')
        characterSpan.classList.remove('incorrect')
      } else if (character === characterSpan.innerText) {
        characterSpan.classList.add('correct')
        characterSpan.classList.remove('incorrect')
        console.log(arrayQuote.length);
        console.log(arrayQuoteCorrect.length);
        if (arrayQuote.length === arrayQuoteCorrect.length) {
          correct = true;
        }

      } else {
        characterSpan.classList.remove('correct')
        characterSpan.classList.add('incorrect')
      }
    })

    if (correct && roundNumber === serverRoundNumber) {
      correct = false
      score++
      console.log("Dit is de " + score);
      endTime = startTime
      socket.emit("score", score, getTimerTime(endTime))
      return
    } else {
      return
    }
  })
}

quoteCorrectFalse()

function game(quote) {
  if (inGame) {
    quoteInputElement.classList.remove("none")
      let startTime = 0;
      let endTime = 0;
      quoteDisplayElement.innerHTML = ''
      quote.split('').forEach(character => {
        const characterSpan = document.createElement('span')
        characterSpan.innerText = character
        quoteDisplayElement.appendChild(characterSpan)

      })
      quoteInputElement.value = null

    startTimer()
  } else {
    return
  }
}
