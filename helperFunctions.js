module.exports.checkWhoScored = (score, id, players) => {
  let indexOfPlayerWhoWon = ""
  let updatedScore = 0
  players.forEach((player, i) => {
      Object.keys(player).forEach(playerVars => {
        if(player[playerVars] === id){
          indexOfPlayerWhoWon= i;
          updatedScore= score
        }
      })
  })

  return {indexOfPlayerWhoWon, updatedScore}
}
