"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Game } from "@prisma/client";
import { getAllGames, getGamesCount } from "./dbqueries";
import { TheParentPGN } from "@/app/engineAndPGN";
import isAuth from "@/components/auth_HOC";
import { GiMountedKnight } from "react-icons/gi";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingSpinner } from "@/app/ui/loadingSpinner";

function getPageArray(totalPages: number) {
  const x = [];
  for (let i = 0; i < Math.ceil(totalPages / 20); i++) {
    x.push(i + 1);
  }
  return x;
}

export function Page() {
  const [page, setPage] = useState(1);
  const [gameArray, setGameArray] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalGames, setTotalGames] = useState(20);
  useEffect(() => {
    async function allGames() {
      const y = await getGamesCount();
      setTotalGames(y);
      const x = await getAllGames(page); // set page here instead of number in getAllGames
      setGameArray(x);
      setLoading(false);
    }
    const timer = setTimeout(allGames, 250);
    return () => {
      clearTimeout(timer);
    };
  }, [page]); // add page in the dependency array
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex w-full justify-center text-5xl my-12">
        Welcome to the hall of games
      </div>
      {loading ? (
        <LoadingComponent />
      ) : (
        <div className="flex justify-center w-full">
          <div className="w-4/5 grid grid-cols-5 grid-auto-flow-row auto-rows-[50px] bg-[#323014] border rounded-lg">
            <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-3xl flex justify-center w-full">
              <div className="flex flex-col h-full justify-center">GameId </div>
            </div>
            <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-3xl flex justify-center w-full">
              <div className="flex flex-col h-full justify-center">White </div>
            </div>
            <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-3xl flex justify-center w-full">
              <div className="flex flex-col h-full justify-center">Black </div>
            </div>
            <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-3xl flex justify-center w-full">
              <div className="flex flex-col h-full justify-center">Result </div>
            </div>
            <div className="border-[#323014] rounded-lg bg-[#323014] text-[#fffefc] text-3xl flex justify-center w-full">
              <div className="flex flex-col h-full justify-center">
                View Game
              </div>
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
                            history.pushState(
                              null,
                              "",
                              "/dashboard/hallofgames",
                            ); // it will redirect back to hall of games if clickd on back button, otherwise it was redirecting to dashbaord
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
      )}
      <div className="flex justify-center w-full mt-5">
        {totalGames <= 80 ? (
          <div className="flex justify-center">
            <Mover
              numCheck={1}
              direction="left"
              setPage={setPage}
              currentPage={page}
              setLoading={setLoading}
            />
            {getPageArray(totalGames).map((num, idx) => (
              <NumberButton
                key={idx}
                numDisplay={num}
                numCheck={page}
                setPage={setPage}
                setLoading={setLoading}
              />
            ))}
            <Mover
              numCheck={Math.ceil(totalGames / 20)}
              direction="right"
              setPage={setPage}
              currentPage={page}
              setLoading={setLoading}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <Mover
              numCheck={1}
              direction="left"
              setPage={setPage}
              currentPage={page}
              setLoading={setLoading}
            />
            {page === 1 || page === 2 ? (
              <div className="flex">
                <NumberButton
                  numDisplay={1}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
                <NumberButton
                  numDisplay={2}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
                <Ellipses />
                <NumberButton
                  numDisplay={Math.ceil(totalGames / 20)}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
              </div>
            ) : page === Math.ceil(totalGames / 20) ||
              page === Math.ceil(totalGames / 20) - 1 ? (
              <div className="flex">
                <NumberButton
                  numDisplay={1}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
                <Ellipses />
                <NumberButton
                  numDisplay={Math.ceil(totalGames / 20) - 1}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
                <NumberButton
                  numDisplay={Math.ceil(totalGames / 20)}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
              </div>
            ) : (
              <div className="flex">
                <NumberButton
                  numDisplay={1}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
                <Ellipses />
                <NumberButton
                  numDisplay={page}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
                <Ellipses />
                <NumberButton
                  numDisplay={Math.ceil(totalGames / 20)}
                  numCheck={page}
                  setPage={setPage}
                  setLoading={setLoading}
                />
              </div>
            )}
            <Mover
              numCheck={Math.ceil(totalGames / 20)}
              direction="right"
              setPage={setPage}
              currentPage={page}
              setLoading={setLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="w-full h-48 flex flex-col justify-center ">
      <div className="w-full flex justify-center">
        <LoadingSpinner width="80px" height="80px" className="text-[#323014]" />
      </div>
      <div className="w-full flex justify-center font-bold text-3xl mt-5 text-[#323014]">
        Loading, please wait ...
      </div>
    </div>
  );
}

function NumberButton({
  numDisplay,
  numCheck,
  setPage,
  setLoading,
}: {
  numDisplay: number;
  numCheck: number;
  setPage: Dispatch<SetStateAction<number>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className={
        numCheck !== numDisplay
          ? "bg-[#fffefec] text-[#323014] hover:bg-[#323014] hover:bg-opacity-10 mx-2 w-12 text-xl cursor-pointer border-[#fffefc] rounded-md flex justify-center"
          : "bg-[#fffefec] text-[#323014] mx-2 w-12 text-xl cursor-pointer border-[#fffefc] rounded-md flex justify-center bg-[#323014] bg-opacity-40"
      }
      onClick={() => {
        if (numDisplay !== numCheck) {
          setPage(numDisplay);
          setLoading(true);
        }
      }}
    >
      <div className="flex flex-col justify-center font-mono">{numDisplay}</div>
    </div>
  );
}

function Mover({
  currentPage,
  numCheck,
  direction,
  setPage,
  setLoading,
}: {
  currentPage: number;
  numCheck: number;
  direction: string;
  setPage: Dispatch<SetStateAction<number>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className="bg-[#323014] text-[#fffefc] hover:bg-opacity-90 mx-2 w-12 h-12 rounded-md cursor-pointer border-[#323014] flex justify-center"
      onClick={() => {
        if (currentPage !== numCheck) {
          setLoading(true);
        }
        return currentPage !== numCheck
          ? direction === "right"
            ? setPage((page) => page + 1)
            : setPage((page) => page - 1)
          : null;
      }}
    >
      <div className="flex flex-col justify-center h-full">
        {direction === "right" ? <ChevronRight /> : <ChevronLeft />}
      </div>
    </div>
  );
}

function Ellipses() {
  return (
    <div
      className={
        "bg-[#fffefec] text-[#323014] mx-2 w-12 text-xl border-[#fffefc] rounded-md flex justify-center"
      }
    >
      <div className="flex flex-col justify-center">...</div>
    </div>
  );
}

export default isAuth(Page);
