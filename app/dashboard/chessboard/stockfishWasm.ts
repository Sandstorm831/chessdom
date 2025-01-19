"use client"

import { useEffect } from "react";
import axios from "axios";

export function wasmThreadsSupported() {
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
      // You have to make sure nobody cares about these messages!
      window.postMessage(mem, "*");
    } catch (e) {
      return false;
    }
  
    // Growable shared memory (optional)
    try {
      mem.grow(8);
    } catch (e) {
      return false;
    }
  
    return true;
  }

export async function startEngine() {

  useEffect(() => {
    if (!wasmThreadsSupported()) {
      alert(
        "Web assembly threads are not supported in this browser, please update or switch the browser"
      );
      return;
    } else {
      const script = document.createElement("script");
      script.src = "/lib/stockfish.js";
      script.async = true;
      script.type = "text/javascript";
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
      script.onload = () => {
        try {
          axios({
            url: "/lib/stockfish.wasm",
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cross-Origin-Embedder-Policy": "require-corp",
            },
            responseType: "arraybuffer",
            onDownloadProgress: (progressEvent) => {
              setState("Loading");
              const loading = progressEvent.loaded;
              const total = progressEvent.total || 27444194;
              setProgress({ loaded: loading, total: total });
            },
          }).then(async (_stockfish) => {
            // @ts-expect-error Loaded from the stockfish.js script, it works but doesn't get detected
            const x = await Stockfish(_stockfish); // Loaded from the stockfish.js script, it works but doesn't get detected
            x.addMessageListener((line: string) => {
              output += line + `\n`;
              setStockfishResponse(output);
            });
            x.postMessage("isready");
            setStockfishEngine(x);
            setState("Ready");
          });
        } catch (err) {
          console.log(
            `Some error occured while fetching web assembly module: ${err}`
          );
        }
      };
      return () => {
        console.log("I am removing the script");
        document.body.removeChild(script);
      };
    }
  }, []);
}
