"use strict";

import Animation, {Frame} from './animation';
import { support } from './support-test';
import {
  bitsToNum,
  byteToBitArr,
  make3BytesArray,
  makeDWordArray,
  ParseCallback,
  ParseOptions,
  read3Bytes,
  readByte,
  readDWord,
  readString, readWord,
  subBuffer
} from "./parse_base";

/**
 * @param {ArrayBuffer} buffer
 * @param {ParseOptions} options
 * @return {Promise}
 */
export default async function (buffer: ArrayBufferLike, options: ParseOptions = { ignoreSingle: false, forceLoop: false}): Promise<Animation> {
  const ignoreSingle = !!(options.ignoreSingle);
  const forceLoop = !!(options.forceLoop);
  const bytes = new Uint8Array(buffer);
  return new Promise((resolve, reject) => {
    // fast animation test
    let isAnimated = false;
    parseChunks(bytes, (type, _bytes, _off, _length) => {
      if (type === "ANIM") {
        isAnimated = true;
        return false;
      }
      return true;
    });
    if (!isAnimated && ignoreSingle) {
      reject("Not an animated WebP");
      return;
    }

    const anim = new Animation();
    let headerDataBytes:Uint8Array | undefined, frame: Frame | undefined;

    parseChunks(bytes, (type, bytes, off, length) => {
      switch (type) {
        case "VP8X":
          headerDataBytes = bytes.subarray(off, off + length);
          anim.width = read3Bytes(bytes, off + 8 + 4) + 1;
          anim.height = read3Bytes(bytes, off + 8 + 4 + 3) + 1;
          break;
        case "ANIM":
          anim.numPlays = readWord(bytes, off + 8 + 4);
          //console.log(`BGColor: ${readDWord(bytes, off + 8)}`);
          break;
        case "ANMF":
          if (frame) anim.frames.push(frame);
          let delay = read3Bytes(bytes, off + 8 + 12);
          if (delay <= 10) delay = 100;
          const bits = byteToBitArr(readByte(bytes, off + 8 + 15));
          frame = {
            delay,
            width: read3Bytes(bytes, off + 8 + 6) + 1,
            height: read3Bytes(bytes, off + 8 + 9) + 1,
            left: read3Bytes(bytes, off + 8) * 2,
            top: read3Bytes(bytes, off + 8 + 3) * 2,
            disposeOp: bits[7] ? 1 : 0,
            blendOp: bits[6] ? 0 : 1,
            data: subBuffer(bytes, off + 8 + 16, length - 8 - 16)
          };
          anim.playTime += frame.delay;
          break;
        default:
      }
      return true;
    });
    if (frame) anim.frames.push(frame);

    if (anim.frames.length <= 1) {
      if (ignoreSingle) {
        reject("Not an animated WebP");
        return;
      } else {
        anim.numPlays = 1;
      }
    } else if (forceLoop) anim.numPlays = 0;

    // creating images
    let createdImages = 0;
    for (let f = 0; f < anim.frames.length; f++) {
      frame = anim.frames[f];

      let bb: BlobPart[] = [];
      const length = makeDWordArray(4 + headerDataBytes!.byteLength + frame.data!.byteLength);
      const headerArray = support.WEBP_CHECK_BYTES.map((bite, i) => {
        return i > 3 && i < 8 ? length[i - 4] : support.WEBP_CHECK_BYTES[i];
      });
      bb.push(headerArray);
      const bits = byteToBitArr(readByte(headerDataBytes!, 8));
      bits[4] = false; // EXIF metadata (E): 1 bit
      bits[5] = false; // XMP metadata (X): 1 bit
      bits[6] = false; // Animation (A): 1 bit
      headerDataBytes!.set([bitsToNum(bits)], 8);
      headerDataBytes!.set(make3BytesArray(frame.width - 1), 8 + 4);
      headerDataBytes!.set(make3BytesArray(frame.height - 1), 8 + 4 + 3);
      bb.push(headerDataBytes!);
      bb.push(frame.data!);
      const url = URL.createObjectURL(new Blob(bb, {"type": "image/webp"}));
      delete frame.data;
      bb = [];

      /**
       * Using "createElement" instead of "new Image" because of bug in Chrome 27
       * https://code.google.com/p/chromium/issues/detail?id=238071
       * http://stackoverflow.com/questions/16377375/using-canvas-drawimage-in-chrome-extension-content-script/16378270
       */
      frame.img = document.createElement('img');
      frame.img.onload = function () {
        URL.revokeObjectURL(this.src);
        createdImages++;
        if (createdImages === anim.frames.length) {
          resolve(anim);
        }
      };
      frame.img.onerror = function () {
        reject("Image creation error");
      };
      frame.img.src = url;
    }
  });
}

/**
 * @param {Uint8Array} bytes
 * @param {function(string, Uint8Array, int, int)} callback
 * @param {number} off
 * @param {number} limit
 */
function parseChunks(bytes: Uint8Array, callback:ParseCallback, off: number = 12, limit?: number) {
  const limitOff = limit ? limit + off : bytes.length;
  let res = true;
  do {
    const type = readString(bytes, off, 4);
    let length = readDWord(bytes, off + 4);
    if (length % 2) length++;
    res = callback(type, bytes, off, length + 8);
    off += length + 8;
  } while (res && off < limitOff);
};

