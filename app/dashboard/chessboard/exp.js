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
//     // You have to make sure nobody cares about these messages!
//     window.postMessage(mem, "*");
//   } catch (e) {
//     return false;
//   }

//   // Growable shared memory (optional)
//   try {
//     mem.grow(8);
//   } catch (e) {
//     return false;
//   }

//   return true;
// }

// console.log(wasmThreadsSupported());

// import { parse, ParseTree } from "@mliebelt/pgn-parser";
// import fs from "fs";
// const PGN: string = `1. e4 d5 2. e5 d4 3. e6 d3 4. exf7+ Kxf7 5. cxd3 Qxd3 6. Bxd3 Bg4 7. h3 Bxd1 8. Nf3 Bxf3 9. O-O Bh5 10. g4 Bxg4 11. hxg4 e6 12. g5 Bb4 13. Bxh7 Rxh7 14. d3 Bd2 15. Bxd2 Na6 16. Na3 Rd8 17. d4 Rxd4 18. Bc3 Ra4 19. Nc4 Rxc4 20. Bxg7 Rxg7 21. b3 Rc1 22. Raxc1 Rxg5+ 23. Kh1 Nf6 24. f4 Rg4 25. Kh2 Nc5 26. Rxc5 b6 27. Rxc7+ Kg6 28. f5+ Kh5 29. Rxa7 b5 30. Rh7+ Kg5 31. Rg7+ Kh4 32. Rxg4+ Kxg4 33. Rg1+ Kxf5 34. Rf1+ Ke4 35. Rxf6 Ke3 36. Rxe6+ Kf2 37. b4 Kf1 38. a4 bxa4 39. Ra6 Kf2 40. Rxa4 Ke1 41. b5 Kd1 42. b6 Kc1 43. b7 Kb1 44. b8=Q+ Kc1 45. Ra1+ Kd2 46. Qf4+ Kc2 47. Rc1+ Kb2 48. Qd2+ Ka3 49. Rc3+ Ka4 50. Qa2+ Kb4 51. Qb3+ Ka5 52. Rc2 Ka6 53. Ra2# 1-0`;

// const parsed = parse(PGN, { startRule: "game" });

// // Write data in 'Output.txt' .
// fs.writeFile("y.json", JSON.stringify(parsed), (err) => {
//   if (err) throw err;
// });
