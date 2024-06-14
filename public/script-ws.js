let ws = new WebSocket("ws://localhost:8000")

let clientId = null
let gameId = null

let gameBoard = [
    '', '', '',
    '', '', '',
    '', '', ''
]

let gameActive = true


let currentPlayer = null
let lastMove = null

const winConditions = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Left-to-right diagonal
  [2, 4, 6]  // Right-to-left diagonal
]

const cells = document.querySelectorAll(".cell")
const btnJoin = document.getElementById("btnJoin")
const divGameMessage = document.getElementById("gameMessage")

console.log('cells ->', cells.length)

btnJoin.addEventListener("click", e=> {

    const payLoad = {
        "method": "join",
        "clientId": clientId
    }

    console.log(JSON.stringify(payLoad))

    ws.send(JSON.stringify(payLoad))
    
})

cells.forEach(cell => {
    cell.addEventListener('click', cellClicked, false)
})

function cellClicked(evt){

    const clickedCell = evt.target

    const clickedCellIndex = parseInt(clickedCell.id.replace('cell-', '')) - 1

    console.log('clickedCellIndex > ' , clickedCellIndex)

    if (gameBoard[clickedCellIndex] !== '' || !gameActive || lastMove === currentPlayer){
        return
    }

    handlePlayerTurn(clickedCellIndex)
}

function handlePlayerTurn(clickedCellIndex){
    gameBoard[clickedCellIndex] = currentPlayer
    console.log(`gameBoard[${clickedCellIndex}] ->`,gameBoard[clickedCellIndex])
    
    lastMove = currentPlayer

    const payLoad = {
        "method": "play",
        "gameId": gameId, 
        "gameBoard": gameBoard ,
        "lastMove": lastMove

    }

    console.log(`play -> ${ JSON.stringify(payLoad) }`)
    ws.send(JSON.stringify(payLoad))
}

function updateUI(){
    for (let i=0; i < cells.length; i++){
        cells[i].innerText = gameBoard[i]

        if (gameBoard[i] === 'X') cells[i].style.color = "Red"
        if (gameBoard[i] === 'O') cells[i].style.color = "Blue"
    }
}

function checkForWinOrDraw(){
    
    let roundWon = false

    for (let i=0; i < winConditions.length; i++){
        const [a, b, c] = winConditions[i]

        if (gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]
        ){
            roundWon = true
            break
        }
    }

    if (roundWon){
        announceWinner(lastMove)
        gameActive = false
        return
    }

    let roundDraw = !gameBoard.includes('')
    if (roundDraw){
        announceDraw()
        gameActive = false
        return
    }
}

function announceWinner(player){
    const messageElement = document.getElementById('gameMessage')
    messageElement.innerHTML = `Player ${player} Wins!`
}

function announceDraw(){
    const messageElement = document.getElementById('gameMessage')
    messageElement.innerHTML = 'Game Draw!'
}

ws.onopen = function(e){
    console.log('ws open!')
}

ws.onmessage = message => {

  const res = JSON.parse(message.data)

  if (res.method == "connect"){
      clientId = res.clientId
      console.log("Client id set sucessfully " + clientId)
  }

  if (res.method == "join"){
      console.log(`res.game -> ${ JSON.stringify(res.game) }`)

      if (gameId == null)  gameId = res.game.id 

      // currentPlayer = res.game.clients[clientId]
      
      res.game.clients.forEach(c => {
          if (c.clientId === clientId)
             if (currentPlayer == null) 
                  if (c.color === "Red") currentPlayer = 'X'
                  if (c.color === "Blue") currentPlayer = 'O'
      })
  }

  if (res.method == "update"){

      if (gameId === res.game.id) {
          console.log(`res.game -> ${ JSON.stringify(res.game) }`)

          gameBoard = res.game.gameBoard
          lastMove = res.game.lastMove

          updateUI()

          if ( !btnJoin.diabled ) {
              btnJoin.disabled = true
              divGameMessage.innerText = 'Game start!'
          }

          if (lastMove === currentPlayer) divGameMessage.innerText = "Waiting your opponent move..."
          if (lastMove !== currentPlayer) divGameMessage.innerText = "Waiting you move..."
          checkForWinOrDraw()
      }
  }


}


