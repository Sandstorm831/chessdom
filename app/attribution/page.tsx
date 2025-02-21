import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col mt-24 text-[#323014]">
      <div className="w-full flex justify-center font-bold text-5xl">
        <div className="w-3/4">Credits and Attributions</div>
      </div>
      <div className="w-full flex justify-center text-2xl mt-4">
        <div className="w-3/4">
          This project would not be possible without using the resources,
          libraries and packages designed and developed by other people.
          Here&apos;s a list of all the resources I have used in making this
          project and an attempt to give them proper credit for their work.
        </div>
      </div>
      <div className="w-full flex justify-center font-bold text-3xl mt-12 underline">
        <div className="w-3/4">Images and Icons</div>
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
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                All the chesspieces are developed by Cburnett, please visit{" "}
                <Link
                  className="text-blue-800 cursor-pointer underline"
                  href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces"
                >
                  {"wikimedia"}
                </Link>{" "}
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
              />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Knight icons created by Pixel perfect - Flaticon. visit{" "}
                <Link
                  href="https://www.flaticon.com/free-icon/chess_591779?term=chess&page=1&position=63&origin=tag&related_id=591779"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Flaticon
                </Link>{" "}
                for more details
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div className="flex flex-col justify-end">
              <Image src="/chess.png" width={50} height={50} alt="knight" />
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Knight icons created by Pixel perfect - Flaticon. visit{" "}
                <Link
                  href="https://www.flaticon.com/free-icon/chess_726165?term=chess&page=1&position=13&origin=search&related_id=726165"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Flaticon
                </Link>{" "}
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
                <Link
                  href="https://stockfishchess.org/"
                  title="stockfish"
                  className="text-blue-800 underline"
                >
                  Stockfish
                </Link>
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
                <Link
                  href="https://pin.it/6xRuUDUec"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Pinterest
                </Link>
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
                <Link
                  href="https://www.behance.net/gallery/110228391/Illustrations-chess?l=16#"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Behance
                </Link>
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
                <Link
                  href="https://www.behance.net/gallery/110228391/Illustrations-chess?l=16#"
                  title="chess icons"
                  className="text-blue-800 underline"
                >
                  Behance
                </Link>
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
          <div className="flex my-3">
            <div>
              <Link
                href="https://github.com/atlassian/pragmatic-drag-and-drop"
                className="text-blue-800 underline"
              >
                {" "}
                Pragmatic Drag and Drop
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>Used for drag and drop functionality.</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://github.com/mliebelt/pgn-parser"
                className="text-blue-800 underline"
              >
                {" "}
                PGN-Parser
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>Used for parsing standard and non-standard PGN formats.</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://www.prisma.io/"
                className="text-blue-800 underline"
              >
                {" "}
                Prisma
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Primary ORM for simplifying all the Database related work
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://www.radix-ui.com/"
                className="text-blue-800 underline"
              >
                {" "}
                Radix-UI
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>An indispensible component of shadcn</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://ui.shadcn.com/"
                className="text-blue-800 underline"
              >
                {" "}
                shadcn/UI
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>Incredible react components</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://github.com/axios/axios"
                className="text-blue-800 underline"
              >
                {" "}
                Axios
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>Promise based HTTP client for the browser and node.js </div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://github.com/hi-ogawa/Stockfish"
                className="text-blue-800 underline"
              >
                {" "}
                Stockfish-nnue.wasm
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Primary stockfish engine used for playing with computer
                functionality
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://tailwindcss.com/"
                className="text-blue-800 underline"
              >
                {" "}
                Tailwindcss
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                A utility-first CSS framework used for styling purposes.
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://next-auth.js.org/"
                className="text-blue-800 underline"
              >
                {" "}
                NextAuth.js
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>For handling OAuth authentication.</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://nextjs.org/"
                className="text-blue-800 underline"
              >
                {" "}
                Next.js
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>React framework used in this project.</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://react.dev/"
                className="text-blue-800 underline"
              >
                {" "}
                React
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>The library for web and native user interfaces</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://react-icons.github.io/react-icons/"
                className="text-blue-800 underline"
              >
                {" "}
                React-Icons
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>Primary library for including icons</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://github.com/vydimitrov/react-countdown-circle-timer"
                className="text-blue-800 underline"
              >
                {" "}
                react-countdown-circle-timer
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>A timer component</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://react-redux.js.org/"
                className="text-blue-800 underline"
              >
                {" "}
                React-Redux
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>For global state management</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://socket.io/"
                className="text-blue-800 underline"
              >
                {" "}
                Socket.IO
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>Web-Socket library for live chessplay</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://github.com/lukeed/uid"
                className="text-blue-800 underline"
              >
                {" "}
                UID
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                For generating randomized output strings of fixed length using
                lowercase alphanumeric characters.
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://github.com/emilkowalski/vaul"
                className="text-blue-800 underline"
              >
                {" "}
                Vaul
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Drawer component for promotion and other functionalities.
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://lucide.dev/guide/packages/lucide-react"
                className="text-blue-800 underline"
              >
                {" "}
                Lucide React
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>
                Implementation of the lucide icon library for react applications
              </div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://www.typescriptlang.org/"
                className="text-blue-800 underline"
              >
                {" "}
                Typescript
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>For typechecks in javascript</div>
            </div>
          </div>

          <div className="flex my-3">
            <div>
              <Link
                href="https://nodejs.org/en"
                className="text-blue-800 underline"
              >
                {" "}
                NodeJS
              </Link>{" "}
              :
            </div>
            <div className="text-xl h-full flex flex-col justify-center ms-8">
              <div>JavaScript runtime environment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
