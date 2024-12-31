import Image from "next/image";
import { playfair_display } from "./ui/fonts";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className={`${playfair_display.className} antialiased bg-[#fffefc] h-screen w-screen text-[#323014]`}
    >
      <div className="w-full h-full flex flex-col">
        <div className="w-full flex justify-between mt-3 px-3">
          <div className=" text-3xl">Chessdom</div>
          <div>
            <Button variant="link"  className="text-3xl"><Link href="/signin">Sign in</Link></Button>
            <Button variant="ghost" className="text-3xl border-[#323014] border px-2 py-5 bg-transparent"><Link href='/signup'>Sign up</Link></Button>
          </div>
        </div>
        <div className="w-full flex justify-center h-max">
          <div className="text-5xl">Let's Play</div>
        </div>
        <div className="w-full flex justify-center h-max mt-5 mb-5">
          <Image
            src={"/chessboard.png"}
            alt="Chessboard picture"
            width={500}
            height={500}
          />
        </div>
        <div className="w-full flex justify-center h-max">
        <div className="text-5xl">CHESS</div>
        </div>
      </div>
    </div>
  );
}
