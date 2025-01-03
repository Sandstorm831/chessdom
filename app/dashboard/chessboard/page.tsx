"use client";
import Image from "next/image";
import { useEffect } from "react";
import { useRef } from "react";
import { ReactElement } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";
import { useState } from "react";
import { ComponentPropsWithoutRef } from "react";

function Peice({ image, alt }: { image: string; alt: string }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState<Boolean>(false);
  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
    });
  }, []);
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

function Square({
  xcord,
  ycord,
  children,
  ...props
}: { xcord: number; ycord: number } & ComponentPropsWithoutRef<"div">) {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, []);

  const isDark = !(xcord % 2 === ycord % 2);
  function getColor(): string {
    if (isDraggedOver) {
      return "bg-blue-200 text-black";
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

export default function Page() {
  const chessBoardArray: ReactElement[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (i % 2 === j % 2) {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <Square xcord={j} ycord={i} key={i.toString() + j.toString()}>
              <div className="absolute -top-[2px] left-2 z-10 text-lg">1</div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                a
              </div>
            </Square>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <Square xcord={j} ycord={i} key={i.toString() + j.toString()}>
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {8 - i}
              </div>
            </Square>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <Square xcord={j} ycord={i} key={i.toString() + j.toString()}>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {String.fromCharCode(j + 97)}
              </div>
            </Square>
          );
        } else
          chessBoardArray.push(
            <Square
              xcord={j}
              ycord={i}
              key={i.toString() + j.toString()}
            ></Square>
          );
      } else {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <Square xcord={j} ycord={i} key={i.toString() + j.toString()}>
              <div className="absolute -top-[2px] left-2 z-10 text-lg">1</div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                a
              </div>
              <Peice image="/chesspeices/blackQueen.svg" alt="BlackQueen" />
            </Square>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <Square xcord={j} ycord={i} key={i.toString() + j.toString()}>
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {8 - i}
              </div>
            </Square>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <Square xcord={j} ycord={i} key={i.toString() + j.toString()}>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {String.fromCharCode(j + 97)}
              </div>
            </Square>
          );
        } else
          chessBoardArray.push(
            <Square
              xcord={j}
              ycord={i}
              className="bg-[#769656]"
              key={i.toString() + j.toString()}
            ></Square>
          );
      }
    }
  }
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex w-full justify-center">
        <div className="aspect-square w-2/5 bg-blue-500 grid grid-rows-8 grid-cols-8">
          {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map((elem) => elem)
            : null}
        </div>
      </div>
    </div>
  );
}
