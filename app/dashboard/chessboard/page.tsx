"use client";

import Image from "next/image";
import { Dispatch, RefObject, SetStateAction, useEffect } from "react";
import { useRef } from "react";
import { ReactElement } from "react";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";
import { useState } from "react";
import { ComponentPropsWithoutRef } from "react";
import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { redirect } from "next/navigation";
import Link from "next/link";
// import { getBestMove, startTheEngine } from "../../../stockfish/stockfish";
import {
  getEngine,
  getEngineState,
  setReady,
} from "@/lib/features/engine/engineSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import { useApplyInitialSettings, useCaptureBestMoves, useGetBestMove } from "./stockfishWasm";
import {
  getLatestResponse,
  getResponseArray,
  pushResponse,
} from "@/lib/features/engine/outputArraySlice";
const chess = new Chess();
const HistoryArray: historyObject[] = [];

export function applyInitialSettings(
  elo: string,
  stockfishEngine: StockfishEngine
) {
  stockfishEngine.postMessage("ucinewgame");
  stockfishEngine.postMessage("setoption name Threads value 2"); // setting option
  stockfishEngine.postMessage("setoption name Hash value 64"); // setting option
  stockfishEngine.postMessage("setoption name MultiPV value 1"); // setting option
  stockfishEngine.postMessage("setoption name UCI_LimitStrength value true"); // setting option
  stockfishEngine.postMessage(`setoption name UCI_Elo value ${elo}`); // setting option
  stockfishEngine.postMessage("isready");
}

export function initializeHistory() {
  const x = ["a", "b", "c", "d", "e", "f", "g", "h"];
  for (let i = 1; i <= 4; i++) {
    for (let j = 0; j < x.length; j++) {
      if (i < 3) {
        //@ts-expect-error
        const isq: Square = `${x[j]}${i}`;
        HistoryArray.push({
          id: isq,
          to: isq,
        });
      } else {
        const ii = i + 4;
        //@ts-expect-error
        const isq: Square = `${x[j]}${ii}`;
        HistoryArray.push({
          id: isq,
          to: isq,
        });
      }
    }
  }
}

export function getBestMove(fen: string, stockfishEngine: StockfishEngine) {
  stockfishEngine.postMessage(`position fen ${fen}`);
  stockfishEngine.postMessage("go depth 15");
}

// export function captureBestMoves(){
//   const stockfishOutputArray = useAppSelector(getResponseArray);
//   if(stockfishOutputArray[stockfishOutputArray.length - 1] === 'readyok'){
//     return stockfishOutputArray[stockfishOutputArray.length - 2];
//   }
//   return stockfishOutputArray[stockfishOutputArray.length - 1];
// }

export type historyObject = {
  id: Square;
  to: Square | "X";
};

export type MoveLAN = {
  from: Square;
  to: Square;
};

export type FenObject = {
  fen: string;
  isDnD: boolean;
  pieceMovements: MoveLAN[];
};

export type StockfishEngine = {
  onmessage: Function;
  postMessage: Function;
  [key: string]: any;
};

type gameEndObject = {
  gameEndTitle: String;
  gameEndResult: String;
  gameEnded: boolean;
};

type positionObject = {
  square: Square;
  type: PieceSymbol;
  color: Color;
};
type SquareAndMove = {
  square: Square;
  move: string;
};
type rankObject = (positionObject | null)[];
type chessBoardObject = rankObject[];

// export function getOriginalID(square: Square) {
//   for (let i = 0; i < HistoryArray.length; i++) {
//     if (HistoryArray[i].to === square) return HistoryArray[i].id;
//   }
//   // console.log(HistoryArray);
//   console.log(`OriginalID = ${square}`);
//   console.log(HistoryArray);
//   alert("Error retreiving piece history");
//   // throw new Error("Error retreiving piece history");
// }

async function animatePieceMovement(pieceMovements: MoveLAN[]){
  for(let i=0; i<pieceMovements.length; i++){
    const from = pieceMovements[i].from;
    const to = pieceMovements[i].to;
    const destinaionRect = document.getElementById(to)?.getBoundingClientRect();
    if(!destinaionRect) throw new Error("destinaionRect is undefined");
    const MoveX = (destinaionRect.right + destinaionRect.left) / 2;
    const MoveY = (destinaionRect.top + destinaionRect.bottom) / 2;
    const parent = document.getElementById(from);
    console.log(parent);
    console.log("children of parent")
    console.log(parent?.children[parent.children.length - 1]);
    const child = parent?.children[parent.children.length - 1] as HTMLElement;      // Taking the last child, as it's always the last child which is the img object
    const childRect = child.getBoundingClientRect();
    const transX = MoveX - ((childRect.left + childRect.right) / 2);
    const transY = MoveY - ((childRect.top + childRect.bottom) / 2);
    // child?.getBoundingClientRect()
    console.log(`X = ${transX}`)
    console.log(`Y = ${transY}`);
    child.style.transition = "all 0.5s"
    child.style.transform = `translateY(${transY}px) translateX(${transX}px)`
    // child.style.transform = ``
    // await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

const delay = () => new Promise(resolve => setTimeout(resolve, 500));

function getPieceMovements(moveObj: Move): MoveLAN[] {
  if (moveObj.san === "O-O") {
    if (moveObj.color === "w") {
      return [
        { from: moveObj.from, to: moveObj.to },
        { from: "h1", to: "f1" },
      ];
    } else if (moveObj.color === "b") {
      return [
        { from: moveObj.from, to: moveObj.to },
        { from: "h8", to: "f8" },
      ];
    }
  } else if (moveObj.san === "O-O-O") {
    if (moveObj.color === "w") {
      return [
        { from: moveObj.from, to: moveObj.to },
        { from: "a1", to: "d1" },
      ];
    } else if (moveObj.color === "b") {
      return [
        { from: moveObj.from, to: moveObj.to },
        { from: "a8", to: "d8" },
      ];
    }
  }
  return [{ from: moveObj.from, to: moveObj.to }];
}

export function wasmThreadsSupported() {
  // WebAssembly 1.0
  const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
  if (
    typeof WebAssembly !== "object" ||
    typeof WebAssembly.validate !== "function"
  )
    return false;
  if (!WebAssembly.validate(source)) return false;

  // SharedArrayBuffer
  if (typeof SharedArrayBuffer !== "function") return false;

  // Atomics
  if (typeof Atomics !== "object") return false;

  // Shared memory
  const mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
  if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

  // Structured cloning
  try {
    // You have to make sure nobody cares about these messages!
    window.postMessage(mem, "*");
  } catch (e) {
    return false;
  }

  // Growable shared memory (optional)
  try {
    mem.grow(8);
  } catch (e) {
    return false;
  }

  return true;
}

function updateHistory(pieceMovement: MoveLAN[]) {
  for (let i = 0; i < pieceMovement.length; i++) {
    const take: number[] = [];
    const upd: number[] = [];
    const from = pieceMovement[i].from;
    const to = pieceMovement[i].to;
    for (let j = 0; j < HistoryArray.length; j++) {
      if (HistoryArray[j].to === to) {
        take.push(j);
      } else if (HistoryArray[j].to === from) {
        upd.push(j);
      }
    }
    for (let j = 0; j < upd.length; j++) {
      console.log(
        `${HistoryArray[upd[j]].to} changed to ${pieceMovement[i].to}`
      );
      HistoryArray[upd[j]].to = pieceMovement[i].to;
    }
    for (let j = 0; j < take.length; j++) {
      HistoryArray[take[j]].to = "X";
      // HistoryArray.splice(take[j], 1);
    }
  }
  console.log(`History`);
  console.log(HistoryArray);
}

function getPieceId(
  chessBoardIJ: positionObject | null,
  pieceMovements: MoveLAN[],
  i: number,
  j: number,
  playColor: Color
) {
  let IJsquare = IJToSquare(i, j, playColor);
  if (!chessBoardIJ) return IJsquare;
  let x = pieceMovements.find((obj) => obj.to === chessBoardIJ.square);
  if (!x) return IJsquare;
  return x.from;
}

function squareToIJ(square: Square, color: Color) {
  let j = square[0].toLowerCase().charCodeAt(0) - 97;
  let i = Math.abs(Number(square[1]) - 8);
  if (color === "b") {
    j = 7 - j;
    i = 7 - i;
  }
  return { i, j };
}

function IJToSquare(i: number, j: number, color: Color): Square {
  let xi = i;
  let yj = j;
  if (color === "b") {
    xi = 7 - i;
    yj = 7 - j;
  }
  let square: string = "";
  square += String.fromCharCode(yj + 97);
  square += (8 - xi).toString();
  return square as Square;
}

function SquareBlock({
  setClickAndMoveTrigger,
  setBlueDotFunc,
  color,
  validMovesArray,
  cord,
  children,
  ...props
}: {
  setClickAndMoveTrigger: Dispatch<SetStateAction<SquareAndMove[]>>;
  setBlueDotFunc: (a: Square, b: boolean) => void;
  color: Color;
  validMovesArray: SquareAndMove[];
  cord: Square;
} & ComponentPropsWithoutRef<"div">) {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);
  function handleClick() {
    setBlueDotFunc("a1", true);
    setBlueDotFunc(cord, false);
    if (validMovesArray.length === 0) return;
    const canMove = validMovesArray.filter((obj) => obj.square === cord);
    if (canMove.length === 0) {
      return;
    } else {
      setClickAndMoveTrigger(canMove);
    }
  }
  useEffect(() => {
    console.log("rendering");
    const elm = ref.current;
    invariant(elm);
    return dropTargetForElements({
      element: elm,
      getData: () => ({ cord, validMovesArray }),
      canDrop: () =>
        validMovesArray.find((obj) => obj.square === cord) !== undefined
          ? true
          : false,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [cord, validMovesArray]);

  const { i, j } = squareToIJ(cord, color);
  const isDark = !(i % 2 === j % 2);
  function getColor() {
    if (isDraggedOver) {
      return isDark
        ? "border-2 border-gray-500 bg-[#769656] text-[#eeeed2]"
        : "border-2 border-gray-500 bg-[#eeeed2] text-[#769656]";
    }
    return isDark
      ? "bg-[#769656] text-[#eeeed2]"
      : "bg-[#eeeed2] text-[#769656]";
  }
  return (
    <div
      {...props}
      ref={ref}
      className={`${getColor()} relative`}
      onClick={() => {
        handleClick();
      }}
    >
      {children}
    </div>
  );
}

function Peice({
  chessBoardIJ,
  blueDotFunc,
  isDnD,
  id,
}: {
  chessBoardIJ: positionObject;
  blueDotFunc: (a: Square, b: boolean) => void;
  isDnD: boolean;
  id: string;
}) {
  // const layoutId = chessBoardIJ.square === toSquare ? fromSquare : chessBoardIJ.square;
  const ref = useRef(null);
  // const ID = getOriginalID(chessBoardIJ.square);
  const [dragging, setDragging] = useState<boolean>(false);
  useEffect(() => {
    const elm = ref.current;
    invariant(elm);
    return draggable({
      element: elm,
      onDragStart: () => {
        setDragging(true);
        blueDotFunc(chessBoardIJ.square, false);
      },
      onDrop: () => {
        setDragging(false);
        blueDotFunc("a1", true); // An arbitrary square is passed here
      },
    });
  }, [chessBoardIJ]);
  return (
    <Image
      src={`/chesspeices/${chessBoardIJ?.color + chessBoardIJ?.type}.svg`}
      alt={chessBoardIJ?.color + chessBoardIJ?.type}
      ref={ref}
      height={0}
      width={0}
      className="w-11/12 h-11/12 absolute left-[5%] top-[5%] z-10"
      style={dragging ? { opacity: 0 } : {}}
      draggable="false"
    />
  );
}

function RenderSquare(
  fen: FenObject,
  color: Color,
  setClickAndMoveTrigger: Dispatch<SetStateAction<SquareAndMove[]>>
) {
  chess.load(fen.fen);
  const chessBoard: chessBoardObject = chess.board();
  if (color === "b") {
    for (let ab = 0; ab < chessBoard.length; ab++) {
      chessBoard[ab].reverse();
    }
    chessBoard.reverse();
  }
  const chessBoardArray: ReactElement[] = [];
  const [blueDotArray, setBlueDotArray] = useState<SquareAndMove[]>([]);
  function setBlueDotArrayFunc(square: Square, toBeCleared: boolean) {
    if (toBeCleared || color !== chess.turn()) setBlueDotArray([]);
    else {
      const possibleMoves = chess.moves({ square: square, verbose: true });
      const tempArray: SquareAndMove[] = [];
      possibleMoves.filter((obj) => {
        tempArray.push({ square: obj.to, move: obj.san });
      });
      setBlueDotArray(tempArray);
    }
  }
  console.log("render happened");
  for (let i = 0; i < chessBoard.length; i++) {
    for (let j = 0; j < chessBoard[i].length; j++) {
      const chessBoardIJ = chessBoard[i][j];
      const pieceId = getPieceId(chessBoardIJ, fen.pieceMovements, i, j, color);
      if (i % 2 === j % 2) {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setClickAndMoveTrigger={setClickAndMoveTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              <div className="absolute -top-[2px] left-2 z-10 text-lg">
                {color === "w" ? 1 : 8}
              </div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {color === "w" ? "a" : "h"}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                  isDnD={fen.isDnD}
                  id={pieceId}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setClickAndMoveTrigger={setClickAndMoveTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {color === "w" ? 8 - i : i + 1}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                  isDnD={fen.isDnD}
                  id={pieceId}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setClickAndMoveTrigger={setClickAndMoveTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {color === "w"
                  ? String.fromCharCode(j + 97)
                  : String.fromCharCode(96 + 8 - j)}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                  isDnD={fen.isDnD}
                  id={pieceId}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>
          );
        } else
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setClickAndMoveTrigger={setClickAndMoveTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                  isDnD={fen.isDnD}
                  id={pieceId}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>
          );
      } else {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setClickAndMoveTrigger={setClickAndMoveTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              <div className="absolute -top-[2px] left-2 z-10 text-lg">
                {color === "w" ? 1 : 8}
              </div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {color === "w" ? "a" : "h"}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                  isDnD={fen.isDnD}
                  id={pieceId}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setClickAndMoveTrigger={setClickAndMoveTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {color === "w" ? 8 - i : i + 1}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                  isDnD={fen.isDnD}
                  id={pieceId}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setClickAndMoveTrigger={setClickAndMoveTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {color === "w"
                  ? String.fromCharCode(j + 97)
                  : String.fromCharCode(96 + 8 - j)}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                  isDnD={fen.isDnD}
                  id={pieceId}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>
          );
        } else
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setClickAndMoveTrigger={setClickAndMoveTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              className="bg-[#769656]"
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                  isDnD={fen.isDnD}
                  id={pieceId}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>
          );
      }
    }
  }
  return chessBoardArray;
}

function setNewGame(
  setFen: Dispatch<SetStateAction<FenObject>>,
  originalFEN: string,
  setOpenSettings: Dispatch<SetStateAction<boolean>>,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>
) {
  setFen({ fen: originalFEN, isDnD: false, pieceMovements: [] });
  setOpenSettings(true);
  setGameEnded({ gameEnded: false, gameEndResult: "", gameEndTitle: "" });
}

function startTheGame(
  setOpenSettings: Dispatch<SetStateAction<boolean>>,
  stockfishElo: number,
  TheStockfishEngine: StockfishEngine,
  playColor: Color,
  originalFEN: string
) {
  setOpenSettings(false);
  applyInitialSettings(stockfishElo.toString(), TheStockfishEngine);
  if (playColor === "b") {
    getBestMove(originalFEN, TheStockfishEngine);
    // const bestMoveString = useCaptureBestMoves();
    // console.log(`latest response = ${latestStockfishResponse}`);
  }
}

function handleGameOver(
  moveObj: Move,
  isDnD: boolean,
  playColor: Color,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  TheStockfishEngine: StockfishEngine
) {
  const gameOver = chess.isGameOver();
  if (!gameOver) return false;
  const pieceMovements: MoveLAN[] = getPieceMovements(moveObj);
  updateHistory(pieceMovements);
  setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements });
  TheStockfishEngine.postMessage("ucinewgame");
  TheStockfishEngine.postMessage("isready");
  if (chess.isDraw()) {
    gameEndResult = "1/2 - 1/2";
    gameEndTitle = "Equally positioned";
  } else if (chess.turn() === "w") {
    gameEndResult = "0 - 1";
    gameEndTitle = playColor === "w" ? "Better luck next time" : "You Won";
  } else {
    gameEndResult = "1 - 0";
    gameEndTitle = playColor === "w" ? "You Won" : "Better luck next time";
  }
  setTimeout(() => {
    setGameEnded({
      gameEnded: true,
      gameEndResult: gameEndResult,
      gameEndTitle: gameEndTitle,
    });
  }, 1000);
  setSoundTrigger("/sounds/game-end.mp3");
  return true;
}

function handlePromotion(
  isDnD: boolean,
  playColor: Color,
  piece: string,
  promotionArray: SquareAndMove[],
  setOpenDrawer: Dispatch<SetStateAction<boolean>>,
  setPromotionArray: Dispatch<SetStateAction<SquareAndMove[]>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  TheStockfishEngine: StockfishEngine
) {
  let promotionMove;
  for (let i = 0; i < promotionArray.length; i++) {
    const ithMove = promotionArray[i].move;
    if (
      ithMove[ithMove.length - 1] === piece ||
      ithMove[ithMove.length - 2] === piece
    ) {
      promotionMove = promotionArray[i];
      break;
    }
  }
  if (promotionMove === undefined) {
    // console.log(promotionArray);
    throw new Error("Failed promotion, some error occured");
  }
  const moveObj = chess.move(promotionMove.move);
  console.log(moveObj);
  const pieceMovements = getPieceMovements(moveObj);
  // animatePieceMovement(pieceMovements);
  updateHistory(pieceMovements);
  setOpenDrawer(false);
  setPromotionArray([]);
  if (
    handleGameOver(
      moveObj,
      isDnD,
      playColor,
      setFen,
      gameEndResult,
      gameEndTitle,
      setGameEnded,
      setSoundTrigger,
      TheStockfishEngine
    )
  )
    return;
  if (chess.isCheck()) {
    setSoundTrigger("/sounds/move-check.mp3");
  } else {
    setSoundTrigger("/sounds/promote.mp3");
  }
  setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements });
}

function useLatestStockfishResponse(
  isDnD: boolean,
  playColor: Color,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  TheStockfishEngine: StockfishEngine
) {
  const latestStockfishResponse = useAppSelector(getLatestResponse);
  useEffect(() => {
    // console.log(`engine on message : ${TheStockfishEngine.onmessage}`);
    // console.log("am in the latest response" + latestStockfishResponse)
    if (
      latestStockfishResponse &&
      latestStockfishResponse.split(" ")[0] === "bestmove"
    ) {
      const bestMove: string = latestStockfishResponse.split(" ")[1];
      triggerStockfishTrigger(
        isDnD,
        playColor,
        bestMove,
        setFen,
        gameEndResult,
        gameEndTitle,
        setGameEnded,
        setSoundTrigger,
        TheStockfishEngine
      );
      // console.log(`found best move = ${latestStockfishResponse.split(" ")[1]}`);
    }
  }, [latestStockfishResponse]);
}

function useEngine(workerRef: RefObject<Worker | null>) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    workerRef.current = new window.Worker("/lib/loadEngine.js");
    if (workerRef.current === null) throw new Error("worker is null");
    workerRef.current.onmessage = async (e) => {
      // alert("web worker responded");
      // console.log(
      //   e.data &&
      //     e.data.buffer instanceof ArrayBuffer &&
      //     e.data.byteLength !== undefined
      // );
      // console.log(e.data);
      // console.log(ArrayBuffer.isView(e.data));
      console.time("starting");
      // @ts-expect-error Stockfish loaded from script present in /lib/stockfish.js and referenced in layout
      const x: StockfishEngine = await Stockfish(e.data);
      console.timeEnd("starting");
      x.addMessageListener((line: string) => {
        // console.log(`hello : ${line}`);
        // setStockfishResponseArray(StockfishResponseArray.concat([line]));
        dispatch(pushResponse(line));
      });
      // x.onmessage = (e: MessageEvent) => {

      // }
      // console.log(x.onmessage);
      dispatch(setReady(x));
      console.log("arraybuffer view : ");
      console.log(ArrayBuffer.isView(x));
      // dispatch(setReady(x));
      // console.log(typeof x);
      // console.log(x);
      // console.log(typeof x);
      // console.log(JSON.stringify(x));
      // console.log(x);
      // const ax: string = JSON.stringify(x);
      // const cx: object = JSON.parse(ax);
      // console.log(cx === x);
      // console.log(useAppSelector(getEngineState))
    };
    workerRef.current.onerror = (e) => {
      console.log(e);
      alert("Error while initiating the Engine, please refresh and try again");
    };
    workerRef.current.postMessage("start");
    // console.log(workerRef.current);

    return () => {
      workerRef.current?.terminate();
    };
  }, []);
}

function useUpdateBoardFEN(
  playColor: Color,
  fen: FenObject,
  TheStockfishEngine: StockfishEngine,
  openSettings: boolean
) {
  useEffect(() => {
    console.log(`WASM Thread Supported = ${wasmThreadsSupported()} `);
    if (chess.turn() === (playColor === "w" ? "b" : "w")) {
      if (!chess.isGameOver() && !openSettings)
        getBestMove(fen.fen, TheStockfishEngine);
      // const bestMoveString = useCaptureBestMoves();
      // console.log(bestMoveString);
    } else {
      return;
    }
  }, [fen]);
}

function triggerStockfishTrigger(
  isDnD: boolean,
  playColor: Color,
  bestMove: string,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  TheStockfishEngine: StockfishEngine
) {
  if (chess.turn() === (playColor === "w" ? "b" : "w")) {
    const x = chess.move(bestMove);
    const pieceMovements = getPieceMovements(x);
    updateHistory(pieceMovements);
    // animatePieceMovement(pieceMovements);
    console.log(x);
    if (
      handleGameOver(
        x,
        isDnD,
        playColor,
        setFen,
        gameEndResult,
        gameEndTitle,
        setGameEnded,
        setSoundTrigger,
        TheStockfishEngine
      )
    )
      return;
    if (chess.isCheck()) {
      setSoundTrigger("/sounds/move-check.mp3");
    } else if (x.hasOwnProperty("captured")) {
      setSoundTrigger("/sounds/capture.mp3");
    } else if (x.san === "O-O-O" || x.san === "O-O") {
      setSoundTrigger("/sounds/castle.mp3");
    } else {
      setSoundTrigger("/sounds/move-self.mp3");
    }
    setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements });
    return;
  } else return;
}

function useSound(
  soundTrigger: string,
  setSoundTrigger: Dispatch<SetStateAction<string>>
) {
  useEffect(() => {
    if (soundTrigger.length === 0) return;
    try {
      const Sound = new Audio(soundTrigger);
      Sound.play();
      setSoundTrigger("");
    } catch (err) {
      setSoundTrigger("");
      throw new Error("Error occured in playing sound");
    }
  }, [soundTrigger]);
}

function useClickAndMove(
  isDnD: boolean,
  playColor: Color,
  clickAndMoveTrigger: SquareAndMove[],
  setPromotionArray: Dispatch<SetStateAction<SquareAndMove[]>>,
  setOpenDrawer: Dispatch<SetStateAction<boolean>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  TheStockfishEngine: StockfishEngine
) {
  useEffect(() => {
    console.log("clickAndMoveTriggerred");
    if (clickAndMoveTrigger.length === 0) return;
    if (clickAndMoveTrigger.length === 4) {
      setPromotionArray(clickAndMoveTrigger);
      setOpenDrawer(true);
    } else {
      const move: string = clickAndMoveTrigger[0].move;
      const x = chess.move(move);
      const pieceMovements = getPieceMovements(x);
      updateHistory(pieceMovements);
      // animatePieceMovement(pieceMovements);
      console.log(x);
      if (
        handleGameOver(
          x,
          isDnD,
          playColor,
          setFen,
          gameEndResult,
          gameEndTitle,
          setGameEnded,
          setSoundTrigger,
          TheStockfishEngine
        )
      )
        return;
      if (chess.isCheck()) {
        setSoundTrigger("/sounds/move-check.mp3");
      } else if (x.hasOwnProperty("captured")) {
        setSoundTrigger("/sounds/capture.mp3");
      } else if (x.san === "O-O-O" || x.san === "O-O") {
        setSoundTrigger("/sounds/castle.mp3");
      } else {
        setSoundTrigger("/sounds/move-self.mp3");
      }
      setFen({
        fen: chess.fen(),
        isDnD: isDnD,
        pieceMovements: pieceMovements,
      });
    }
  }, [clickAndMoveTrigger]);
}

function useOnPieceDrop(
  isDnD: boolean,
  playColor: Color,
  fen: FenObject,
  setPromotionArray: Dispatch<SetStateAction<SquareAndMove[]>>,
  setOpenDrawer: Dispatch<SetStateAction<boolean>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  TheStockfishEngine: StockfishEngine
) {
  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;
        const dest = destination.data.cord; // Square object
        const aary = destination.data.validMovesArray; // SquareAndMoves[] Object
        // Should validate destSquareCoordinates for Square and sourcePieceData for positionObject

        ///////////////////////////////////////////////////////////////////////
        // Typecasting for a while
        const destSquareCoordinates = dest as Square;
        const validMovesArray = aary as SquareAndMove[];
        ///////////////////////////////////////////////////////////////////////

        const tempObj = validMovesArray.filter(
          (obj) => obj.square === destSquareCoordinates
        );
        if (tempObj.length === 0) {
          throw new Error("Some Error occured, can not find the right move");
        }
        if (tempObj.length === 4) {
          setPromotionArray(tempObj);
          setOpenDrawer(true);
        } else {
          const move: string = tempObj[0].move;
          const x = chess.move(move);
          const pieceMovements = getPieceMovements(x);
          updateHistory(pieceMovements);
          // animatePieceMovement(pieceMovements);
          // console.log(x);
          if (
            handleGameOver(
              x,
              isDnD,
              playColor,
              setFen,
              gameEndResult,
              gameEndTitle,
              setGameEnded,
              setSoundTrigger,
              TheStockfishEngine
            )
          )
            return;
          if (chess.isCheck()) {
            setSoundTrigger("/sounds/move-check.mp3");
          } else if (x.hasOwnProperty("captured")) {
            setSoundTrigger("/sounds/capture.mp3");
          } else if (x.san === "O-O-O" || x.san === "O-O") {
            setSoundTrigger("/sounds/castle.mp3");
          } else {
            setSoundTrigger("/sounds/move-self.mp3");
          }
          setFen({
            fen: chess.fen(),
            isDnD: isDnD,
            pieceMovements: pieceMovements,
          });
        }
      },
    });
  }, []);
}

export default function Page() {
  let gameEndResult = "";
  let gameEndTitle = "";
  const originalFEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const [fen, setFen] = useState<FenObject>({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    isDnD: false,
    pieceMovements: [],
  });
  const [gameEnded, setGameEnded] = useState<gameEndObject>({
    gameEnded: false,
    gameEndResult: "",
    gameEndTitle: "",
  });
  const [clickAndMoveTrigger, setClickAndMoveTrigger] = useState<
    SquareAndMove[]
  >([]);
  const [soundTrigger, setSoundTrigger] = useState<string>("");
  const [playColor, setPlayColor] = useState<Color>("w");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSettings, setOpenSettings] = useState(true);
  const [promotionArray, setPromotionArray] = useState<SquareAndMove[]>([]);
  const workerRef = useRef<Worker>(null);
  const TheStockfishEngine = useAppSelector(getEngine);

  console.log("page rendering");

  chess.load(fen.fen);

  if (HistoryArray.length === 0) {
    initializeHistory();
  }

  // custom hook calls

  useLatestStockfishResponse(
    false, // Stockfish always use animation, that is, no one drags and drop functionality, i.e., false
    playColor,
    setFen,
    gameEndResult,
    gameEndTitle,
    setGameEnded,
    setSoundTrigger,
    TheStockfishEngine
  );

  useEngine(workerRef);

  useUpdateBoardFEN(playColor, fen, TheStockfishEngine, openSettings);

  useSound(soundTrigger, setSoundTrigger);

  useClickAndMove(
    false, // Click and Move mean that, it doesn't use drag and drop functionality, i.e., false
    playColor,
    clickAndMoveTrigger,
    setPromotionArray,
    setOpenDrawer,
    setFen,
    gameEndResult,
    gameEndTitle,
    setGameEnded,
    setSoundTrigger,
    TheStockfishEngine
  );

  useOnPieceDrop(
    true, // OnPieceDrop simply means that drag and drop functionality is used, therfore, true
    playColor,
    fen,
    setPromotionArray,
    setOpenDrawer,
    setFen,
    gameEndResult,
    gameEndTitle,
    setGameEnded,
    setSoundTrigger,
    TheStockfishEngine
  );

  const chessBoardArray = RenderSquare(fen, playColor, setClickAndMoveTrigger);

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex w-full justify-center">
        <div className="aspect-square w-2/5 grid grid-rows-8 grid-cols-8">
          <SettingComponent
            openSettings={openSettings}
            playColor={playColor}
            setPlayColor={setPlayColor}
            setOpenSettings={setOpenSettings}
            TheStockfishEngine={TheStockfishEngine}
            originalFEN={originalFEN}
          />

          <GameEndDialogue
            gameEnded={gameEnded}
            setFen={setFen}
            originalFEN={originalFEN}
            setOpenSettings={setOpenSettings}
            setGameEnded={setGameEnded}
          />

          {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map((elem) => elem)
            : null}

          {openDrawer ? (
            <PromotionDrawer
              openDrawer={openDrawer}
              promotionArray={promotionArray}
              playColor={playColor}
              setOpenDrawer={setOpenDrawer}
              setPromotionArray={setPromotionArray}
              setSoundTrigger={setSoundTrigger}
              setFen={setFen}
              gameEndResult={gameEndResult}
              gameEndTitle={gameEndTitle}
              setGameEnded={setGameEnded}
              TheStockfishEngine={TheStockfishEngine}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function GameEndDialogue({
  gameEnded,
  setFen,
  originalFEN,
  setOpenSettings,
  setGameEnded,
}: {
  gameEnded: gameEndObject;
  setFen: Dispatch<SetStateAction<FenObject>>;
  originalFEN: string;
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>;
}) {
  return (
    <Dialog
      open={gameEnded.gameEnded}
      modal={true}
      onOpenChange={(open: boolean) => {
        redirect("/dashboard");
      }}
    >
      <DialogContent className="flex flex-col justify-center">
        <DialogHeader>
          <DialogTitle className="text-3xl flex justify-center">
            {gameEnded.gameEndTitle}
          </DialogTitle>
          <DialogDescription className="text-5xl flex justify-center">
            {gameEnded.gameEndResult}
          </DialogDescription>
          <DialogDescription className="flex justify-center pt-3">
            <Button
              variant={"default"}
              className="flex justify-center mx-2 text-xl w-56"
            >
              <Link href={"/dashboard"}> Return to dashboard </Link>{" "}
            </Button>
            <Button
              variant={"default"}
              className="flex justify-center mx-2 text-xl w-56"
              onClick={() =>
                setNewGame(setFen, originalFEN, setOpenSettings, setGameEnded)
              }
            >
              New game
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function PromotionDrawer({
  openDrawer,
  promotionArray,
  playColor,
  setOpenDrawer,
  setPromotionArray,
  setSoundTrigger,
  setFen,
  gameEndResult,
  gameEndTitle,
  setGameEnded,
  TheStockfishEngine,
}: {
  openDrawer: boolean;
  promotionArray: SquareAndMove[];
  playColor: Color;
  setOpenDrawer: Dispatch<SetStateAction<boolean>>;
  setPromotionArray: Dispatch<SetStateAction<SquareAndMove[]>>;
  setSoundTrigger: Dispatch<SetStateAction<string>>;
  setFen: Dispatch<SetStateAction<FenObject>>;
  gameEndResult: string;
  gameEndTitle: string;
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>;
  TheStockfishEngine: StockfishEngine;
}) {
  return (
    <Drawer open={openDrawer} modal={true} dismissible={false}>
      <DrawerContent>
        <DrawerTitle className="flex justify-center text-3xl mb-5">
          Select your piece
        </DrawerTitle>
        <DrawerDescription className="flex justify-center">
          <Image
            src={`/chesspeices/${
              promotionArray[0].square[1] === "1" ? "b" : "w"
            }n.svg`}
            alt={`${promotionArray[0].square[1] === "1" ? "b" : "w"}n`}
            draggable="false"
            width={100}
            height={100}
            className="mx-5 hover:bg-gray-200 rounded-xl mb-3"
            onClick={() =>
              handlePromotion(
                false, // For promotion, since the drawer is opened, it doesn't matter if we have used drag&drop or click&Move
                playColor,
                "N",
                promotionArray,
                setOpenDrawer,
                setPromotionArray,
                setSoundTrigger,
                setFen,
                gameEndResult,
                gameEndTitle,
                setGameEnded,
                TheStockfishEngine
              )
            }
          />
          <Image
            src={`/chesspeices/${
              promotionArray[0].square[1] === "1" ? "b" : "w"
            }r.svg`}
            alt={`${promotionArray[0].square[1] === "1" ? "b" : "w"}r`}
            draggable="false"
            width={100}
            height={100}
            className="mx-5 hover:bg-gray-200 rounded-xl mb-3"
            onClick={() =>
              handlePromotion(
                false, // For promotion, since the drawer is opened, it doesn't matter if we have used drag&drop or click&Move
                playColor,
                "R",
                promotionArray,
                setOpenDrawer,
                setPromotionArray,
                setSoundTrigger,
                setFen,
                gameEndResult,
                gameEndTitle,
                setGameEnded,
                TheStockfishEngine
              )
            }
          />
          <Image
            src={`/chesspeices/${
              promotionArray[0].square[1] === "1" ? "b" : "w"
            }b.svg`}
            alt={`${promotionArray[0].square[1] === "1" ? "b" : "w"}b`}
            draggable="false"
            width={100}
            height={100}
            className="mx-5 hover:bg-gray-200 rounded-xl mb-3"
            onClick={() =>
              handlePromotion(
                false, // For promotion, since the drawer is opened, it doesn't matter if we have used drag&drop or click&Move
                playColor,
                "B",
                promotionArray,
                setOpenDrawer,
                setPromotionArray,
                setSoundTrigger,
                setFen,
                gameEndResult,
                gameEndTitle,
                setGameEnded,
                TheStockfishEngine
              )
            }
          />
          <Image
            src={`/chesspeices/${
              promotionArray[0].square[1] === "1" ? "b" : "w"
            }q.svg`}
            alt={`${promotionArray[0].square[1] === "1" ? "b" : "w"}q`}
            draggable="false"
            width={100}
            height={100}
            className="mx-5 hover:bg-gray-200 rounded-xl mb-3"
            onClick={() =>
              handlePromotion(
                false, // For promotion, since the drawer is opened, it doesn't matter if we have used drag&drop or click&Move
                playColor,
                "Q",
                promotionArray,
                setOpenDrawer,
                setPromotionArray,
                setSoundTrigger,
                setFen,
                gameEndResult,
                gameEndTitle,
                setGameEnded,
                TheStockfishEngine
              )
            }
          />
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
}

function SettingComponent({
  openSettings,
  playColor,
  setPlayColor,
  setOpenSettings,
  TheStockfishEngine,
  originalFEN,
}: {
  openSettings: boolean;
  playColor: Color;
  setPlayColor: Dispatch<SetStateAction<Color>>;
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
  TheStockfishEngine: StockfishEngine;
  originalFEN: string;
}) {
  const [stockfishElo, setStockfishElo] = useState<number>(1350);
  return (
    <Drawer
      open={openSettings}
      modal={true}
      dismissible={false}
      direction="left"
    >
      <DrawerContent className="w-[500px] h-full rounded-lg">
        <DrawerTitle className="flex justify-center text-3xl mb-16">
          Settings
        </DrawerTitle>
        <DrawerTitle className="flex justify-center text-xl mb-2">
          Play as : {playColor === "w" ? "White" : "Black"}
        </DrawerTitle>
        <DrawerDescription className="flex justify-center mt-2 mb-5">
          <Button
            variant={"secondary"}
            className="mx-2 hover:bg-gray-5"
            onClick={() => setPlayColor("w")}
          >
            White
          </Button>
          <Button
            variant={"secondary"}
            className="mx-2 hover:bg-gray-5"
            onClick={() => setPlayColor("b")}
          >
            Black
          </Button>
          <Button
            variant={"secondary"}
            className="mx-2 hover:bg-gray-5"
            onClick={() => {
              return Math.round(Math.random()) === 1
                ? setPlayColor("b")
                : setPlayColor("w");
            }}
          >
            Random
          </Button>
        </DrawerDescription>
        <DrawerDescription className="flex justify-center font-bold text-xl mb-3 text-black">
          Stockfish Elo : {stockfishElo}
        </DrawerDescription>
        <DrawerDescription className="flex justify-center font-bold text-xl px-10 mb-5">
          <Slider
            defaultValue={[stockfishElo]}
            max={3150}
            min={1350}
            step={50}
            onValueChange={(value) => setStockfishElo(value[0])}
          />
        </DrawerDescription>
        <DrawerDescription className="flex justify-center w-full px-12">
          <Button
            className="w-full"
            variant={"default"}
            onClick={() =>
              startTheGame(
                setOpenSettings,
                stockfishElo,
                TheStockfishEngine,
                playColor,
                originalFEN
              )
            }
            // onClick={() => {
            //   if(!workerRef.current) {
            //     console.log("worker not initialized")
            //     return;
            //   }else{
            //     console.log(workerRef.current)
            //     return workerRef.current.postMessage('start')
            //   }}}
            disabled={useAppSelector(getEngineState) === "ready" ? false : true}
          >
            Apply and Play
          </Button>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
}
