import { auth } from "@/auth";
import { SignIn, SignOut } from "@/components/auth_components";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { GiMountedKnight } from "react-icons/gi";
import { MdDashboard } from "react-icons/md";
import { FaHome, FaGithub } from "react-icons/fa";
import { GoCommandPalette } from "react-icons/go";
import { TbHeartHandshake } from "react-icons/tb";

export default async function Navbar() {
  const session = await auth();
  return (
    <div className="w-full flex justify-between pt-3 px-3 text-[#fffefc] bg-[#323014]">
      <div className=" text-3xl">
        <Link href={"/"}> Chessdom </Link>
      </div>
      <div>
        {session?.user ? (
          <div className="flex justify-evenly">
            <div className="text-2xl mx-5">
              <div className="flex flex-col justify-center h-full">
                <Link
                  href="/dashboard"
                  className="flex justify-center cursor-pointer hover:underline transition duration-150"
                >
                  <MdDashboard className="h-full" />
                  dashboard
                </Link>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <GiMountedKnight className="cursor-pointer text-5xl" />
              </PopoverTrigger>
              <PopoverContent className="w-max flex flex-col p-2">
                {session.user.email ? (
                  <div className="text-3xl text-[#323014] my-2 mx-5">{`Hello ${session.user.email.split("@")[0]}`}</div>
                ) : (
                  "Hello Knight"
                )}
                {session ? (
                  <div className="bg-[#fffefec] text-[#323014] hover:bg-[#323014] hover:bg-opacity-10 text-lg cursor-pointer border-[#fffefc] rounded-md flex">
                    <div className="flex flex-col justify-center ms-5 mr-2">
                      <FaHome />
                    </div>
                    <div className="flex flex-col justify-center">
                      <Link href={"/"}>Home</Link>
                    </div>
                  </div>
                ) : null}
                {session ? (
                  <div className="bg-[#fffefec] text-[#323014] hover:bg-[#323014] hover:bg-opacity-10 text-lg cursor-pointer border-[#fffefc] rounded-md flex">
                    <div className="flex flex-col justify-center ms-5 mr-2">
                      <MdDashboard />
                    </div>
                    <div className="flex flex-col justify-center">
                      <Link href={"/dashboard"}>Dashboard</Link>
                    </div>
                  </div>
                ) : null}
                {session ? (
                  <div className="bg-[#fffefec] text-[#323014] hover:bg-[#323014] hover:bg-opacity-10 text-lg cursor-pointer border-[#fffefc] rounded-md flex">
                    <div className="flex flex-col justify-center ms-5 mr-2">
                      <GoCommandPalette />
                    </div>
                    <div className="flex flex-col justify-center">
                      <Link href={"/aboutme"}>About Me</Link>
                    </div>
                  </div>
                ) : null}
                {session ? (
                  <div className="bg-[#fffefec] text-[#323014] hover:bg-[#323014] hover:bg-opacity-10 text-lg cursor-pointer border-[#fffefc] rounded-md flex">
                    <div className="flex flex-col justify-center ms-5 mr-2">
                      <TbHeartHandshake />
                    </div>
                    <div className="flex flex-col justify-center">
                      <Link href={"/attribution"}>Attributions</Link>
                    </div>
                  </div>
                ) : null}
                {session ? (
                  <div className="bg-[#fffefec] text-[#323014] hover:bg-[#323014] hover:bg-opacity-10 text-lg cursor-pointer border-[#fffefc] rounded-md flex">
                    <div className="flex flex-col justify-center ms-5 mr-2">
                      <FaGithub />
                    </div>
                    <div className="flex flex-col justify-center">
                      <Link href={"https://github.com/sandstorm831/chessdom"}>
                        GitHub Repo
                      </Link>
                    </div>
                  </div>
                ) : null}
                <div className="w-full px-5 mt-2">
                  <SignOut
                    variant="default"
                    className="text-xl bg-[#323014] text-[#FFFEFC] w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <SignIn variant="link" className="text-3xl text-[#fffefc]" />
        )}
      </div>
    </div>
  );
}
