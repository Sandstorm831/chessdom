"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { Dispatch, RefObject, SetStateAction, useEffect } from "react";
import { useRef } from "react";
import { ReactElement } from "react";
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
import { LoadingSpinner } from "@/app/ui/loadingSpinner";

import { parse, ParseTree } from "@mliebelt/pgn-parser";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Popover } from "@radix-ui/react-popover";
import { Toaster } from "@/components/ui/toaster";
import { TheParentPGN } from "@/app/engineAndPGN";
import isAuth from "@/components/auth_HOC";
import { redirect } from "next/navigation";
/*  Variables relating to socket chess and online play */
let stockfishColor: Color = "w";
const chess = new Chess();
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

function arbitraryTimeTravel(
  moveNumber: number,
  turn: string,
  setFen: Dispatch<SetStateAction<FenObject>>,
) {
  setFen(FENHistory[moveNumber * 2 - (turn === "w" ? 1 : 0)]);
  currentUIPosition = moveNumber * 2 - (turn === "w" ? 1 : 0);
}

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

export type MoveLAN = {
  from: Square;
  to: Square;
};

export type FenObject = {
  fen: string;
  isDnD: boolean;
  pieceMovements: MoveLAN[];
};

type positionObject = {
  square: Square;
  type: PieceSymbol;
  color: Color;
};
type rankObject = (positionObject | null)[];
type chessBoardObject = rankObject[];
type PGNObject = {
  pgn: string;
  moveNumber: number;
};

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
  color,
  cord,
  children,
  ...props
}: {
  color: Color;
  cord: Square;
} & ComponentPropsWithoutRef<"div">) {
  const ref = useRef(null);
  const { i, j } = squareToIJ(cord, color);
  const isDark = !(i % 2 === j % 2);
  function getColor() {
    return isDark
      ? "bg-[#b58863] text-[#f0d9b5]"
      : "bg-[#f0d9b5] text-[#b58863]";
  }
  return (
    <div {...props} ref={ref} className={`${getColor()} relative`}>
      {children}
    </div>
  );
}

function Peice({ chessBoardIJ }: { chessBoardIJ: positionObject }) {
  const ref = useRef(null);
  return (
    <Image
      src={`/chesspeices/${chessBoardIJ?.color + chessBoardIJ?.type}.svg`}
      alt={chessBoardIJ?.color + chessBoardIJ?.type}
      id={chessBoardIJ?.color + chessBoardIJ?.type}
      ref={ref}
      height={0}
      width={0}
      className="w-10/12 h-10/12 absolute 2xl:left-[8%] max-2xl:left-[9%] bottom-[3%] z-10"
      draggable="false"
    />
  );
}

function RenderSquare(fen: FenObject, color: Color) {
  chess.load(fen.fen);
  const chessBoard: chessBoardObject = chess.board();
  if (color === "b") {
    for (let ab = 0; ab < chessBoard.length; ab++) {
      chessBoard[ab].reverse();
    }
    chessBoard.reverse();
  }
  const chessBoardArray: ReactElement[] = [];
  for (let i = 0; i < chessBoard.length; i++) {
    for (let j = 0; j < chessBoard[i].length; j++) {
      const chessBoardIJ = chessBoard[i][j];
      if (i % 2 === j % 2) {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <SquareBlock
              color={color}
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
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </SquareBlock>,
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <SquareBlock
              color={color}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              {" "}
              <div className="z-10 absolute -top-[1px] left-1 text-sm font-bold">
                {color === "w" ? 8 - i : i + 1}
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </SquareBlock>,
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <SquareBlock
              color={color}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              <div className="z-10 absolute bottom-[3%] right-[5%] text-sm font-bold">
                {color === "w"
                  ? String.fromCharCode(j + 97)
                  : String.fromCharCode(96 + 8 - j)}
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </SquareBlock>,
          );
        } else
          chessBoardArray.push(
            <SquareBlock
              color={color}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </SquareBlock>,
          );
      } else {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <SquareBlock
              color={color}
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
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </SquareBlock>,
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <SquareBlock
              color={color}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              {" "}
              <div className="z-10 absolute -top-[1px] left-1 text-sm font-bold">
                {color === "w" ? 8 - i : i + 1}
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </SquareBlock>,
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <SquareBlock
              color={color}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              <div className="z-10 absolute bottom-[3%] right-[5%] text-sm font-bold">
                {color === "w"
                  ? String.fromCharCode(j + 97)
                  : String.fromCharCode(96 + 8 - j)}
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </SquareBlock>,
          );
        } else
          chessBoardArray.push(
            <SquareBlock
              color={color}
              cord={IJToSquare(i, j, color)}
              className="bg-[#769656]"
              key={IJToSquare(i, j, color)}
              id={IJToSquare(i, j, color)}
            >
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
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

function useParsedPGNView(parsedPGN: ParseTree[], ScrollToBottom: () => void) {
  useEffect(() => {
    ScrollToBottom();
  }, [parsedPGN]);
}

function Page() {
  const [fen, setFen] = useState<FenObject>({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    isDnD: false,
    pieceMovements: [],
  });
  const [playColor, setPlayColor] = useState<Color>("w");
  const [loading, setLoading] = useState(true);
  const [parsedPGN, setParsedPGN] = useState<ParseTree[]>([]);
  const parsedPGNRef = useRef<null | HTMLDivElement>(null);

  chess.load(DEFAULT_POSITION);

  const ScrollToBottom = () => {
    parsedPGNRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // custom hook calls

  useEffect(() => {
    if (chess.fen() === DEFAULT_POSITION) {
      if (TheParentPGN.PGN === "") redirect("/dashboard");
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
      // Type Checking Code ------>
      const isOfType = (z: any): z is ParseTree => "moves" in z;
      if (!isOfType(parsed)) throw new Error("parsed output is not of type");
      const x = [parsed];
      // <-------- Type Checking Code
      reinitialiseNullMoveNums(x);
      setParsedPGN(x);
      PGN.moveNumber = x[0].moves.length;
      PGN.pgn = OG;
      const parsedPGNMoves = x[0].moves;
      for (let i = 0; i < parsedPGNMoves.length; i++) {
        const san = parsedPGNMoves[i].notation.notation;
        const moveObj = chess.move(san);
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

  const chessBoardArray = RenderSquare(fen, playColor);

  return loading ? (
    <LoadingComponent />
  ) : (
    <div className="w-full h-full flex flex-col justify-center bg-[#323014] py-2">
      <div className="flex w-full h-full justify-center">
        <PlayersInfo playColor={playColor} />
        <div className="aspect-square h-full grid grid-rows-8 grid-cols-8 border rounded-lg overflow-hidden">
          {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map((elem) => elem)
            : null}
        </div>

        <PGNTable
          parsedPGN={parsedPGN}
          parsedPGNRef={parsedPGNRef}
          setFen={setFen}
          setPlayColor={setPlayColor}
        />

        <Toaster />
      </div>
    </div>
  );
}

function PlayersInfo({ playColor }: { playColor: Color }) {
  return (
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
  );
}

function LoadingComponent() {
  return (
    <div className="w-full h-full flex flex-col justify-center ">
      <div className="w-full flex justify-center">
        <LoadingSpinner width="80px" height="80px" className="text-[#323014]" />
      </div>
      <div className="w-full flex justify-center font-bold text-3xl mt-5 text-[#323014]">
        Loading, please wait ...
      </div>
    </div>
  );
}

function PGNTable({
  parsedPGN,
  parsedPGNRef,
  setFen,
  setPlayColor,
}: {
  parsedPGN: ParseTree[];
  parsedPGNRef: RefObject<HTMLDivElement | null>;
  setFen: Dispatch<SetStateAction<FenObject>>;
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
