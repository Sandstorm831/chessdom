"use client";
import { playfair_display } from "./ui/fonts";
import { EngineX } from "./engineAndPGN";
import { useEffect } from "react";
import initialisingEngineWorker from "./startEngine";
import { GiOrbitalRays, GiMountedKnight } from "react-icons/gi";
import { FaQuoteLeft, FaQuoteRight, FaChessBoard } from "react-icons/fa";

export default function Home() {
  // The code will run only when present on the client, and not on pre-rendering on server.
  useEffect(() => {
    if (EngineX.stockfishEngine === null) initialisingEngineWorker();
  }, []);

  return (
    <div
      className={`${playfair_display.className} antialiased bg-[#323014] w-full h-full text-[#fffefc] overflow-auto`}
    >
      <div className="w-full h-full flex flex-col justify-center p-4 sm:p-5">
        <div className="w-full flex flex-col md:flex-row items-center h-max">
          <div className="text-6xl sm:text-8xl md:text-9xl lg:text-[150px] md:mr-12">
            THE Game
          </div>
          <div className="flex mt-4 md:mt-0">
            <div className="flex flex-col justify-center">
              <TheGrid />
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row justify-end items-center h-max mt-4 md:mt-0">
          <div className="flex justify-end order-2 md:order-1">
            <div className="flex flex-col justify-center">
              <TheGrid />
            </div>
          </div>
          <div className="text-7xl sm:text-9xl md:text-[150px] lg:text-[200px] flex md:ml-12 order-1 md:order-2">
            of CHESS
          </div>
        </div>
        <div className="flex flex-col lg:flex-row w-full mt-10">
          <div className="border-b-2 lg:border-r-2 lg:border-b-0 border-[#fffefc] w-full lg:w-1/3 flex flex-col pb-8 lg:pb-0">
            <div className="text-2xl sm:text-3xl md:text-4xl flex justify-center lg:justify-end lg:mr-8">
              <p className="font-extrabold">
                6<sup>th</sup> Century - Eternity
              </p>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl flex justify-center lg:justify-end lg:mr-8 mt-3 sm:mt-5">
              <div className="italic font-serif font-light">Earth</div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl text-center mt-5 mx-auto lg:mx-0 lg:mr-8 max-w-sm">
              Chess was never just a game, but a journey for anyone who masters
              it and becomes a knight
            </div>
            <div className="flex justify-center lg:mr-8 mt-5">
              <GiMountedKnight className="text-9xl sm:text-[150px] md:text-[200px] text-[#fffefc]" />
            </div>
          </div>
          <div className="w-full lg:w-2/3 flex flex-col mt-8 lg:mt-0">
            <div className="flex flex-col sm:flex-row ms-0 lg:ms-8 h-full">
              <div className="flex flex-row sm:flex-col justify-around items-center">
                <GiOrbitalRays className="text-8xl sm:text-9xl md:text-[150px] mb-4 sm:mb-0" />
                <FaChessBoard className="text-9xl sm:text-[150px] md:text-[200px] text-[#fffefc]" />
              </div>
              <div className="flex justify-center mt-8 sm:mt-0">
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
    <div className="ml-0 sm:ml-12 flex flex-col h-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl w-full lg:w-3/4">
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
      className={`grid grid-cols-[repeat(15,15px)] grid-rows-[repeat(3,15px)] sm:grid-cols-[repeat(15,25px)] sm:grid-rows-[repeat(3,25px)] md:grid-cols-[repeat(15,35px)] md:grid-rows-[repeat(3,35px)] lg:grid-cols-[repeat(15,50px)] lg:grid-rows-[repeat(3,50px)] w-full`}
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
