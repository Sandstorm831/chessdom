import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col justify-center bg-[#FFFEFC] text-[#323014]">
      <div className="w-full flex justify-center">
        <Button className="text-3xl bg-[#323014] text-[#fffefc] py-6">
          <Link href="/dashboard/chessboard" > Play with computer  </Link>
        </Button>
      </div>
    </div>
  );
}
