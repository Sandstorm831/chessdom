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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { socket } from "@/app/socket";
import { LoadingSpinner } from "@/app/ui/loadingSpinner";
import { parse, ParseTree } from "@mliebelt/pgn-parser";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import isAuth from "@/components/auth_HOC";
import { Session } from "next-auth";
/*  Variables relating to socket chess and online play */
let storeCallback: (response: string) => void;
let reconciliation = false;
let NonStatePlaycolor: Color = "w"; // Created, as in useEffect with zero
// dependency array, state variables that
// are set afterward the first render, doesn't
// get reflected, at those places, this variable
// can be used
/*  Variables relating to socket chess and online play */

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

function presentTimeTravel(setFen: Dispatch<SetStateAction<FenObject>>) {
  blueDotArrayClearIntimator = true;
  setFen(FENHistory[FENHistory.length - 1]);
  currentUIPosition = FENHistory.length - 1;
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
    const transX = MoveX - (childRect.left + childRect.right) / 2 + 3;
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

  setGameEnded({
    gameEnded: true,
    gameEndResult: playColor === "w" ? "0 - 1" : "1 - 0",
    gameEndTitle: "Better luck next time",
  });
  setSoundTrigger("/sounds/game-end.mp3");
  socket.emit("resigned", playColor);
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
      className="w-11/12 h-11/12 absolute 2xl:left-[6%] max-2xl:left-[6%] bottom-[3%] z-10"
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
                <div className="z-10 absolute 2xl:bottom-[33%] 2xl:left-[42%] max-2xl:bottom-[35%] max-2xl:left-[44%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-4 max-2xl:h-4"></div>
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
                <div className="z-10 absolute 2xl:bottom-[33%] 2xl:left-[42%] max-2xl:bottom-[35%] max-2xl:left-[44%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-4 max-2xl:h-4"></div>
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
                <div className="z-10 absolute 2xl:bottom-[33%] 2xl:left-[42%] max-2xl:bottom-[35%] max-2xl:left-[44%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-4 max-2xl:h-4"></div>
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
                <div className="z-10 absolute 2xl:bottom-[33%] 2xl:left-[42%] max-2xl:bottom-[35%] max-2xl:left-[44%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-4 max-2xl:h-4"></div>
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
                <div className="z-10 absolute 2xl:bottom-[33%] 2xl:left-[42%] max-2xl:bottom-[35%] max-2xl:left-[44%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-4 max-2xl:h-4"></div>
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
                <div className="z-10 absolute 2xl:bottom-[33%] 2xl:left-[42%] max-2xl:bottom-[35%] max-2xl:left-[44%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-4 max-2xl:h-4"></div>
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
                <div className="z-10 absolute 2xl:bottom-[33%] 2xl:left-[42%] max-2xl:bottom-[35%] max-2xl:left-[44%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-4 max-2xl:h-4"></div>
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
                <div className="z-10 absolute 2xl:bottom-[33%] 2xl:left-[42%] max-2xl:bottom-[35%] max-2xl:left-[44%] bg-[#0077CC] rounded-full 2xl:w-5 2xl:h-5 max-2xl:w-4 max-2xl:h-4"></div>
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
      console.log(`Acknowledgement : ${response}`);
      return;
    }
  }
  if (chess.turn() !== playColor)
    socket
      .timeout(5000)
      .emit("move", moveObj.san, (err: Error, response: string) =>
        ackknowledgementCallback(err, response),
      );
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
    }
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
        console.log(`Acknowledgement : ${response}`);
        return;
      }
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
    setTimeout(() => FENCallback(setFen), 500);
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
  callback: (response: string) => void,
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
  callback: (response: string) => void,
  setParsedPGN: Dispatch<SetStateAction<ParseTree[]>>,
  setFen: Dispatch<SetStateAction<FenObject>>,
  setSoundTrigger: Dispatch<SetStateAction<string>>,
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>,
  setPlayColor: Dispatch<SetStateAction<Color>>,
) {
  reconciliation = true;
  storeCallback = callback;
  // do whatever you want to do for reconciliation from here
  setPlayColor(colorHeld);
  NonStatePlaycolor = colorHeld;
  while (chess.history().length < historyX.length) {
    const index = chess.history().length;
    const san = historyX[index];
    const moveObj = chess.move(san);
    updatePGN(moveObj, setParsedPGN);
    const pieceMovements = getPieceMovements(moveObj);
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
  // upto here
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
      console.log(err);
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
          console.log(`Acknowledgemenet : ${response}`);
          return;
        }
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
      setTimeout(() => FENCallback(setFen), 500);
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
              console.log(`Acknowledgement : ${response}`);
              return;
            }
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
  setSameUser: Dispatch<SetStateAction<boolean>>,
  setOpponentName: Dispatch<SetStateAction<string>>,
) {
  const { toast } = useToast();
  const { data: session } = useSession();
  useEffect(() => {
    async function authSetter() {
      if (session && session.user && session.user.email && session.user.name) {
        socket.auth = {
          username: session.user.email,
        };
      }
      socket.connect();
    }
    authSetter();
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);

    socket.on("disconnect", onDisconnect);

    socket.on("gamecolor", (color: Color, opponent: string) => {
      setPlayColor(color);
      NonStatePlaycolor = color;
      setOpponentName(opponent.split("@")[0]);
    });

    socket.on("startgame", () =>
      handleGameStartingForSocket(setParsedPGN, setFindingRoom, setRematchD),
    );

    socket.on(
      "move",
      async (chessMove: string, callback: (response: string) => void) =>
        handleOpponentMoveForSocket(
          chessMove,
          callback,
          setOpponentMove,
          setFen,
        ),
    );

    socket.on(
      "reconciliation",
      (
        historyX: string[],
        colorHeld: Color,
        callback: (response: string) => void,
      ) =>
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

    socket.on("sameuser", () => {
      setSameUser(true);
    });

    socket.on("connect_error", (err) => {
      console.log("some socket connection error occured");
      console.log(err);
      console.log(err.message);
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

function Page() {
  const gameEndResult = "";
  const gameEndTitle = "";
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
  const [promotionArray, setPromotionArray] = useState<SquareAndMove[]>([]);
  const [opponentMove, setOpponentMove] = useState<string>("");
  // const workerRef = useRef<Worker>(null);
  // const TheOpponentEngine = useAppSelector(getEngine);
  const [parsedPGN, setParsedPGN] = useState<ParseTree[]>([]);
  const parsedPGNRef = useRef<null | HTMLDivElement>(null);
  const { data: session } = useSession();

  /*  Variables relating to socket chess and online play */
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [findingRoom, setFindingRoom] = useState(true);
  const [rematchD, setRematchD] = useState(false);
  const [isDisconnected, setIsDisconnectedFromGame] = useState(false);
  const [opponentLeftTheGame, setOpponentLeftTheGame] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [bannedTimer, setBannedTimer] = useState(900);
  const [sameUser, setSameUser] = useState(false);
  const [opponentName, setOpponentName] = useState("A knight");
  /*  Variables relating to socket chess and online play */

  console.log(`Connected to server : ${isConnected}`);
  console.log(`Transport Method : ${transport}`);
  chess.load(fen.fen);

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
    setSameUser,
    setOpponentName,
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
  ) : sameUser ? (
    <SameUserPage />
  ) : findingRoom ? (
    <FindingRoom />
  ) : (
    <div className="w-full h-full flex flex-col justify-center bg-[#323014] py-2">
      <div className="flex w-full h-full justify-center">
        <PlayersInfo session={session} opponentName={opponentName} />
        <div className="aspect-square h-full grid grid-rows-8 grid-cols-8 border rounded-lg overflow-hidden">
          <GameEndDialogue
            setOpponentLeftTheGame={setOpponentLeftTheGame}
            setIsDisconnectedFromGame={setIsDisconnectedFromGame}
            setParsedPGN={setParsedPGN}
            gameEnded={gameEnded}
            setFen={setFen}
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

function PlayersInfo({
  opponentName,
  session,
}: {
  opponentName: string;
  session: Session | null;
}) {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex text-[#b58863] font-bold text-xl mr-8 bg-[#f0d9b5] rounded-lg p-2">
        <Image
          src={"/knight_mirror.png"}
          width={60}
          height={60}
          alt="default avatar"
          className="border border-[#f0d9b5] mr-5 rounded-lg"
        />
        {opponentName}
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

function FindingRoom() {
  return (
    <div className="w-full h-full flex flex-col justify-center ">
      <div className="w-full flex justify-center">
        <LoadingSpinner width="80px" height="80px" className="text-[#323014]" />
      </div>
      <div className="w-full flex justify-center font-bold text-3xl mt-5 text-[#323014]">
        Finding opponent, please wait ...
      </div>
    </div>
  );
}

function SameUserPage() {
  setTimeout(() => redirect("/dashboard"), 4000);
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="w-full flex justify-center text-3xl text-center mb-12">
        A User with the same email id already exists, please login to a
        different account to play
      </div>
      <div className="w-full flex justify-center text-3xl text-gray-500">
        Redirecting back to dashboard ...
      </div>
    </div>
  );
}

function BannedPage({ BannedTimer }: { BannedTimer: number }) {
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="w-full flex justify-center">
        <div className="text-3xl font-bold flex flex-col justify-center mx-12 text-[#323014]">
          You Are Banned For ...{" "}
        </div>
        <CountdownCircleTimer
          isPlaying
          size={500}
          duration={BannedTimer}
          strokeWidth={10}
          colors="#323014"
        >
          {({ remainingTime }) => {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            return (
              <div
                role="timer"
                aria-live="assertive"
                className="font-mono text-xl text-[#323014]"
              >
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
      <DialogContent className="flex flex-col justify-center">
        <DialogHeader>
          {opponentLeftTheGame ? (
            <DialogTitle className="w-full flex justify-center text-3xl text-[#323014]">
              Opponent Left The Game
            </DialogTitle>
          ) : (
            <DialogTitle className="w-full flex justify-center">
              <LoadingSpinner
                width="80px"
                height="80px"
                className="text-[#323014]"
              />
            </DialogTitle>
          )}
          {opponentLeftTheGame ? (
            <DialogDescription className="flex justify-center pt-3">
              <Button
                variant={"default"}
                className="flex justify-center mx-2 text-xl w-56 bg-[#323014]"
                onClick={() => {
                  socket.emit("gameleave");
                }}
              >
                <Link href={"/dashboard"}> Return to dashboard </Link>{" "}
              </Button>
              <Button
                variant={"default"}
                className="flex justify-center mx-2 text-xl w-56 bg-[#323014]"
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
            <DialogDescription className="flex justify-center pt-3 text-xl">
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

function GameEndDialogue({
  setOpponentLeftTheGame,
  setIsDisconnectedFromGame,
  setParsedPGN,
  gameEnded,
  setFen,
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
  setGameEnded: Dispatch<SetStateAction<gameEndObject>>;
  setFindingRoom: Dispatch<SetStateAction<boolean>>;
  rematchD: boolean;
  setRematchD: Dispatch<SetStateAction<boolean>>;
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
            <div
              className="flex justify-center mx-2 text-xl w-56 bg-[#323014] text-[#fffefc] hover:bg-opacity-90 transition duration-150 py-1 rounded-lg cursor-pointer"
              onClick={() => {
                socket.emit("gameleave");
              }}
            >
              <div className="flex flex-col justify-center h-full">
                <Link href={"/dashboard"}> Return to dashboard </Link>{" "}
              </div>
            </div>
            <Button
              variant={"default"}
              className="flex justify-center mx-2 text-xl w-56 bg-[#323014] text-[#fffefc]"
              disabled={rematchD}
              onClick={() => {
                socket.emit("rematch");
                setRematchD(true);
              }}
            >
              Rematch
            </Button>
          </div>
          <DialogDescription className="flex justify-center pt-3">
            <Button
              variant={"default"}
              className="flex justify-center mx-2 text-xl w-full bg-[#323014] text-[#fffefc]"
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

export default isAuth(Page);
