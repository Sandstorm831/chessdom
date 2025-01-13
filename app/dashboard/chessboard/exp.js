// import { spawn } from 'child_process';
// import fs from 'fs';
// import { promises as fs } from 'fs';

// async function ReadFile(){
//     const runningPID = await fs.readFile('running.pid', 'utf-8', (err, data) => {
//         if(err){
//           console.log(err);
//           throw new Error('error in reading pid file');
//         }
//         console.log(data.length);
//       })
//     //   return;
// }

// await ReadFile();

//   const terminal = spawn('bash');
//   terminal.stdout.on('data', (data) => {console.log(`OUTPUT : ${data}`)});
//   terminal.on('close', (code) => {
//     console.log("closing terminal with exit code = " + code);
//   })
//   await new Promise(resolve => setTimeout(resolve, 2000));
//   terminal.stdin.write('help\n');
//   await new Promise(resolve => setTimeout(resolve, 2000));
//   terminal.stdout.removeAllListeners();
//   terminal.stdin.write('pwd\n');
//   await new Promise(resolve => setTimeout(resolve, 2000));
//   terminal.stdout.on('data', (data) => {console.log(`OUTPUT : ${data}`)});
//   terminal.stdin.write('ls\n');
//   await new Promise(resolve => setTimeout(resolve, 10000));
  // terminal.stdin.write('exit\n');

// fs.writeFile('running.pid', '', (err) => {
//     if(err){
//         throw new Error(err);
//     }
// })

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

console.log(wasmThreadsSupported());