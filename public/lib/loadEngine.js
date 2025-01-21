importScripts('/lib/stockfish.js')

onmessage = async (e) => {
  console.log("yupp, I am here")
  if(e.data === 'start'){
    await StartEngine();
    console.log('started the engine')
  }
}

async function StartEngine() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/lib/stockfish.wasm', true);
  xhr.setRequestHeader('Accept', '*/*');
  xhr.setRequestHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  xhr.responseType = 'arraybuffer';
  xhr.onload = async (doneEvent) => {
    console.log("got the engine")
    console.log(`module loaded: ${doneEvent.loaded} bytes transferred`);
    postMessage(xhr.response);
    console.log('loaded the engine')
  }
  xhr.onerror = (errorEvent) => {
    console.log(`Some Error occured while laoding modules: ${errorEvent.loaded} bytes transferred`)
    console.log('failed to get wasm file')
  }
  xhr.onprogress = (ProgressEvent) => {
    console.log(`Loading : ${ProgressEvent.loaded}`);
  }
  console.log("starting the fetch request");
  xhr.send();
}


// import axios from "axios";
// import Stockfish from "./stockfish.js";
// import { useAppDispatch } from "@/lib/hooks.js";
// import {
//   setFailed,
//   setLoading,
//   setReady,
// } from "@/lib/features/engine/engineSlice.js";
// const dispatch = useAppDispatch();

// function wasmThreadsSupported() {
//   // WebAssembly 1.0
//   const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
//   if (
//     typeof WebAssembly !== "object" ||
//     typeof WebAssembly.validate !== "function"
//   )
//     return false;
//   if (!WebAssembly.validate(source)) return false;

//   // SharedArrayBuffer
//   if (typeof SharedArrayBuffer !== "function") return false;

//   // Atomics
//   if (typeof Atomics !== "object") return false;

//   // Shared memory
//   const mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
//   if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

//   // Structured cloning
//   try {
//     window.postMessage(mem, "*");
//   } catch (e) {
//     console.log(`Browser Error ${e}`);
//     return false;
//   }

//   // Growable shared memory (optional)
//   try {
//     mem.grow(8);
//   } catch (e) {
//     console.log(`Browser Error ${e}`);
//     return false;
//   }

//   return true;
// }

// async function StartEngine() {
//   try {
//     if (!wasmThreadsSupported()) throw new Error("Browser not supported");
//     dispatch(setLoading());
//     postMessage("worker laod engine");
//     axios({
//       url: "/lib/stockfish.wasm",
//       method: "GET",
//       headers: {
//         Accept: "*/*",
//         "Cross-Origin-Embedder-Policy": "require-corp",
//       },
//       responseType: "arraybuffer",
//     }).then(async (_stockfish) => {
//       const x = await Stockfish(_stockfish);
//       // x.addMessageListener((line: string) => {
//       //   output += line + `\n`;
//       //   setStockfishResponse(output);
//       // });
//       // x.postMessage("isready");
//       postMessage("engine is ready");
//       dispatch(setReady(x));
//     });
//   } catch (err) {
//     postMessage(`Some engine error occured: ${err}`);
//     dispatch(setFailed(Object(err)));
//   }
// }
