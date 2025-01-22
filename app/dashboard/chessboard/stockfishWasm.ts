import { getEngine } from "@/lib/features/engine/engineSlice";
import { getResponseArray } from "@/lib/features/engine/outputArraySlice";
import { useAppSelector } from "@/lib/hooks";

export function useApplyInitialSettings(elo: string){
  const stockfishEngine = useAppSelector(getEngine);
  
  stockfishEngine.postMessage('ucinewgame');
  stockfishEngine.postMessage("setoption name Threads value 2");                    // setting option
  stockfishEngine.postMessage("setoption name Hash value 64");                      // setting option
  stockfishEngine.postMessage("setoption name MultiPV value 1");                    // setting option
  stockfishEngine.postMessage("setoption name UCI_LimitStrength value true");       // setting option
  stockfishEngine.postMessage(`setoption name UCI_Elo value ${elo}`);               // setting option
  stockfishEngine.postMessage("isready");
}

export function useGetBestMove(fen: string){
  const stockfishEngine = useAppSelector(getEngine);
  stockfishEngine.postMessage(`position fen ${fen}`)
  stockfishEngine.postMessage("go depth 15");
  stockfishEngine.postMessage('isready');
}

export function useCaptureBestMoves(){
  const stockfishOutputArray = useAppSelector(getResponseArray);
  if(stockfishOutputArray[stockfishOutputArray.length - 1] === 'readyok'){
    return stockfishOutputArray[stockfishOutputArray.length - 2];
  }
}