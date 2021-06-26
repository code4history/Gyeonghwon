"use strict";

import Animation, {Frame} from './animation';
import { support } from './support-test';
import {
  bitsToNum,
  byteToBitArr,
  makeWordArray,
  ParseCallback,
  ParseOptions,
  readByte,
  readString,
  readWord,
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
    let gceCount = 0;
    parseBlocks(bytes, (type, _bytes, _off, _length) => {
      if (type === "APP") {
        isAnimated = true;
        return false;
      } else if (type === "GCE") {
        gceCount++;
      }
      return true;
    });
    if (!isAnimated && gceCount < 2 && ignoreSingle) {
      reject("Not an animated GIF");
      return;
    }

    const postDataParts:Uint8Array[] = [], anim = new Animation();
    let headerDataBytes:Uint8Array | undefined, frame: Partial<Frame> | undefined;
    if (gceCount > 1) anim.numPlays = 1;

    parseBlocks(bytes, (type, bytes, off, length) => {
      switch (type) {
        case "HDR":
          headerDataBytes = bytes.subarray(off, off + length);
          anim.width = readWord(bytes, off);
          anim.height = readWord(bytes, off + 2);
          break;
        case "APP":
          const ident = readString(bytes, off + 3, 11);
          if (ident === 'NETSCAPE2.0') {
            anim.numPlays = readWord(bytes, off + 16);
          }
          break;
        case "GCE":
          if (frame) anim.frames.push(frame as Frame);
          frame = {};
          frame.delay = readWord(bytes, off + 4) * 10;
          if (frame.delay <= 10) frame.delay = 100;
          anim.playTime += frame.delay;
          frame.gce = subBuffer(bytes, off, length);
          break;
        case "IMG":
          if (frame && frame.data) {
            anim.frames.push(frame as Frame);
            frame = {};
          }
          frame!.width = readWord(bytes, off + 5);
          frame!.height = readWord(bytes, off + 7);
          frame!.left = readWord(bytes, off + 1);
          frame!.top = readWord(bytes, off + 3);
          frame!.data = subBuffer(bytes, off, length);
          frame!.disposeOp = 0;
          frame!.blendOp = 0;
          break;
        case "COM":
          break;
        case "PTE":
          break;
        case "EOF":
          postDataParts.push(subBuffer(bytes, off, length));
          break;
        default:
      }
      return true;
    });

    if (frame) anim.frames.push(frame as Frame);

    if (anim.frames.length <= 1) {
      if (ignoreSingle) {
        reject("Not an animated PNG");
        return;
      } else {
        anim.numPlays = 1;
      }
    } else if (forceLoop) anim.numPlays = 0;

    // creating images
    let createdImages = 0;
    const postBlob = new Blob(postDataParts);
    for (let f = 0; f < anim.frames.length; f++) {
      frame = anim.frames[f];

      let bb: BlobPart[] = [];
      bb.push(support.GIF89_SIGNATURE_BYTES);
      headerDataBytes!.set(makeWordArray((frame as Frame).width), 0);
      headerDataBytes!.set(makeWordArray((frame as Frame).height!), 2);
      bb.push(headerDataBytes!);
      bb.push(frame.gce!);
      bb.push(frame.data!);
      bb.push(postBlob);
      const url = URL.createObjectURL(new Blob(bb, {"type": "image/gif"}));
      delete frame.data;
      delete frame.gce;
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

function blocksLength(bytes: Uint8Array, off: number): number {
  let length = 0;
  while(1) {
    const siz = readByte(bytes, off + length);
    length++;
    if (siz === 0x00) break;
    length += siz;
  }
  return length;
}

/**
 * @param {Uint8Array} bytes
 * @param {function(string, Uint8Array, int, int)} callback
 */
function parseBlocks(bytes: Uint8Array, callback: ParseCallback) {
  let off = 6;
  let res = true, length = 0, type: string;
  do {
    if (off === 6) {
      type = 'HDR';
      //w(2B),h(2B),GCTF(1B),BCI(1B),PAR(1B) => 7, /w off => 13
      length = 7;
      const bits = byteToBitArr(readByte(bytes, off + 4));
      const gctExists = bits[0];
      const gctSize = bitsToNum(bits.splice(5, 3));
      length += gctExists ? Math.pow(2, gctSize + 1) * 3 : 0;
    } else {
      const comm = readString(bytes, off, 1);
      switch (comm) { // For ease of matching
        case '!':
          switch(readByte(bytes, off + 1)) {
            case 0xf9:
              type = 'GCE';
              break;
            case 0xfe:
              type = 'COM';
              break;
            case 0x01:
              type = 'PTE';
              break;
            case 0xff:
              type = 'APP';
              break;
            default:
              throw new Error('Unknown block');
          }
          length = 2;
          length += blocksLength(bytes, off + length);
          break;
        case ',':
          type = 'IMG';
          //Sep(1B),l(2B),t(2B),w(2B),h(2B),LCTF(1B) => 10
          length = 10;
          const bits = byteToBitArr(readByte(bytes, off + 9));
          const lctExists = bits[0];
          const lctSize = bitsToNum(bits.splice(5, 3));
          length += (lctExists ? Math.pow(2, lctSize + 1) * 3 : 0) + 1;
          length += blocksLength(bytes, off + length);
          break;
        case ';':
          type = 'EOF';
          break;
        default:
          throw new Error(`Unknown block ${comm}`);
      }
    }
    res = callback(type, bytes, off, length);
    off += length;
  } while (res && type !== "EOF" && off < bytes.length);
}

