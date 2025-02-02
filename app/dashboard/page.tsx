"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EngineX } from "./chessboard/page";

function initialisingEngineWorker() {
  console.log("am I coming here");
  try {
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
      console.timeEnd("starting");
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
  } catch (err) {
    console.log(err);
  }
}

export default function Page() {
  // if(EngineX.stockfishEngine === null) initialisingEngineWorker();
  console.log(EngineX);
  return (
    <div className="w-full h-full flex flex-col justify-center bg-[#FFFEFC] text-[#323014]">
      <div className="w-full flex justify-center">
        <Button className="text-3xl bg-[#323014] text-[#fffefc] py-6">
          <Link href="/dashboard/chessboard"> Play with computer </Link>
        </Button>
      </div>
      <div className="w-full flex justify-center mt-5">
        <Button className="text-3xl bg-[#323014] text-[#fffefc] py-6">
          <Link href="/dashboard/opponent"> Play Online </Link>
        </Button>
      </div>
    </div>
  );
}
