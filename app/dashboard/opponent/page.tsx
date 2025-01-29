"use client";
import { socket } from "@/app/socket";
import { useEffect, useState } from "react";

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [move, setMove] = useState("");
  const [recievedMoves, setRecievedMoves] = useState<string[]>([])
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

  socket.on('move', (chessMove, callback) => {
    setRecievedMoves([...recievedMoves, chessMove]);
    callback('ok');
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
