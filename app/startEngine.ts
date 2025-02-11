import { EngineX } from "./engineAndPGN";

export default function initialisingEngineWorker() {
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
    console.log("Error caught");
    console.log(err);
  }
}
