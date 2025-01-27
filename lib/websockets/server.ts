import { createServer } from "http";
import { parse } from "url";
import next from 'next';
import WebSocket, { WebSocketServer } from "ws";

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        if(req?.url === undefined) throw new Error("request.url is undefined");
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    })

    const wss = new WebSocketServer({server});

    wss.on('connection', (ws) => {
        console.log("New client is connected");

        ws.on('message', (message) =>{
            console.log(`Recieved message : ${message}`);
            ws.send(`Server: ${message}`);
        })

        ws.on('close', () =>{
            console.log("Client disconnected");
        })
    })

    server.listen(3000, () => {
        console.log("listening on port http://localhost:3000");
    })

})