const stockfish_executable_path =
  "./../../../stockfish/stockfish/stockfish-ubuntu-x86-64-avx2";
import { spawn } from "node:child_process";
const controller = new AbortController();
const { signal } = controller;

async function getBestMove() {
  const outputArray: string[] = [];
  const stockFish = spawn(stockfish_executable_path, [], {
    stdio: ["pipe", "pipe", "pipe"],
    signal: signal,
  });
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