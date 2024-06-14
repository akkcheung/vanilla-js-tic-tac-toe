let currentPlayer = 'X'

let gameBoard = [
    '', '', '',
    '', '', '',
    '', '', '']; // 3x3 game board

let gameActive = true;

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

console.log('cells ->', cells.length)

cells.forEach(cell => {
    cell.addEventListener('click', cellClicked, false)
})

const resetButton = document.getElementById('resetButton')

resetButton.addEventListener('click', resetGame, false)


function cellClicked(evt){

    const clickedCell = evt.target

    const clickedCellIndex = parseInt(clickedCell.id.replace('cell-', '')) - 1

    console.log('clickedCellIndex > ' , clickedCellIndex)

    if (gameBoard[clickedCellIndex] !== '' || !gameActive){
        return
    }

    handlePlayerTurn(clickedCellIndex)
    updateUI()
}

function handlePlayerTurn(clickedCellIndex){
    gameBoard[clickedCellIndex] = currentPlayer
    console.log(`gameBoard[${clickedCellIndex}] ->`,gameBoard[clickedCellIndex])

    checkForWinOrDraw()

    currentPlayer = currentPlayer === 'X' ? 'O': 'X'
}

function updateUI(){
    for (let i=0; i < cells.length; i++){
        cells[i].innerText = gameBoard[i]
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
        announceWinner(currentPlayer)
        gameActive = false
        return
    }

    let roundDraw = !gameBoard.includes('')
    if (roundDraw){
        // announceDraw()
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

function resetGame(){
    gameBoard = [
        '', '', '', 
        '', '', '', 
        '', '', '', 
    ]

    gameActive = true
    currentPlayer = 'X'

    cells.forEach(cell => {
        cell.innerText = ''
    })

    document.getElementById('gameMessage').innerText = ''
}
