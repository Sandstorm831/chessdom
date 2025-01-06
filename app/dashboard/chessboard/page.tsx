"use client";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect } from "react";
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
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
const chess = new Chess();

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
  setTrigger,
  setBlueDotFunc,
  color,
  validMovesArray,
  cord,
  children,
  ...props
}: {
  setTrigger: Dispatch<SetStateAction<SquareAndMove[]>>;
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
      setTrigger(canMove);
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
      ref={ref}
      height={0}
      width={0}
      className="w-11/12 h-11/12 absolute left-[5%] top-[5%]"
      style={dragging ? { opacity: 0 } : {}}
      draggable="false"
    />
  );
}

function RenderSquare(
  fen: string,
  color: Color,
  setTrigger: Dispatch<SetStateAction<SquareAndMove[]>>
) {
  chess.load(fen);
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
    if (toBeCleared) setBlueDotArray([]);
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
      if (i % 2 === j % 2) {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setTrigger={setTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
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
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-3 h-3"></div>
              ) : null}
            </SquareBlock>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setTrigger={setTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
            >
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {color === "w" ? 8 - i : i + 1}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-3 h-3"></div>
              ) : null}
            </SquareBlock>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setTrigger={setTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
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
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-3 h-3"></div>
              ) : null}
            </SquareBlock>
          );
        } else
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setTrigger={setTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
            >
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-3 h-3"></div>
              ) : null}
            </SquareBlock>
          );
      } else {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setTrigger={setTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
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
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-3 h-3"></div>
              ) : null}
            </SquareBlock>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setTrigger={setTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
            >
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {color === "w" ? 8 - i : i + 1}
              </div>
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-3 h-3"></div>
              ) : null}
            </SquareBlock>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setTrigger={setTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              key={IJToSquare(i, j, color)}
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
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-3 h-3"></div>
              ) : null}
            </SquareBlock>
          );
        } else
          chessBoardArray.push(
            <SquareBlock
              setBlueDotFunc={setBlueDotArrayFunc}
              setTrigger={setTrigger}
              color={color}
              validMovesArray={blueDotArray}
              cord={IJToSquare(i, j, color)}
              className="bg-[#769656]"
              key={IJToSquare(i, j, color)}
            >
              {chessBoardIJ ? (
                <Peice
                  chessBoardIJ={chessBoardIJ}
                  blueDotFunc={setBlueDotArrayFunc}
                />
              ) : null}
              {blueDotArray.find(
                (obj) => obj.square === IJToSquare(i, j, color)
              ) ? (
                <div className="z-10 absolute top-[45%] left-[45%] bg-[#0077CC] rounded-full w-3 h-3"></div>
              ) : null}
            </SquareBlock>
          );
      }
    }
  }
  return chessBoardArray;
}

export default function Page() {
  const [fen, setFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [trigger, setTrigger] = useState<SquareAndMove[]>([]);
  const [playColor, setPlayColor] = useState<Color>("w");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSettings, setOpenSettings] = useState(true);
  const [promotionArray, setPromotionArray] = useState<SquareAndMove[]>([]);
  function handlePromotion(piece: string) {
    const move = promotionArray.find((obj) => obj.move[5] === piece);
    if (move === undefined)
      throw new Error("Failed promotion, some error occured");
    chess.move(move.move);
    setFen(chess.fen());
    setOpenDrawer(false);
    setPromotionArray([]);
  }
  chess.load(fen);
  useEffect(() => {
    if (trigger.length === 0) return;
    if (trigger.length === 4) {
      setPromotionArray(trigger);
      setOpenDrawer(true);
    } else {
      const move: string = trigger[0].move;
      chess.move(move);
      setFen(chess.fen());
    }
  }, [trigger]);
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
          chess.move(move);
          setFen(chess.fen());
        }
      },
    });
  }, [fen]);
  const chessBoardArray = RenderSquare(fen, playColor, setTrigger);
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex w-full justify-center">
        <div className="aspect-square w-2/5 grid grid-rows-8 grid-cols-8">
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
              <DrawerTitle className="flex justify-center text-xl mb-3">
                Play as
              </DrawerTitle>
              <DrawerDescription className="flex justify-center mt-2 mb-5">
                <Button
                  variant={"secondary"}
                  className="mx-2"
                  onClick={() => setPlayColor("w")}
                >
                  White
                </Button>
                <Button
                  variant={"secondary"}
                  className="mx-2"
                  onClick={() => setPlayColor("b")}
                >
                  Black
                </Button>
                <Button
                  variant={"secondary"}
                  className="mx-2"
                  onClick={() => {
                    return Math.round(Math.random()) === 1
                      ? setPlayColor("b")
                      : setPlayColor("w");
                  }}
                >
                  Random
                </Button>
              </DrawerDescription>
              <DrawerDescription className="flex justify-center">
                <Button
                  variant={"outline"}
                  onClick={() => setOpenSettings(false)}
                >
                  Apply and Play
                </Button>
              </DrawerDescription>
            </DrawerContent>
          </Drawer>
          {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map((elem) => elem)
            : null}
          {openDrawer ? (
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
                    onClick={() => handlePromotion("N")}
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
                    onClick={() => handlePromotion("R")}
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
                    onClick={() => handlePromotion("B")}
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
                    onClick={() => handlePromotion("Q")}
                  />
                </DrawerDescription>
              </DrawerContent>
            </Drawer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
