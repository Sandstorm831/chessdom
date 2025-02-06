"use client";

import { useEffect, useState } from "react";
import { Game } from "@prisma/client";
import { getAllGames } from "./dbqueries";
import Link from "next/link";

export default function Page() {
  const [page, setPage] = useState(1);
  const [gameArray, setGameArray] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    async function allGames() {
      const x = await getAllGames(page);
      setGameArray(x);
      setLoading(false);
    }
    allGames();
  }, [page]);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex w-full justify-center text-5xl mb-12">
        Welcome to the hall of games
      </div>
      <div className="flex justify-center w-full">
        <div className="w-3/4 grid grid-cols-4 grid-auto-flow-row gap-4 auto-rows-[200px]">
          {gameArray && gameArray.length
            ? gameArray.map((obj, idx) => (
                <div
                  key={idx}
                  className="bg-gray-400 overflow-scroll flex justify-center"
                >
                  <Link
                    className="flex justify-center w-44 h-min bg-blue-950 rounded-lg text-white hover:cursor-pointer"
                    href={"/dashboard"}
                  >
                    Review the game
                  </Link>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
