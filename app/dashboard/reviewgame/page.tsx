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
import { ChevronLeft, ChevronRight, Flag, RefreshCw } from "lucide-react";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { setReady } from "@/lib/features/engine/engineSlice";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { TheParentPGN } from "@/app/engineAndPGN";
import { useSession } from "next-auth/react";
import isAuth from "@/components/auth_HOC";
/*  Variables relating to socket chess and online play */
let storeCallback: Function;
let reconciliation = false;
let stockfishColor: Color = "w";
let NonStatePlaycolor: Color = "w"; // Created, as in useEffect with zero
let blueDotArrayClearIntimator: boolean = false;
// dependency array, state variables that
// are set afterward the first render, doesn't
// get reflected, at those places, this variable
// can be used
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
const gameInitials: gameEst = { white: "", black: "", stockfishGame: false };
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

export type gameEst = {
  white: string;
  black: string;
  stockfishGame: boolean;
};

export type parentPGN = {
  PGN: string;
  white: string;
  black: string;
  stockfishGame: boolean;
};

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
        ? "border-2 border-gray-500 bg-[#b58863] text-[#f0d9b5]"
        : "border-2 border-gray-500 bg-[#f0d9b5] text-[#b58863]";
    }
    return isDark
      ? "bg-[#b58863] text-[#f0d9b5]"
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
  function setBlueDotArrayFunc(square: Square, toBeCleared: boolean) {}
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
                  isDnD={fen.isDnD}
                  id={pieceId}
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
                  isDnD={fen.isDnD}
                  id={pieceId}
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
                  isDnD={fen.isDnD}
                  id={pieceId}
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
                  isDnD={fen.isDnD}
                  id={pieceId}
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
                  isDnD={fen.isDnD}
                  id={pieceId}
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
                  isDnD={fen.isDnD}
                  id={pieceId}
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
                  isDnD={fen.isDnD}
                  id={pieceId}
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
                  isDnD={fen.isDnD}
                  id={pieceId}
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

function reinitialiseNullMoveNums(parsedPGN: ParseTree[]) {
  let histtoricMoveNum = 1;
  for (let i = 0; i < parsedPGN[0].moves.length; i++) {
    if (parsedPGN[0].moves[i].moveNumber === null) {
      parsedPGN[0].moves[i].moveNumber = histtoricMoveNum;
    } else {
      histtoricMoveNum = parsedPGN[0].moves[i].moveNumber;
    }
  }
}

function useParsedPGNView(parsedPGN: ParseTree[], ScrollToBottom: Function) {
  useEffect(() => {
    ScrollToBottom();
  }, [parsedPGN]);
}

export function Page() {
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
  const [playColor, setPlayColor] = useState<Color>("w");
  const [loading, setLoading] = useState(true);
  // const workerRef = useRef<Worker>(null);
  // const TheOpponentEngine = useAppSelector(getEngine);
  const [parsedPGN, setParsedPGN] = useState<ParseTree[]>([]);
  const parsedPGNRef = useRef<null | HTMLDivElement>(null);

  console.log("page rendering");

  chess.load(DEFAULT_POSITION);

  const ScrollToBottom = () => {
    parsedPGNRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // custom hook calls

  useEffect(() => {
    if (chess.fen() === DEFAULT_POSITION) {
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
      gameInitials.black = TheParentPGN.black;
      gameInitials.white = TheParentPGN.white;
      gameInitials.stockfishGame = TheParentPGN.stockfishGame;
      if (gameInitials.stockfishGame) {
        if (gameInitials.white.split("@")[0] === "Stockfisha5b6-c1e9")
          stockfishColor = "w";
        else stockfishColor = "b";
      }
      const OG: string = TheParentPGN.PGN;
      const parsed = parse(OG, { startRule: "game" });
      console.log(parsed);
      // Type Checking Code ------>
      const isOfType = (z: any): z is ParseTree => "moves" in z;
      if (!isOfType(parsed)) throw new Error("parsed output is not of type");
      const x = [parsed];
      // <-------- Type Checking Code
      reinitialiseNullMoveNums(x);
      setParsedPGN(x);
      PGN.moveNumber = x[0].moves.length;
      PGN.pgn = OG;
      NonStatePlaycolor = "w";
      const parsedPGNMoves = x[0].moves;
      for (let i = 0; i < parsedPGNMoves.length; i++) {
        const san = parsedPGNMoves[i].notation.notation;
        // console.log(chess.fen());
        // console.log(chess.ascii());
        console.log(san + " | " + i);
        const moveObj = chess.move(san);
        // updatePGN(moveObj, setParsedPGN);
        const pieceMovements = getPieceMovements(moveObj);
        FENHistory.push({
          fen: chess.fen(),
          isDnD: false,
          pieceMovements: pieceMovements,
        });
      }
      setLoading(false);
    }
  }, []);

  useParsedPGNView(parsedPGN, ScrollToBottom);

  const chessBoardArray = RenderSquare(fen, playColor, setClickAndMoveTrigger);

  return loading ? (
    <div className="w-full h-full flex flex-col justify-center ">
      <div className="w-full flex justify-center">
        <LoadingSpinner width="80px" height="80px" />
      </div>
      <div className="w-full flex justify-center font-bold text-xl mt-5">
        Loading, please wait ...
      </div>
    </div>
  ) : (
    <div className="w-full h-full flex flex-col justify-center bg-[#323014] py-2">
      <div className="flex w-full h-full justify-center">
        <div className="h-full flex flex-col justify-between">
          <div className="flex text-[#b58863] font-bold text-xl mr-8 bg-[#f0d9b5] rounded-lg p-2">
            {gameInitials.stockfishGame && playColor !== stockfishColor ? (
              <Image
                src={"/images/stockfish.png"}
                width={67}
                height={67}
                alt="stokfish"
                className="border border-[#f0d9b5] rounded-lg mr-5"
              />
            ) : (
              <Image
                src={"/knight_mirror.png"}
                width={60}
                height={60}
                alt="default avatar"
                className="border border-[#f0d9b5] mr-5 rounded-lg"
              />
            )}
            {playColor === "w"
              ? gameInitials.black.split("@")[0]
              : gameInitials.white.split("@")[0]}
          </div>
          <div className="flex bg-[#b58863] font-bold text-xl mr-8 text-[#f0d9b5] rounded-lg p-2">
            {gameInitials.stockfishGame && playColor === stockfishColor ? (
              <Image
                src={"/images/stockfish.png"}
                width={67}
                height={67}
                alt="stokfish"
                className="border border-[#b58863] rounded-lg mr-5"
              />
            ) : (
              <Image
                src={"/knight_mirror.png"}
                width={60}
                height={60}
                alt="default avatar"
                className="border border-[#b58863] mr-5 rounded-lg"
              />
            )}
            {playColor === "b"
              ? gameInitials.black.split("@")[0]
              : gameInitials.white.split("@")[0]}
          </div>
        </div>
        <div className="aspect-square h-full grid grid-rows-8 grid-cols-8 border rounded-lg overflow-hidden">
          {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map((elem) => elem)
            : null}
        </div>

        <PGNTable
          parsedPGN={parsedPGN}
          parsedPGNRef={parsedPGNRef}
          setFen={setFen}
          gameEnded={gameEnded}
          setParsedPGN={setParsedPGN}
          playColor={playColor}
          setGameEnded={setGameEnded}
          setPlayColor={setPlayColor}
        />

        <Toaster />
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
  setPlayColor,
}: {
  parsedPGN: ParseTree[];
  parsedPGNRef: RefObject<HTMLDivElement | null>;
  setFen: Dispatch<SetStateAction<FenObject>>;
  gameEnded: gameEndObject;
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>;
  playColor: Color;
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>;
  setPlayColor: Dispatch<SetStateAction<Color>>;
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
          {parsedPGN[0].tags?.Result ? (
            <div className="col-span-7 text-3xl w-full flex justify-center text-[#323014] mt-3">
              <div>{parsedPGN[0].tags.Result}</div>
            </div>
          ) : null}
        </div>
        {/* <div ref={parsedPGNRef} className="w-full bg-slate-600 absolute bottom-0">hello</div> */}
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
            <div
              className="bg-[#323014] h-full rounded-lg cursor-pointer flex justify-center hover:bg-opacity-90 transition duration-100"
              onClick={() =>
                setPlayColor((x: Color) => (x === "w" ? "b" : "w"))
              }
            >
              <div className="flex flex-col justify-center">
                <RefreshCw className="text-[#fffefc]" size={25} />
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
}
export default isAuth(Page);
