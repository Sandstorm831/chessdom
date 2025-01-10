"use server";

const stockfish_executable_path =
  "./stockfish/stockfish/stockfish-ubuntu-x86-64-avx2";
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
const controller = new AbortController();
const { signal } = controller;
import * as fs from "node:fs/promises";
let lastProcess: string = "null";

let stockFish: ChildProcessWithoutNullStreams;

async function clearFile() {
  try {
    await fs.writeFile("stockfish/running.pid", "", "utf-8");
    return;
  } catch (err) {
    throw new Error("Error in clearing pid file");
  }
}

async function terminatePIDs(PIDList: string[]) {
  const terminal = spawn("bash");
  for (let i = 0; i < PIDList.length; i++) {
    terminal.stdin.write(`kill ${PIDList[i]}\n`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  terminal.stdin.write("exit\n");
  await clearFile();
  return;
}

export async function startTheEngine(elo: string = "1320") {
  let isReady = false;
  try {
    const data = await fs.readFile("stockfish/running.pid", "utf-8");
    if (data.length !== 0) {
      await terminatePIDs(data.split("\n"));
    }
  } catch (err) {
    throw new Error("error in reading pid file : " + err);
  }

  function listener(data: any) {
    isReady = true;
  }
  stockFish = spawn(stockfish_executable_path, [], {
    stdio: ["pipe", "pipe", "pipe"],
    signal: signal,
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  const PID = stockFish.pid;
  if (PID === undefined)
    throw new Error("Error in reading PID of the spawned process");
  fs.writeFile("stockfish/running.pid", PID.toString(), "utf-8");
  stockFish.stdout.on("data", (data) => listener(data));
  stockFish.on("close", (code) => {
    console.log(`Process is closed with exit code ${code}`);
    return `Process is closed with exit code ${code}`;
  });
  lastProcess = "startTheEngine";
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (isReady) {
    stockFish.stdin.write("setoption name Threads value 2\n"); // setting option
    stockFish.stdin.write("setoption name Hash value 64\n"); // setting option
    stockFish.stdin.write("setoption name MultiPV value 1"); // setting option
    stockFish.stdin.write("setoption name UCI_LimitStrength value true\n"); // setting option
    stockFish.stdin.write(`setoption name UCI_Elo value ${elo}\n`); // setting option
    return true;
  } else {
    console.log("Stockfish engine is taking longer than expected to start ...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    if (!isReady)
      throw new Error(
        "Failed to start the engine, Engine took too long to start"
      );
    else {
      stockFish.stdin.write("setoption name Threads value 2\n"); // setting option
      stockFish.stdin.write("setoption name Hash value 64\n"); // setting option
      stockFish.stdin.write("setoption name MultiPV value 1"); // setting option
      stockFish.stdin.write("setoption name UCI_LimitStrength value true\n"); // setting option
      stockFish.stdin.write(`setoption name UCI_Elo value ${elo}\n`); // setting option
      return true;
    }
  }
}

export async function shutEngineDown() {
  stockFish.stdin.write("quit\n");
  lastProcess = "null";
  try {
    const data = await fs.readFile("stockfish/running.pid", "utf-8");
    if (data.length !== 0) {
      await terminatePIDs(data.split("\n"));
    }
  } catch (err) {
    console.log(err);
    throw new Error(
      "error in reading pid file for terminating engine : " + err
    );
  }
  console.log("shutting down stockfish engine");
  stockFish.stdin.end();
}

export async function getBestMove(fen: string) {
  const outputArray: string[] = [];
  const errorArray: string[] = [];
  if (lastProcess !== "getBestMove") {
    // Removing listeners
    stockFish.stdout.removeAllListeners();
    stockFish.stderr.removeAllListeners();
    // Adding listeners
    stockFish.stdout.on("data", (data) => {
      const c = data
        .toString()
        .split("\n")
        .filter((str: string) => str);
      for (let i = 0; i < c.length; i++) outputArray.push(c[i]);
    });
    stockFish.stderr.on("error", (error) => {
      console.log(`Error : ${error.toString()}`);
      errorArray.push(error.toString());
    });
    stockFish.on("close", (code) => {
      console.log(`Process is closed with exit code ${code}`);
    });
    // marking the current function
    lastProcess = "getBestMOve";
  }

  // Checking the health of Engine
  stockFish.stdin.write("isready\n");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (outputArray[1] !== "readyok") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (outputArray[0] !== "readyok") {
      throw new Error("something is wrong with the engine");
    }
  }

  // Setting the FEN
  stockFish.stdin.write(`position fen ${fen}\n`);
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Finding the best move
  stockFish.stdin.write("go depth 15\n");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return outputArray[outputArray.length - 1].split(" ")[1];
}

// error
// end
// data
// close
