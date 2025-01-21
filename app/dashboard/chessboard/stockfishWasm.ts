import { getEngine } from "@/lib/features/engine/engineSlice";
import { getLatestResponse, getResponseArray, pushResponse } from "@/lib/features/engine/outputArraySlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export function onMessageFunc(e: MessageEvent) {
  const dispatch = useAppDispatch();
  dispatch(pushResponse(e.data));
}

export function applyInitialSettings(elo: string){
  const stockfishEngine = useAppSelector(getEngine);
  
  stockfishEngine.postMessage("setoption name Threads value 2");                    // setting option
  stockfishEngine.postMessage("setoption name Hash value 64");                      // setting option
  stockfishEngine.postMessage("setoption name MultiPV value 1");                    // setting option
  stockfishEngine.postMessage("setoption name UCI_LimitStrength value true");       // setting option
  stockfishEngine.postMessage(`setoption name UCI_Elo value ${elo}`);               // setting option
  stockfishEngine.postMessage(`isready`);

}

export function getBestMove(fen: string){
  const stockfishEngine = useAppSelector(getEngine);
  const latestResponse = useAppSelector(getLatestResponse);
  const responseArray = useAppSelector(getResponseArray);
  stockfishEngine.postMessage(`position fen ${fen}`)
  stockfishEngine.postMessage("go depth 15");
  stockfishEngine.postMessage('isready');
  if(latestResponse ===  'readyok'){
    console.log(responseArray); 
    return 'e2e4';
    // return responseArray[responseArray.length - 2];
  }
  return 'e2e4'; // should be removed afterwards, it should be async function not immediate resolver;
}