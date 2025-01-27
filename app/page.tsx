'use client'
import Image from "next/image";
import { playfair_display } from "./ui/fonts";
import { EngineX } from "./dashboard/chessboard/page";

function initialisingEngineWorker(){
  console.log("am I coming here")
  try{
    const workerRef = new window.Worker("/lib/loadEngine.js");
    if (workerRef === null) throw new Error("worker is null");
    workerRef.onmessage = async (e) => {
      console.time("starting");
      // @ts-expect-error Stockfish loaded from script present in /lib/stockfish.js and referenced in layout
      const x: StockfishEngine = await Stockfish(e.data);
      console.timeEnd("starting");
      EngineX.stockfishEngine = x;
      console.log("arraybuffer view : ");
      console.log(ArrayBuffer.isView(x));
      console.timeEnd('starting')
    };
    workerRef.onerror = (e) => {
      console.log(e);
      alert("Error while initiating the Engine, please refresh and try again");
    };
    workerRef.postMessage("start");
    // console.log(workerRef);

    return () => {
      workerRef?.terminate();
    };
  } catch(err){
    console.log(err);
  }
}


export default function Home() {
  if(EngineX.stockfishEngine === null) initialisingEngineWorker();
  console.log(EngineX);
  return (
    <div
      className={`${playfair_display.className} antialiased bg-[#fffefc] w-full h-full text-[#323014]`}
    >
      <div className="w-full h-full flex flex-col justify-center">
        <div className="w-full flex justify-center h-max">
          <div className="text-5xl">Let's Play</div>
        </div>
        <div className="w-full flex justify-center h-max mt-5 mb-5">
          <Image
            src={"/chessboard.png"}
            alt="Chessboard picture"
            width={500}
            height={500}
          />
        </div>
        <div className="w-full flex justify-center h-max">
        <div className="text-5xl">CHESS</div>
        </div>
      </div>
    </div>
  );
}
