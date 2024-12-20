export type ParseCallback = (type: string, bytes: Uint8Array, off: number, length:number) => boolean;

export type ParseOptions = {
  ignoreSingle?: boolean;
  forceLoop?: boolean;
};

function endianIndex(i: number, byteNum: number, isBig = false): number {
  return isBig ? i : byteNum - 1 - i;
}

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @param {boolean} isBig
 * @return {int}
 */
export function readDWord(bytes: Uint8Array, off: number, isBig = false) {
  let x = 0;
  // Force the most-significant byte to unsigned.
  x += ((bytes[off + endianIndex(0, 4, isBig)] << 24 ) >>> 0);
  for (let i = 1; i < 4; i++) x += ( (bytes[off + endianIndex(i, 4, isBig)] << ((3 - i) * 8)) );
  return x;
}

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @param {boolean} isBig
 * @return {int}
 */
export function readWord(bytes: Uint8Array, off: number, isBig = false) {
  let x = 0;
  for (let i = 0; i < 2; i++) x += (bytes[off + endianIndex(i, 2, isBig)] << ((1 - i) * 8));
  return x;
}

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @param {boolean} isBig
 * @return {int}
 */
export function read3Bytes(bytes: Uint8Array, off: number, isBig = false) {
  let x = 0;
  // Force the most-significant byte to unsigned.
  x += ((bytes[off + endianIndex(0, 3, isBig)] << 16 ) >>> 0);
  for (let i = 1; i < 3; i++) x += ( (bytes[off + endianIndex(i, 3, isBig)] << ((2 - i) * 8)) );
  return x;
}

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */
export function readByte(bytes: Uint8Array, off: number) { // gif ready, no customize
  return bytes[off];
}

/**
 * @param {Uint8Array} bytes
 * @param {int} start
 * @param {int} length
 * @return {Uint8Array}
 */
export function subBuffer(bytes: Uint8Array, start: number, length: number) { // gif ready, no customize
  const a = new Uint8Array(length);
  a.set(bytes.subarray(start, start + length));
  return a;
}

export function readString(bytes: Uint8Array, off: number, length: number): string { // gif ready, no customize
  const chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
  return String.fromCharCode.apply(String, chars);
}

export function makeDWordArray(x: number, isBig = false) { // gif ready, for little endian
  const arr = [x & 0xff, (x >>> 8) & 0xff, (x >>> 16) & 0xff, (x >>> 24) & 0xff];
  return isBig ? arr.reverse() : arr;
}

export function makeWordArray(x: number, isBig = false) {
  const arr = [x & 0xff, (x >>> 8) & 0xff];
  return isBig ? arr.reverse() : arr;
}

export function make3BytesArray(x: number, isBig = false) { // gif ready, for little endian
  const arr = [x & 0xff, (x >>> 8) & 0xff, (x >>> 16) & 0xff];
  return isBig ? arr.reverse() : arr;
}

export function makeStringArray(x: string) { // gif ready, no customize
  const res = [];
  for (let i = 0; i < x.length; i++) res.push(x.charCodeAt(i));
  return res;
}

export function bitsToNum(ba: boolean[]) { // gif ready, no customize
  return ba.reduce((s, n) => {
    return s * 2 + (n ? 1 : 0);
  }, 0);
}

export function byteToBitArr(bite: number) { // gif ready, no customize
  const a = [];
  for (let i = 7; i >= 0; i--) {
    a.push( !! (bite & (1 << i)));
  }
  return a;
}