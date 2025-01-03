"use client";
import Image from "next/image";
import { useEffect } from "react";
import { useRef } from "react";
import { ReactElement } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";

function Peice({ image, alt }: { image: string; alt: string }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
    });
  }, []);
  return (
    <Image
      src={image}
      alt={alt}
      ref = {ref}
      height={0}
      width={0}
      className="w-11/12 h-11/12 absolute left-[5%] top-[5%]"
      draggable="false"
    />
  );
}

export default function Page() {
  const chessBoardArray: ReactElement[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (i % 2 === j % 2) {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <div className="bg-[#eeeed2] relative text-[#769656]" key={i.toString() + j.toString()}>
              <div className="absolute -top-[2px] left-2 z-10 text-lg">1</div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                a
              </div>
            </div>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <div className="bg-[#eeeed2] relative text-[#769656]" key={i.toString() + j.toString()}>
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {8 - i}
              </div>
            </div>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <div className="bg-[#eeeed2] relative text-[#769656]" key={i.toString() + j.toString()}>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {String.fromCharCode(j + 97)}
              </div>
            </div>
          );
        } else chessBoardArray.push(<div className="bg-[#eeeed2]" key={i.toString() + j.toString()}></div>);
      } else {
        if (j === 0 && i === 7) {
          chessBoardArray.push(
            <div className="bg-[#769656] relative text-[#eeeed2]" key={i.toString() + j.toString()}>
              <div className="absolute -top-[2px] left-2 z-10 text-lg">1</div>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                a
              </div>
              <Peice image="/chesspeices/blackQueen.svg" alt="BlackQueen" />
            </div>
          );
        } else if (j === 0) {
          chessBoardArray.push(
            <div className="bg-[#769656] relative text-[#eeeed2]" key={i.toString() + j.toString()}>
              {" "}
              <div className="z-10 absolute -top-[2px] left-2 text-lg">
                {8 - i}
              </div>
            </div>
          );
        } else if (i === 7) {
          chessBoardArray.push(
            <div className="bg-[#769656] relative text-[#eeeed2]" key={i.toString() + j.toString()}>
              <div className="z-10 absolute top-[70%] left-[80%] text-lg">
                {String.fromCharCode(j + 97)}
              </div>
            </div>
          );
        } else chessBoardArray.push(<div className="bg-[#769656]" key={i.toString() + j.toString()}></div>);
      }
    }
  }
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex w-full justify-center">
        <div className="aspect-square w-2/5 bg-blue-500 grid grid-rows-8 grid-cols-8">
          {chessBoardArray && chessBoardArray.length
            ? chessBoardArray.map(elem => elem)
            : null}
        </div>
      </div>
    </div>
  );
}
