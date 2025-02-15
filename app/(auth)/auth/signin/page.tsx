import Image from "next/image";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { signIn, providerMap } from "@/auth";

export default function Page() {
  return (
    <div className="w-full h-screen flex flex-col justify-center">
      <div className="w-full flex justify-center">
        <div className="w-1/3 flex flex-col">
          <div className="flex justify-around">
            <Image
              src={"/knight_mirror_.png"}
              alt="Knight"
              width={100}
              height={100}
              className="rounded-lg"
            />
            <div className="flex flex-col justify-center">
              <div className="text-3xl text-[#323014]">Welcome to Chessdom</div>
              <div className="text-xl text-gray-500">
                Please choose your preferred method to continue
              </div>
            </div>
          </div>
          <div className="w-full border-2 rounded-lg"></div>

          {Object.values(providerMap).map((provider) => (
            <form
              key={provider.id}
              action={async (formData) => {
                "use server";
                await signIn(provider.id, { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className={
                  provider.name === "GitHub"
                    ? `w-full flex justify-around rounded-lg text-[#323014] text-2xl py-5 hover:bg-[#010409] hover:bg-opacity-20 duration-200 cursor-pointer`
                    : `w-full flex justify-around rounded-lg text-[#323014] text-2xl py-5 hover:bg-[#0b57d0] hover:bg-opacity-20 duration-200 cursor-pointer`
                }
              >
                Continue with {provider.name}
                {provider.name === "GitHub" ? (
                  <FaGithub className="text-4xl text-[#323014]" />
                ) : (
                  <FaGoogle className="text-4xl text-[#323014]" />
                )}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
