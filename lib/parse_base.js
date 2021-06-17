function endianIndex(i, byteNum, isBig = false) {
    return isBig ? i : byteNum - 1 - i;
}
export function readDWord(bytes, off, isBig = false) {
    let x = 0;
    x += ((bytes[off + endianIndex(0, 4, isBig)] << 24) >>> 0);
    for (let i = 1; i < 4; i++)
        x += ((bytes[off + endianIndex(i, 4, isBig)] << ((3 - i) * 8)));
    return x;
}
export function readWord(bytes, off, isBig = false) {
    let x = 0;
    for (let i = 0; i < 2; i++)
        x += (bytes[off + endianIndex(i, 2, isBig)] << ((1 - i) * 8));
    return x;
}
export function read3Bytes(bytes, off, isBig = false) {
    let x = 0;
    x += ((bytes[off + endianIndex(0, 3, isBig)] << 16) >>> 0);
    for (let i = 1; i < 3; i++)
        x += ((bytes[off + endianIndex(i, 3, isBig)] << ((2 - i) * 8)));
    return x;
}
export function readByte(bytes, off) {
    return bytes[off];
}
export function subBuffer(bytes, start, length) {
    const a = new Uint8Array(length);
    a.set(bytes.subarray(start, start + length));
    return a;
}
export function readString(bytes, off, length) {
    const chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
    return String.fromCharCode.apply(String, chars);
}
export function makeDWordArray(x, isBig = false) {
    const arr = [x & 0xff, (x >>> 8) & 0xff, (x >>> 16) & 0xff, (x >>> 24) & 0xff];
    return isBig ? arr.reverse() : arr;
}
export function makeWordArray(x, isBig = false) {
    const arr = [x & 0xff, (x >>> 8) & 0xff];
    return isBig ? arr.reverse() : arr;
}
export function make3BytesArray(x, isBig = false) {
    const arr = [x & 0xff, (x >>> 8) & 0xff, (x >>> 16) & 0xff];
    return isBig ? arr.reverse() : arr;
}
export function makeStringArray(x) {
    const res = [];
    for (let i = 0; i < x.length; i++)
        res.push(x.charCodeAt(i));
    return res;
}
export function bitsToNum(ba) {
    return ba.reduce((s, n) => {
        return s * 2 + (n ? 1 : 0);
    }, 0);
}
export function byteToBitArr(bite) {
    const a = [];
    for (let i = 7; i >= 0; i--) {
        a.push(!!(bite & (1 << i)));
    }
    return a;
}
//# sourceMappingURL=parse_base.js.map