"use client";
import Link from "next/link";
import { EngineX } from "../engineAndPGN";
import { useEffect } from "react";
import initialisingEngineWorker from "../startEngine";
import isAuth from "@/components/auth_HOC";
import Image from "next/image";

function Page() {
  // The code will run only when present on the client, and not on pre-rendering on server.
  useEffect(() => {
    if (EngineX.stockfishEngine === null) initialisingEngineWorker();
    console.log(EngineX);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center bg-[#fffefc] text-[#323014] px-5">
      <div className="w-full flex justify-start mt-12">
        <div className="group relative h-[500px] w-full lg:w-2/3 rounded-lg">
          <Image
            src="/images/deepblue.webp"
            alt="The deep blue"
            fill
            objectFit="cover"
            objectPosition="bottom"
            className="rounded-lg shadow-[0_10px_14px_5px_rgba(0,0,0,0.2)] opacity-95 group-hover:opacity-100 transition duration-300 ease-in-out"
          />
          <h2 className="text-[#323014] text-3xl font-bold absolute right-5 bottom-8 group-hover:bottom-[340px] group-hover:transition-bottom group-hover:delay-0 group-hover:duration-300 transition-bottom delay-300 duration-300">
            Play with Computer
          </h2>
          <div className="absolute bg-[#fffefc] bg-opacity-80 text-2xl top-48 text-[#323014] opacity-0 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-300 transition duration-300 rounded-lg mx-5 p-5">
            <span className="max-xl:hidden">In 1997, IBM&apos;s Deep Blue achieved a historic victory over world
            chess champion Garry Kasparov, marking the first time a computer
            defeated a reigning world chess champion under standard tournament
            conditions.Now, an open-source chess engine, Stockfish, has far
            surpassed Deep Blue in chess-playing capability ...</span>
            <span className="xl:hidden"> Stockfish engine, the world&apos;s most powerful chess engine

            </span>
          </div>
          <div className="absolute bg-[#293639] bg-opacity-90 text-3xl bottom-4 right-1 text-[#fffefc] opacity-0 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-300 transition duration-300 rounded-lg mx-5 p-3 group-hover:cursor-pointer">
            <Link href={"/dashboard/chessboard"}>Challenge Stockfish</Link>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-end mt-12">
        <div className="group relative h-[500px] w-full lg:w-2/3 rounded-lg">
          <Image
            src="/images/2players.jpg"
            alt="wardens playing chess"
            fill
            objectFit="cover"
            className="rounded-lg shadow-[0_10px_14px_5px_rgba(0,0,0,0.2)] opacity-95 group-hover:opacity-100 transition duration-300 ease-in-out"
          />
          <div className="absolute font-bold left-[38px] bottom-8 text-[#fffefc] text-3xl group-hover:bottom-[320px] group-hover:transition-bottom group-hover:delay-0 group-hover:duration-300 transition-bottom delay-300 duration-300">
            Play with a Friend
          </div>
          <div className="absolute text-2xl left-[38px] mr-5 top-48 text-[#fffefc] opacity-0 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-300 transition duration-300">
            <span className="max-xl:hidden">Chess has evolved over centuries, from its ancient origins in India
            as &quot;chaturanga&quot; to the global strategy game we recognize
            today. Throughout history, it has been a battleground of intellect,
            with players challenging each other across generations. From royal
            courts to modern tournaments, chess remains a profound test of human
            strategy and creativity.</span>
            <span className="xl:hidden">
              Play live with people areound the world
            </span>
          </div>
          <div className="absolute cursor-pointer bg-[#c4742e] bg-opacity-80 text-3xl left-8 bottom-8 p-3 rounded-lg text-[#1b1713] opacity-0 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-300 transition duration-300">
            <Link href={"/dashboard/opponent"}>Challenge a Friend </Link>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-start mt-12 mb-12">
        <div className="group relative h-[500px] w-full lg:w-2/3 rounded-lg">
          <Image
            src="/images/chessSet.jpg"
            alt="The deep blue"
            fill
            objectFit="cover"
            className="rounded-lg shadow-[0_10px_14px_5px_rgba(0,0,0,0.2)] opacity-95 group-hover:opacity-100 transition duration-300 ease-in-out"
          />
          <div className="text-4xl font-bold absolute right-8 bottom-8 text-white group-hover:bottom-[340px] group-hover:transition-bottom group-hover:delay-0 group-hover:duration-300 transition-bottom delay-300 duration-300">
            Hall of Games
          </div>
          <p className="text-2xl ml-5 absolute right-4 top-48 text-white opacity-0 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-300 transition duration-300">
            <span className="max-xl:hidden">Chess game archives trace back centuries, with some of the earliest
            documented games from the 15th century, providing a historical
            ledger of chess strategy evolution and player prowess. Today,
            digital archives like ChessBase offer millions of games, accessible
            for study, analysis, and entertainment, preserving the legacy of
            chess while serving as a vital resource for players at all levels to
            learn from past masters.</span>
            <span className="xl:hidden">
              review and analyze all the games played live
            </span>
          </p>
          <div className="absolute bg-[#151c28] bg-opacity-80 text-2xl bottom-4 right-1 text-[#fffefc] opacity-0 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-300 transition duration-300 rounded-lg mx-5 p-3 group-hover:cursor-pointer">
            <Link href={"/dashboard/hallofgames"}>View Hall of Games </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default isAuth(Page);
