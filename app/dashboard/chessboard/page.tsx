"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */

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
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getEngineState, setReady } from "@/lib/features/engine/engineSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getLatestResponse,
  pushResponse,
} from "@/lib/features/engine/outputArraySlice";
import { parse, ParseTree } from "@mliebelt/pgn-parser";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TheParentPGN } from "@/app/engineAndPGN";
import { EngineX } from "@/app/engineAndPGN";
import isAuth from "@/components/auth_HOC";
import { Session } from "next-auth";
const chess = new Chess();
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
let blueDotArrayClearIntimator: boolean = false;
function applyInitialSettings(elo: string) {
  const skill_level = (Number(elo) - 1350) / 80;
  const skill_string = skill_level.toString();
  if (EngineX.stockfishEngine === null)
    throw new Error("stockfishEngine of EngineX is null");
  EngineX.stockfishEngine.postMessage("ucinewgame");
  EngineX.stockfishEngine.postMessage("setoption name Threads value 2"); // setting option
  EngineX.stockfishEngine.postMessage("setoption name Hash value 64"); // setting option
  EngineX.stockfishEngine.postMessage("setoption name MultiPV value 1"); // setting option
  EngineX.stockfishEngine.postMessage(
    `setoption name Skill Level value ${skill_string}`,
  ); // setting option
  EngineX.stockfishEngine.postMessage("isready");
}

function moveForward(setFen: Dispatch<SetStateAction<FenObject>>) {
  if (currentUIPosition === FENHistory.length - 1) return;
  else {
    blueDotArrayClearIntimator = true;
    setFen(FENHistory[currentUIPosition + 1]);
    currentUIPosition += 1;
  }
}

function moveBackward(setFen: Dispatch<SetStateAction<FenObject>>) {
  if (currentUIPosition === 0) return;
  else {
    blueDotArrayClearIntimator = true;
    setFen(FENHistory[currentUIPosition - 1]);
    currentUIPosition -= 1;
  }
}

function arbitraryTimeTravel(
  moveNumber: number,
  turn: string,
  setFen: Dispatch<SetStateAction<FenObject>>,
) {
  blueDotArrayClearIntimator = true;
  setFen(FENHistory[moveNumber * 2 - (turn === "w" ? 1 : 0)]);
  currentUIPosition = moveNumber * 2 - (turn === "w" ? 1 : 0);
}

function getBestMove(fen: string) {
  if (EngineX.stockfishEngine === null)
    throw new Error("stockfishEngine of EngineX is null");
  EngineX.stockfishEngine.postMessage(`position fen ${fen}`);
  EngineX.stockfishEngine.postMessage("go depth 15");
}

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
  onmessage: (e: MessageEvent) => void;
  postMessage: (s: any) => void;
  [key: string]: any;
};

type gameEndObject = {
  gameEndTitle: string;
  gameEndResult: string;
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

function updatePGN(
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
  // Type Checking Code ------>
  const isOfType = (z: any): z is ParseTree => "moves" in z;
  if (!isOfType(parsed)) throw new Error("parsed output is not of type");
  const x = [parsed];
  // <-------- Type Checking Code
  setParsedPGN(x);
}

async function animatePieceMovement(moveObj: Move) {
  const pieceMovements = getPieceMovements(moveObj);
  for (let i = 0; i < pieceMovements.length; i++) {
    const from = pieceMovements[i].from;
    const to = pieceMovements[i].to;
    const destSquare = document.getElementById(to);
    if (!destSquare) throw new Error("dest square is null");
    const destinaionRect = destSquare?.getBoundingClientRect();
    const MoveX = (destinaionRect.right + destinaionRect.left) / 2;
    const MoveY = (destinaionRect.top + destinaionRect.bottom) / 2;
    const parent = document.getElementById(from);
    const child = parent?.children[parent.children.length - 1] as HTMLElement; // Taking the last child, as it's always the last child which is the img object
    const destChild = destSquare.children as HTMLCollectionOf<HTMLElement>;
    const childRect = child.getBoundingClientRect();
    const transX = MoveX - (childRect.left + childRect.right) / 2;
    const transY = MoveY - (childRect.top + childRect.bottom) / 2;
    child.style.transition = "all 0.2s";
    child.style.transform = `translateY(${transY}px) translateX(${transX}px)`;
    child.style.zIndex = "20";
    for (let i = 0; i < destChild.length; i++) {
      if (destChild[i].nodeName === "IMG") {
        setTimeout(() => {
          //@ts-expect-error since node name is 'IMG' therefore this is an img tag, therefor will contain the src for sure
          destChild[i].src = "";
          //@ts-expect-error since node name is 'IMG' therefore this is an img tag, therefor will contain the src for sure
          destChild[i].alt = "";
        }, 100);
        break;
      }
    }
  }
}

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

function wasmThreadsSupported() {
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
    console.log(e);
    return false;
  }

  // Growable shared memory (optional)
  try {
    mem.grow(8);
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
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
  // Type Checking Code ------>
  const isOfType = (z: any): z is ParseTree => "moves" in z;
  if (!isOfType(parsed)) throw new Error("parsed output is not of type");
  const x = [parsed];
  // <-------- Type Checking Code
  setParsedPGN(x);

  // setFen({ fen: chess.fen(), isDnD: isDnD, pieceMovements: pieceMovements });
  if (EngineX.stockfishEngine === null)
    throw new Error("stockfish engine of EngineX is null");
  EngineX.stockfishEngine.postMessage("ucinewgame");
  EngineX.stockfishEngine.postMessage("isready");
  setGameEnded({
    gameEnded: true,
    gameEndResult: playColor === "w" ? "0 - 1" : "1 - 0",
    gameEndTitle: "Better luck next time",
  });
  setSoundTrigger("/sounds/game-end.mp3");
  return;
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
    const elm = ref.current;
    invariant(elm);
    return dropTargetForElements({
      element: elm,
      getData: () => ({ cord, validMovesArray }),
      canDrop: () =>
        validMovesArray.find((obj) => obj.square === cord) !== undefined,
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
        ? "border-2 border-gray-500 bg-[#b58863] text-[#f0d9b5]"
        : "border-2 border-gray-500 bg-[#f0d9b5] text-[#b58863]";
    }
    return isDark
      ? "bg-[#b58863] text-[#eeeed2]"
      : "bg-[#f0d9b5] text-[#b58863]";
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
}: {
  chessBoardIJ: positionObject;
  blueDotFunc: (a: Square, b: boolean) => void;
}) {
  const ref = useRef(null);
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
      className="w-10/12 h-10/12 absolute 2xl:left-[8%] max-2xl:left-[9%] bottom-[3%] z-10"
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
  if (blueDotArrayClearIntimator) {
    setBlueDotArray([]);
    blueDotArrayClearIntimator = false;
  }
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
  for (let i = 0; i < chessBoard.length; i++) {
    for (let j = 0; j < chessBoard[i].length; j++) {
      const chessBoardIJ = chessBoard[i][j];
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
              <div className="absolute -top-[1px] left-1 z-10 text-sm font-bold">
                {color === "w" ? 1 : 8}
              </div>
              <div className="z-10 absolute bottom-[3%] right-[5%] text-sm font-bold">
                {color === "w" ? "a" : "h"}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute bottom-[33%] left-[42%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-3 max-2xl:h-3"></div>
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
              <div className="z-10 absolute -top-[1px] left-1 text-sm font-bold">
                {color === "w" ? 8 - i : i + 1}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute bottom-[33%] left-[42%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-3 max-2xl:h-3"></div>
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
              <div className="z-10 absolute bottom-[3%] right-[5%] text-sm font-bold">
                {color === "w"
                  ? String.fromCharCode(j + 97)
                  : String.fromCharCode(96 + 8 - j)}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute bottom-[33%] left-[42%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-3 max-2xl:h-3"></div>
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
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute bottom-[33%] left-[42%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-3 max-2xl:h-3"></div>
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
              <div className="absolute -top-[1px] left-1 z-10 text-sm font-bold">
                {color === "w" ? 1 : 8}
              </div>
              <div className="z-10 absolute bottom-[3%] right-[5%] text-sm font-bold">
                {color === "w" ? "a" : "h"}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute bottom-[33%] left-[42%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-3 max-2xl:h-3"></div>
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
              <div className="z-10 absolute -top-[1px] left-1 text-sm font-bold">
                {color === "w" ? 8 - i : i + 1}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute bottom-[33%] left-[42%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-3 max-2xl:h-3"></div>
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
              <div className="z-10 absolute bottom-[3%] right-[5%] text-sm font-bold">
                {color === "w"
                  ? String.fromCharCode(j + 97)
                  : String.fromCharCode(96 + 8 - j)}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute bottom-[33%] left-[42%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-3 max-2xl:h-3"></div>
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
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color),
              ) ? (
                <div className="z-10 absolute bottom-[33%] left-[42%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-3 max-2xl:h-3"></div>
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
  setOpenSettings: Dispatch<SetStateAction<boolean>>,
  stockfishElo: number,
  playColor: Color,
  originalFEN: string,
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
  setOpenSettings(false);
  applyInitialSettings(stockfishElo.toString());
  if (playColor === "b") {
    getBestMove(originalFEN);
  }
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
  const gameOver = chess.isGameOver();
  if (!gameOver) return false;
  const pieceMovements: MoveLAN[] = getPieceMovements(moveObj);
  nextMoveObject.fen = chess.fen();
  nextMoveObject.isDnD = isDnD;
  nextMoveObject.pieceMovements = pieceMovements;
  setTimeout(() => FENCallback(setFen), 250);
  if (EngineX.stockfishEngine === null)
    throw new Error("stockfishEngine of EngineX is null");
  EngineX.stockfishEngine.postMessage("ucinewgame");
  EngineX.stockfishEngine.postMessage("isready");
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
    throw new Error("Failed promotion, some error occured");
  }
  const moveObj = chess.move(promotionMove.move);
  updatePGN(moveObj, setParsedPGN);
  const pieceMovements = getPieceMovements(moveObj);
  animatePieceMovement(moveObj);
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

function useLatestStockfishResponse(
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  isDnD: boolean,
  playColor: Color,
  setFen: Dispatch<SetStateAction<FenObject>>,
  gameEndResult: string,
  gameEndTitle: string,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
) {
  const latestStockfishResponse = useAppSelector(getLatestResponse);
  useEffect(() => {
    if (
      latestStockfishResponse &&
      latestStockfishResponse.split(" ")[0] === "bestmove"
    ) {
      const bestMove: string = latestStockfishResponse.split(" ")[1];
      if (currentUIPosition === FENHistory.length - 1) {
        triggerStockfishTrigger(
          setParsedPGN,
          isDnD,
          playColor,
          bestMove,
          setFen,
          gameEndResult,
          gameEndTitle,
          setGameEnded,
          setSoundTrigger,
        );
      }
    }
  }, [latestStockfishResponse]);
}

function useEngine(
  workerRef: RefObject<Worker | null>,
  setEngineOperable: Dispatch<SetStateAction<boolean>>,
) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!wasmThreadsSupported()) {
      setEngineOperable(false);
      return;
    }
    if (EngineX.stockfishEngine) {
      EngineX.stockfishEngine.addMessageListener((line: string) => {
        dispatch(pushResponse(line));
      });
      dispatch(setReady());
    } else {
      workerRef.current = new window.Worker("/lib/loadEngine.js");
      if (workerRef.current === null) throw new Error("worker is null");
      workerRef.current.onmessage = async (e) => {
        // @ts-expect-error Stockfish loaded from script present in /lib/stockfish.js and referenced in layout
        const x: StockfishEngine = await Stockfish(e.data);
        x.addMessageListener((line: string) => {
          dispatch(pushResponse(line));
        });
        EngineX.stockfishEngine = x;
        dispatch(setReady());
      };
      workerRef.current.onerror = (e) => {
        console.log(e);
        alert(
          "Error while initiating the Engine, please refresh and try again",
        );
      };
      workerRef.current.postMessage("start");
      return () => {
        workerRef.current?.terminate();
      };
    }
  }, []);
}

function useUpdateBoardFEN(
  playColor: Color,
  fen: FenObject,
  openSettings: boolean,
) {
  useEffect(() => {
    if (chess.turn() === (playColor === "w" ? "b" : "w")) {
      if (
        !chess.isGameOver() &&
        !openSettings &&
        FENHistory.length - 1 === currentUIPosition
      )
        getBestMove(fen.fen);
    } else {
      return;
    }
  }, [fen]);
}

function triggerStockfishTrigger(
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
    updatePGN(x, setParsedPGN);
    const pieceMovements = getPieceMovements(x);
    FENHistory.push({
      fen: chess.fen(),
      isDnD: isDnD,
      pieceMovements: pieceMovements,
    });
    currentUIPosition += 1;
    animatePieceMovement(x);
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
    setTimeout(() => FENCallback(setFen), 250);
    return;
  } else return;
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
      console.log(err);
      throw new Error("Error occurred in playing sound");
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
    if (clickAndMoveTrigger.length === 0) return;
    if (clickAndMoveTrigger.length === 4) {
      setPromotionArray(clickAndMoveTrigger);
      setOpenDrawer(true);
    } else {
      const move: string = clickAndMoveTrigger[0].move;
      const x = chess.move(move);
      updatePGN(x, setParsedPGN);
      const pieceMovements = getPieceMovements(x);
      FENHistory.push({
        fen: chess.fen(),
        isDnD: isDnD,
        pieceMovements: pieceMovements,
      });
      currentUIPosition += 1;
      animatePieceMovement(x);
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
      setTimeout(() => FENCallback(setFen), 250);
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
      onDrop({ location }) {
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
          updatePGN(x, setParsedPGN);
          const pieceMovements = getPieceMovements(x);
          FENHistory.push({
            fen: chess.fen(),
            isDnD: isDnD,
            pieceMovements: pieceMovements,
          });
          currentUIPosition += 1;
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

function useParsedPGNView(parsedPGN: ParseTree[], ScrollToBottom: () => void) {
  useEffect(() => {
    ScrollToBottom();
  }, [parsedPGN]);
}

function Page() {
  const gameEndResult = "";
  const gameEndTitle = "";
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
  const [parsedPGN, setParsedPGN] = useState<ParseTree[]>([]);
  const parsedPGNRef = useRef<null | HTMLDivElement>(null);
  const [engineOperable, setEngineOperable] = useState<boolean>(true);
  const { data: session } = useSession();

  chess.load(fen.fen);

  const ScrollToBottom = () => {
    parsedPGNRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // custom hook calls

  useParsedPGNView(parsedPGN, ScrollToBottom);

  useLatestStockfishResponse(
    setParsedPGN,
    false, // Stockfish always use animation, that is, no one drags and drop functionality, i.e., false
    playColor,
    setFen,
    gameEndResult,
    gameEndTitle,
    setGameEnded,
    setSoundTrigger,
  );

  useEngine(workerRef, setEngineOperable);

  useUpdateBoardFEN(playColor, fen, openSettings);

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

  return (
    <div className="w-full h-full flex flex-col justify-center bg-[#323014] py-2">
      <div className="flex w-full h-full justify-center">
        <PlayersInfo session={session} />
        <div className="aspect-square h-full grid grid-rows-8 grid-cols-8 border rounded-lg overflow-hidden">
          {engineOperable ? (
            <SettingComponent
              setParsedPGN={setParsedPGN}
              openSettings={openSettings}
              playColor={playColor}
              setPlayColor={setPlayColor}
              setOpenSettings={setOpenSettings}
              originalFEN={originalFEN}
            />
          ) : null}

          <WASMThreadsNotSupportedDialog engineOperable={engineOperable} />

          <GameEndDialogue
            setParsedPGN={setParsedPGN}
            gameEnded={gameEnded}
            setFen={setFen}
            originalFEN={originalFEN}
            setOpenSettings={setOpenSettings}
            setGameEnded={setGameEnded}
            playColor={playColor}
            session={session}
          />
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
      </div>
    </div>
  );
}

function PlayersInfo({ session }: { session: Session | null }) {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex text-[#b58863] font-bold text-xl mr-8 bg-[#f0d9b5] rounded-lg p-2">
        <Image
          src={"/images/stockfish.png"}
          width={67}
          height={67}
          alt="stokfish"
          className="border border-[#f0d9b5] rounded-lg mr-5"
        />
        Stockfish
      </div>
      <div className="flex bg-[#b58863] font-bold text-xl mr-8 text-[#f0d9b5] rounded-lg p-2">
        <Image
          src={"/knight_mirror.png"}
          width={60}
          height={60}
          alt="default avatar"
          className="border border-[#b58863] mr-5 rounded-lg"
        />
        {session && session.user && session.user.email
          ? session.user.email.split("@")[0]
          : "The Knight"}
      </div>
    </div>
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
    <div className="w-1/5 h-[480px] border rounded-lg bg-[#fffefc] flex flex-col mx-5 overflow-hidden border-[#323014]">
      <div className="bg-[#323014] h-16 flex justify-center rounded-lg m-2">
        <div className="text-3xl text-[#fffefc] flex flex-col justify-center">
          <div>PGN Table</div>
        </div>
      </div>
      <div className="w-full h-full overflow-scroll bg-[#fffefc] relative font-mono">
        <div className="grid grid-cols-7 auto-rows-[50px] grid-flow-row h-full text-[#323014]">
          {parsedPGN && parsedPGN.length
            ? parsedPGN[0].moves.map((obj, id) => {
                return obj.turn === "w" ? (
                  <div
                    key={id}
                    className="col-span-4 grid grid-cols-4 grid-rows-1"
                  >
                    <div className="col-span-1 bg-[#fffefc] w-full flex justify-center text-2xl">
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
                      className="col-span-3 w-full flex justify-center cursor-pointer hover:shadow-sm hover:shadow-[#323014] transition duration-100 rounded-lg text-2xl"
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
                    className="col-span-3 w-full flex justify-center cursor-pointer hover:shadow-sm hover:shadow-[#323014] transition duration-100 rounded-lg text-2xl"
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
            <div className="col-span-7 text-3xl w-full flex justify-center text-[#343014] mt-3">
              <div>{gameEnded.gameEndResult}</div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="bg-[#fffefc] w-full h-20 flex justify-around">
        <div className="h-full w-1/3 flex flex-col justify-center p-2">
          <div
            className="bg-[#323014] h-full rounded-lg cursor-pointer flex justify-center hover:bg-opacity-90 transition duration-100"
            onClick={() => moveBackward(setFen)}
          >
            <div className="flex flex-col justify-center h-full">
              <ChevronLeft className="text-[#fffefc]" size={25} />
            </div>
          </div>
        </div>
        <div className="h-full w-1/3 flex flex-col justify-center p-2">
          <div
            className="bg-[#323014] h-full rounded-lg cursor-pointer flex justify-center hover:bg-opacity-90 transition duration-100"
            onClick={() => moveForward(setFen)}
          >
            <div className="flex flex-col justify-center h-full">
              <ChevronRight className="text-[#fffefc]" size={25} />
            </div>
          </div>
        </div>
        <div className="h-full w-1/3 flex flex-col justify-center p-2">
          <Popover>
            <PopoverTrigger asChild>
              <div className="bg-[#323014] h-full rounded-lg cursor-pointer flex justify-center hover:bg-opacity-90 transition duration-100">
                <div className="flex flex-col justify-center">
                  <Flag className="text-[#fffefc]" size={25} />
                </div>
              </div>
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
                    !(
                      playColor === chess.turn() &&
                      currentUIPosition === FENHistory.length - 1
                    )
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

function WASMThreadsNotSupportedDialog({
  engineOperable,
}: {
  engineOperable: boolean;
}) {
  if (!engineOperable)
    setTimeout(() => {
      redirect("/dashboard");
    }, 5000);
  return (
    <Dialog open={!engineOperable} modal={true}>
      <DialogContent className="flex flex-col justify-center">
        <DialogHeader>
          <DialogTitle className="text-3xl flex justify-center text-[#323014]">
            Borwser not supported
          </DialogTitle>
          <DialogDescription className="text-xl flex justify-center">
            Please update or switch your browser to continue.
          </DialogDescription>
          <DialogDescription className="text-xl flex justify-center">
            redirecting back to dashboard ...
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function GameEndDialogue({
  setParsedPGN,
  gameEnded,
  setFen,
  originalFEN,
  setOpenSettings,
  setGameEnded,
  playColor,
  session,
}: {
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>;
  gameEnded: gameEndObject;
  setFen: Dispatch<SetStateAction<FenObject>>;
  originalFEN: string;
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>;
  playColor: Color;
  session: Session | null;
}) {
  return (
    <Dialog open={gameEnded.gameEnded} modal={true}>
      <DialogContent className="flex flex-col justify-center">
        <DialogHeader>
          <DialogTitle className="text-3xl flex justify-center text-[#323014]">
            {gameEnded.gameEndTitle}
          </DialogTitle>
          <DialogDescription className="text-5xl flex justify-center">
            {gameEnded.gameEndResult}
          </DialogDescription>
          <div className="flex justify-center pt-3">
            <div className="flex justify-center mx-2 text-xl w-56 bg-[#323014] text-[#fffefc] hover:bg-opacity-90 transition duration-150 py-1 rounded-lg cursor-pointer">
              <div className="flex flex-col justify-center h-full">
                <Link href={"/dashboard"}> Return to dashboard </Link>{" "}
              </div>
            </div>
            <div
              className="flex justify-center mx-2 text-xl w-56 bg-[#323014] text-[#fffefc] hover:bg-opacity-90 transition duration-150 py-1 rounded-lg cursor-pointer"
              onClick={() => {
                TheParentPGN.PGN = PGN.pgn;
                TheParentPGN.stockfishGame = true;
                TheParentPGN.white =
                  playColor === "w" &&
                  session &&
                  session.user &&
                  session.user.email
                    ? session.user.email
                    : "Stockfisha5b6-c1e9@topchessengine.com";
                TheParentPGN.black =
                  playColor === "b" &&
                  session &&
                  session.user &&
                  session.user.email
                    ? session.user.email
                    : "Stockfisha5b6-c1e9@topchessengine.com";
                redirect("/dashboard/reviewgame");
              }}
            >
              <div className="flex flex-col justify-center h-full">
                Review game
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-3">
            <div
              className="flex justify-center mx-2 text-xl w-full bg-[#323014] text-[#fffefc] hover:bg-opacity-90 transition duration-150 py-1 rounded-lg cursor-pointer"
              onClick={() =>
                setNewGame(
                  setParsedPGN,
                  setFen,
                  originalFEN,
                  setOpenSettings,
                  setGameEnded,
                )
              }
            >
              <div className="flex flex-col justify-center h-full">
                New Game
              </div>
            </div>
          </div>
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
        <DrawerTitle className="flex justify-center text-3xl mb-5 text-[#323014]">
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
}) {
  const [stockfishElo, setStockfishElo] = useState<number>(1350);
  return (
    <Drawer
      open={openSettings}
      modal={true}
      dismissible={false}
      direction="left"
    >
      <DrawerContent className="w-[500px] h-full rounded-lg text-[#323014] bg-[#fffefc]">
        <DrawerTitle className="flex justify-center text-5xl mb-16">
          Settings
        </DrawerTitle>
        <DrawerTitle className="flex justify-center text-3xl mb-2">
          Play as : {playColor === "w" ? "White" : "Black"}
        </DrawerTitle>
        <div className="flex justify-center mt-2 mb-5">
          <div
            className="bg-[#323014] text-xl text-[#fffefc] hover:bg-[#323014] hover:bg-opacity-90 px-5 py-1 mx-2 rounded-md cursor-pointer flex justify-center transition duration-150"
            onClick={() => setPlayColor("w")}
          >
            <div className="flex flex-col justify-center h-full">White</div>
          </div>
          <div
            className="bg-[#323014] text-xl text-[#fffefc] hover:bg-[#323014] hover:bg-opacity-90 px-5 py-1 mx-2 rounded-md cursor-pointer flex justify-center transition duration-150"
            onClick={() => setPlayColor("b")}
          >
            <div className="flex flex-col justify-center h-full">Black</div>
          </div>
          <div
            className="bg-[#323014] text-xl text-[#fffefc] hover:bg-[#323014] hover:bg-opacity-90 px-5 py-1 mx-2 rounded-md cursor-pointer flex justify-center transition duration-150"
            onClick={() => {
              return Math.round(Math.random()) === 1
                ? setPlayColor("b")
                : setPlayColor("w");
            }}
          >
            <div className="flex flex-col justify-center h-full">Random</div>
          </div>
        </div>
        <DrawerDescription className="flex justify-center font-bold text-3xl mb-3 text-[#323014] mt-12">
          Stockfish Elo : {stockfishElo}
        </DrawerDescription>
        <DrawerDescription className="flex justify-center font-bold text-xl px-10 mb-5">
          <Slider
            defaultValue={[stockfishElo]}
            max={2870}
            min={1350}
            step={80}
            onValueChange={(value) => setStockfishElo(value[0])}
            color="#323014"
          />
        </DrawerDescription>
        <div className="flex flex-col justify-end py-12 w-full px-12 h-full">
          <Button
            className="w-full bg-[#323014] text-[#fffefc] text-xl"
            variant={"default"}
            onClick={() =>
              startTheGame(
                setParsedPGN,
                setOpenSettings,
                stockfishElo,
                playColor,
                originalFEN,
              )
            }
            disabled={useAppSelector(getEngineState) !== "ready"}
          >
            Apply and Play
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default isAuth(Page);
