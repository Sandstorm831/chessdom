import { spawn } from 'child_process';
// import fs from 'fs';
import { promises as fs } from 'fs';

async function ReadFile(){
    const runningPID = await fs.readFile('running.pid', 'utf-8', (err, data) => {
        if(err){
          console.log(err);
          throw new Error('error in reading pid file');
        }
        console.log(data.length);
      })
    //   return;
}

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