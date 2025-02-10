import { auth } from "@/auth";
import { SignIn, SignOut } from "@/components/auth_components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import Link from "next/link";
import { FaChess } from "react-icons/fa";

export default async function Navbar() {
  const session = await auth();
  return (
    <div className="w-full flex justify-between pt-3 px-3 text-[#323014]">
      <div className=" text-3xl">
        <Link href="/"> Chessdom </Link>
      </div>
      <div>
        {session?.user ? (
          <Popover>
            <PopoverTrigger asChild>
              <FaChess className="cursor-pointer text-4xl" />
              {/* <Image
                src="/knight_mirror.png"
                alt="The Knight"
                height={40}
                width={40}
                className="cursor-pointer"
              /> */}
            </PopoverTrigger>
            <PopoverContent className="w-max">
              <SignOut
                variant="default"
                className="text-xl bg-[#323014] text-[#FFFEFC]"
              />
            </PopoverContent>
          </Popover>
        ) : (
          <SignIn variant="link" className="text-3xl text-[#323014]" />
        )}
      </div>
    </div>
  );
}
