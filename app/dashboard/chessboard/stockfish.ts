const stockfish_executable_path =
  "./../../../stockfish/stockfish/stockfish-ubuntu-x86-64-avx2";
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
const controller = new AbortController();
const { signal } = controller;

let stockFish: ChildProcessWithoutNullStreams; 

export async function startTheEngine(){
    let isReady = false;
    function listener(data: any){
        isReady = true;
    }
    stockFish = spawn(stockfish_executable_path, [], {
        stdio: ["pipe", "pipe", "pipe"],
        signal: signal,
      });
    stockFish.stdout.on('data', (data) => listener(data));
    await new Promise(resolve => setTimeout(resolve, 1000));
    if(isReady) {
        stockFish.stdout.removeAllListeners('data');
        return true;
    }
    else {
        console.log("Stockfish engine is taking longer than expected to start ...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        stockFish.stdout.removeAllListeners('data');
        if(!isReady) throw new Error("Failed to start the engine, Engine took too long to start");
        else return true;
    }
}

export async function shutEngineDown(){
    stockFish.stdin.write('quit\n');
    console.log('shutting down stockfish engine');
    stockFish.stdin.end();
}

export async function getBestMove() {
  const outputArray: string[] = [];

  console.log(stockFish.pid);
  stockFish.stdout.on("data", (data) => {
    const c = data.toString().split('\n').filter((str:string) => str);
    for(let i=0; i<c.length; i++) outputArray.push(c[i]);
  });
  stockFish.stderr.on("error", (error) => {
    console.log(`Error : ${error.toString()}`);
  });
  stockFish.on("close", (code) => {
    console.log(`Process is closed with exit code ${code}`);
  });
  stockFish.stdin.write("go depth 15\n");
  await new Promise((resolve => setTimeout(resolve, 1000)));
  stockFish.stdin.write("quit");
  stockFish.stdin.end();
  return outputArray[outputArray.length - 1].split(" ")[1];
}

async function main(){
    const bestMove = await getBestMove();
    console.log(bestMove)
}
main();