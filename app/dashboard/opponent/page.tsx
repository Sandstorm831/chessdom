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
import {
  Chess,
  Color,
  DEFAULT_POSITION,
  Move,
  PieceSymbol,
  Square,
} from "chess.js";
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
  DialogClose,
} from "@/components/ui/dialog";
import { redirect } from "next/navigation";
import Link from "next/link";
import { socket } from "@/app/socket";
import { LoadingSpinner } from "@/app/ui/loadingSpinner";
// import { getBestMove, startTheEngine } from "../../../opponent/opponent";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import { useApplyInitialSettings, useCaptureBestMoves, useGetBestMove } from "./opponentWasm";
import { parse, ParseTree } from "@mliebelt/pgn-parser";
import { PgnMove, Tags } from "@mliebelt/pgn-types/";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { setReady } from "@/lib/features/engine/engineSlice";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useSession } from "next-auth/react";
/*  Variables relating to socket chess and online play */
let storeCallback: Function;
let reconciliation = false;
let NonStatePlaycolor: Color = "w"; // Created, as in useEffect with zero
// dependency array, state variables that
// are set afterward the first render, doesn't
// get reflected, at those places, this variable
// can be used
/*  Variables relating to socket chess and online play */

const chess = new Chess();
const HistoryArray: historyObject[] = [];
const nextMoveObject: FenObject = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  isDnD: false,
  pieceMovements: [],
};
const PGN: PGNObject = { pgn: "", moveNumber: 0 };
const FENHistory: FenObject[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    isDnD: false,
    pieceMovements: [],
  },
];

let currentUIPosition = 0;

function moveForward(setFen: Dispatch<SetStateAction<FenObject>>) {
  if (currentUIPosition === FENHistory.length - 1) return;
  else {
    setFen(FENHistory[currentUIPosition + 1]);
    currentUIPosition += 1;
  }
}

function moveBackward(setFen: Dispatch<SetStateAction<FenObject>>) {
  if (currentUIPosition === 0) return;
  else {
    setFen(FENHistory[currentUIPosition - 1]);
    currentUIPosition -= 1;
  }
}

function presentTimeTravel(setFen: Dispatch<SetStateAction<FenObject>>) {
  setFen(FENHistory[FENHistory.length - 1]);
  currentUIPosition = FENHistory.length - 1;
}

function arbitraryTimeTravel(
  moveNumber: number,
  turn: string,
  setFen: Dispatch<SetStateAction<FenObject>>,
) {
  setFen(FENHistory[moveNumber * 2 - (turn === "w" ? 1 : 0)]);
  currentUIPosition = moveNumber * 2 - (turn === "w" ? 1 : 0);
}

export function initializeHistory() {
  const x = ["a", "b", "c", "d", "e", "f", "g", "h"];
  for (let i = 1; i <= 4; i++) {
    for (let j = 0; j < x.length; j++) {
      if (i < 3) {
        //@ts-expect-error will be converting to a square, which can't be evaluated statically in expression
        const isq: Square = `${x[j]}${i}`;
        HistoryArray.push({
          id: isq,
          to: isq,
        });
      } else {
        const ii = i + 4;
        //@ts-expect-error will be converting to a square, which can't be evaluated statically in expression
        const isq: Square = `${x[j]}${ii}`;
        HistoryArray.push({
          id: isq,
          to: isq,
        });
      }
    }
  }
}

// export function getBestMove(fen: string, opponentEngine: OpponentEngine) {
//   opponentEngine.postMessage(`position fen ${fen}`);
//   opponentEngine.postMessage("go depth 15");
// }

// export function captureBestMoves(){
//   const opponentOutputArray = useAppSelector(getResponseArray);
//   if(opponentOutputArray[opponentOutputArray.length - 1] === 'readyok'){
//     return opponentOutputArray[opponentOutputArray.length - 2];
//   }
//   return opponentOutputArray[opponentOutputArray.length - 1];
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
type PGNObject = {
  pgn: string;
  moveNumber: number;
};

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

export function updatePGN(
  moveObj: Move,
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
) {
  if (moveObj.color === "w") {
    const x = PGN.moveNumber + 1;
    const pgnString: string = `${x}. ${moveObj.san} `;
    PGN.moveNumber = x;
    PGN.pgn += pgnString;
  } else {
    const pgnString = `${PGN.moveNumber}... ${moveObj.san} `;
    PGN.pgn += pgnString;
  }
  const parsed = parse(PGN.pgn, { startRule: "game" });
  console.log(parsed);
  console.log(PGN.pgn);
  // Type Checking Code ------>
  // if(!Array.isArray(parsed)){
  //   console.log(parsed);
  //   throw new Error("parsed output is not an array");
  // }
  const isOfType = (z: any): z is ParseTree => "moves" in z;
  if (!isOfType(parsed)) throw new Error("parsed output is not of type");
  const x = [parsed];
  // <-------- Type Checking Code
  setParsedPGN(x);
}

async function animatePieceMovement(moveObj: Move) {
  const pieceMovements = getPieceMovements(moveObj);
  console.log("Piece movements");
  console.log(pieceMovements);
  for (let i = 0; i < pieceMovements.length; i++) {
    const from = pieceMovements[i].from;
    const to = pieceMovements[i].to;
    const destSquare = document.getElementById(to);
    if (!destSquare) throw new Error("dest square is null");
    const destinaionRect = destSquare?.getBoundingClientRect();
    const MoveX = (destinaionRect.right + destinaionRect.left) / 2;
    const MoveY = (destinaionRect.top + destinaionRect.bottom) / 2;
    const parent = document.getElementById(from);
    console.log(parent);
    console.log("children of parent");
    console.log(parent?.children[parent.children.length - 1]);
    const child = parent?.children[parent.children.length - 1] as HTMLElement; // Taking the last child, as it's always the last child which is the img object
    const destChild = destSquare.children as HTMLCollectionOf<HTMLElement>;
    const childRect = child.getBoundingClientRect();
    const transX = MoveX - (childRect.left + childRect.right) / 2;
    const transY = MoveY - (childRect.top + childRect.bottom) / 2;
    // child?.getBoundingClientRect()
    console.log(`X = ${transX}`);
    console.log(`Y = ${transY}`);
    child.style.transition = "all 0.2s";
    child.style.transform = `translateY(${transY}px) translateX(${transX}px)`;
    child.style.zIndex = "20";
    // let destAlt = "";
    for (let i = 0; i < destChild.length; i++) {
      if (destChild[i].nodeName === "IMG") {
        // const attacker: string = `/chesspeices/${moveObj.color}${moveObj.piece}.svg`;
        setTimeout(() => {
          //@ts-expect-error since node name is 'IMG' therefore this is an img tag, therefor will contain the src for sure
          destChild[i].src = "";
          //@ts-expect-error since node name is 'IMG' therefore this is an img tag, therefor will contain the src for sure
          destChild[i].alt = "";
        }, 100);
        // destChild[i].style.transform = "scale(0, 0)"
        // destChild[i].style.transition = "all 0.15s"
        // console.log(destAlt);
        // destAlt = destChild[i].id;
        // destChild[i].remove();
        break;
        // setTimeout(() => {destChild[i].style.transform = "none"}, 400);
      }
    }
    // return;
    // child.style.transform = ``
    // await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

function removeAnimationTransforms(pieceMovements: MoveLAN[]) {
  for (let i = 0; i < pieceMovements.length; i++) {
    const from = pieceMovements[i].from;
    const to = pieceMovements[i].to;
    const destSquare = document.getElementById(to);
    if (!destSquare) throw new Error("dest square is null");
    const destChild = destSquare.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < destChild.length; i++) {
      if (destChild[i].nodeName === "IMG") {
        destChild[i].style.transform = "none";
      }
    }
  }
}

const delay = () => new Promise((resolve) => setTimeout(resolve, 500));

function getPieceMovements(moveObj: Move): MoveLAN[] {
  if (moveObj.san === "O-O" || moveObj.san === "O-O+") {
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
  } else if (moveObj.san === "O-O-O" || moveObj.san === "O-O-O+") {
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
        `${HistoryArray[upd[j]].to} changed to ${pieceMovement[i].to}`,
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

function handleResignation(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  playColor: Color,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
) {
  const resgString: string = playColor === "w" ? "0-1" : "1-0";
  if (playColor === "w") {
    const pgnString: string = `{ White Resigns. } ${resgString} `;
    PGN.pgn += pgnString;
  } else {
    const pgnString = `{ Black Resigns. } ${resgString} `;
    PGN.pgn += pgnString;
  }
  const parsed = parse(PGN.pgn, { startRule: "game" });
  console.log(parsed);
  console.log(PGN.pgn);
  // Type Checking Code ------>
  const isOfType = (z: any): z is ParseTree => "moves" in z;
  if (!isOfType(parsed)) throw new Error("parsed output is not of type");
  const x = [parsed];
  // <-------- Type Checking Code
  setParsedPGN(x);

  // setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements });
  // do something on resignatino, I haven't thought about it till now.
  // TheOpponentEngine.postMessage("ucinewgame");
  // TheOpponentEngine.postMessage("isready");
  //
  setGameEnded({
    gameEnded: true,
    gameEndResult: playColor === "w" ? "0 - 1" : "1 - 0",
    gameEndTitle: "Better luck next time",
  });
  setSoundTrigger("/sounds/game-end.mp3");
  socket.emit("resigned", playColor);
  return;
}

function getPieceId(
  chessBoardIJ: positionObject | null,
  pieceMovements: MoveLAN[],
  i: number,
  j: number,
  playColor: Color,
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
      id={chessBoardIJ?.color + chessBoardIJ?.type}
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
  setClickAndMoveTrigger: Dispatch<SetStateAction<SquareAndMove[]>>,
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
    if (
      toBeCleared ||
      color !== chess.turn() ||
      FENHistory.length - 1 !== currentUIPosition
    )
      setBlueDotArray([]);
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
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute top-[43%] left-[42%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>,
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
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute top-[43%] left-[42%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>,
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
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute top-[43%] left-[42%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>,
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
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute top-[43%] left-[42%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>,
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
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute top-[43%] left-[42%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>,
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
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute top-[43%] left-[42%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>,
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
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute top-[43%] left-[42%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>,
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
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute top-[43%] left-[42%] bg-[#0077CC] rounded-full w-5 h-5"></div>
              ) : null}
            </SquareBlock>,
          );
      }
    }
  }
  return chessBoardArray;
}

function FENCallback(setFen: Dispatch<SetStateAction<FenObject>>) {
  const fen: string = nextMoveObject.fen;
  const isDnD: boolean = nextMoveObject.isDnD;
  const pieceMovements: MoveLAN[] = nextMoveObject.pieceMovements;
  setFen({ fen: fen, isDnD: isDnD, pieceMovements: pieceMovements });
}

function setNewGame(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  originalFEN: string,
  setOpenSettings: Dispatch<SetStateAction<boolean>>,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
) {
  PGN.pgn = "";
  PGN.moveNumber = 0;
  setParsedPGN([]);
  FENHistory.length = 0;
  FENHistory.push({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    isDnD: false,
    pieceMovements: [],
  });
  currentUIPosition = 0;
  setFen({ fen: originalFEN, isDnD: false, pieceMovements: [] });
  setOpenSettings(true);
  setGameEnded({ gameEnded: false, gameEndResult: "", gameEndTitle: "" });
}

function startTheGame(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setFindingRoom: Dispatch<SetStateAction<boolean>>,
) {
  PGN.pgn = "";
  PGN.moveNumber = 0;
  setParsedPGN([]);
  FENHistory.length = 0;
  FENHistory.push({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    isDnD: false,
    pieceMovements: [],
  });
  currentUIPosition = 0;
  setFindingRoom(false);
}

function handleGameOver(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  moveObj: Move,
  isDnD: boolean,
  playColor: Color,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
) {
  const playColorAct: Color =
    playColor !== NonStatePlaycolor ? NonStatePlaycolor : playColor; // to avoid conflict of some edge cases.
  const gameOver = chess.isGameOver();
  if (!gameOver) return false;
  const pieceMovements: MoveLAN[] = getPieceMovements(moveObj);
  updateHistory(pieceMovements);

  if (!isDnD) {
    nextMoveObject.fen = chess.fen();
    nextMoveObject.isDnD = isDnD;
    nextMoveObject.pieceMovements = pieceMovements;
    setTimeout(() => FENCallback(setFen), 500);
  } else {
    setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements });
  }

  if (chess.isDraw()) {
    gameEndResult = "1/2 - 1/2";
    gameEndTitle = "Equally positioned";
  } else if (chess.turn() === "w") {
    gameEndResult = "0 - 1";
    gameEndTitle = playColorAct === "w" ? "Better luck next time" : "You Won";
  } else {
    gameEndResult = "1 - 0";
    gameEndTitle = playColorAct === "w" ? "You Won" : "Better luck next time";
  }
  const resgString: string = chess.turn() === "w" ? "0-1" : "1-0";
  if (playColorAct === "w") {
    const pgnString: string = `${resgString} `;
    PGN.pgn += pgnString;
  } else {
    const pgnString = `${resgString} `;
    PGN.pgn += pgnString;
  }
  const parsed = parse(PGN.pgn, { startRule: "game" });
  console.log(parsed);
  console.log(PGN.pgn);
  // Type Checking Code ------>
  const isOfType = (z: any): z is ParseTree => "moves" in z;
  if (!isOfType(parsed)) throw new Error("parsed output is not of type");
  const x = [parsed];
  // <-------- Type Checking Code
  setParsedPGN(x);
  setTimeout(() => {
    setGameEnded({
      gameEnded: true,
      gameEndResult: gameEndResult,
      gameEndTitle: gameEndTitle,
    });
  }, 1000);
  setSoundTrigger("/sounds/game-end.mp3");
  console.log(JSON.stringify(chess.pgn()));
  return true;
}

function handlePromotion(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
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
  // since the move has been played in chess object we have get an opposite check, otherwise the move recieved will be throttled back
  function ackknowledgementCallback(err: Error, response: string) {
    if (err) {
      console.log("no acknowledgement");
      socket
        .timeout(5000)
        .emit("move", moveObj.san, (err: Error, response: string) =>
          ackknowledgementCallback(err, response),
        );
      return;
    } else {
      console.log(response);
      return;
    }
    return;
  }
  if (chess.turn() !== playColor)
    socket
      .timeout(5000)
      .emit("move", moveObj.san, (err: Error, response: string) =>
        ackknowledgementCallback(err, response),
      );
  updatePGN(moveObj, setParsedPGN);
  console.log(moveObj);
  const pieceMovements = getPieceMovements(moveObj);
  animatePieceMovement(moveObj);
  updateHistory(pieceMovements);
  FENHistory.push({
    fen: chess.fen(),
    isDnD: isDnD,
    pieceMovements: pieceMovements,
  });
  currentUIPosition += 1;
  setOpenDrawer(false);
  setPromotionArray([]);
  if (
    handleGameOver(
      setParsedPGN,
      moveObj,
      isDnD,
      playColor,
      setFen,
      gameEndResult,
      gameEndTitle,
      setGameEnded,
      setSoundTrigger,
    )
  )
    return;
  if (chess.isCheck()) {
    setSoundTrigger("/sounds/move-check.mp3");
  } else {
    setSoundTrigger("/sounds/promote.mp3");
  }
  setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements }); // Not using animating move in promotion as promotion doesn't require it
}

function useLatestOpponentResponse(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  isDnD: boolean,
  playColor: Color,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  opponentMove: string,
) {
  useEffect(() => {
    // console.log(`engine on message : ${TheOpponentEngine.onmessage}`);
    // console.log("am in the latest response" + latestOpponentResponse)
    if (currentUIPosition === FENHistory.length - 1) {
      triggerOpponentTrigger(
        setParsedPGN,
        isDnD,
        playColor,
        opponentMove,
        setFen,
        gameEndResult,
        gameEndTitle,
        setGameEnded,
        setSoundTrigger,
      );
    } else {
      // if game is in time travel get to the current FEN and the animate the move
    }
    // console.log(`found best move = ${latestOpponentResponse.split(" ")[1]}`);
  }, [opponentMove]);
}

function triggerOpponentTrigger(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  isDnD: boolean,
  playColor: Color,
  bestMove: string,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
) {
  if (chess.turn() === (playColor === "w" ? "b" : "w")) {
    const x = chess.move(bestMove);
    function ackknowledgementCallback(err: Error, response: string) {
      if (err) {
        console.log("no acknowledgement");
        socket
          .timeout(5000)
          .emit("move", x.san, (err: Error, response: string) =>
            ackknowledgementCallback(err, response),
          );
        return;
      } else {
        console.log(response);
        return;
      }
      return;
    }
    // since the move has been played in chess object we have get an opposite check, otherwise the move recieved will be throttled back
    if (chess.turn() !== playColor)
      socket
        .timeout(5000)
        .emit("move", x.san, (err: Error, response: string) =>
          ackknowledgementCallback(err, response),
        );
    updatePGN(x, setParsedPGN);
    const pieceMovements = getPieceMovements(x);
    updateHistory(pieceMovements);
    FENHistory.push({
      fen: chess.fen(),
      isDnD: isDnD,
      pieceMovements: pieceMovements,
    });
    currentUIPosition += 1;
    animatePieceMovement(x);
    console.log(x);
    if (
      handleGameOver(
        setParsedPGN,
        x,
        isDnD,
        playColor,
        setFen,
        gameEndResult,
        gameEndTitle,
        setGameEnded,
        setSoundTrigger,
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
    nextMoveObject.fen = chess.fen();
    nextMoveObject.isDnD = isDnD;
    nextMoveObject.pieceMovements = pieceMovements;
    setTimeout(() => FENCallback(setFen), 500);
    // setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements });
    return;
  } else return;
}

function handleReconciliationGameOver(
  playColor: Color,
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
) {
  let gameEndResult: string = "";
  let gameEndTitle: string = "";
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
  const resgString: string = chess.turn() === "w" ? "0-1" : "1-0";
  if (playColor === "w") {
    const pgnString: string = `${resgString} `;
    PGN.pgn += pgnString;
  } else {
    const pgnString = `${resgString} `;
    PGN.pgn += pgnString;
  }
  const parsed = parse(PGN.pgn, { startRule: "game" });
  console.log(parsed);
  console.log(PGN.pgn);
  // Type Checking Code ------>
  const isOfType = (z: any): z is ParseTree => "moves" in z;
  if (!isOfType(parsed)) throw new Error("parsed output is not of type");
  const x = [parsed];
  // <-------- Type Checking Code
  setParsedPGN(x);
  setTimeout(() => {
    setGameEnded({
      gameEnded: true,
      gameEndResult: gameEndResult,
      gameEndTitle: gameEndTitle,
    });
  }, 1000);
  setSoundTrigger("/sounds/game-end.mp3");
  console.log(JSON.stringify(chess.pgn()));
}

function handleResetBoardForSocket(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setIsDisconnectedFromGame: Dispatch<SetStateAction<boolean>>,
  setOpponentLeftTheGame: Dispatch<SetStateAction<boolean>>,
) {
  PGN.pgn = "";
  PGN.moveNumber = 0;
  setParsedPGN([]);
  FENHistory.length = 0;
  FENHistory.push({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    isDnD: false,
    pieceMovements: [],
  });
  currentUIPosition = 0;
  setFen({ fen: DEFAULT_POSITION, isDnD: false, pieceMovements: [] });
  setGameEnded({ gameEnded: false, gameEndResult: "", gameEndTitle: "" });
  setIsDisconnectedFromGame(false);
  setOpponentLeftTheGame(false);
}

function handleGameStartingForSocket(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setFindingRoom: Dispatch<SetStateAction<boolean>>,
  setRematchD: Dispatch<SetStateAction<boolean>>,
) {
  setRematchD(false);
  startTheGame(setParsedPGN, setFindingRoom);
}

function handleOpponentMoveForSocket(
  chessMove: string,
  callback: Function,
  setOpponentMove: Dispatch<SetStateAction<string>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
) {
  // Next 2 lines are fundamental and should not be removed
  if (reconciliation) return;
  storeCallback = callback;
  ///////////////////////////////////////////////////////////
  if (currentUIPosition !== FENHistory.length - 1) presentTimeTravel(setFen);
  setOpponentMove(chessMove);

  // Calling the acknowledgement callback
  storeCallback("ok");
}

function handleReconciliationForSocket(
  colorHeld: Color,
  historyX: string[],
  setFindingRoom: Dispatch<SetStateAction<boolean>>,
  callback: Function,
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setPlayColor: Dispatch<SetStateAction<Color>>,
) {
  reconciliation = true;
  storeCallback = callback;
  // do whatever you want to do for reconciliation
  setPlayColor(colorHeld);
  NonStatePlaycolor = colorHeld;
  while (chess.history().length < historyX.length) {
    const index = chess.history().length;
    const san = historyX[index];
    const moveObj = chess.move(san);
    updatePGN(moveObj, setParsedPGN);
    const pieceMovements = getPieceMovements(moveObj);
    updateHistory(pieceMovements);
    FENHistory.push({
      fen: chess.fen(),
      isDnD: false,
      pieceMovements: pieceMovements,
    });
    currentUIPosition += 1;
    if (chess.history().length === historyX.length) {
      setFen({
        fen: chess.fen(),
        isDnD: false,
        pieceMovements: pieceMovements,
      });
      if (chess.isGameOver())
        handleReconciliationGameOver(
          colorHeld,
          setParsedPGN,
          setSoundTrigger,
          setGameEnded,
        );
    }
  }
  //
  storeCallback("reconciled");
  setFindingRoom(false);
  reconciliation = false;
}

function handleOpponentResignationForSocket(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  opponentColor: Color,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
) {
  const resgString: string = opponentColor === "w" ? "0-1" : "1-0";
  if (opponentColor === "w") {
    const pgnString: string = `{ White Resigns. } ${resgString} `;
    PGN.pgn += pgnString;
  } else {
    const pgnString = `{ Black Resigns. } ${resgString} `;
    PGN.pgn += pgnString;
  }
  const parsed = parse(PGN.pgn, { startRule: "game" });
  console.log(parsed);
  console.log(PGN.pgn);
  // Type Checking Code ------>
  const isOfType = (z: any): z is ParseTree => "moves" in z;
  if (!isOfType(parsed)) throw new Error("parsed output is not of type");
  const x = [parsed];
  // <-------- Type Checking Code
  setParsedPGN(x);

  // setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements });
  // do something on resignatino, I haven't thought about it till now.
  // TheOpponentEngine.postMessage("ucinewgame");
  // TheOpponentEngine.postMessage("isready");
  //
  setGameEnded({
    gameEnded: true,
    gameEndResult: opponentColor === "w" ? "0 - 1" : "1 - 0",
    gameEndTitle: "Congratulations, You Won",
  });
  setSoundTrigger("/sounds/game-end.mp3");
  return;
}

function handleRematchForSocket(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setRematchD: Dispatch<SetStateAction<boolean>>,
) {
  PGN.pgn = "";
  PGN.moveNumber = 0;
  setParsedPGN([]);
  FENHistory.length = 0;
  FENHistory.push({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    isDnD: false,
    pieceMovements: [],
  });
  currentUIPosition = 0;
  setFen({ fen: DEFAULT_POSITION, isDnD: false, pieceMovements: [] });
  setGameEnded({ gameEnded: false, gameEndResult: "", gameEndTitle: "" });
  setRematchD(false);
}

function useSound(
  soundTrigger: string,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
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
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
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
      function ackknowledgementCallback(err: Error, response: string) {
        if (err) {
          console.log("no acknowledgement");
          socket
            .timeout(5000)
            .emit("move", x.san, (err: Error, response: string) =>
              ackknowledgementCallback(err, response),
            );
          return;
        } else {
          console.log(response);
          return;
        }
        return;
      }
      // since the move has been played in chess object we have get an opposite check, otherwise the move recieved will be throttled back
      if (chess.turn() !== playColor)
        socket
          .timeout(5000)
          .emit("move", x.san, (err: Error, response: string) =>
            ackknowledgementCallback(err, response),
          );
      updatePGN(x, setParsedPGN);
      const pieceMovements = getPieceMovements(x);
      updateHistory(pieceMovements);
      FENHistory.push({
        fen: chess.fen(),
        isDnD: isDnD,
        pieceMovements: pieceMovements,
      });
      currentUIPosition += 1;
      animatePieceMovement(x);
      console.log(x);
      if (
        handleGameOver(
          setParsedPGN,
          x,
          isDnD,
          playColor,
          setFen,
          gameEndResult,
          gameEndTitle,
          setGameEnded,
          setSoundTrigger,
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
      nextMoveObject.fen = chess.fen();
      nextMoveObject.isDnD = isDnD;
      nextMoveObject.pieceMovements = pieceMovements;
      setTimeout(() => FENCallback(setFen), 500);
      // setFen({
      //   fen: chess.fen(),
      //   isDnD: isDnD,
      //   pieceMovements: pieceMovements,
      // });
    }
  }, [clickAndMoveTrigger]);
}

function useOnPieceDrop(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
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
          (obj) => obj.square === destSquareCoordinates,
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
          function ackknowledgementCallback(err: Error, response: string) {
            if (err) {
              console.log("no acknowledgement");
              socket
                .timeout(5000)
                .emit("move", x.san, (err: Error, response: string) =>
                  ackknowledgementCallback(err, response),
                );
              return;
            } else {
              console.log(response);
              return;
            }
            return;
          }
          // since the move has been played in chess object we have get an opposite check, otherwise the move recieved will be throttled back
          if (chess.turn() !== NonStatePlaycolor)
            socket
              .timeout(5000)
              .emit("move", x.san, (err: Error, response: string) =>
                ackknowledgementCallback(err, response),
              );
          updatePGN(x, setParsedPGN);
          const pieceMovements = getPieceMovements(x);
          updateHistory(pieceMovements);
          FENHistory.push({
            fen: chess.fen(),
            isDnD: isDnD,
            pieceMovements: pieceMovements,
          });
          currentUIPosition += 1;
          // animatePieceMovement(x);
          // console.log(x);
          if (
            handleGameOver(
              setParsedPGN,
              x,
              isDnD,
              playColor,
              setFen,
              gameEndResult,
              gameEndTitle,
              setGameEnded,
              setSoundTrigger,
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
          }); // Not using animated transition as it's drag and drop
        }
      },
    });
  }, []);
}

function useParsedPGNView(parsedPGN: ParseTree[], ScrollToBottom: Function) {
  useEffect(() => {
    ScrollToBottom();
  }, [parsedPGN]);
}

/*  Variables relating to socket chess and online play */
function useSocket(
  setIsBanned: Dispatch<SetStateAction<boolean>>,
  setBannedTimer: Dispatch<SetStateAction<number>>,
  setOpponentLeftTheGame: Dispatch<SetStateAction<boolean>>,
  setIsDisconnectedFromGame: Dispatch<SetStateAction<boolean>>,
  setOpponentMove: Dispatch<SetStateAction<string>>,
  setFindingRoom: Dispatch<SetStateAction<boolean>>,
  setIsConnected: Dispatch<SetStateAction<boolean>>,
  setTransport: Dispatch<SetStateAction<string>>,
  setPlayColor: Dispatch<SetStateAction<Color>>,
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setRematchD: Dispatch<SetStateAction<boolean>>,
) {
  const { toast } = useToast();
  const { data: session } = useSession();
  useEffect(() => {
    async function authSetter() {
      if (session && session.user && session.user.email && session.user.name) {
        console.log("inside the important stuff");
        console.log(session.user.email);
        socket.auth = {
          username: session.user.email,
        };
      }
      console.log("just before connectin");
      console.log(socket.auth);
      socket.connect();
    }
    authSetter();
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);

    socket.on("disconnect", onDisconnect);

    socket.on("gamecolor", (color: Color) => {
      setPlayColor(color);
      NonStatePlaycolor = color;
    });

    socket.on("startgame", () =>
      handleGameStartingForSocket(setParsedPGN, setFindingRoom, setRematchD),
    );

    socket.on("move", async (chessMove: string, callback: Function) =>
      handleOpponentMoveForSocket(chessMove, callback, setOpponentMove, setFen),
    );

    socket.on(
      "reconciliation",
      (historyX: string[], colorHeld: Color, callback: Function) =>
        handleReconciliationForSocket(
          colorHeld,
          historyX,
          setFindingRoom,
          callback,
          setParsedPGN,
          setFen,
          setSoundTrigger,
          setGameEnded,
          setPlayColor,
        ),
    );

    socket.on("resigned", (opponentColor: Color) =>
      handleOpponentResignationForSocket(
        setParsedPGN,
        opponentColor,
        setGameEnded,
        setSoundTrigger,
      ),
    );

    socket.on("rematchconfirmed", () =>
      handleRematchForSocket(setParsedPGN, setFen, setGameEnded, setRematchD),
    );

    socket.on("playeroptednewgame", () => {
      toast({
        title: "Opponent left the room",
        description:
          "the opponent player left the room and opted for a new game",
      });
      setRematchD(true);
    });

    socket.on("opponentdisconnected", () => {
      setIsDisconnectedFromGame(true);
    });

    socket.on("opponentreconnected", () => {
      setIsDisconnectedFromGame(false);
    });

    socket.on("opponentleftgame", () => {
      console.log("recieved the event opponentleftgame");
      setIsDisconnectedFromGame(true);
      setOpponentLeftTheGame(true);
    });

    socket.on("banned", (time: number) => {
      setIsBanned(true);
      setBannedTimer(time);
    });

    socket.on("banlifted", () => {
      setIsBanned(false);
    });

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);
}
/*  Variables relating to socket chess and online play */

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
  const [opponentMove, setOpponentMove] = useState<string>("");
  // const workerRef = useRef<Worker>(null);
  // const TheOpponentEngine = useAppSelector(getEngine);
  const [parsedPGN, setParsedPGN] = useState<ParseTree[]>([]);
  const parsedPGNRef = useRef<null | HTMLDivElement>(null);

  /*  Variables relating to socket chess and online play */
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [findingRoom, setFindingRoom] = useState(true);
  const [rematchD, setRematchD] = useState(false);
  const [isDisconnected, setIsDisconnectedFromGame] = useState(false);
  const [opponentLeftTheGame, setOpponentLeftTheGame] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [bannedTimer, setBannedTimer] = useState(900);
  /*  Variables relating to socket chess and online play */

  console.log("page rendering");
  chess.load(fen.fen);

  if (HistoryArray.length === 0) {
    initializeHistory();
  }

  const ScrollToBottom = () => {
    parsedPGNRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // custom hook calls

  /*  Variables relating to socket chess and online play */
  useSocket(
    setIsBanned,
    setBannedTimer,
    setOpponentLeftTheGame,
    setIsDisconnectedFromGame,
    setOpponentMove,
    setFindingRoom,
    setIsConnected,
    setTransport,
    setPlayColor,
    setParsedPGN,
    setFen,
    setSoundTrigger,
    setGameEnded,
    setRematchD,
  );
  /*  Variables relating to socket chess and online play */

  useParsedPGNView(parsedPGN, ScrollToBottom);

  useLatestOpponentResponse(
    setParsedPGN,
    false, // Opponent always use animation, that is, no one drags and drop functionality, i.e., false
    playColor,
    setFen,
    gameEndResult,
    gameEndTitle,
    setGameEnded,
    setSoundTrigger,
    opponentMove,
  );

  // useEngine(workerRef);

  // useUpdateBoardFEN(playColor, fen, TheOpponentEngine, openSettings);

  useSound(soundTrigger, setSoundTrigger);

  useClickAndMove(
    setParsedPGN,
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
  );

  useOnPieceDrop(
    setParsedPGN,
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
  );

  const chessBoardArray = RenderSquare(fen, playColor, setClickAndMoveTrigger);

  return isBanned ? (
    <BannedPage BannedTimer={bannedTimer} />
  ) : findingRoom ? (
    <div className="w-full h-full flex flex-col justify-center ">
      <div className="w-full flex justify-center">
        <LoadingSpinner width="80px" height="80px" />
      </div>
      <div className="w-full flex justify-center font-bold text-xl mt-5">
        Finding opponent, please wait ...
      </div>
    </div>
  ) : (
    <div className="w-full h-full flex flex-col justify-center">
      {/* Experimental Feature */}
      <div className="flex w-full justify-center">
        <div className="text-3xl mt-5">
          isConnected : {isConnected ? "connected" : "disconnected"}
        </div>
        <div className="text-3xl mt-5">Transport : {transport}</div>
      </div>
      {/* Experimental Feature */}

      <div className="flex w-full justify-center">
        <div className="aspect-square w-2/5 grid grid-rows-8 grid-cols-8">
          <GameEndDialogue
            setOpponentLeftTheGame={setOpponentLeftTheGame}
            setIsDisconnectedFromGame={setIsDisconnectedFromGame}
            setParsedPGN={setParsedPGN}
            gameEnded={gameEnded}
            setFen={setFen}
            originalFEN={originalFEN}
            setOpenSettings={setOpenSettings}
            setGameEnded={setGameEnded}
            setFindingRoom={setFindingRoom}
            rematchD={rematchD}
            setRematchD={setRematchD}
          />

          {isDisconnected ? (
            <DisconnectionDialogue
              setOpponentLeftTheGame={setOpponentLeftTheGame}
              setIsDisconnectedFromGame={setIsDisconnectedFromGame}
              isDisconnected={isDisconnected}
              opponentLeftTheGame={opponentLeftTheGame}
              setFindingRoom={setFindingRoom}
              setParsedPGN={setParsedPGN}
              setFen={setFen}
              setGameEnded={setGameEnded}
            />
          ) : null}

          {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map((elem) => elem)
            : null}

          {openDrawer ? (
            <PromotionDrawer
              setParsedPGN={setParsedPGN}
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
            />
          ) : null}
        </div>

        <PGNTable
          parsedPGN={parsedPGN}
          parsedPGNRef={parsedPGNRef}
          setFen={setFen}
          gameEnded={gameEnded}
          setParsedPGN={setParsedPGN}
          playColor={playColor}
          setGameEnded={setGameEnded}
          setSoundTrigger={setSoundTrigger}
        />

        <Toaster />
      </div>
    </div>
  );
}

function BannedPage({ BannedTimer }: { BannedTimer: number }) {
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="w-full flex justify-center">
        <div className="text-3xl font-bold flex flex-col justify-center mx-12">
          You Are Banned For ...{" "}
        </div>
        <CountdownCircleTimer
          isPlaying
          size={500}
          duration={BannedTimer}
          strokeWidth={10}
          colors="#004777"
        >
          {({ remainingTime }) => {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            return (
              <div role="timer" aria-live="assertive" className="font-mono">
                {minutes}:{seconds}
              </div>
            );
          }}
        </CountdownCircleTimer>
      </div>
    </div>
  );
}

function DisconnectionDialogue({
  setOpponentLeftTheGame,
  setIsDisconnectedFromGame,
  isDisconnected,
  opponentLeftTheGame,
  setFindingRoom,
  setParsedPGN,
  setFen,
  setGameEnded,
}: {
  setOpponentLeftTheGame: Dispatch<SetStateAction<boolean>>;
  setIsDisconnectedFromGame: Dispatch<SetStateAction<boolean>>;
  isDisconnected: boolean;
  opponentLeftTheGame: boolean;
  setFindingRoom: Dispatch<SetStateAction<boolean>>;
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>;
  setFen: Dispatch<SetStateAction<FenObject>>;
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>;
}) {
  return (
    <Dialog open={isDisconnected} modal={true}>
      <DialogContent>
        <DialogHeader>
          {opponentLeftTheGame ? (
            <DialogTitle>Opponent Left The Game</DialogTitle>
          ) : (
            <DialogTitle>
              <LoadingSpinner width="80px" height="80px" />
            </DialogTitle>
          )}
          {opponentLeftTheGame ? (
            <DialogDescription className="flex justify-center pt-3">
              <Button
                variant={"default"}
                className="flex justify-center mx-2 text-xl w-56"
                onClick={() => {
                  socket.emit("gameleave");
                }}
              >
                <Link href={"/dashboard"}> Return to dashboard </Link>{" "}
              </Button>
              <Button
                variant={"default"}
                className="flex justify-center mx-2 text-xl w-56"
                onClick={() => {
                  socket.emit("newgame");
                  setFindingRoom(true);
                  handleResetBoardForSocket(
                    setParsedPGN,
                    setFen,
                    setGameEnded,
                    setIsDisconnectedFromGame,
                    setOpponentLeftTheGame,
                  );
                }}
              >
                New Game
              </Button>
            </DialogDescription>
          ) : (
            <DialogDescription>
              Opponent is disconnected, trying to reconnect ...
            </DialogDescription>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function PGNTable({
  parsedPGN,
  parsedPGNRef,
  setFen,
  gameEnded,
  setParsedPGN,
  playColor,
  setGameEnded,
  setSoundTrigger,
}: {
  parsedPGN: ParseTree[];
  parsedPGNRef: RefObject<HTMLDivElement | null>;
  setFen: Dispatch<SetStateAction<FenObject>>;
  gameEnded: gameEndObject;
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>;
  playColor: Color;
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>;
  setSoundTrigger: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="w-1/5 h-[480px] border rouned-md bg-slate-300 flex flex-col mx-5">
      <div className="bg-slate-500 w-full h-16 flex justify-center">
        <div className="text-2xl font-mono flex flex-col justify-center">
          <div>PGN Table</div>
        </div>
      </div>
      <div className="w-full h-full overflow-scroll bg-slate-600 relative">
        <div className="grid grid-cols-7 auto-rows-[50px] grid-flow-row h-full text-white">
          {parsedPGN && parsedPGN.length
            ? parsedPGN[0].moves.map((obj, id) => {
                return obj.turn === "w" ? (
                  <div
                    key={id}
                    className="col-span-4 grid grid-cols-4 grid-rows-1"
                  >
                    <div className="col-span-1 bg-slate-700 w-full flex justify-center">
                      <div
                        className="h-full flex flex-col justify-center"
                        ref={
                          obj.moveNumber ===
                          parsedPGN[0].moves[parsedPGN[0].moves.length - 1]
                            .moveNumber
                            ? parsedPGNRef
                            : null
                        }
                      >
                        {obj.moveNumber}
                      </div>
                    </div>
                    <div
                      className="col-span-3 w-full flex justify-center cursor-pointer"
                      onClick={() =>
                        arbitraryTimeTravel(obj.moveNumber, obj.turn, setFen)
                      }
                    >
                      <div className="h-full flex flex-col justify-center">
                        {obj.notation.notation}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={id}
                    className="col-span-3 w-full flex justify-center cursor-pointer"
                    onClick={() =>
                      arbitraryTimeTravel(obj.moveNumber, obj.turn, setFen)
                    }
                  >
                    <div className="h-full flex flex-col justify-center">
                      {obj.notation.notation}
                    </div>
                  </div>
                );
              })
            : null}
          {gameEnded.gameEnded ? (
            <div className="col-span-7 text-3xl w-full flex justify-center text-white">
              <div>{gameEnded.gameEndResult}</div>
            </div>
          ) : null}
        </div>
        {/* <div ref={parsedPGNRef} className="w-full bg-slate-600 absolute bottom-0">hello</div> */}
      </div>
      <div className="bg-slate-500 w-full h-20 flex justify-around">
        <div className="h-full w-1/3 flex flex-col justify-center p-2">
          <Button
            variant="outline"
            className="bg-slate-600 border-slate-600 hover:bg-slate-600 hover:text-white h-full"
            onClick={() => moveBackward(setFen)}
          >
            <ChevronLeft />
          </Button>
        </div>
        <div className="h-full w-1/3 flex flex-col justify-center p-2">
          <Button
            variant="outline"
            className="bg-slate-600 border-slate-600 hover:bg-slate-600 hover:text-white h-full"
            onClick={() => moveForward(setFen)}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="h-full w-1/3 flex flex-col justify-center p-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-slate-600 border-slate-600 hover:bg-slate-600 hover:text-white h-full"
              >
                <Flag />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className=" text-xl flex justify-center">
                Are you sure you want to resign ?
              </div>
              <div className="w-full flex justify-center text-xl">
                <Button
                  variant={"destructive"}
                  className="w-full mt-2"
                  onClick={() =>
                    handleResignation(
                      setParsedPGN,
                      playColor,
                      setGameEnded,
                      setSoundTrigger,
                    )
                  }
                  disabled={
                    playColor === chess.turn() &&
                    currentUIPosition === FENHistory.length - 1
                      ? false
                      : true
                  }
                >
                  Yes
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

function GameEndDialogue({
  setOpponentLeftTheGame,
  setIsDisconnectedFromGame,
  setParsedPGN,
  gameEnded,
  setFen,
  originalFEN,
  setOpenSettings,
  setGameEnded,
  setFindingRoom,
  rematchD,
  setRematchD,
}: {
  setOpponentLeftTheGame: Dispatch<SetStateAction<boolean>>;
  setIsDisconnectedFromGame: Dispatch<SetStateAction<boolean>>;
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>;
  gameEnded: gameEndObject;
  setFen: Dispatch<SetStateAction<FenObject>>;
  originalFEN: string;
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>;
  setFindingRoom: Dispatch<SetStateAction<boolean>>;
  rematchD: boolean;
  setRematchD: Dispatch<SetStateAction<boolean>>;
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
              onClick={() => {
                socket.emit("gameleave");
              }}
            >
              <Link href={"/dashboard"}> Return to dashboard </Link>{" "}
            </Button>
            <Button
              variant={"default"}
              className="flex justify-center mx-2 text-xl w-56"
              disabled={rematchD}
              onClick={() => {
                socket.emit("rematch");
                setRematchD(true);
              }}
            >
              Rematch
            </Button>
          </DialogDescription>
          <DialogDescription className="flex justify-center pt-3">
            <Button
              variant={"default"}
              className="flex justify-center mx-2 text-xl w-full"
              onClick={() => {
                socket.emit("newgame");
                setFindingRoom(true);
                handleResetBoardForSocket(
                  setParsedPGN,
                  setFen,
                  setGameEnded,
                  setIsDisconnectedFromGame,
                  setOpponentLeftTheGame,
                );
              }}
            >
              New Game
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function PromotionDrawer({
  setParsedPGN,
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
}: {
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>;
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
                setParsedPGN,
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
                setParsedPGN,
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
                setParsedPGN,
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
                setParsedPGN,
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
              )
            }
          />
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
}

function SettingComponent({
  setParsedPGN,
  openSettings,
  playColor,
  setPlayColor,
  setOpenSettings,
  originalFEN,
}: {
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>;
  openSettings: boolean;
  playColor: Color;
  setPlayColor: Dispatch<SetStateAction<Color>>;
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
  originalFEN: string;
}) {}

///////////////////////////

// function OldBook({
//   isConnected,
//   transport,
//   move,
//   setMove,
//   recievedMoves,
//   handleSubmit,
//   handleRematch,
//   handleNewGame,
// }: {
//   isConnected: boolean;
//   transport: string;
//   move: string;
//   setMove: Dispatch<SetStateAction<string>>;
//   recievedMoves: string[];
//   handleSubmit: (event: any) => void;
//   handleRematch: Function;
//   handleNewGame: Function;
// }) {
//   return (
//     <div className="w-full h-full flex flex-col justify-center bg-[#FFFEFC] text-[#323014]">
//       <div className="w-full flex justify-center">
//         <div className="flex-col justify-center">
//           <div className="text-3xl">Opponent player page</div>
//           <div className="text-3xl mt-5">
//             isConnected : {isConnected ? "connected" : "disconnected"}
//           </div>
//           <div className="text-3xl mt-5">Transport : {transport}</div>
//           <form onSubmit={handleSubmit}>
//             <label>
//               Enter your name:
//               <input
//                 type="text"
//                 value={move}
//                 onChange={(e) => setMove(e.target.value)}
//               />
//             </label>
//             <input type="submit" />
//           </form>
//         </div>
//         <div className="text-3xl mt-5">
//           <ul>
//             {recievedMoves && recievedMoves.length
//               ? recievedMoves.map((obj, idx) => <li key={idx}>{obj}</li>)
//               : null}
//           </ul>
//         </div>
//         <button onClick={() => handleRematch()}>rematch</button>
//         <button onClick={() => handleNewGame()}>New Game</button>
//       </div>
//     </div>
//   );
// }

// <OldBook
//   isConnected={isConnected}
//   transport={transport}
//   move={move}
//   setMove={setMove}
//   recievedMoves={recievedMoves}
//   handleSubmit={handleSubmit}
//   handleRematch={handleRematch}
//   handleNewGame={handleNewGame}
// />

// <SettingComponent
//   setParsedPGN={setParsedPGN}
//   openSettings={openSettings}
//   playColor={playColor}
//   setPlayColor={setPlayColor}
//   setOpenSettings={setOpenSettings}
//   originalFEN={originalFEN}
// />
//
export function Paged() {}
