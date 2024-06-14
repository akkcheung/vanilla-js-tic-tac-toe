
import http from 'http'
import fs from 'fs'

import WebSocket, { WebSocketServer } from 'ws'

const server = http.createServer(httpHandler)

const wss = new WebSocketServer({
    server
})

const port = 8000

const clients = {}
const games = {}

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

wss.on('connection', function connection(ws){

    ws.on('open', () => console.log('opened'))

    ws.on('close', () => console.log('closed'))

    ws.on('message', (data) => {
        const result = JSON.parse(data)
        console.log(result)

        if (result.method === "join"){

            const clientId = result.clientId
            let gameId = null

            console.log(`games -> ${games}`)

            if (JSON.stringify(games) === "{}") {
               gameId = uuidv4() 

               let lastMove = Math.floor((Math.random() + 0.5)) == 0 ? 'X' : 'O'

               games[gameId] = {
                   "id": gameId,
                   "clients": [],
                   "gameBoard": [
                       '', '', '',
                       '', '', '',
                       '', '', ''
                   ],
                   "lastMove": lastMove
               }

               updateGameState()

            } else {
                for (const k of Object.keys(games)){
                    if (games[k].clients.length < 2){
                        gameId = k
                    }
                }

                if (gameId == null){
                   gameId = uuidv4() 
                   let lastMove = Math.floor((Math.random() + 0.5)) == 0 ? 'X' : 'O'

                   games[gameId] = {
                       "id": gameId,
                       "clients": [],
                       "gameBoard": [
                           '', '', '',
                           '', '', '',
                           '', '', ''
                       ],
                       "lastMove": lastMove
                   }
                }
            }

            const game = games[gameId]
            console.log(`game -> ${game}`)

            const color = {
               "0": "Red",
               "1": "Blue"
            }[game.clients.length]

            game.clients.push({
               "clientId": clientId,
               "color": color
            })

            console.log(`games[${gameId}] -> ${ JSON.stringify(games[gameId]) }`)

            const payLoad = {
                "method": "join",
                "game": game
            }

            ws.send(JSON.stringify(payLoad))
            
        } // result.method == "join"

        if (result.method === "play"){

            for (const k of Object.keys(games)){
                if (games[k].id = result.gameId ){
                    games[k].gameBoard = result.gameBoard 
                    games[k].lastMove = result.lastMove
                }
            }
        }
    })

    const clientId = uuidv4()

    clients[clientId] = {}

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    }

    ws.send(JSON.stringify(payLoad))


})

function httpHandler(req, res){
    fs.readFile('./public' + req.url, function (err, data){
        if (err == null){
            res.writeHead(200, {'Content-Type':'text/html'})
            res.write(data)
            res.end()
        }
    })
}

function uuidv4() {
    return '00-0-4-1-000'.replace(/[^-]/g,
            s => ((Math.random() + ~~s) * 0x10000 >> s).toString(16).padStart(4, '0')
    );
}

function updateGameState(){

    for ( const g of Object.keys(games)){
        const game = games[g]

        const payLoad = {
            "method": "update",
            "game": game,
        }

        wss.clients.forEach(function each(client){
            if (client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(payLoad))
            }
        })
    }

    setTimeout(updateGameState, 500)

}
