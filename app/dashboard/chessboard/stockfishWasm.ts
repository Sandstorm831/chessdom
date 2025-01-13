export function wasmThreadsSupported() {
    // WebAssembly 1.0
    const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
    if (
      typeof WebAssembly !== "object" ||
      typeof WebAssembly.validate !== "function"
    )
      return false;
    console.log('first')
    if (!WebAssembly.validate(source)) return false;
    console.log('second')
  
    // SharedArrayBuffer
    if (typeof SharedArrayBuffer !== "function") return false;
    console.log('third')
  
    // Atomics
    if (typeof Atomics !== "object") return false;
    console.log('fourth')
  
    // Shared memory
    const mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
    if (!(mem.buffer instanceof SharedArrayBuffer)) return false;
    console.log('fifth')
  
    // Structured cloning
    try {
      // You have to make sure nobody cares about these messages!
      window.postMessage(mem, "*");
    } catch (e) {
      return false;
    }
    console.log('sixth')
  
    // Growable shared memory (optional)
    try {
      mem.grow(8);
    } catch (e) {
      return false;
    }
    console.log('seventh')
  
    return true;
  }