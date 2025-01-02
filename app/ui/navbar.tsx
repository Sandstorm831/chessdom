import { auth } from "@/auth";
import { SignIn, SignOut } from "@/components/auth_components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default async function Navbar() {
  const session = await auth();
  return (
    <div className="w-full flex justify-between pt-3 px-3 text-[#323014]">
      <div className=" text-3xl">Chessdom</div>
      <div>
        {session?.user ? (
            <Popover >
                <PopoverTrigger asChild>
          <Avatar className="cursor-pointer">
            {session.user.image !== null ? <AvatarImage src={session.user.image} /> : <AvatarImage src="default_avatar.svg" />}
            <AvatarFallback>CP</AvatarFallback>
          </Avatar></PopoverTrigger>
          <PopoverContent className="w-max">
            <SignOut variant="default" className="text-xl bg-[#323014] text-[#FFFEFC]" />
          </PopoverContent>
          </Popover>
        ) : (
          <SignIn variant="link" className="text-3xl text-[#323014]" />
        )}
      </div>
    </div>
  );
}
