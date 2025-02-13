"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EngineX } from "../engineAndPGN";
import { useEffect } from "react";
import initialisingEngineWorker from "../startEngine";
import isAuth from "@/components/auth_HOC";
import Image from "next/image";

export function Page() {
  // The code will run only when present on the client, and not on pre-rendering on server.
  useEffect(() => {
    if (EngineX.stockfishEngine === null) initialisingEngineWorker();
    console.log(EngineX);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center bg-[#FFFEFC] text-[#323014] px-5">
      <div className="w-full flex justify-start mt-12">
        <div className="relative h-[500px] w-2/3 rounded-lg">
          <Image
          src="/images/deepblue.webp"
          alt="The deep blue"
          fill
          objectFit="cover"
          objectPosition="bottom"
          className="rounded-lg"
          />
        </div>
      </div>
      <div className="w-full flex justify-end mt-12">
        <div className="relative h-[500px] w-2/3 rounded-lg">
        <Image
          src="/images/2players.jpg"
          alt="The deep blue"
          fill
          objectFit="cover"
          className="rounded-lg"
          />
        </div>
      </div>
      <div className="w-full flex justify-start mt-12 mb-12">
        <div className="relative h-[500px] w-2/3 rounded-lg">
        <Image
          src="/images/chessSet.jpg"
          alt="The deep blue"
          fill
          objectFit="cover"
          className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default isAuth(Page);


// https://www.behance.net/gallery/208985531/shahmatnyjpavilon-imeni-vja-dvorkovicha?tracking_source=search_projects|chess+website+web+design&l=3#

// https://www.behance.net/gallery/110228391/Illustrations-chess?tracking_source=search_projects|chess+website&l=16#

// https://www.behance.net/gallery/197310563/Chess-Interface?tracking_source=search_projects|chess+website&l=6#

// https://www.behance.net/gallery/207748933/Summer-chess-camp?tracking_source=search_projects%7Cchess+website#

// https://preview.themeforest.net/item/checkmate-chess-club-tournaments-elementor-template-kit/full_screen_preview/29880542

// https://dribbble.com/shots/16086042-Match-Point-Kasparov

// https://www.behance.net/search/projects/chess%20website%20web%20design