"use client";
import { playfair_display } from "./ui/fonts";
import { EngineX } from "./engineAndPGN";
import { useEffect } from "react";
import initialisingEngineWorker from "./startEngine";
import { GiOrbitalRays, GiMountedKnight } from "react-icons/gi";
import {
  FaQuoteLeft,
  FaQuoteRight,
  FaChessBoard,
} from "react-icons/fa";

export default function Home() {
  // The code will run only when present on the client, and not on pre-rendering on server.
  useEffect(() => {
    if (EngineX.stockfishEngine === null) initialisingEngineWorker();
    console.log(EngineX);
  }, []);

  return (
    <div
      className={`${playfair_display.className} antialiased bg-[#323014] w-full h-full text-[#fffefc]`}
    >
      <div className="w-full h-full flex flex-col justify-center px-5">
        <div className="w-full flex h-max">
          <div className="text-[150px] mr-12 ">THE Game</div>
          <div className="flex">
            <div className="flex flex-col justify-center">
              <TheGrid />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end h-max">
          <div className="flex justify-end">
            <div className="flex flex-col justify-center">
              <TheGrid />
            </div>
          </div>
          <div className="text-[200px] flex ml-12">of CHESS</div>
        </div>
        <div className="flex w-full">
          <div className="border-r-2 border-[#fffefc] w-1/3 flex flex-col">
            <div className="text-4xl flex justify-end mr-8 ">
              <p className="font-extrabold">
                6<sup>th</sup> Century - Eternity
              </p>
            </div>
            <div className="text-3xl flex justify-end mr-8 mt-5">
              <div className="italic font-serif font-light">Earth</div>
            </div>
            <div className="text-3xl text-center mt-5 mr-8">
              Chess was never just a game, but a journey for anyone who masters
              it and becomes a knight
            </div>
            {/* <div className="flex justify-center"><FaArrowTrendDown /></div> */}
            <div className="flex justify-center mr-8 mt-5">
              {/* <FaPersonWalkingArrowRight className="text-[200px] text-[#fffefc]" /> */}
              <GiMountedKnight className="text-[200px] text-[#fffefc]" />
            </div>
          </div>
          <div className="w-2/3 flex flex-col">
            <div className="flex ms-8 h-full">
              <div className="flex flex-col justify-around">
                <div className="flex justify-center">
                  <GiOrbitalRays className="text-[150px]" />
                </div>
                <FaChessBoard className="text-[200px] text-[#fffefc]" />
              </div>
              <div className="flex justify-center">
                <Quote />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Quote() {
  return (
    <div className="ml-12 flex flex-col h-full text-5xl w-1/2">
      <FaQuoteLeft className="mb-5" />
      Of chess, it has been said that life is not long enough for it, but that
      is the fault of life, not chess.
      <div className="flex justify-end mt-5">- William Napier</div>
      <div className="flex justify-end mt-5">
        <FaQuoteRight />
      </div>
    </div>
  );
}

function TheGrid() {
  const x: number[] = [];
  for (let i = 0; i < 45; i++) {
    x.push(i);
  }
  return (
    <div
      className={`grid grid-cols-[repeat(15,50px)] grid-rows-[repeat(3,50px)] w-full`}
    >
      {x.map((num, idx) => (
        <div
          className={num % 2 === 1 ? "bg-[#323014]" : "bg-[#fffefc]"}
          key={idx}
        ></div>
      ))}
    </div>
  );
}
