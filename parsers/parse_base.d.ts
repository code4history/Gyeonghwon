export type ParseCallback = (type: string, bytes: Uint8Array, off: number, length: number) => boolean;
export type ParseOptions = {
    ignoreSingle?: boolean;
    forceLoop?: boolean;
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @param {boolean} isBig
 * @return {int}
 */
export declare function readDWord(bytes: Uint8Array, off: number, isBig?: boolean): number;
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @param {boolean} isBig
 * @return {int}
 */
export declare function readWord(bytes: Uint8Array, off: number, isBig?: boolean): number;
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @param {boolean} isBig
 * @return {int}
 */
export declare function read3Bytes(bytes: Uint8Array, off: number, isBig?: boolean): number;
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */
export declare function readByte(bytes: Uint8Array, off: number): number;
/**
 * @param {Uint8Array} bytes
 * @param {int} start
 * @param {int} length
 * @return {Uint8Array}
 */
export declare function subBuffer(bytes: Uint8Array, start: number, length: number): Uint8Array<ArrayBuffer>;
export declare function readString(bytes: Uint8Array, off: number, length: number): string;
export declare function makeDWordArray(x: number, isBig?: boolean): number[];
export declare function makeWordArray(x: number, isBig?: boolean): number[];
export declare function make3BytesArray(x: number, isBig?: boolean): number[];
export declare function makeStringArray(x: string): number[];
export declare function bitsToNum(ba: boolean[]): number;
export declare function byteToBitArr(bite: number): boolean[];
