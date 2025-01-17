import Image from "next/image";
import { playfair_display } from "./ui/fonts";

export default function Home() {
  return (
    <div
      className={`${playfair_display.className} antialiased bg-[#fffefc] w-full h-full text-[#323014]`}
    >
      <div className="w-full h-full flex flex-col justify-center">
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
