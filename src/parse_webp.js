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
    parseChunks(bytes, function (type, bytes, off, length) {
      if (type === "ANIM") {
        isAnimated = true;
        return false;
      }// else if (type === "ANMF") {
      //  parseChunks(bytes, function(ltype, bytes, loff , llength) {
      //    console.log(`ANMF: ${ltype} ${loff} ${llength}`);
      //  }, off + 8 + 16, length - 8 - 16);
      //}
      return true;
    });
    if (!isAnimated) {
      reject("Not an animated WebP");
      return;
    }

    const anim = new Animation();
    let
      headerDataBytes = null,
      frame = null;

    parseChunks(bytes, function (type, bytes, off, length) {
      console.log(type);
      switch (type) {
        case "VP8X":
          headerDataBytes = bytes.subarray(off, off + length);
          anim.width = read3Bytes(bytes, off + 8 + 4);
          anim.height = read3Bytes(bytes, off + 8 + 4 + 3);
          console.log(`anim.width: ${anim.width}`);
          console.log(`anim.height: ${anim.height}`);
          break;
/*        case "APP":
          const ident = readString(bytes, off + 3, 11);
          if (ident === 'NETSCAPE2.0') {
            anim.numPlays = readWord(bytes, off + 16);
            console.log(`anim.numPlays: ${anim.numPlays}`);
          }
          break;
        case "GCE":
          if (frame) anim.frames.push(frame);
          frame = {};
          frame.delay = readWord(bytes, off + 4) * 10;
          if (frame.delay <= 10) frame.delay = 100;
          anim.playTime += frame.delay;
          console.log(`frame.delay: ${frame.delay}`);
          console.log(`anim.playTime: ${anim.playTime}`);
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
          console.log(`frame.width: ${frame.width}`);
          console.log(`frame.height: ${frame.height}`);
          console.log(`frame.left: ${frame.left}`);
          console.log(`frame.top: ${frame.top}`);
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
          break;*/
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

/**
 * @param {Uint8Array} bytes
 * @param {function(string, Uint8Array, int, int)} callback
 */
var parseChunks = function (bytes, callback, off, limit) {
  if (!off) off = 12;
  const limitOff = limit ? limit + off : bytes.length;
  let res, length, type;
  do {
    const type = readString(bytes, off, 4);
    const length = readDWord(bytes, off + 4);
    res = callback(type, bytes, off, length + 8);
    off += length + 8;
    if (length % 2) off++;
  } while (res !== false && off < limitOff);
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
var read3Bytes = function (bytes, off) { // gif ready, for little endian
  var x = 0;
  // Force the most-significant byte to unsigned.
  x += ((bytes[off + 2] << 16 ) >>> 0);
  for (var i = 1; i < 3; i++) x += ( (bytes[off + 2 - i] << ((2 - i) * 8)) );
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

