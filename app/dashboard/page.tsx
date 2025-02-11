"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EngineX } from "../engineAndPGN";
import { useEffect } from "react";
import initialisingEngineWorker from "../startEngine";

export default function Page() {
  // The code will run only when present on the client, and not on pre-rendering on server.
  useEffect(() => {
    if (EngineX.stockfishEngine === null) initialisingEngineWorker();
    console.log(EngineX);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center bg-[#FFFEFC] text-[#323014]">
      <div className="w-full flex justify-center">
        <Button className="text-3xl bg-[#323014] text-[#fffefc] py-6">
          <Link href="/dashboard/chessboard"> Play with computer </Link>
        </Button>
      </div>
      <div className="w-full flex justify-center mt-5">
        <Button className="text-3xl bg-[#323014] text-[#fffefc] py-6">
          <Link href="/dashboard/opponent"> Play Online </Link>
        </Button>
      </div>
      <div className="w-full flex justify-center mt-5">
        <Button className="text-3xl bg-[#323014] text-[#fffefc] py-6">
          <Link href="/dashboard/hallofgames"> Hall of Games </Link>
        </Button>
      </div>
    </div>
  );
}
