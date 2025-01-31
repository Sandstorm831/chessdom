"use client";
import { socket } from "@/app/socket";
import { useEffect, useState } from "react";

let storeCallback: Function;
let ack: boolean = false;
let reconciliation = false;

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [move, setMove] = useState("");
  const [recievedMoves, setRecievedMoves] = useState<string[]>([])

  function delay() {
    return new Promise(resolve => setTimeout(resolve, 30000));
  }

useEffect(() => {
    socket.connect();
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    socket.emit('move', move)
  }

  socket.on('move', async (chessMove: string, callback: Function) => {
    if(reconciliation) return;
    setRecievedMoves([...recievedMoves, chessMove]);
    storeCallback = callback;
    console.log(`callback is undefined : ${callback === undefined}`);
    if(ack) {
      console.log("is someone here ?")
      return;
    }
    console.log(`logging after ack returner & ack = ${ack}`);
    ack = true;
    // await delay();
    console.log("after 30 seconds, next log should be what time is it ...")
    console.log(storeCallback);
    console.log("what time is it")
    storeCallback('ok');
    ack=false;
  })

  socket.on('reconciliation', (historyX: string[], callback:Function) => {
    reconciliation = true;
    setRecievedMoves([...historyX]);
    callback('reconciled');
    reconciliation = false;
  })

  return (
    <div className="w-full h-full flex flex-col justify-center bg-[#FFFEFC] text-[#323014]">
      <div className="w-full flex justify-center">
        <div className="flex-col justify-center">
          <div className="text-3xl">Opponent player page</div>
          <div className="text-3xl mt-5">
            isConnected : {isConnected ? "connected" : "disconnected"}
          </div>
          <div className="text-3xl mt-5">Transport : {transport}</div>
          <form onSubmit={ handleSubmit}>
            <label>
              Enter your name:
              <input
                type="text"
                value={move}
                onChange={(e) => setMove(e.target.value)}
              />
            </label>
            <input type="submit" />
          </form>
        </div>
        <div className="text-3xl mt-5">
            <ul>
                {recievedMoves && recievedMoves.length ? recievedMoves.map((obj, idx) => <li key={idx}>{obj}</li>) : null}
            </ul>
        </div>
      </div>
    </div>
  );
}
