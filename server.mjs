
import http from 'http'
import fs from 'fs'

const server = http.createServer(httpHandler)
const port = 8000

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
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
