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

type HoveredState = "idle" | "validMove" | "InvalidMove";

type PieceType = "queen";

type PieceTypeRecord = {
  type: "queen";
  cord: coordinates;
};

type coordinates = {
  xcord: number;
  ycord: number;
};

function isAtSamePlace(i: coordinates, j: coordinates) {
  if (i.xcord === j.xcord && i.ycord === j.ycord) return true;
  return false;
}

function canMove(
  start: coordinates,
  destination: coordinates,
  piece: PieceType,
  squarePiece: PieceTypeRecord[]
) {
  const rowDist = Math.abs(start.xcord - destination.xcord);
  const colDist = Math.abs(start.ycord - destination.ycord);
    console.log("I am 0")
  if (squarePiece.find((spice) => isAtSamePlace(spice.cord, destination))) {
    return false;
  }
  console.log("I am 1")
  if (rowDist === colDist || rowDist === 0 || colDist === 0) return true;
  else return false;
}

function Peice({
  cord,
  pieceType,
  image,
  alt,
}: {
  cord: coordinates;
  pieceType: PieceType;
  image: string;
  alt: string;
}) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState<Boolean>(false);
  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
      getInitialData: () => ({ cord, pieceType }),
    });
  }, [cord, pieceType]);
  return (
    <Image
      src={image}
      alt={alt}
      ref={ref}
      height={0}
      width={0}
      className="w-11/12 h-11/12 absolute left-[5%] top-[5%]"
      style={dragging ? { opacity: 0 } : {}}
      draggable="false"
    />
  );
}

function isCoordinate(token: unknown): coordinates {
  if (
    typeof token === "object" &&
    token !== null &&
    "xcord" in token &&
    "ycord" in token
  ) {
    const { xcord, ycord } = token;
    if (typeof xcord === "number" && typeof ycord === "number")
      return { xcord, ycord };
    else throw new Error("type check error in isCoordinate");
  } else {
    throw new Error("type check error in isCoordinate");
  }
}

function isPieceType(token: unknown): PieceType {
  if (typeof token === "string" && token === "queen") {
    return "queen";
  } else {
    throw new Error("type check error in isPieceType");
  }
}

function Square({
  pieces,
  cord,
  children,
  ...props
}: {
  pieces: PieceTypeRecord[];
  cord: coordinates;
} & ComponentPropsWithoutRef<"div">) {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState<HoveredState>("idle");

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      getData: () => ({ cord }),
      canDrop: ({ source }) => {
        let sourceCords: coordinates;
        if (!isCoordinate(source.data.cord)) {
          return false;
        }
        sourceCords = isCoordinate(source.data.cord);
        if (
          sourceCords.xcord === cord.xcord &&
          sourceCords.ycord === cord.ycord
        )
          return false;
        return true;
      },
      onDragEnter: ({ source }) => {
        // type checks for source
        let sourceCords: coordinates;
        let sourcePieceType: PieceType;
        if (
          !isCoordinate(source.data.cord) ||
          !isPieceType(source.data.pieceType)
        ) {
          return;
        }
        sourceCords = isCoordinate(source.data.cord);
        sourcePieceType = isPieceType(source.data.pieceType);
        if (canMove(sourceCords, cord, sourcePieceType, pieces)) {
          setIsDraggedOver("validMove");
        } else {
          setIsDraggedOver("InvalidMove");
        }
      },
      onDragLeave: () => setIsDraggedOver("idle"),
      onDrop: () => setIsDraggedOver("idle"),
    });
  }, [cord, pieces]);

  const isDark = !(cord.xcord % 2 === cord.ycord % 2);
  function getColor(): string {
    if (isDraggedOver === "validMove") {
      return "bg-green-300 text-black";
    } else if (isDraggedOver === "InvalidMove") {
      return "bg-fuchsia-300 text-black";
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

export function RenderSquares(queenPos: PieceTypeRecord[]) {
  const qCord: coordinates = queenPos[0].cord;

  const chessBoardArray: ReactElement[] = [];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (i % 2 === j % 2) {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <Square
              pieces={[]}
              cord={{ xcord: j, ycord: i }}
              key={i.toString() + j.toString()}
            >
              <div className="absolute -top-[2px] left-2 z-10 text-lg">1</div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                a
              </div>
              {qCord.xcord === j && qCord.ycord === i ? (
                <Peice
                  cord={{ xcord: j, ycord: i }}
                  pieceType="queen"
                  image="/chesspeices/blackQueen.svg"
                  alt="BlackQueen"
                />
              ) : null}
            </Square>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <Square
              pieces={[]}
              cord={{ xcord: j, ycord: i }}
              key={i.toString() + j.toString()}
            >
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {8 - i}
              </div>
              {qCord.xcord === j && qCord.ycord === i ? (
                <Peice
                  cord={{ xcord: j, ycord: i }}
                  pieceType="queen"
                  image="/chesspeices/blackQueen.svg"
                  alt="BlackQueen"
                />
              ) : null}
            </Square>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <Square
              pieces={[]}
              cord={{ xcord: j, ycord: i }}
              key={i.toString() + j.toString()}
            >
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {String.fromCharCode(j + 97)}
              </div>
              {qCord.xcord === j && qCord.ycord === i ? (
                <Peice
                  cord={{ xcord: j, ycord: i }}
                  pieceType="queen"
                  image="/chesspeices/blackQueen.svg"
                  alt="BlackQueen"
                />
              ) : null}
            </Square>
          );
        } else
          chessBoardArray.push(
            <Square
              pieces={[]}
              cord={{ xcord: j, ycord: i }}
              key={i.toString() + j.toString()}
            >
              {qCord.xcord === j && qCord.ycord === i ? (
                <Peice
                  cord={{ xcord: j, ycord: i }}
                  pieceType="queen"
                  image="/chesspeices/blackQueen.svg"
                  alt="BlackQueen"
                />
              ) : null}
            </Square>
          );
      } else {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <Square
              pieces={[]}
              cord={{ xcord: j, ycord: i }}
              key={i.toString() + j.toString()}
            >
              <div className="absolute -top-[2px] left-2 z-10 text-lg">1</div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                a
              </div>
              {qCord.xcord === j && qCord.ycord === i ? (
                <Peice
                  cord={{ xcord: j, ycord: i }}
                  pieceType="queen"
                  image="/chesspeices/blackQueen.svg"
                  alt="BlackQueen"
                />
              ) : null}
            </Square>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <Square
              pieces={[]}
              cord={{ xcord: j, ycord: i }}
              key={i.toString() + j.toString()}
            >
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {8 - i}
              </div>
              {qCord.xcord === j && qCord.ycord === i ? (
                <Peice
                  cord={{ xcord: j, ycord: i }}
                  pieceType="queen"
                  image="/chesspeices/blackQueen.svg"
                  alt="BlackQueen"
                />
              ) : null}
            </Square>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <Square
              pieces={[]}
              cord={{ xcord: j, ycord: i }}
              key={i.toString() + j.toString()}
            >
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {String.fromCharCode(j + 97)}
              </div>
              {qCord.xcord === j && qCord.ycord === i ? (
                <Peice
                  cord={{ xcord: j, ycord: i }}
                  pieceType="queen"
                  image="/chesspeices/blackQueen.svg"
                  alt="BlackQueen"
                />
              ) : null}
            </Square>
          );
        } else
          chessBoardArray.push(
            <Square
              pieces={[]}
              cord={{ xcord: j, ycord: i }}
              className="bg-[#769656]"
              key={i.toString() + j.toString()}
            >
              {qCord.xcord === j && qCord.ycord === i ? (
                <Peice
                  cord={{ xcord: j, ycord: i }}
                  pieceType="queen"
                  image="/chesspeices/blackQueen.svg"
                  alt="BlackQueen"
                />
              ) : null}
            </Square>
          );
      }
    }
  }
  return chessBoardArray;
}

export default function Page() {
  const [queenPos, setQueenPos] = useState<PieceTypeRecord[]> ([
    {
      type: "queen",
      cord: {
        xcord: 5,
        ycord: 2,
      },
    },
  ]);
  useEffect(() => {
    console.log("queenPos is changing")
    return monitorForElements({
        onDrop({source, location}) {
            const destination = location.current.dropTargets[0];
            if(!destination){
                return;
            }
            const destinationLocation = destination.data.cord;
            const sourceLocation = source.data.cord;
            const pieceType = source.data.pieceType;
            if(!isCoordinate(destinationLocation) || !isCoordinate(sourceLocation) || !isPieceType(pieceType)){
                return;
            }
            const destCoordinates = isCoordinate(destinationLocation);
            const sourceCoordinates = isCoordinate(sourceLocation);
            const pieceTypeD = isPieceType(pieceType);
            const piece = queenPos.find((p) => isAtSamePlace(p.cord, sourceCoordinates));
            const restPieces = queenPos.filter((p) => p !== piece);
            console.log(destCoordinates);
            console.log(canMove(sourceCoordinates, destCoordinates, pieceTypeD, queenPos))
            console.log(piece !== undefined)
            if(canMove(sourceCoordinates, destCoordinates, pieceTypeD, queenPos) && piece !== undefined){
                setQueenPos([{type: 'queen', cord: destCoordinates}, ...restPieces]);
            }
        },
    });
  }, [queenPos])

//   const chessBoardArray = RenderSquares(queenPos);
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex w-full justify-center">
        <div className="aspect-square w-2/5  grid grid-rows-8 grid-cols-8">
          {/* {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map((elem) => elem)
            : null} */}
            {RenderSquares(queenPos)}
        </div>
      </div>
    </div>
  );
}
