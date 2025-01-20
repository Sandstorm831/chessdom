import axios from "axios";
import Stockfish from "./stockfish.js";
import { useAppDispatch } from "@/lib/hooks.js";
import {
  setFailed,
  setLoading,
  setReady,
} from "@/lib/features/engine/engineSlice.js";

const dispatch = useAppDispatch();

function wasmThreadsSupported() {
  // WebAssembly 1.0
  const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
  if (
    typeof WebAssembly !== "object" ||
    typeof WebAssembly.validate !== "function"
  )
    return false;
  if (!WebAssembly.validate(source)) return false;

  // SharedArrayBuffer
  if (typeof SharedArrayBuffer !== "function") return false;

  // Atomics
  if (typeof Atomics !== "object") return false;

  // Shared memory
  const mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
  if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

  // Structured cloning
  try {
    window.postMessage(mem, "*");
  } catch (e) {
    console.log(`Browser Error ${e}`);
    return false;
  }

  // Growable shared memory (optional)
  try {
    mem.grow(8);
  } catch (e) {
    console.log(`Browser Error ${e}`);
    return false;
  }

  return true;
}

function StartEngine() {
  try {
    if (!wasmThreadsSupported()) throw new Error("Browser not supported");
    dispatch(setLoading());
    console.log("worker laod engine");
    axios({
      url: "/lib/stockfish.wasm",
      method: "GET",
      headers: {
        Accept: "*/*",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
      responseType: "arraybuffer",
    }).then(async (_stockfish) => {
      const x = await Stockfish(_stockfish);
      // x.addMessageListener((line: string) => {
      //   output += line + `\n`;
      //   setStockfishResponse(output);
      // });
      // x.postMessage("isready");
      console.log("engine is ready");
      dispatch(setReady(x));
    });
  } catch (err) {
    console.log(`Some engine error occured: ${err}`);
    dispatch(setFailed(Object(err)));
  }
}

StartEngine();