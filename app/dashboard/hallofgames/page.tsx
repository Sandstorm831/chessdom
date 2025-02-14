"use client";

import React, { useEffect, useState } from "react";
import { Game } from "@prisma/client";
import { getAllGames } from "./dbqueries";
import { TheParentPGN } from "@/app/engineAndPGN";
import isAuth from "@/components/auth_HOC";
import { GiMountedKnight } from "react-icons/gi";
import { redirect } from "next/navigation";

export function Page() {
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
      <div className="flex w-full justify-center text-5xl my-12">
        Welcome to the hall of games
      </div>
      <div className="flex justify-center w-full">
        <div className="w-4/5 grid grid-cols-5 grid-auto-flow-row auto-rows-[50px] bg-[#323014] border rounded-lg">
          <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full">
            <div className="flex flex-col h-full justify-center">GameId </div>
          </div>
          <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full">
            <div className="flex flex-col h-full justify-center">White </div>
          </div>
          <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full">
            <div className="flex flex-col h-full justify-center">Black </div>
          </div>
          <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full">
            <div className="flex flex-col h-full justify-center">Result </div>
          </div>
          <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full">
            <div className="flex flex-col h-full justify-center">View Game</div>
          </div>
          {gameArray && gameArray.length
            ? gameArray.map((obj, idx) => {
                const ary = [];
                ary.push(
                  <div
                    className={
                      idx % 2 === 1
                        ? "px-2 overflow-scroll border-[#323014] h-full bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full font-mono"
                        : "px-2 overflow-scroll border-[#323014] h-full bg-[#fffefc] text-[#323014] text-xl flex justify-center w-full font-mono"
                    }
                  >
                    <div className="overflow-scroll px-2 flex flex-col h-full justify-center">
                      {obj.RoomID.split("?user1")[0]}
                    </div>
                  </div>,
                );
                ary.push(
                  <div
                    className={
                      idx % 2 === 1
                        ? "px-2 overflow-scroll border-[#323014] h-full bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full font-mono"
                        : "px-2 overflow-scroll border-[#323014] h-full bg-[#fffefc] text-[#323014] text-xl flex justify-center w-full font-mono"
                    }
                  >
                    <div className="overflow-scroll px-2 flex flex-col h-full justify-center">
                      {obj.white.split("@")[0]}
                    </div>
                  </div>,
                );
                ary.push(
                  <div
                    className={
                      idx % 2 === 1
                        ? "px-2 overflow-scroll border-[#323014] h-full bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full font-mono"
                        : "px-2 overflow-scroll border-[#323014] h-full bg-[#fffefc] text-[#323014] text-xl flex justify-center w-full font-mono"
                    }
                  >
                    <div className="overflow-scroll px-2 flex flex-col h-full justify-center">
                      {obj.black.split("@")[0]}
                    </div>
                  </div>,
                );
                ary.push(
                  <div
                    className={
                      idx % 2 === 1
                        ? "px-2 overflow-scroll border-[#323014] h-full bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full font-mono"
                        : "px-2 overflow-scroll border-[#323014] h-full bg-[#fffefc] text-[#323014] text-xl flex justify-center w-full font-mono"
                    }
                  >
                    <div className="overflow-scroll px-2 flex flex-col h-full justify-center">
                      {obj.result}
                    </div>
                  </div>,
                );
                ary.push(
                  <div
                    className={
                      idx % 2 === 1
                        ? "px-2 overflow-scroll border-[#323014] h-full bg-[#323014] text-[#fffefc] text-xl flex justify-center w-full font-mono"
                        : "px-2 overflow-scroll border-[#323014] h-full bg-[#fffefc] text-[#323014] text-xl flex justify-center w-full font-mono"
                    }
                  >
                    <div className="overflow-scroll px-2 flex flex-col h-full justify-center p-1">
                      <GiMountedKnight
                        className="h-full w-full cursor-pointer"
                        onClick={() => {
                          TheParentPGN.PGN = obj.PGN;
                          TheParentPGN.white = obj.white;
                          TheParentPGN.black = obj.black;
                          TheParentPGN.stockfishGame = false;
                          redirect("/dashboard/reviewgame");
                        }}
                      />
                    </div>
                  </div>,
                );
                return (
                  <React.Fragment key={idx}>
                    {ary.map((sobj, skey) => (
                      <div key={skey}>{sobj}</div>
                    ))}
                  </React.Fragment>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
}
export default isAuth(Page);
// {gameArray && gameArray.length
//   ? gameArray.map((obj, idx) => (
//       <div
//         key={idx}
//         className="bg-gray-400 overflow-scroll flex justify-center"
//       >
//         <Link
//           className="flex justify-center w-44 h-min bg-blue-950 rounded-lg text-white hover:cursor-pointer"
//           href={"/dashboard/reviewgame"}
// onClick={() => {
//   TheParentPGN.PGN = obj.PGN;
//   TheParentPGN.white = obj.white;
//   TheParentPGN.black = obj.black;
//   TheParentPGN.stockfishGame = false;
// }}
//         >
//           Review the game
//         </Link>
//       </div>
//     ))
//   : null}
