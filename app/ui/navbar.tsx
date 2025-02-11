import { auth } from "@/auth";
import { SignIn, SignOut } from "@/components/auth_components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import Link from "next/link";
import { GiMountedKnight } from "react-icons/gi";

export default async function Navbar() {
  const session = await auth();
  return (
    <div className="w-full flex justify-between pt-3 px-3 text-[#323014]">
      <div className=" text-3xl">
        <Link href={session ? "/dashboard" : "/"}> Chessdom </Link>
      </div>
      <div>
        {session?.user ? (
          <Popover>
            <PopoverTrigger asChild>
              <GiMountedKnight className="cursor-pointer text-5xl" />
              {/* <Image
                src="/knight_mirror.png"
                alt="The Knight"
                height={40}
                width={40}
                className="cursor-pointer"
              /> */}
            </PopoverTrigger>
            <PopoverContent className="w-max">
              {session ? (
                <Button variant={"outline"}>
                  <Link href={"/dashboard"}>go to dashboard</Link>
                </Button>
              ) : null}
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
