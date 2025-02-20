import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { HiCodeBracket } from "react-icons/hi2";
import React, { ReactElement } from "react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col justify-center text-[#323014]">
      <div className="w-full flex justify-center font-bold text-5xl">
        <div className="w-1/2">Hello, Nice to meet you, I am Rohan</div>
      </div>
      <div className="w-full flex justify-center text-2xl mt-4">
        <div className="w-1/2">
          a full-stack developer who loves to work and learn new technologies
          everyday. Web-3 and Blockchain enthusiast and trying to do something
          hands-on. I like to do Calisthenics to maintian fitness and loves to
          watch movies and read books in my free time. If you liked my project,
          you can reach me out via ...{" "}
        </div>
      </div>
      <div className="w-full flex justify-center text-2xl mt-4">
        <div className="w-1/2 flex flex-col">
          <Iconholder href="https://x.com/Rodes30947083" title="Twitter">
            <FaXTwitter className="mx-3 text-5xl" />
          </Iconholder>
          <Iconholder href="https://github.com/Sandstorm831" title="Github">
            <FaGithub className="mx-3 text-5xl" />
          </Iconholder>
          <Iconholder
            href="https://www.linkedin.com/in/rohan-garg-1b6b40200/"
            title="Linkedin"
          >
            <FaLinkedin className="mx-3 text-5xl" />
          </Iconholder>
          <Iconholder
            href="mailto:gargrohan831@gmail.com?subject=Hey, Let's Connect"
            title="Mail"
          >
            <IoIosMail className="mx-3 text-5xl" />
          </Iconholder>
          <Iconholder
            href="https://sandstorm831.github.io"
            title="Portfolio Page"
          >
            <HiCodeBracket className="mx-3 text-5xl" />
          </Iconholder>
        </div>
      </div>
    </div>
  );
}

function Iconholder({
  title,
  children,
  href,
}: {
  title: string;
  children: ReactElement;
  href: string;
}) {
  return (
    <Link className="flex my-3" href={href}>
      <div className="flex flex-col justify-end">{children}</div>
      <div className="text-xl h-full flex flex-col justify-end">{title}</div>
    </Link>
  );
}
