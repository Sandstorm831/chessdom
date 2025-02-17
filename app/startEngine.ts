import { EngineX } from "./engineAndPGN";

export default function initialisingEngineWorker() {
  try {
    const workerRef = new window.Worker("/lib/loadEngine.js");
    if (workerRef === null) throw new Error("worker is null");
    workerRef.onmessage = async (e) => {
      // @ts-expect-error Stockfish loaded from script present in /lib/stockfish.js and referenced in layout
      const x: StockfishEngine = await Stockfish(e.data);
      EngineX.stockfishEngine = x;
    };
    workerRef.onerror = (e) => {
      console.log(e);
      alert("Error while initiating the Engine, please refresh and try again");
    };
    workerRef.postMessage("start");

    return () => {
      workerRef?.terminate();
    };
  } catch (err) {
    console.log("Some error occured while running initialising engine worker");
    console.log(err);
  }
}
