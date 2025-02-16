importScripts('/lib/stockfish.js')

onmessage = async (e) => {
  if(e.data === 'start'){
    await StartEngine();
  }
}

async function StartEngine() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/lib/stockfish.wasm', true);
  xhr.setRequestHeader('Accept', '*/*');
  xhr.setRequestHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  xhr.responseType = 'arraybuffer';
  xhr.onload = async () => {
    postMessage(xhr.response);
    console.log('loaded the engine');
    close();
  }
  xhr.onerror = (errorEvent) => {
    console.log(`Some Error occured while fetching WASM engine`)
    console.log(errorEvent);
    throw new Error(errorEvent);
  }
  xhr.send();
}