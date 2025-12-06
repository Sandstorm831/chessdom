import Image from "next/image";

export default function Page() {
  const nonImageItems = [
    {
      title: "Pragmatic Drag and Drop",
      link: "https://github.com/atlassian/pragmatic-drag-and-drop",
      body: "Used for drag and drop functionality.",
    },
    {
      title: "PGN-Parser",
      link: "https://github.com/mliebelt/pgn-parser",
      body: "Used for parsing standard and non-standard PGN formats.",
    },
    {
      title: "Prisma",
      link: "https://www.prisma.io/",
      body: "Primary ORM for simplifying all the Database related work",
    },
    {
      title: "Radix-UI",
      link: "https://www.radix-ui.com/",
      body: "An indispensible component of shadcn",
    },
    {
      title: "shadcn/UI",
      link: "https://ui.shadcn.com/",
      body: "Incredible react components",
    },
    {
      title: "Axios",
      link: "https://github.com/axios/axios",
      body: "Promise based HTTP client for the browser and node.js",
    },
    {
      title: "Stockfish-nnue.wasm",
      link: "hhttps://github.com/hi-ogawa/Stockfish",
      body: "Primary stockfish engine used for playing with computer functionality",
    },
    {
      title: "Tailwindcss",
      link: "https://tailwindcss.com/",
      body: "A utility-first CSS framework used for styling purposes.",
    },
    {
      title: "NextAuth.js",
      link: "https://next-auth.js.org/",
      body: "For handling OAuth authentication.",
    },
    {
      title: "Next.js",
      link: "https://nextjs.org/",
      body: "React framework used in this project.",
    },
    {
      title: "React",
      link: "https://react.dev/",
      body: "The library for web and native user interfaces",
    },
    {
      title: "React-Icons",
      link: "https://react-icons.github.io/react-icons/",
      body: "Primary library for including icons",
    },
    {
      title: "react-countdown-circle-timer",
      link: "https://github.com/vydimitrov/react-countdown-circle-timer",
      body: "A timer component",
    },
    {
      title: "React-Redux",
      link: "https://react-redux.js.org/",
      body: "For global state management",
    },
    {
      title: "Socket.IO",
      link: "https://socket.io/",
      body: "Web-Socket library for live chessplay",
    },
    {
      title: "UID",
      link: "https://github.com/lukeed/uid",
      body: "For generating randomized output strings of fixed length using lowercase alphanumeric characters.",
    },
    {
      title: "Vaul",
      link: "https://github.com/emilkowalski/vaul",
      body: "Drawer component for promotion and other functionalities.",
    },
    {
      title: "Lucide React",
      link: "https://lucide.dev/guide/packages/lucide-react",
      body: "Implementation of the lucide icon library for react applications",
    },
    {
      title: "Typescript",
      link: "https://www.typescriptlang.org/",
      body: "For typechecks in javascript",
    },
    {
      title: "NodeJS",
      link: "https://nodejs.org/en",
      body: "JavaScript runtime environment",
    },
  ];
  const cloudAttributions = [
    {
      title: "Vercel",
      link: "https://vercel.com/",
      body: "Used for hosting chessdom project.",
    },
    {
      title: "Railway",
      link: "https://railway.com/",
      body: "Used for hosting the SocketIO server for live chess game-play.",
    },
    {
      title: "Aiven",
      link: "https://aiven.io/",
      body: "Used for drag and drop functionality.",
    },
  ];
  return (
    <div className="w-full h-full flex flex-col mt-24 text-[#323014]">
      <div className="w-full flex justify-center font-bold text-5xl">
        <div className="w-full px-4 md:w-3/4 md:px-0">
          Credits and Attributions
        </div>
      </div>
      <div className="w-full flex justify-center text-2xl mt-4">
        <div className="w-full px-4 md:w-3/4 md:px-0">
          This project would not be possible without using the resources,
          libraries and packages designed and developed by other people.
          Here&apos;s a list of all the resources I have used in making this
          project and an attempt to give them proper credit for their work.
        </div>
      </div>
      <div className="w-full flex justify-center font-bold text-3xl mt-12 underline">
        <div className="w-full px-4 md:w-3/4 md:px-0">Images and Icons</div>
      </div>
      <div className="w-full flex justify-center text-2xl mt-4">
        <div className="w-3/4 flex flex-col">
          <div className="flex my-3">
            <div className="flex flex-col justify-end">
              <Image
                src="/chesspeices/wn.svg"
                width={50}
                height={50}
                alt="black pawn"
                className="max-sm:w-[250px] h-auto"
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                All the chesspieces are developed by Cburnett, please visit{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 cursor-pointer underline"
                  href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces"
                >
                  {"wikimedia"}
                </a>{" "}
                for more details
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div className="flex flex-col justify-end">
              <Image
                src="/knight_mirror_.png"
                width={50}
                height={50}
                alt="knight"
                className="max-sm:w-[250px] h-auto"
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Knight icons created by Pixel perfect - Flaticon. visit{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.flaticon.com/free-icon/chess_591779?term=chess&page=1&position=63&origin=tag&related_id=591779"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Flaticon
                </a>{" "}
                for more details
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div className="flex flex-col justify-end">
              <Image
                src="/chess.png"
                width={50}
                height={50}
                alt="knight"
                className="max-sm:w-[250px] h-auto"
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Knight icons created by Pixel perfect - Flaticon. visit{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.flaticon.com/free-icon/chess_726165?term=chess&page=1&position=13&origin=search&related_id=726165"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Flaticon
                </a>{" "}
                for more details
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div className="flex flex-col justify-end">
              <Image
                src="/images/stockfish.png"
                width={80}
                height={80}
                alt="kasparov vs deepblue"
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Image provided by{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://stockfishchess.org/"
                  title="stockfish"
                  className="text-blue-800 underline"
                >
                  Stockfish
                </a>
                .
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div className="flex flex-col justify-end">
              <Image
                src="/images/2players.jpg"
                width={200}
                height={200}
                alt="wardens playing chess"
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Image taken from{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://pin.it/6xRuUDUec"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Pinterest
                </a>
                .
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div className="flex flex-col justify-end">
              <Image
                src="/images/chessSet.jpg"
                width={200}
                height={200}
                alt="chessbox"
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Image taken from{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.behance.net/gallery/110228391/Illustrations-chess?l=16#"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Behance
                </a>
                .
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div className="flex flex-col justify-end">
              <Image
                src="/images/deepblue.webp"
                width={200}
                height={200}
                alt="kasparov vs deepblue"
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Image taken from{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.behance.net/gallery/110228391/Illustrations-chess?l=16#"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Behance
                </a>
                .
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center font-bold text-3xl mt-12 underline">
        <div className="w-3/4">Libraries and Packages</div>
      </div>
      <div className="w-full flex justify-center text-2xl mt-4">
        <div className="w-3/4 flex flex-col">
          {nonImageItems.map((item, idx) => (
            <NonImageItemsComponent
              key={idx}
              title={item.title}
              link={item.link}
              body={item.body}
            />
          ))}
        </div>
      </div>
      <div className="w-full flex justify-center font-bold text-3xl mt-12 underline">
        <div className="w-3/4">Hosting platforms</div>
      </div>
      <div className="w-full flex justify-center text-xl mt-4">
        <div className="w-3/4">
          The various different functionalities of this project are currently
          hosted on various service providers in their free tiers, and It would
          not be possible to host this project without those free-services.
        </div>
      </div>
      <div className="w-full flex justify-center text-2xl mt-4">
        <div className="w-3/4 flex flex-col">
          {cloudAttributions.map((item, idx) => (
            <NonImageItemsComponent
              key={idx}
              title={item.title}
              link={item.link}
              body={item.body}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NonImageItemsComponent({
  title,
  link,
  body,
}: {
  title: string;
  link: string;
  body: string;
}) {
  return (
    <div className="flex max-md:flex-col my-3">
      <div>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={link}
          className="text-blue-800 underline"
        >
          {" "}
          {title}
        </a>{" "}
        :
      </div>
      <div className="text-xl h-full flex flex-col justify-center md:ms-8">
        <div>{body}</div>
      </div>
    </div>
  );
}
