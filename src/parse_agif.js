"use strict";

var Animation = require('./animation');
var crc32 = require('./crc32');
const support = require("./support-test");

/**
 * @param {ArrayBuffer} buffer
 * @return {Promise}
 */
module.exports = function (buffer) {
  const bytes = new Uint8Array(buffer);
  return new Promise(function (resolve, reject) {
    // fast animation test
    let isAnimated = false;
    parseBlocks(bytes, function (type) {
      if (type === "APP") {
        isAnimated = true;
        return false;
      }
      return true;
    });
    if (!isAnimated) {
      reject("Not an animated GIF");
      return;
    }

    const
      postDataParts = [],
      anim = new Animation();
    let
      headerDataBytes = null,
      frame = null;

    parseBlocks(bytes, function (type, bytes, off, length) {
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
          if (frame) anim.frames.push(frame);
          frame = {};
          frame.delay = readWord(bytes, off + 4) * 10;
          if (frame.delay <= 10) frame.delay = 100;
          anim.playTime += frame.delay;
          frame.gce = subBuffer(bytes, off, length);
          break;
        case "IMG":
          if (frame && frame.data) {
            anim.frames.push(frame);
            frame = {};
          }
          frame.width = readWord(bytes, off + 5);
          frame.height = readWord(bytes, off + 7);
          frame.left = readWord(bytes, off + 1);
          frame.top = readWord(bytes, off + 3);
          frame.data = subBuffer(bytes, off, length);
          frame.disposeOp = 0;
          frame.blendOp = 0;
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
    });

    if (frame) anim.frames.push(frame);

    if (anim.frames.length === 0) {
      reject("Not an animated PNG");
      return;
    }

    // creating images
    let createdImages = 0;
    const postBlob = new Blob(postDataParts);
    for (var f = 0; f < anim.frames.length; f++) {
      frame = anim.frames[f];

      var bb = [];
      bb.push(support.GIF89_SIGNATURE_BYTES);
      headerDataBytes.set(makeWordArray(frame.width), 0);
      headerDataBytes.set(makeWordArray(frame.height), 2);
      bb.push(headerDataBytes);
      bb.push(frame.gce);
      bb.push(frame.data);
      bb.push(postBlob);
      var url = URL.createObjectURL(new Blob(bb, {"type": "image/gif"}));
      delete frame.data;
      delete frame.gce;
      bb = null;

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
};

const blocksLength = function(bytes, off) {
  let length = 0;
  while(1) {
    const siz = readByte(bytes, off + length);
    length++;
    if (siz === 0x00) return length;
    length += siz;
  }
}

/**
 * @param {Uint8Array} bytes
 * @param {function(string, Uint8Array, int, int)} callback
 */
var parseBlocks = function (bytes, callback) {
  let off = 6;
  let res, length, type;
  do {
    let type;
    if (off === 6) {
      type = 'HDR';
      //w(2B),h(2B),GCTF(1B),BCI(1B),PAR(1B) => 7, /w off => 13
      length = 7;
      const bits = byteToBitArr(readByte(bytes, off + 4));
      const gctSize = bitsToNum(bits.splice(5, 3));
      length += Math.pow(2, gctSize + 1) * 3;
    } else {
      switch (readString(bytes, off, 1)) { // For ease of matching
        case '!':
          const sub = readByte(bytes, off + 1);
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
          const gctSize = bitsToNum(bits.splice(5, 3));
          length += Math.pow(2, gctSize + 1) * 3;
          length += blocksLength(bytes, off + length);
          break;
        case ';':
          type = 'EOF';
          break;
        default:
          throw new Error('Unknown block');
      }
    }
    res = callback(type, bytes, off, length);
    off += length;
  } while (res !== false && type !== "EOF" && off < bytes.length);
};

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */
var readDWord = function (bytes, off) { // gif ready, for little endian
  var x = 0;
  // Force the most-significant byte to unsigned.
  x += ((bytes[off + 3] << 24 ) >>> 0);
  for (var i = 1; i < 4; i++) x += ( (bytes[off + 3 - i] << ((3 - i) * 8)) );
  return x;
};

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */
var readWord = function (bytes, off) { // gif ready, for little endian
  var x = 0;
  for (var i = 0; i < 2; i++) x += (bytes[off + 1 - i] << ((1 - i) * 8));
  return x;
};

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */
var readByte = function (bytes, off) { // gif ready, no customize
  return bytes[off];
};

/**
 * @param {Uint8Array} bytes
 * @param {int} start
 * @param {int} length
 * @return {Uint8Array}
 */
var subBuffer = function (bytes, start, length) { // gif ready, no customize
  var a = new Uint8Array(length);
  a.set(bytes.subarray(start, start + length));
  return a;
};

var readString = function (bytes, off, length) { // gif ready, no customize
  var chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
  return String.fromCharCode.apply(String, chars);
};

var makeDWordArray = function (x) { // gif ready, for little endian
  return [x & 0xff, (x >>> 8) & 0xff, (x >>> 16) & 0xff, (x >>> 24) & 0xff];
};

var makeWordArray = function (x) {
  return [x & 0xff, (x >>> 8) & 0xff];
}

var makeStringArray = function (x) { // gif ready, no customize
  var res = [];
  for (var i = 0; i < x.length; i++) res.push(x.charCodeAt(i));
  return res;
};

var bitsToNum = function (ba) { // gif ready, no customize
  return ba.reduce(function (s, n) {
    return s * 2 + n;
  }, 0);
};

var byteToBitArr = function (bite) { // gif ready, no customize
  var a = [];
  for (var i = 7; i >= 0; i--) {
    a.push( !! (bite & (1 << i)));
  }
  return a;
};

/**
 * @param {string} type
 * @param {Uint8Array} dataBytes
 * @return {Uint8Array}
 */
var makeChunkBytes = function (type, dataBytes) {
  var crcLen = type.length + dataBytes.length;
  var bytes = new Uint8Array(new ArrayBuffer(crcLen + 8));
  bytes.set(makeDWordArray(dataBytes.length), 0);
  bytes.set(makeStringArray(type), 4);
  bytes.set(dataBytes, 8);
  var crc = crc32(bytes, 4, crcLen);
  bytes.set(makeDWordArray(crc), crcLen + 4);
  return bytes;
};

