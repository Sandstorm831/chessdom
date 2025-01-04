"use client";
import Image from "next/image";
import { useEffect } from "react";
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
import { Chess } from "chess.js";
const chess = new Chess();

type positionObject = {
  square: string;
  type: "r" | "n" | "b" | "q" | "k" | "p";
  color: "w" | "b";
};

type rankObject = (positionObject | null)[];
type chessBoardObject = rankObject[];

function squareToIJ(square: string) {
  const j = square[0].toLowerCase().charCodeAt(0) - 97;
  const i = Math.abs(Number(square[1]) - 8);
  return { i, j };
}

function IJToSquare(i: number, j: number): string {
  let square: string = "";
  square += String.fromCharCode(j + 97);
  square += (8 - i).toString();
  return square;
}

function Square({
  cord,
  children,
  ...props
}: {
  cord: string;
} & ComponentPropsWithoutRef<"div">) {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);
  useEffect(() => {
    const elm = ref.current;
    invariant(elm);
     return dropTargetForElements({
      element: elm,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
     })
  }, [cord])

  const {i, j} = squareToIJ(cord)
  const isDark = !(i%2 === j%2);
  function getColor(){
    if(isDraggedOver){
      return 'bg-blue-200 text-black';
    }
    return isDark
      ? "bg-[#769656] text-[#eeeed2]"
      : "bg-[#eeeed2] text-[#769656]";
  }
  return (
    <div {...props} ref={ref} className={`${getColor()} relative`}>
      {children}
    </div>
  );
}

function Peice({ chessBoardIJ }: { chessBoardIJ: positionObject }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState<boolean>(false);
  useEffect(() => {
    const elm = ref.current;
    invariant(elm);
    return draggable({
      element: elm,
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),

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

function RenderSquare(fen: string) {
  const chess = new Chess();
  chess.load(fen);
  const chessBoard: chessBoardObject = chess.board();
  const chessBoardArray: ReactElement[] = [];

  for (let i = 0; i < chessBoard.length; i++) {
    for (let j = 0; j < chessBoard[i].length; j++) {
      const chessBoardIJ = chessBoard[i][j];
      if (i % 2 === j % 2) {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <Square cord={IJToSquare(i, j)} key={IJToSquare(i, j)}>
              <div className="absolute -top-[2px] left-2 z-10 text-lg">1</div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                a
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </Square>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <Square cord={IJToSquare(i, j)} key={IJToSquare(i, j)}>
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {8 - i}
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </Square>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <Square cord={IJToSquare(i, j)} key={IJToSquare(i, j)}>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {String.fromCharCode(j + 97)}
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </Square>
          );
        } else
          chessBoardArray.push(
            <Square cord={IJToSquare(i, j)} key={IJToSquare(i, j)}>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </Square>
          );
      } else {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <Square cord={IJToSquare(i, j)} key={IJToSquare(i, j)}>
              <div className="absolute -top-[2px] left-2 z-10 text-lg">1</div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                a
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </Square>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <Square cord={IJToSquare(i, j)} key={IJToSquare(i, j)}>
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {8 - i}
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </Square>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <Square cord={IJToSquare(i, j)} key={IJToSquare(i, j)}>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {String.fromCharCode(j + 97)}
              </div>
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </Square>
          );
        } else
          chessBoardArray.push(
            <Square
            
              cord={IJToSquare(i, j)}
              className="bg-[#769656]"
              key={IJToSquare(i, j)}
            >
              {chessBoardIJ ? <Peice chessBoardIJ={chessBoardIJ} /> : null}
            </Square>
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
  const chessBoardArray = RenderSquare(fen);
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex w-full justify-center">
        <div className="aspect-square w-2/5  grid grid-rows-8 grid-cols-8">
          {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map((elem) => elem)
            : null}
        </div>
      </div>
    </div>
  );

}
