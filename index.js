/*! Gyeonghwon v0.0.1 | Kohei Otsuka | license: MIT */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/animation.js":
/*!**************************!*\
  !*** ./src/animation.js ***!
  \**************************/
/***/ ((module) => {

"use strict";

/**
 * Animation class
 * @constructor
 */

var Animation = function () {
  // Public
  this.width = 0;
  this.height = 0;
  this.numPlays = 0;
  this.playTime = 0;
  this.frames = [];
  /**
   * Play animation (if not finished)
   * @return {void}
   */

  this.play = function () {
    if (played || finished) return;
    this.rewind();
    played = true;
    requestAnimationFrame(tick);
  };
  /**
   * Rewind animation to start (and stop it)
   * @return {void}
   */


  this.rewind = function () {
    nextRenderTime = 0;
    fNum = 0;
    prevF = null;
    played = false;
    finished = false;
  };
  /**
   * Add new canvas context to animate
   * @param {CanvasRenderingContext2D} ctx
   * @return {void}
   */


  this.addContext = function (ctx) {
    if (contexts.length > 0) {
      var dat = contexts[0].getImageData(0, 0, this.width, this.height);
      ctx.putImageData(dat, 0, 0);
    }

    contexts.push(ctx);
    ctx['_aimg_animation'] = this;
  };
  /**
   * Remove canvas context from animation
   * @param {CanvasRenderingContext2D} ctx
   * @return {void}
   */


  this.removeContext = function (ctx) {
    var idx = contexts.indexOf(ctx);

    if (idx === -1) {
      return;
    }

    contexts.splice(idx, 1);

    if (contexts.length === 0) {
      this.rewind();
    }

    if ('_aimg_animation' in ctx) {
      delete ctx['_aimg_animation'];
    }
  }; //noinspection JSUnusedGlobalSymbols

  /**
   * Is animation played?
   * @return {boolean}
   */


  this.isPlayed = function () {
    return played;
  }; //noinspection JSUnusedGlobalSymbols

  /**
   * Is animation finished?
   * @return {boolean}
   */


  this.isFinished = function () {
    return finished;
  }; // Private


  var ani = this,
      nextRenderTime = 0,
      fNum = 0,
      prevF = null,
      played = false,
      finished = false,
      contexts = [];

  var tick = function (now) {
    while (played && nextRenderTime <= now) renderFrame(now);

    if (played) requestAnimationFrame(tick);
  };

  var renderFrame = function (now) {
    var f = fNum++ % ani.frames.length;
    var frame = ani.frames[f];

    if (!(ani.numPlays === 0 || fNum / ani.frames.length <= ani.numPlays)) {
      played = false;
      finished = true;
      return;
    }

    if (f === 0) {
      contexts.forEach(function (ctx) {
        ctx.clearRect(0, 0, ani.width, ani.height);
      });
      prevF = null;
      if (frame.disposeOp === 2) frame.disposeOp = 1;
    }

    if (prevF && prevF.disposeOp === 1) {
      contexts.forEach(function (ctx) {
        ctx.clearRect(prevF.left, prevF.top, prevF.width, prevF.height);
      });
    } else if (prevF && prevF.disposeOp === 2) {
      contexts.forEach(function (ctx) {
        ctx.putImageData(prevF.iData, prevF.left, prevF.top);
      });
    }

    prevF = frame;
    prevF.iData = null;

    if (prevF.disposeOp === 2) {
      prevF.iData = contexts[0].getImageData(frame.left, frame.top, frame.width, frame.height);
    }

    if (frame.blendOp === 0) {
      contexts.forEach(function (ctx) {
        ctx.clearRect(frame.left, frame.top, frame.width, frame.height);
      });
    }

    contexts.forEach(function (ctx) {
      ctx.drawImage(frame.img, frame.left, frame.top);
    });
    if (nextRenderTime === 0) nextRenderTime = now;

    while (now > nextRenderTime + ani.playTime) nextRenderTime += ani.playTime;

    nextRenderTime += frame.delay;
  };
};

module.exports = Animation;

/***/ }),

/***/ "./src/crc32.js":
/*!**********************!*\
  !*** ./src/crc32.js ***!
  \**********************/
/***/ ((module) => {

"use strict";


var table = new Uint32Array(256);

for (var i = 0; i < 256; i++) {
  var c = i;

  for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;

  table[i] = c;
}
/**
 *
 * @param {Uint8Array} bytes
 * @param {int} start
 * @param {int} length
 * @return {int}
 */


module.exports = function (bytes, start, length) {
  start = start || 0;
  length = length || bytes.length - start;
  var crc = -1;

  for (var i = start, l = start + length; i < l; i++) {
    crc = crc >>> 8 ^ table[(crc ^ bytes[i]) & 0xFF];
  }

  return crc ^ -1;
};

/***/ }),

/***/ "./src/loader.js":
/*!***********************!*\
  !*** ./src/loader.js ***!
  \***********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Promise = Promise || __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js").Promise;

module.exports = function (url) {
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'GET'
    }).then(res => {
      if (res.status !== 200) reject(res);
      res.arrayBuffer().then(buf => resolve(buf));
    });
  });
};

/***/ }),

/***/ "./src/parse_agif.js":
/*!***************************!*\
  !*** ./src/parse_agif.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Animation = __webpack_require__(/*! ./animation */ "./src/animation.js");

var crc32 = __webpack_require__(/*! ./crc32 */ "./src/crc32.js");

const support = __webpack_require__(/*! ./support-test */ "./src/support-test.js");
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

    const postDataParts = [],
          anim = new Animation();
    let headerDataBytes = null,
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
    } // creating images


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
      var url = URL.createObjectURL(new Blob(bb, {
        "type": "image/gif"
      }));
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

const blocksLength = function (bytes, off) {
  let length = 0;

  while (1) {
    const siz = readByte(bytes, off + length);
    length++;
    if (siz === 0x00) return length;
    length += siz;
  }
};
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
      type = 'HDR'; //w(2B),h(2B),GCTF(1B),BCI(1B),PAR(1B) => 7, /w off => 13

      length = 7;
      const bits = byteToBitArr(readByte(bytes, off + 4));
      const gctExists = bits[0];
      const gctSize = bitsToNum(bits.splice(5, 3));
      length += gctExists ? Math.pow(2, gctSize + 1) * 3 : 0;
    } else {
      const comm = readString(bytes, off, 1);

      switch (comm) {
        // For ease of matching
        case '!':
          const sub = readByte(bytes, off + 1);

          switch (readByte(bytes, off + 1)) {
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
          type = 'IMG'; //Sep(1B),l(2B),t(2B),w(2B),h(2B),LCTF(1B) => 10

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
  } while (res !== false && type !== "EOF" && off < bytes.length);
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readDWord = function (bytes, off) {
  // gif ready, for little endian
  var x = 0; // Force the most-significant byte to unsigned.

  x += bytes[off + 3] << 24 >>> 0;

  for (var i = 1; i < 4; i++) x += bytes[off + 3 - i] << (3 - i) * 8;

  return x;
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readWord = function (bytes, off) {
  // gif ready, for little endian
  var x = 0;

  for (var i = 0; i < 2; i++) x += bytes[off + 1 - i] << (1 - i) * 8;

  return x;
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readByte = function (bytes, off) {
  // gif ready, no customize
  return bytes[off];
};
/**
 * @param {Uint8Array} bytes
 * @param {int} start
 * @param {int} length
 * @return {Uint8Array}
 */


var subBuffer = function (bytes, start, length) {
  // gif ready, no customize
  var a = new Uint8Array(length);
  a.set(bytes.subarray(start, start + length));
  return a;
};

var readString = function (bytes, off, length) {
  // gif ready, no customize
  var chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
  return String.fromCharCode.apply(String, chars);
};

var makeDWordArray = function (x) {
  // gif ready, for little endian
  return [x & 0xff, x >>> 8 & 0xff, x >>> 16 & 0xff, x >>> 24 & 0xff];
};

var makeWordArray = function (x) {
  return [x & 0xff, x >>> 8 & 0xff];
};

var makeStringArray = function (x) {
  // gif ready, no customize
  var res = [];

  for (var i = 0; i < x.length; i++) res.push(x.charCodeAt(i));

  return res;
};

var bitsToNum = function (ba) {
  // gif ready, no customize
  return ba.reduce(function (s, n) {
    return s * 2 + n;
  }, 0);
};

var byteToBitArr = function (bite) {
  // gif ready, no customize
  var a = [];

  for (var i = 7; i >= 0; i--) {
    a.push(!!(bite & 1 << i));
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

/***/ }),

/***/ "./src/parse_apng.js":
/*!***************************!*\
  !*** ./src/parse_apng.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const Animation = __webpack_require__(/*! ./animation */ "./src/animation.js");

const crc32 = __webpack_require__(/*! ./crc32 */ "./src/crc32.js");

const support = __webpack_require__(/*! ./support-test */ "./src/support-test.js");
/**
 * @param {ArrayBuffer} buffer
 * @return {Promise}
 */


module.exports = function (buffer) {
  const bytes = new Uint8Array(buffer);
  return new Promise(function (resolve, reject) {
    // fast animation test
    let isAnimated = false;
    parseChunks(bytes, function (type) {
      if (type === "acTL") {
        isAnimated = true;
        return false;
      }

      return true;
    });

    if (!isAnimated) {
      reject("Not an animated PNG");
      return;
    }

    const preDataParts = [],
          postDataParts = [],
          anim = new Animation();
    let headerDataBytes = null,
        frame = null;
    parseChunks(bytes, function (type, bytes, off, length) {
      switch (type) {
        case "IHDR":
          headerDataBytes = bytes.subarray(off + 8, off + 8 + length);
          anim.width = readDWord(bytes, off + 8);
          anim.height = readDWord(bytes, off + 12);
          break;

        case "acTL":
          anim.numPlays = readDWord(bytes, off + 8 + 4);
          break;

        case "fcTL":
          if (frame) anim.frames.push(frame);
          frame = {};
          frame.width = readDWord(bytes, off + 8 + 4);
          frame.height = readDWord(bytes, off + 8 + 8);
          frame.left = readDWord(bytes, off + 8 + 12);
          frame.top = readDWord(bytes, off + 8 + 16);
          var delayN = readWord(bytes, off + 8 + 20);
          var delayD = readWord(bytes, off + 8 + 22);
          if (delayD == 0) delayD = 100;
          frame.delay = 1000 * delayN / delayD; // see http://mxr.mozilla.org/mozilla/source/gfx/src/shared/gfxImageFrame.cpp#343

          if (frame.delay <= 10) frame.delay = 100;
          anim.playTime += frame.delay;
          frame.disposeOp = readByte(bytes, off + 8 + 24);
          frame.blendOp = readByte(bytes, off + 8 + 25);
          frame.dataParts = [];
          break;

        case "fdAT":
          if (frame) frame.dataParts.push(bytes.subarray(off + 8 + 4, off + 8 + length));
          break;

        case "IDAT":
          if (frame) frame.dataParts.push(bytes.subarray(off + 8, off + 8 + length));
          break;

        case "IEND":
          postDataParts.push(subBuffer(bytes, off, 12 + length));
          break;

        default:
          preDataParts.push(subBuffer(bytes, off, 12 + length));
      }
    });
    if (frame) anim.frames.push(frame);

    if (anim.frames.length == 0) {
      reject("Not an animated PNG");
      return;
    } // creating images


    var createdImages = 0;
    var preBlob = new Blob(preDataParts),
        postBlob = new Blob(postDataParts);

    for (var f = 0; f < anim.frames.length; f++) {
      frame = anim.frames[f];
      var bb = [];
      bb.push(support.PNG_SIGNATURE_BYTES);
      headerDataBytes.set(makeDWordArray(frame.width), 0);
      headerDataBytes.set(makeDWordArray(frame.height), 4);
      bb.push(makeChunkBytes("IHDR", headerDataBytes));
      bb.push(preBlob);

      for (var j = 0; j < frame.dataParts.length; j++) {
        bb.push(makeChunkBytes("IDAT", frame.dataParts[j]));
      }

      bb.push(postBlob);
      var url = URL.createObjectURL(new Blob(bb, {
        "type": "image/png"
      }));
      delete frame.dataParts;
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


var parseChunks = function (bytes, callback) {
  var off = 8;

  do {
    var length = readDWord(bytes, off);
    var type = readString(bytes, off + 4, 4);
    var res = callback(type, bytes, off, length);
    off += 12 + length;
  } while (res !== false && type != "IEND" && off < bytes.length);
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readDWord = function (bytes, off) {
  var x = 0; // Force the most-significant byte to unsigned.

  x += bytes[0 + off] << 24 >>> 0;

  for (var i = 1; i < 4; i++) x += bytes[i + off] << (3 - i) * 8;

  return x;
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readWord = function (bytes, off) {
  var x = 0;

  for (var i = 0; i < 2; i++) x += bytes[i + off] << (1 - i) * 8;

  return x;
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readByte = function (bytes, off) {
  return bytes[off];
};
/**
 * @param {Uint8Array} bytes
 * @param {int} start
 * @param {int} length
 * @return {Uint8Array}
 */


var subBuffer = function (bytes, start, length) {
  var a = new Uint8Array(length);
  a.set(bytes.subarray(start, start + length));
  return a;
};

var readString = function (bytes, off, length) {
  var chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
  return String.fromCharCode.apply(String, chars);
};

var makeDWordArray = function (x) {
  return [x >>> 24 & 0xff, x >>> 16 & 0xff, x >>> 8 & 0xff, x & 0xff];
};

var makeStringArray = function (x) {
  var res = [];

  for (var i = 0; i < x.length; i++) res.push(x.charCodeAt(i));

  return res;
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

/***/ }),

/***/ "./src/parse_webp.js":
/*!***************************!*\
  !*** ./src/parse_webp.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Animation = __webpack_require__(/*! ./animation */ "./src/animation.js");

var crc32 = __webpack_require__(/*! ./crc32 */ "./src/crc32.js");

const support = __webpack_require__(/*! ./support-test */ "./src/support-test.js");
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
      }

      return true;
    });

    if (!isAnimated) {
      reject("Not an animated WebP");
      return;
    }

    const anim = new Animation();
    let headerDataBytes = null,
        frame = null;
    parseChunks(bytes, function (type, bytes, off, length) {
      switch (type) {
        case "VP8X":
          headerDataBytes = bytes.subarray(off, off + length);
          anim.width = read3Bytes(bytes, off + 8 + 4) + 1;
          anim.height = read3Bytes(bytes, off + 8 + 4 + 3) + 1;
          break;

        case "ANIM":
          anim.numPlays = readWord(bytes, off + 8 + 4); //console.log(`BGColor: ${readDWord(bytes, off + 8)}`);

          break;

        case "ANMF":
          if (frame) anim.frames.push(frame);
          frame = {};
          frame.delay = read3Bytes(bytes, off + 8 + 12);
          if (frame.delay <= 10) frame.delay = 100;
          anim.playTime += frame.delay;
          frame.width = read3Bytes(bytes, off + 8 + 6) + 1;
          frame.height = read3Bytes(bytes, off + 8 + 9) + 1;
          frame.left = read3Bytes(bytes, off + 8) * 2;
          frame.top = read3Bytes(bytes, off + 8 + 3) * 2;
          const bits = byteToBitArr(readByte(bytes, off + 8 + 15));
          frame.disposeOp = bits[7] ? 1 : 0;
          frame.blendOp = bits[6] ? 0 : 1;
          frame.data = subBuffer(bytes, off + 8 + 16, length - 8 - 16);
          break;

        default:
      }
    });
    if (frame) anim.frames.push(frame);

    if (anim.frames.length === 0) {
      reject("Not an animated WebP");
      return;
    } // creating images


    let createdImages = 0;

    for (var f = 0; f < anim.frames.length; f++) {
      frame = anim.frames[f];
      var bb = [];
      const length = makeDWordArray(4 + headerDataBytes.byteLength + frame.data.byteLength);
      const headerArray = support.WEBP_CHECK_BYTES.map((bite, i) => {
        return i > 3 && i < 8 ? length[i - 4] : support.WEBP_CHECK_BYTES[i];
      });
      bb.push(headerArray);
      const bits = byteToBitArr(readByte(headerDataBytes, 8));
      bits[4] = false; // EXIF metadata (E): 1 bit

      bits[5] = false; // XMP metadata (X): 1 bit

      bits[6] = false; // Animation (A): 1 bit

      headerDataBytes.set([bitsToNum(bits)], 8);
      headerDataBytes.set(make3BytesArray(frame.width - 1), 8 + 4);
      headerDataBytes.set(make3BytesArray(frame.height - 1), 8 + 4 + 3);
      bb.push(headerDataBytes);
      bb.push(frame.data);
      var url = URL.createObjectURL(new Blob(bb, {
        "type": "image/webp"
      }));
      delete frame.data;
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
    let length = readDWord(bytes, off + 4);
    if (length % 2) length++;
    res = callback(type, bytes, off, length + 8);
    off += length + 8;
  } while (res !== false && off < limitOff);
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readDWord = function (bytes, off) {
  // gif ready, for little endian
  var x = 0; // Force the most-significant byte to unsigned.

  x += bytes[off + 3] << 24 >>> 0;

  for (var i = 1; i < 4; i++) x += bytes[off + 3 - i] << (3 - i) * 8;

  return x;
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readWord = function (bytes, off) {
  // gif ready, for little endian
  var x = 0;

  for (var i = 0; i < 2; i++) x += bytes[off + 1 - i] << (1 - i) * 8;

  return x;
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var read3Bytes = function (bytes, off) {
  // gif ready, for little endian
  var x = 0; // Force the most-significant byte to unsigned.

  x += bytes[off + 2] << 16 >>> 0;

  for (var i = 1; i < 3; i++) x += bytes[off + 2 - i] << (2 - i) * 8;

  return x;
};
/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */


var readByte = function (bytes, off) {
  // gif ready, no customize
  return bytes[off];
};
/**
 * @param {Uint8Array} bytes
 * @param {int} start
 * @param {int} length
 * @return {Uint8Array}
 */


var subBuffer = function (bytes, start, length) {
  // gif ready, no customize
  var a = new Uint8Array(length);
  a.set(bytes.subarray(start, start + length));
  return a;
};

var readString = function (bytes, off, length) {
  // gif ready, no customize
  var chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
  return String.fromCharCode.apply(String, chars);
};

var makeDWordArray = function (x) {
  // gif ready, for little endian
  return [x & 0xff, x >>> 8 & 0xff, x >>> 16 & 0xff, x >>> 24 & 0xff];
};

var makeWordArray = function (x) {
  return [x & 0xff, x >>> 8 & 0xff];
};

var make3BytesArray = function (x) {
  // gif ready, for little endian
  return [x & 0xff, x >>> 8 & 0xff, x >>> 16 & 0xff];
};

var makeStringArray = function (x) {
  // gif ready, no customize
  var res = [];

  for (var i = 0; i < x.length; i++) res.push(x.charCodeAt(i));

  return res;
};

var bitsToNum = function (ba) {
  // gif ready, no customize
  return ba.reduce(function (s, n) {
    return s * 2 + n;
  }, 0);
};

var byteToBitArr = function (bite) {
  // gif ready, no customize
  var a = [];

  for (var i = 7; i >= 0; i--) {
    a.push(!!(bite & 1 << i));
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

/***/ }),

/***/ "./src/support-test.js":
/*!*****************************!*\
  !*** ./src/support-test.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Promise = Promise || __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js").Promise; // "\x89PNG\x0d\x0a\x1a\x0a"


const PNG_SIGNATURE_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF87_SIGNATURE_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
const GIF89_SIGNATURE_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const WEBP_CHECK_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

var oncePromise = function (foo) {
  var promise = null;
  return function (callback) {
    if (!promise) promise = new Promise(foo);
    if (callback) promise.then(callback);
    return promise;
  };
};

var checkNativeFeatures = oncePromise(function (resolve) {
  var canvas = document.createElement("canvas");
  var result = {
    TypedArrays: "ArrayBuffer" in __webpack_require__.g,
    BlobURLs: "URL" in __webpack_require__.g,
    requestAnimationFrame: "requestAnimationFrame" in __webpack_require__.g,
    pageProtocol: location.protocol == "http:" || location.protocol == "https:",
    canvas: "getContext" in document.createElement("canvas"),
    APNG: false
  };

  if (result.canvas) {
    // see http://eligrey.com/blog/post/apng-feature-detection
    var img = new Image();

    img.onload = function () {
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      result.APNG = ctx.getImageData(0, 0, 1, 1).data[3] === 0;
      resolve(result);
    }; // frame 1 (skipped on apng-supporting browsers): [0, 0, 0, 255]
    // frame 2: [0, 0, 0, 0]


    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjV" + "EwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAA" + "AAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==";
  } else {
    resolve(result);
  }
});
/**
 * @param {boolean} [ignoreNativeAPNG]
 * @return {Promise}
 */

var ifNeeded = function (ignoreNativeAPNG) {
  if (typeof ignoreNativeAPNG == 'undefined') ignoreNativeAPNG = false;
  return checkNativeFeatures().then(function (features) {
    if (features.APNG && !ignoreNativeAPNG) {
      reject();
    } else {
      var ok = true;

      for (var k in features) if (features.hasOwnProperty(k) && k != 'APNG') {
        ok = ok && features[k];
      }
    }
  });
};

function pngCheck(buffer) {
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < PNG_SIGNATURE_BYTES.length; i++) {
    if (PNG_SIGNATURE_BYTES[i] !== bytes[i]) {
      return false;
    }
  }

  return true;
}

function gifCheck(buffer) {
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < GIF87_SIGNATURE_BYTES.length; i++) {
    if (GIF87_SIGNATURE_BYTES[i] !== bytes[i] && GIF89_SIGNATURE_BYTES[i] !== bytes[i]) {
      return false;
    }
  }

  return true;
}

function webpCheck(buffer) {
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < WEBP_CHECK_BYTES.length; i++) {
    if (WEBP_CHECK_BYTES[i] !== bytes[i] && WEBP_CHECK_BYTES[i] !== 0x00) {
      return false;
    }
  }

  return true;
}

module.exports = {
  checkNativeFeatures,
  ifNeeded,
  pngCheck,
  gifCheck,
  webpCheck,
  PNG_SIGNATURE_BYTES,
  GIF87_SIGNATURE_BYTES,
  GIF89_SIGNATURE_BYTES,
  WEBP_CHECK_BYTES
};

/***/ }),

/***/ "./node_modules/es6-promise/dist/es6-promise.js":
/*!******************************************************!*\
  !*** ./node_modules/es6-promise/dist/es6-promise.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof __webpack_require__.g !== 'undefined') {
    local = __webpack_require__.g;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));



//# sourceMappingURL=es6-promise.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/**
 * API:
 *
 * ifNeeded([ignoreNativeAPNG bool]) → Promise()
 * animateImage(img HTMLImageElement) → Promise()
 *
 * animateContext(url String, CanvasRenderingContext2D context) → Promise(Animation)
 * parseBuffer(ArrayBuffer) → Promise(Animation)
 * parseURL(url String) → Promise(Animation)
 * checkNativeFeatures() → Promise(features)
 */


const support = __webpack_require__(/*! ./support-test */ "./src/support-test.js");

const parseAPNG = __webpack_require__(/*! ./parse_apng */ "./src/parse_apng.js");

const parseAGIF = __webpack_require__(/*! ./parse_agif */ "./src/parse_agif.js");

const parseWEBP = __webpack_require__(/*! ./parse_webp */ "./src/parse_webp.js");

const loadUrl = __webpack_require__(/*! ./loader */ "./src/loader.js");

const Gyeonghwon = __webpack_require__.g.Gyeonghwon = {};
Gyeonghwon.checkNativeFeatures = support.checkNativeFeatures;
Gyeonghwon.ifNeeded = support.ifNeeded;
/**
 * @param {ArrayBuffer} buffer
 * @return {Promise}
 */

Gyeonghwon.parseBuffer = function (buffer) {
  return support.pngCheck(buffer) ? parseAPNG(buffer) : support.gifCheck(buffer) ? parseAGIF(buffer) : support.webpCheck(buffer) ? parseWEBP(buffer) : Promise.reject(new Error('Not a supported file (invalid file signature)'));
};

var url2promise = {};
/**
 * @param {String} url
 * @return {Promise}
 */

Gyeonghwon.parseURL = function (url) {
  if (!(url in url2promise)) url2promise[url] = loadUrl(url).then(Gyeonghwon.parseBuffer);
  return url2promise[url];
};
/**
 * @param {String} url
 * @param {CanvasRenderingContext2D} context
 * @return {Promise}
 */


Gyeonghwon.animateContext = function (url, context) {
  return Gyeonghwon.parseURL(url).then(function (a) {
    a.addContext(context);
    a.play();
    return a;
  });
};
/**
 * @param {HTMLImageElement} img
 * @return {Promise}
 */


Gyeonghwon.animateImage = function (img) {
  img.setAttribute("data-is-aimg", "progress");
  return Gyeonghwon.parseURL(img.src).then(function (anim) {
    img.setAttribute("data-is-aimg", "yes");
    var canvas = document.createElement("canvas");
    canvas.width = anim.width;
    canvas.height = anim.height;
    Array.prototype.slice.call(img.attributes).forEach(function (attr) {
      if (["alt", "src", "usemap", "ismap", "data-is-aimg", "width", "height"].indexOf(attr.nodeName) === -1) {
        canvas.setAttributeNode(attr.cloneNode(false));
      }
    });
    canvas.setAttribute("data-aimg-src", img.src);
    if (img.alt !== "") canvas.appendChild(document.createTextNode(img.alt));
    var imgWidth = "",
        imgHeight = "",
        val = 0,
        unit = "";

    if (img.style.width !== "" && img.style.width !== "auto") {
      imgWidth = img.style.width;
    } else if (img.hasAttribute("width")) {
      imgWidth = img.getAttribute("width") + "px";
    }

    if (img.style.height !== "" && img.style.height !== "auto") {
      imgHeight = img.style.height;
    } else if (img.hasAttribute("height")) {
      imgHeight = img.getAttribute("height") + "px";
    }

    if (imgWidth !== "" && imgHeight === "") {
      val = parseFloat(imgWidth);
      unit = imgWidth.match(/\D+$/)[0];
      imgHeight = Math.round(canvas.height * val / canvas.width) + unit;
    }

    if (imgHeight !== "" && imgWidth === "") {
      val = parseFloat(imgHeight);
      unit = imgHeight.match(/\D+$/)[0];
      imgWidth = Math.round(canvas.width * val / canvas.height) + unit;
    }

    canvas.style.width = imgWidth;
    canvas.style.height = imgHeight;
    var p = img.parentNode;
    p.insertBefore(canvas, img);
    p.removeChild(img);
    anim.addContext(canvas.getContext("2d"));
    anim.play();
  }, function (e) {
    console.log(e);
    img.setAttribute("data-is-aimg", "no");
  });
};
/**
 * @param {HTMLCanvasElement} canvas
 * @return {void}
 */


Gyeonghwon.releaseCanvas = function (canvas) {
  var ctx = canvas.getContext("2d");

  if ('_aimg_animation' in ctx) {
    ctx['_aimg_animation'].removeContext(ctx);
  }
};
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9HeWVvbmdod29uL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9HeWVvbmdod29uLy4vc3JjL2FuaW1hdGlvbi5qcyIsIndlYnBhY2s6Ly9HeWVvbmdod29uLy4vc3JjL2NyYzMyLmpzIiwid2VicGFjazovL0d5ZW9uZ2h3b24vLi9zcmMvbG9hZGVyLmpzIiwid2VicGFjazovL0d5ZW9uZ2h3b24vLi9zcmMvcGFyc2VfYWdpZi5qcyIsIndlYnBhY2s6Ly9HeWVvbmdod29uLy4vc3JjL3BhcnNlX2FwbmcuanMiLCJ3ZWJwYWNrOi8vR3llb25naHdvbi8uL3NyYy9wYXJzZV93ZWJwLmpzIiwid2VicGFjazovL0d5ZW9uZ2h3b24vLi9zcmMvc3VwcG9ydC10ZXN0LmpzIiwid2VicGFjazovL0d5ZW9uZ2h3b24vLi9ub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIndlYnBhY2s6Ly9HeWVvbmdod29uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0d5ZW9uZ2h3b24vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9HeWVvbmdod29uLy4vc3JjL21haW4uanMiXSwibmFtZXMiOlsiQW5pbWF0aW9uIiwid2lkdGgiLCJoZWlnaHQiLCJudW1QbGF5cyIsInBsYXlUaW1lIiwiZnJhbWVzIiwicGxheSIsInBsYXllZCIsImZpbmlzaGVkIiwicmV3aW5kIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidGljayIsIm5leHRSZW5kZXJUaW1lIiwiZk51bSIsInByZXZGIiwiYWRkQ29udGV4dCIsImN0eCIsImNvbnRleHRzIiwibGVuZ3RoIiwiZGF0IiwiZ2V0SW1hZ2VEYXRhIiwicHV0SW1hZ2VEYXRhIiwicHVzaCIsInJlbW92ZUNvbnRleHQiLCJpZHgiLCJpbmRleE9mIiwic3BsaWNlIiwiaXNQbGF5ZWQiLCJpc0ZpbmlzaGVkIiwiYW5pIiwibm93IiwicmVuZGVyRnJhbWUiLCJmIiwiZnJhbWUiLCJmb3JFYWNoIiwiY2xlYXJSZWN0IiwiZGlzcG9zZU9wIiwibGVmdCIsInRvcCIsImlEYXRhIiwiYmxlbmRPcCIsImRyYXdJbWFnZSIsImltZyIsImRlbGF5IiwibW9kdWxlIiwiZXhwb3J0cyIsInRhYmxlIiwiVWludDMyQXJyYXkiLCJpIiwiYyIsImsiLCJieXRlcyIsInN0YXJ0IiwiY3JjIiwibCIsIlByb21pc2UiLCJyZXF1aXJlIiwidXJsIiwicmVzb2x2ZSIsInJlamVjdCIsImZldGNoIiwibWV0aG9kIiwidGhlbiIsInJlcyIsInN0YXR1cyIsImFycmF5QnVmZmVyIiwiYnVmIiwiY3JjMzIiLCJzdXBwb3J0IiwiYnVmZmVyIiwiVWludDhBcnJheSIsImlzQW5pbWF0ZWQiLCJwYXJzZUJsb2NrcyIsInR5cGUiLCJwb3N0RGF0YVBhcnRzIiwiYW5pbSIsImhlYWRlckRhdGFCeXRlcyIsIm9mZiIsInN1YmFycmF5IiwicmVhZFdvcmQiLCJpZGVudCIsInJlYWRTdHJpbmciLCJnY2UiLCJzdWJCdWZmZXIiLCJkYXRhIiwiY3JlYXRlZEltYWdlcyIsInBvc3RCbG9iIiwiQmxvYiIsImJiIiwiR0lGODlfU0lHTkFUVVJFX0JZVEVTIiwic2V0IiwibWFrZVdvcmRBcnJheSIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIm9ubG9hZCIsInJldm9rZU9iamVjdFVSTCIsInNyYyIsIm9uZXJyb3IiLCJibG9ja3NMZW5ndGgiLCJzaXoiLCJyZWFkQnl0ZSIsImNhbGxiYWNrIiwiYml0cyIsImJ5dGVUb0JpdEFyciIsImdjdEV4aXN0cyIsImdjdFNpemUiLCJiaXRzVG9OdW0iLCJNYXRoIiwicG93IiwiY29tbSIsInN1YiIsIkVycm9yIiwibGN0RXhpc3RzIiwibGN0U2l6ZSIsInJlYWREV29yZCIsIngiLCJhIiwiY2hhcnMiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImFwcGx5IiwibWFrZURXb3JkQXJyYXkiLCJtYWtlU3RyaW5nQXJyYXkiLCJjaGFyQ29kZUF0IiwiYmEiLCJyZWR1Y2UiLCJzIiwibiIsImJpdGUiLCJtYWtlQ2h1bmtCeXRlcyIsImRhdGFCeXRlcyIsImNyY0xlbiIsIkFycmF5QnVmZmVyIiwicGFyc2VDaHVua3MiLCJwcmVEYXRhUGFydHMiLCJkZWxheU4iLCJkZWxheUQiLCJkYXRhUGFydHMiLCJwcmVCbG9iIiwiUE5HX1NJR05BVFVSRV9CWVRFUyIsImoiLCJyZWFkM0J5dGVzIiwiYnl0ZUxlbmd0aCIsImhlYWRlckFycmF5IiwiV0VCUF9DSEVDS19CWVRFUyIsIm1hcCIsIm1ha2UzQnl0ZXNBcnJheSIsImxpbWl0IiwibGltaXRPZmYiLCJHSUY4N19TSUdOQVRVUkVfQllURVMiLCJvbmNlUHJvbWlzZSIsImZvbyIsInByb21pc2UiLCJjaGVja05hdGl2ZUZlYXR1cmVzIiwiY2FudmFzIiwicmVzdWx0IiwiVHlwZWRBcnJheXMiLCJnbG9iYWwiLCJCbG9iVVJMcyIsInBhZ2VQcm90b2NvbCIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJBUE5HIiwiSW1hZ2UiLCJnZXRDb250ZXh0IiwiaWZOZWVkZWQiLCJpZ25vcmVOYXRpdmVBUE5HIiwiZmVhdHVyZXMiLCJvayIsImhhc093blByb3BlcnR5IiwicG5nQ2hlY2siLCJnaWZDaGVjayIsIndlYnBDaGVjayIsInBhcnNlQVBORyIsInBhcnNlQUdJRiIsInBhcnNlV0VCUCIsImxvYWRVcmwiLCJHeWVvbmdod29uIiwicGFyc2VCdWZmZXIiLCJ1cmwycHJvbWlzZSIsInBhcnNlVVJMIiwiYW5pbWF0ZUNvbnRleHQiLCJjb250ZXh0IiwiYW5pbWF0ZUltYWdlIiwic2V0QXR0cmlidXRlIiwiYXR0cmlidXRlcyIsImF0dHIiLCJub2RlTmFtZSIsInNldEF0dHJpYnV0ZU5vZGUiLCJjbG9uZU5vZGUiLCJhbHQiLCJhcHBlbmRDaGlsZCIsImNyZWF0ZVRleHROb2RlIiwiaW1nV2lkdGgiLCJpbWdIZWlnaHQiLCJ2YWwiLCJ1bml0Iiwic3R5bGUiLCJoYXNBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJwYXJzZUZsb2F0IiwibWF0Y2giLCJyb3VuZCIsInAiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJlIiwiY29uc29sZSIsImxvZyIsInJlbGVhc2VDYW52YXMiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTzs7Ozs7Ozs7OztBQ1ZhO0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsSUFBSUEsU0FBUyxHQUFHLFlBQVk7QUFDMUI7QUFFQSxPQUFLQyxLQUFMLEdBQWEsQ0FBYjtBQUNBLE9BQUtDLE1BQUwsR0FBYyxDQUFkO0FBQ0EsT0FBS0MsUUFBTCxHQUFnQixDQUFoQjtBQUNBLE9BQUtDLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQSxPQUFLQyxNQUFMLEdBQWMsRUFBZDtBQUVBO0FBQ0Y7QUFDQTtBQUNBOztBQUNFLE9BQUtDLElBQUwsR0FBWSxZQUFZO0FBQ3RCLFFBQUlDLE1BQU0sSUFBSUMsUUFBZCxFQUF3QjtBQUN4QixTQUFLQyxNQUFMO0FBQ0FGLFVBQU0sR0FBRyxJQUFUO0FBQ0FHLHlCQUFxQixDQUFDQyxJQUFELENBQXJCO0FBQ0QsR0FMRDtBQU9BO0FBQ0Y7QUFDQTtBQUNBOzs7QUFDRSxPQUFLRixNQUFMLEdBQWMsWUFBWTtBQUN4Qkcsa0JBQWMsR0FBRyxDQUFqQjtBQUNBQyxRQUFJLEdBQUcsQ0FBUDtBQUNBQyxTQUFLLEdBQUcsSUFBUjtBQUNBUCxVQUFNLEdBQUcsS0FBVDtBQUNBQyxZQUFRLEdBQUcsS0FBWDtBQUNELEdBTkQ7QUFRQTtBQUNGO0FBQ0E7QUFDQTtBQUNBOzs7QUFDRSxPQUFLTyxVQUFMLEdBQWtCLFVBQVVDLEdBQVYsRUFBZTtBQUMvQixRQUFJQyxRQUFRLENBQUNDLE1BQVQsR0FBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsVUFBSUMsR0FBRyxH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QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixzQkFBc0I7O0FBRWhEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCLFNBQVM7QUFDMUI7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUMseUNBQXlDLFVBQWM7QUFDeEQ7QUFDQSxDQUFDO0FBQ0Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0EsVUFBVSxJQUFJO0FBQ2Q7QUFDQSxXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsd0JBQXdCO0FBQ3pDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBbUIsNkNBQTZDO0FBQ2hFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBLFVBQVUsTUFBTTtBQUNoQixVQUFVLE9BQU87QUFDakI7QUFDQSxXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVSxNQUFNO0FBQ2hCO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0EscUJBQXFCLFlBQVk7QUFDakM7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQSxVQUFVLElBQUk7QUFDZDtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQSxVQUFVLFNBQVM7QUFDbkI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNB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Ozs7QUFDQVAsVUFBVSxDQUFDaUMsYUFBWCxHQUEyQixVQUFTeEQsTUFBVCxFQUFpQjtBQUMxQyxNQUFJaEosR0FBRyxHQUFHZ0osTUFBTSxDQUFDVSxVQUFQLENBQWtCLElBQWxCLENBQVY7O0FBQ0EsTUFBSSxxQkFBcUIxSixHQUF6QixFQUE4QjtBQUM1QkEsT0FBRyxDQUFDLGlCQUFELENBQUgsQ0FBdUJPLGFBQXZCLENBQXFDUCxHQUFyQztBQUNEO0FBQ0YsQ0FMRCxDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIHtcblx0XHR2YXIgYSA9IGZhY3RvcnkoKTtcblx0XHRmb3IodmFyIGkgaW4gYSkgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyA/IGV4cG9ydHMgOiByb290KVtpXSA9IGFbaV07XG5cdH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEFuaW1hdGlvbiBjbGFzc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbnZhciBBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgLy8gUHVibGljXHJcblxyXG4gIHRoaXMud2lkdGggPSAwO1xyXG4gIHRoaXMuaGVpZ2h0ID0gMDtcclxuICB0aGlzLm51bVBsYXlzID0gMDtcclxuICB0aGlzLnBsYXlUaW1lID0gMDtcclxuICB0aGlzLmZyYW1lcyA9IFtdO1xyXG5cclxuICAvKipcclxuICAgKiBQbGF5IGFuaW1hdGlvbiAoaWYgbm90IGZpbmlzaGVkKVxyXG4gICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICovXHJcbiAgdGhpcy5wbGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHBsYXllZCB8fCBmaW5pc2hlZCkgcmV0dXJuO1xyXG4gICAgdGhpcy5yZXdpbmQoKTtcclxuICAgIHBsYXllZCA9IHRydWU7XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmV3aW5kIGFuaW1hdGlvbiB0byBzdGFydCAoYW5kIHN0b3AgaXQpXHJcbiAgICogQHJldHVybiB7dm9pZH1cclxuICAgKi9cclxuICB0aGlzLnJld2luZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIG5leHRSZW5kZXJUaW1lID0gMDtcclxuICAgIGZOdW0gPSAwO1xyXG4gICAgcHJldkYgPSBudWxsO1xyXG4gICAgcGxheWVkID0gZmFsc2U7XHJcbiAgICBmaW5pc2hlZCA9IGZhbHNlO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBuZXcgY2FudmFzIGNvbnRleHQgdG8gYW5pbWF0ZVxyXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHhcclxuICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAqL1xyXG4gIHRoaXMuYWRkQ29udGV4dCA9IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgIGlmIChjb250ZXh0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciBkYXQgPSBjb250ZXh0c1swXS5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICBjdHgucHV0SW1hZ2VEYXRhKGRhdCwgMCwgMCk7XHJcbiAgICB9XHJcbiAgICBjb250ZXh0cy5wdXNoKGN0eCk7XHJcbiAgICBjdHhbJ19haW1nX2FuaW1hdGlvbiddID0gdGhpcztcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgY2FudmFzIGNvbnRleHQgZnJvbSBhbmltYXRpb25cclxuICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4XHJcbiAgICogQHJldHVybiB7dm9pZH1cclxuICAgKi9cclxuICB0aGlzLnJlbW92ZUNvbnRleHQgPSBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICB2YXIgaWR4ID0gY29udGV4dHMuaW5kZXhPZihjdHgpO1xyXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29udGV4dHMuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICBpZiAoY29udGV4dHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHRoaXMucmV3aW5kKCk7XHJcbiAgICB9XHJcbiAgICBpZiAoJ19haW1nX2FuaW1hdGlvbicgaW4gY3R4KSB7XHJcbiAgICAgIGRlbGV0ZSBjdHhbJ19haW1nX2FuaW1hdGlvbiddO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vbm9pbnNwZWN0aW9uIEpTVW51c2VkR2xvYmFsU3ltYm9sc1xyXG4gIC8qKlxyXG4gICAqIElzIGFuaW1hdGlvbiBwbGF5ZWQ/XHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgKi9cclxuICB0aGlzLmlzUGxheWVkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcGxheWVkOyB9O1xyXG5cclxuICAvL25vaW5zcGVjdGlvbiBKU1VudXNlZEdsb2JhbFN5bWJvbHNcclxuICAvKipcclxuICAgKiBJcyBhbmltYXRpb24gZmluaXNoZWQ/XHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgKi9cclxuICB0aGlzLmlzRmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBmaW5pc2hlZDsgfTtcclxuXHJcbiAgLy8gUHJpdmF0ZVxyXG5cclxuICB2YXIgYW5pID0gdGhpcyxcclxuICAgIG5leHRSZW5kZXJUaW1lID0gMCxcclxuICAgIGZOdW0gPSAwLFxyXG4gICAgcHJldkYgPSBudWxsLFxyXG4gICAgcGxheWVkID0gZmFsc2UsXHJcbiAgICBmaW5pc2hlZCA9IGZhbHNlLFxyXG4gICAgY29udGV4dHMgPSBbXTtcclxuXHJcbiAgdmFyIHRpY2sgPSBmdW5jdGlvbiAobm93KSB7XHJcbiAgICB3aGlsZSAocGxheWVkICYmIG5leHRSZW5kZXJUaW1lIDw9IG5vdykgcmVuZGVyRnJhbWUobm93KTtcclxuICAgIGlmIChwbGF5ZWQpIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcclxuICB9O1xyXG5cclxuICB2YXIgcmVuZGVyRnJhbWUgPSBmdW5jdGlvbiAobm93KSB7XHJcbiAgICB2YXIgZiA9IGZOdW0rKyAlIGFuaS5mcmFtZXMubGVuZ3RoO1xyXG4gICAgdmFyIGZyYW1lID0gYW5pLmZyYW1lc1tmXTtcclxuXHJcbiAgICBpZiAoIShhbmkubnVtUGxheXMgPT09IDAgfHwgZk51bSAvIGFuaS5mcmFtZXMubGVuZ3RoIDw9IGFuaS5udW1QbGF5cykpIHtcclxuICAgICAgcGxheWVkID0gZmFsc2U7XHJcbiAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGYgPT09IDApIHtcclxuICAgICAgY29udGV4dHMuZm9yRWFjaChmdW5jdGlvbiAoY3R4KSB7Y3R4LmNsZWFyUmVjdCgwLCAwLCBhbmkud2lkdGgsIGFuaS5oZWlnaHQpO30pO1xyXG4gICAgICBwcmV2RiA9IG51bGw7XHJcbiAgICAgIGlmIChmcmFtZS5kaXNwb3NlT3AgPT09IDIpIGZyYW1lLmRpc3Bvc2VPcCA9IDE7XHJcbiAgICB9XHJcbiAgICBpZiAocHJldkYgJiYgcHJldkYuZGlzcG9zZU9wID09PSAxKSB7XHJcbiAgICAgIGNvbnRleHRzLmZvckVhY2goZnVuY3Rpb24gKGN0eCkge2N0eC5jbGVhclJlY3QocHJldkYubGVmdCwgcHJldkYudG9wLCBwcmV2Ri53aWR0aCwgcHJldkYuaGVpZ2h0KTt9KTtcclxuICAgIH0gZWxzZSBpZiAocHJldkYgJiYgcHJldkYuZGlzcG9zZU9wID09PSAyKSB7XHJcbiAgICAgIGNvbnRleHRzLmZvckVhY2goZnVuY3Rpb24gKGN0eCkge2N0eC5wdXRJbWFnZURhdGEocHJldkYuaURhdGEsIHByZXZGLmxlZnQsIHByZXZGLnRvcCk7fSk7XHJcbiAgICB9XHJcbiAgICBwcmV2RiA9IGZyYW1lO1xyXG4gICAgcHJldkYuaURhdGEgPSBudWxsO1xyXG4gICAgaWYgKHByZXZGLmRpc3Bvc2VPcCA9PT0gMikge1xyXG4gICAgICBwcmV2Ri5pRGF0YSA9IGNvbnRleHRzWzBdLmdldEltYWdlRGF0YShmcmFtZS5sZWZ0LCBmcmFtZS50b3AsIGZyYW1lLndpZHRoLCBmcmFtZS5oZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgaWYgKGZyYW1lLmJsZW5kT3AgPT09IDApIHtcclxuICAgICAgY29udGV4dHMuZm9yRWFjaChmdW5jdGlvbiAoY3R4KSB7Y3R4LmNsZWFyUmVjdChmcmFtZS5sZWZ0LCBmcmFtZS50b3AsIGZyYW1lLndpZHRoLCBmcmFtZS5oZWlnaHQpO30pO1xyXG4gICAgfVxyXG4gICAgY29udGV4dHMuZm9yRWFjaChmdW5jdGlvbiAoY3R4KSB7Y3R4LmRyYXdJbWFnZShmcmFtZS5pbWcsIGZyYW1lLmxlZnQsIGZyYW1lLnRvcCk7fSk7XHJcbiAgICBpZiAobmV4dFJlbmRlclRpbWUgPT09IDApIG5leHRSZW5kZXJUaW1lID0gbm93O1xyXG4gICAgd2hpbGUgKG5vdyA+IG5leHRSZW5kZXJUaW1lICsgYW5pLnBsYXlUaW1lKSBuZXh0UmVuZGVyVGltZSArPSBhbmkucGxheVRpbWU7XHJcbiAgICBuZXh0UmVuZGVyVGltZSArPSBmcmFtZS5kZWxheTtcclxuICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdGFibGUgPSBuZXcgVWludDMyQXJyYXkoMjU2KTtcclxuXHJcbmZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcclxuICAgIHZhciBjID0gaTtcclxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgODsgaysrKSBjID0gKGMgJiAxKSA/IDB4RURCODgzMjAgXiAoYyA+Pj4gMSkgOiBjID4+PiAxO1xyXG4gICAgdGFibGVbaV0gPSBjO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2ludH0gc3RhcnRcclxuICogQHBhcmFtIHtpbnR9IGxlbmd0aFxyXG4gKiBAcmV0dXJuIHtpbnR9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChieXRlcywgc3RhcnQsIGxlbmd0aCkge1xyXG4gICAgc3RhcnQgPSBzdGFydCB8fCAwO1xyXG4gICAgbGVuZ3RoID0gbGVuZ3RoIHx8IChieXRlcy5sZW5ndGggLSBzdGFydCk7XHJcbiAgICB2YXIgY3JjID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnQsIGwgPSBzdGFydCArIGxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGNyYyA9ICggY3JjID4+PiA4ICkgXiB0YWJsZVsoIGNyYyBeIGJ5dGVzW2ldICkgJiAweEZGXTtcclxuICAgIH1cclxuICAgIHJldHVybiBjcmMgXiAoLTEpO1xyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQcm9taXNlID0gUHJvbWlzZSB8fCByZXF1aXJlKCdlczYtcHJvbWlzZScpLlByb21pc2U7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh1cmwpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgZmV0Y2godXJsLCB7XHJcbiAgICAgIG1ldGhvZDogJ0dFVCdcclxuICAgIH0pLnRoZW4ocmVzID0+IHtcclxuICAgICAgaWYgKHJlcy5zdGF0dXMgIT09IDIwMCkgcmVqZWN0KHJlcyk7XHJcbiAgICAgIHJlcy5hcnJheUJ1ZmZlcigpLnRoZW4oYnVmID0+IHJlc29sdmUoYnVmKSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQW5pbWF0aW9uID0gcmVxdWlyZSgnLi9hbmltYXRpb24nKTtcclxudmFyIGNyYzMyID0gcmVxdWlyZSgnLi9jcmMzMicpO1xyXG5jb25zdCBzdXBwb3J0ID0gcmVxdWlyZShcIi4vc3VwcG9ydC10ZXN0XCIpO1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGJ1ZmZlclxyXG4gKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYnVmZmVyKSB7XHJcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAvLyBmYXN0IGFuaW1hdGlvbiB0ZXN0XHJcbiAgICBsZXQgaXNBbmltYXRlZCA9IGZhbHNlO1xyXG4gICAgcGFyc2VCbG9ja3MoYnl0ZXMsIGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgIGlmICh0eXBlID09PSBcIkFQUFwiKSB7XHJcbiAgICAgICAgaXNBbmltYXRlZCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoIWlzQW5pbWF0ZWQpIHtcclxuICAgICAgcmVqZWN0KFwiTm90IGFuIGFuaW1hdGVkIEdJRlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0XHJcbiAgICAgIHBvc3REYXRhUGFydHMgPSBbXSxcclxuICAgICAgYW5pbSA9IG5ldyBBbmltYXRpb24oKTtcclxuICAgIGxldFxyXG4gICAgICBoZWFkZXJEYXRhQnl0ZXMgPSBudWxsLFxyXG4gICAgICBmcmFtZSA9IG51bGw7XHJcblxyXG4gICAgcGFyc2VCbG9ja3MoYnl0ZXMsIGZ1bmN0aW9uICh0eXBlLCBieXRlcywgb2ZmLCBsZW5ndGgpIHtcclxuICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcIkhEUlwiOlxyXG4gICAgICAgICAgaGVhZGVyRGF0YUJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkob2ZmLCBvZmYgKyBsZW5ndGgpO1xyXG4gICAgICAgICAgYW5pbS53aWR0aCA9IHJlYWRXb3JkKGJ5dGVzLCBvZmYpO1xyXG4gICAgICAgICAgYW5pbS5oZWlnaHQgPSByZWFkV29yZChieXRlcywgb2ZmICsgMik7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiQVBQXCI6XHJcbiAgICAgICAgICBjb25zdCBpZGVudCA9IHJlYWRTdHJpbmcoYnl0ZXMsIG9mZiArIDMsIDExKTtcclxuICAgICAgICAgIGlmIChpZGVudCA9PT0gJ05FVFNDQVBFMi4wJykge1xyXG4gICAgICAgICAgICBhbmltLm51bVBsYXlzID0gcmVhZFdvcmQoYnl0ZXMsIG9mZiArIDE2KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJHQ0VcIjpcclxuICAgICAgICAgIGlmIChmcmFtZSkgYW5pbS5mcmFtZXMucHVzaChmcmFtZSk7XHJcbiAgICAgICAgICBmcmFtZSA9IHt9O1xyXG4gICAgICAgICAgZnJhbWUuZGVsYXkgPSByZWFkV29yZChieXRlcywgb2ZmICsgNCkgKiAxMDtcclxuICAgICAgICAgIGlmIChmcmFtZS5kZWxheSA8PSAxMCkgZnJhbWUuZGVsYXkgPSAxMDA7XHJcbiAgICAgICAgICBhbmltLnBsYXlUaW1lICs9IGZyYW1lLmRlbGF5O1xyXG4gICAgICAgICAgZnJhbWUuZ2NlID0gc3ViQnVmZmVyKGJ5dGVzLCBvZmYsIGxlbmd0aCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiSU1HXCI6XHJcbiAgICAgICAgICBpZiAoZnJhbWUgJiYgZnJhbWUuZGF0YSkge1xyXG4gICAgICAgICAgICBhbmltLmZyYW1lcy5wdXNoKGZyYW1lKTtcclxuICAgICAgICAgICAgZnJhbWUgPSB7fTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZyYW1lLndpZHRoID0gcmVhZFdvcmQoYnl0ZXMsIG9mZiArIDUpO1xyXG4gICAgICAgICAgZnJhbWUuaGVpZ2h0ID0gcmVhZFdvcmQoYnl0ZXMsIG9mZiArIDcpO1xyXG4gICAgICAgICAgZnJhbWUubGVmdCA9IHJlYWRXb3JkKGJ5dGVzLCBvZmYgKyAxKTtcclxuICAgICAgICAgIGZyYW1lLnRvcCA9IHJlYWRXb3JkKGJ5dGVzLCBvZmYgKyAzKTtcclxuICAgICAgICAgIGZyYW1lLmRhdGEgPSBzdWJCdWZmZXIoYnl0ZXMsIG9mZiwgbGVuZ3RoKTtcclxuICAgICAgICAgIGZyYW1lLmRpc3Bvc2VPcCA9IDA7XHJcbiAgICAgICAgICBmcmFtZS5ibGVuZE9wID0gMDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJDT01cIjpcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJQVEVcIjpcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJFT0ZcIjpcclxuICAgICAgICAgIHBvc3REYXRhUGFydHMucHVzaChzdWJCdWZmZXIoYnl0ZXMsIG9mZiwgbGVuZ3RoKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZnJhbWUpIGFuaW0uZnJhbWVzLnB1c2goZnJhbWUpO1xyXG5cclxuICAgIGlmIChhbmltLmZyYW1lcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmVqZWN0KFwiTm90IGFuIGFuaW1hdGVkIFBOR1wiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0aW5nIGltYWdlc1xyXG4gICAgbGV0IGNyZWF0ZWRJbWFnZXMgPSAwO1xyXG4gICAgY29uc3QgcG9zdEJsb2IgPSBuZXcgQmxvYihwb3N0RGF0YVBhcnRzKTtcclxuICAgIGZvciAodmFyIGYgPSAwOyBmIDwgYW5pbS5mcmFtZXMubGVuZ3RoOyBmKyspIHtcclxuICAgICAgZnJhbWUgPSBhbmltLmZyYW1lc1tmXTtcclxuXHJcbiAgICAgIHZhciBiYiA9IFtdO1xyXG4gICAgICBiYi5wdXNoKHN1cHBvcnQuR0lGODlfU0lHTkFUVVJFX0JZVEVTKTtcclxuICAgICAgaGVhZGVyRGF0YUJ5dGVzLnNldChtYWtlV29yZEFycmF5KGZyYW1lLndpZHRoKSwgMCk7XHJcbiAgICAgIGhlYWRlckRhdGFCeXRlcy5zZXQobWFrZVdvcmRBcnJheShmcmFtZS5oZWlnaHQpLCAyKTtcclxuICAgICAgYmIucHVzaChoZWFkZXJEYXRhQnl0ZXMpO1xyXG4gICAgICBiYi5wdXNoKGZyYW1lLmdjZSk7XHJcbiAgICAgIGJiLnB1c2goZnJhbWUuZGF0YSk7XHJcbiAgICAgIGJiLnB1c2gocG9zdEJsb2IpO1xyXG4gICAgICB2YXIgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihiYiwge1widHlwZVwiOiBcImltYWdlL2dpZlwifSkpO1xyXG4gICAgICBkZWxldGUgZnJhbWUuZGF0YTtcclxuICAgICAgZGVsZXRlIGZyYW1lLmdjZTtcclxuICAgICAgYmIgPSBudWxsO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFVzaW5nIFwiY3JlYXRlRWxlbWVudFwiIGluc3RlYWQgb2YgXCJuZXcgSW1hZ2VcIiBiZWNhdXNlIG9mIGJ1ZyBpbiBDaHJvbWUgMjdcclxuICAgICAgICogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTIzODA3MVxyXG4gICAgICAgKiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2Mzc3Mzc1L3VzaW5nLWNhbnZhcy1kcmF3aW1hZ2UtaW4tY2hyb21lLWV4dGVuc2lvbi1jb250ZW50LXNjcmlwdC8xNjM3ODI3MFxyXG4gICAgICAgKi9cclxuICAgICAgZnJhbWUuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgIGZyYW1lLmltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnNyYyk7XHJcbiAgICAgICAgY3JlYXRlZEltYWdlcysrO1xyXG4gICAgICAgIGlmIChjcmVhdGVkSW1hZ2VzID09PSBhbmltLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHJlc29sdmUoYW5pbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBmcmFtZS5pbWcub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZWplY3QoXCJJbWFnZSBjcmVhdGlvbiBlcnJvclwiKTtcclxuICAgICAgfTtcclxuICAgICAgZnJhbWUuaW1nLnNyYyA9IHVybDtcclxuICAgIH1cclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IGJsb2Nrc0xlbmd0aCA9IGZ1bmN0aW9uKGJ5dGVzLCBvZmYpIHtcclxuICBsZXQgbGVuZ3RoID0gMDtcclxuICB3aGlsZSgxKSB7XHJcbiAgICBjb25zdCBzaXogPSByZWFkQnl0ZShieXRlcywgb2ZmICsgbGVuZ3RoKTtcclxuICAgIGxlbmd0aCsrO1xyXG4gICAgaWYgKHNpeiA9PT0gMHgwMCkgcmV0dXJuIGxlbmd0aDtcclxuICAgIGxlbmd0aCArPSBzaXo7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZywgVWludDhBcnJheSwgaW50LCBpbnQpfSBjYWxsYmFja1xyXG4gKi9cclxudmFyIHBhcnNlQmxvY2tzID0gZnVuY3Rpb24gKGJ5dGVzLCBjYWxsYmFjaykge1xyXG4gIGxldCBvZmYgPSA2O1xyXG4gIGxldCByZXMsIGxlbmd0aCwgdHlwZTtcclxuICBkbyB7XHJcbiAgICBsZXQgdHlwZTtcclxuICAgIGlmIChvZmYgPT09IDYpIHtcclxuICAgICAgdHlwZSA9ICdIRFInO1xyXG4gICAgICAvL3coMkIpLGgoMkIpLEdDVEYoMUIpLEJDSSgxQiksUEFSKDFCKSA9PiA3LCAvdyBvZmYgPT4gMTNcclxuICAgICAgbGVuZ3RoID0gNztcclxuICAgICAgY29uc3QgYml0cyA9IGJ5dGVUb0JpdEFycihyZWFkQnl0ZShieXRlcywgb2ZmICsgNCkpO1xyXG4gICAgICBjb25zdCBnY3RFeGlzdHMgPSBiaXRzWzBdO1xyXG4gICAgICBjb25zdCBnY3RTaXplID0gYml0c1RvTnVtKGJpdHMuc3BsaWNlKDUsIDMpKTtcclxuICAgICAgbGVuZ3RoICs9IGdjdEV4aXN0cyA/IE1hdGgucG93KDIsIGdjdFNpemUgKyAxKSAqIDMgOiAwO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgY29tbSA9IHJlYWRTdHJpbmcoYnl0ZXMsIG9mZiwgMSk7XHJcbiAgICAgIHN3aXRjaCAoY29tbSkgeyAvLyBGb3IgZWFzZSBvZiBtYXRjaGluZ1xyXG4gICAgICAgIGNhc2UgJyEnOlxyXG4gICAgICAgICAgY29uc3Qgc3ViID0gcmVhZEJ5dGUoYnl0ZXMsIG9mZiArIDEpO1xyXG4gICAgICAgICAgc3dpdGNoKHJlYWRCeXRlKGJ5dGVzLCBvZmYgKyAxKSkge1xyXG4gICAgICAgICAgICBjYXNlIDB4Zjk6XHJcbiAgICAgICAgICAgICAgdHlwZSA9ICdHQ0UnO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDB4ZmU6XHJcbiAgICAgICAgICAgICAgdHlwZSA9ICdDT00nO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDB4MDE6XHJcbiAgICAgICAgICAgICAgdHlwZSA9ICdQVEUnO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDB4ZmY6XHJcbiAgICAgICAgICAgICAgdHlwZSA9ICdBUFAnO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBibG9jaycpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbGVuZ3RoID0gMjtcclxuICAgICAgICAgIGxlbmd0aCArPSBibG9ja3NMZW5ndGgoYnl0ZXMsIG9mZiArIGxlbmd0aCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICcsJzpcclxuICAgICAgICAgIHR5cGUgPSAnSU1HJztcclxuICAgICAgICAgIC8vU2VwKDFCKSxsKDJCKSx0KDJCKSx3KDJCKSxoKDJCKSxMQ1RGKDFCKSA9PiAxMFxyXG4gICAgICAgICAgbGVuZ3RoID0gMTA7XHJcbiAgICAgICAgICBjb25zdCBiaXRzID0gYnl0ZVRvQml0QXJyKHJlYWRCeXRlKGJ5dGVzLCBvZmYgKyA5KSk7XHJcbiAgICAgICAgICBjb25zdCBsY3RFeGlzdHMgPSBiaXRzWzBdO1xyXG4gICAgICAgICAgY29uc3QgbGN0U2l6ZSA9IGJpdHNUb051bShiaXRzLnNwbGljZSg1LCAzKSk7XHJcbiAgICAgICAgICBsZW5ndGggKz0gKGxjdEV4aXN0cyA/IE1hdGgucG93KDIsIGxjdFNpemUgKyAxKSAqIDMgOiAwKSArIDE7XHJcbiAgICAgICAgICBsZW5ndGggKz0gYmxvY2tzTGVuZ3RoKGJ5dGVzLCBvZmYgKyBsZW5ndGgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnOyc6XHJcbiAgICAgICAgICB0eXBlID0gJ0VPRic7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGJsb2NrICR7Y29tbX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzID0gY2FsbGJhY2sodHlwZSwgYnl0ZXMsIG9mZiwgbGVuZ3RoKTtcclxuICAgIG9mZiArPSBsZW5ndGg7XHJcbiAgfSB3aGlsZSAocmVzICE9PSBmYWxzZSAmJiB0eXBlICE9PSBcIkVPRlwiICYmIG9mZiA8IGJ5dGVzLmxlbmd0aCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2ludH0gb2ZmXHJcbiAqIEByZXR1cm4ge2ludH1cclxuICovXHJcbnZhciByZWFkRFdvcmQgPSBmdW5jdGlvbiAoYnl0ZXMsIG9mZikgeyAvLyBnaWYgcmVhZHksIGZvciBsaXR0bGUgZW5kaWFuXHJcbiAgdmFyIHggPSAwO1xyXG4gIC8vIEZvcmNlIHRoZSBtb3N0LXNpZ25pZmljYW50IGJ5dGUgdG8gdW5zaWduZWQuXHJcbiAgeCArPSAoKGJ5dGVzW29mZiArIDNdIDw8IDI0ICkgPj4+IDApO1xyXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgNDsgaSsrKSB4ICs9ICggKGJ5dGVzW29mZiArIDMgLSBpXSA8PCAoKDMgLSBpKSAqIDgpKSApO1xyXG4gIHJldHVybiB4O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYnl0ZXNcclxuICogQHBhcmFtIHtpbnR9IG9mZlxyXG4gKiBAcmV0dXJuIHtpbnR9XHJcbiAqL1xyXG52YXIgcmVhZFdvcmQgPSBmdW5jdGlvbiAoYnl0ZXMsIG9mZikgeyAvLyBnaWYgcmVhZHksIGZvciBsaXR0bGUgZW5kaWFuXHJcbiAgdmFyIHggPSAwO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMjsgaSsrKSB4ICs9IChieXRlc1tvZmYgKyAxIC0gaV0gPDwgKCgxIC0gaSkgKiA4KSk7XHJcbiAgcmV0dXJuIHg7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2ludH0gb2ZmXHJcbiAqIEByZXR1cm4ge2ludH1cclxuICovXHJcbnZhciByZWFkQnl0ZSA9IGZ1bmN0aW9uIChieXRlcywgb2ZmKSB7IC8vIGdpZiByZWFkeSwgbm8gY3VzdG9taXplXHJcbiAgcmV0dXJuIGJ5dGVzW29mZl07XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2ludH0gc3RhcnRcclxuICogQHBhcmFtIHtpbnR9IGxlbmd0aFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fVxyXG4gKi9cclxudmFyIHN1YkJ1ZmZlciA9IGZ1bmN0aW9uIChieXRlcywgc3RhcnQsIGxlbmd0aCkgeyAvLyBnaWYgcmVhZHksIG5vIGN1c3RvbWl6ZVxyXG4gIHZhciBhID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtcclxuICBhLnNldChieXRlcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW5ndGgpKTtcclxuICByZXR1cm4gYTtcclxufTtcclxuXHJcbnZhciByZWFkU3RyaW5nID0gZnVuY3Rpb24gKGJ5dGVzLCBvZmYsIGxlbmd0aCkgeyAvLyBnaWYgcmVhZHksIG5vIGN1c3RvbWl6ZVxyXG4gIHZhciBjaGFycyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ5dGVzLnN1YmFycmF5KG9mZiwgb2ZmICsgbGVuZ3RoKSk7XHJcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjaGFycyk7XHJcbn07XHJcblxyXG52YXIgbWFrZURXb3JkQXJyYXkgPSBmdW5jdGlvbiAoeCkgeyAvLyBnaWYgcmVhZHksIGZvciBsaXR0bGUgZW5kaWFuXHJcbiAgcmV0dXJuIFt4ICYgMHhmZiwgKHggPj4+IDgpICYgMHhmZiwgKHggPj4+IDE2KSAmIDB4ZmYsICh4ID4+PiAyNCkgJiAweGZmXTtcclxufTtcclxuXHJcbnZhciBtYWtlV29yZEFycmF5ID0gZnVuY3Rpb24gKHgpIHtcclxuICByZXR1cm4gW3ggJiAweGZmLCAoeCA+Pj4gOCkgJiAweGZmXTtcclxufTtcclxuXHJcbnZhciBtYWtlU3RyaW5nQXJyYXkgPSBmdW5jdGlvbiAoeCkgeyAvLyBnaWYgcmVhZHksIG5vIGN1c3RvbWl6ZVxyXG4gIHZhciByZXMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHJlcy5wdXNoKHguY2hhckNvZGVBdChpKSk7XHJcbiAgcmV0dXJuIHJlcztcclxufTtcclxuXHJcbnZhciBiaXRzVG9OdW0gPSBmdW5jdGlvbiAoYmEpIHsgLy8gZ2lmIHJlYWR5LCBubyBjdXN0b21pemVcclxuICByZXR1cm4gYmEucmVkdWNlKGZ1bmN0aW9uIChzLCBuKSB7XHJcbiAgICByZXR1cm4gcyAqIDIgKyBuO1xyXG4gIH0sIDApO1xyXG59O1xyXG5cclxudmFyIGJ5dGVUb0JpdEFyciA9IGZ1bmN0aW9uIChiaXRlKSB7IC8vIGdpZiByZWFkeSwgbm8gY3VzdG9taXplXHJcbiAgdmFyIGEgPSBbXTtcclxuICBmb3IgKHZhciBpID0gNzsgaSA+PSAwOyBpLS0pIHtcclxuICAgIGEucHVzaCggISEgKGJpdGUgJiAoMSA8PCBpKSkpO1xyXG4gIH1cclxuICByZXR1cm4gYTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxyXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFCeXRlc1xyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fVxyXG4gKi9cclxudmFyIG1ha2VDaHVua0J5dGVzID0gZnVuY3Rpb24gKHR5cGUsIGRhdGFCeXRlcykge1xyXG4gIHZhciBjcmNMZW4gPSB0eXBlLmxlbmd0aCArIGRhdGFCeXRlcy5sZW5ndGg7XHJcbiAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobmV3IEFycmF5QnVmZmVyKGNyY0xlbiArIDgpKTtcclxuICBieXRlcy5zZXQobWFrZURXb3JkQXJyYXkoZGF0YUJ5dGVzLmxlbmd0aCksIDApO1xyXG4gIGJ5dGVzLnNldChtYWtlU3RyaW5nQXJyYXkodHlwZSksIDQpO1xyXG4gIGJ5dGVzLnNldChkYXRhQnl0ZXMsIDgpO1xyXG4gIHZhciBjcmMgPSBjcmMzMihieXRlcywgNCwgY3JjTGVuKTtcclxuICBieXRlcy5zZXQobWFrZURXb3JkQXJyYXkoY3JjKSwgY3JjTGVuICsgNCk7XHJcbiAgcmV0dXJuIGJ5dGVzO1xyXG59O1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCBBbmltYXRpb24gPSByZXF1aXJlKCcuL2FuaW1hdGlvbicpO1xyXG5jb25zdCBjcmMzMiA9IHJlcXVpcmUoJy4vY3JjMzInKTtcclxuY29uc3Qgc3VwcG9ydCA9IHJlcXVpcmUoXCIuL3N1cHBvcnQtdGVzdFwiKTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBidWZmZXJcclxuICogQHJldHVybiB7UHJvbWlzZX1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJ1ZmZlcikge1xyXG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcclxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgLy8gZmFzdCBhbmltYXRpb24gdGVzdFxyXG4gICAgbGV0IGlzQW5pbWF0ZWQgPSBmYWxzZTtcclxuICAgIHBhcnNlQ2h1bmtzKGJ5dGVzLCBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICBpZiAodHlwZSA9PT0gXCJhY1RMXCIpIHtcclxuICAgICAgICBpc0FuaW1hdGVkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxuICAgIGlmICghaXNBbmltYXRlZCkge1xyXG4gICAgICByZWplY3QoXCJOb3QgYW4gYW5pbWF0ZWQgUE5HXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RcclxuICAgICAgcHJlRGF0YVBhcnRzID0gW10sXHJcbiAgICAgIHBvc3REYXRhUGFydHMgPSBbXSxcclxuICAgICAgYW5pbSA9IG5ldyBBbmltYXRpb24oKTtcclxuICAgIGxldFxyXG4gICAgICBoZWFkZXJEYXRhQnl0ZXMgPSBudWxsLFxyXG4gICAgICBmcmFtZSA9IG51bGw7XHJcblxyXG4gICAgcGFyc2VDaHVua3MoYnl0ZXMsIGZ1bmN0aW9uICh0eXBlLCBieXRlcywgb2ZmLCBsZW5ndGgpIHtcclxuICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcIklIRFJcIjpcclxuICAgICAgICAgIGhlYWRlckRhdGFCeXRlcyA9IGJ5dGVzLnN1YmFycmF5KG9mZiArIDgsIG9mZiArIDggKyBsZW5ndGgpO1xyXG4gICAgICAgICAgYW5pbS53aWR0aCA9IHJlYWREV29yZChieXRlcywgb2ZmICsgOCk7XHJcbiAgICAgICAgICBhbmltLmhlaWdodCA9IHJlYWREV29yZChieXRlcywgb2ZmICsgMTIpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImFjVExcIjpcclxuICAgICAgICAgIGFuaW0ubnVtUGxheXMgPSByZWFkRFdvcmQoYnl0ZXMsIG9mZiArIDggKyA0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJmY1RMXCI6XHJcbiAgICAgICAgICBpZiAoZnJhbWUpIGFuaW0uZnJhbWVzLnB1c2goZnJhbWUpO1xyXG4gICAgICAgICAgZnJhbWUgPSB7fTtcclxuICAgICAgICAgIGZyYW1lLndpZHRoID0gcmVhZERXb3JkKGJ5dGVzLCBvZmYgKyA4ICsgNCk7XHJcbiAgICAgICAgICBmcmFtZS5oZWlnaHQgPSByZWFkRFdvcmQoYnl0ZXMsIG9mZiArIDggKyA4KTtcclxuICAgICAgICAgIGZyYW1lLmxlZnQgPSByZWFkRFdvcmQoYnl0ZXMsIG9mZiArIDggKyAxMik7XHJcbiAgICAgICAgICBmcmFtZS50b3AgPSByZWFkRFdvcmQoYnl0ZXMsIG9mZiArIDggKyAxNik7XHJcbiAgICAgICAgICB2YXIgZGVsYXlOID0gcmVhZFdvcmQoYnl0ZXMsIG9mZiArIDggKyAyMCk7XHJcbiAgICAgICAgICB2YXIgZGVsYXlEID0gcmVhZFdvcmQoYnl0ZXMsIG9mZiArIDggKyAyMik7XHJcbiAgICAgICAgICBpZiAoZGVsYXlEID09IDApIGRlbGF5RCA9IDEwMDtcclxuICAgICAgICAgIGZyYW1lLmRlbGF5ID0gMTAwMCAqIGRlbGF5TiAvIGRlbGF5RDtcclxuICAgICAgICAgIC8vIHNlZSBodHRwOi8vbXhyLm1vemlsbGEub3JnL21vemlsbGEvc291cmNlL2dmeC9zcmMvc2hhcmVkL2dmeEltYWdlRnJhbWUuY3BwIzM0M1xyXG4gICAgICAgICAgaWYgKGZyYW1lLmRlbGF5IDw9IDEwKSBmcmFtZS5kZWxheSA9IDEwMDtcclxuICAgICAgICAgIGFuaW0ucGxheVRpbWUgKz0gZnJhbWUuZGVsYXk7XHJcbiAgICAgICAgICBmcmFtZS5kaXNwb3NlT3AgPSByZWFkQnl0ZShieXRlcywgb2ZmICsgOCArIDI0KTtcclxuICAgICAgICAgIGZyYW1lLmJsZW5kT3AgPSByZWFkQnl0ZShieXRlcywgb2ZmICsgOCArIDI1KTtcclxuICAgICAgICAgIGZyYW1lLmRhdGFQYXJ0cyA9IFtdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImZkQVRcIjpcclxuICAgICAgICAgIGlmIChmcmFtZSkgZnJhbWUuZGF0YVBhcnRzLnB1c2goYnl0ZXMuc3ViYXJyYXkob2ZmICsgOCArIDQsIG9mZiArIDggKyBsZW5ndGgpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJJREFUXCI6XHJcbiAgICAgICAgICBpZiAoZnJhbWUpIGZyYW1lLmRhdGFQYXJ0cy5wdXNoKGJ5dGVzLnN1YmFycmF5KG9mZiArIDgsIG9mZiArIDggKyBsZW5ndGgpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJJRU5EXCI6XHJcbiAgICAgICAgICBwb3N0RGF0YVBhcnRzLnB1c2goc3ViQnVmZmVyKGJ5dGVzLCBvZmYsIDEyICsgbGVuZ3RoKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcHJlRGF0YVBhcnRzLnB1c2goc3ViQnVmZmVyKGJ5dGVzLCBvZmYsIDEyICsgbGVuZ3RoKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChmcmFtZSkgYW5pbS5mcmFtZXMucHVzaChmcmFtZSk7XHJcblxyXG4gICAgaWYgKGFuaW0uZnJhbWVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHJlamVjdChcIk5vdCBhbiBhbmltYXRlZCBQTkdcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGluZyBpbWFnZXNcclxuICAgIHZhciBjcmVhdGVkSW1hZ2VzID0gMDtcclxuICAgIHZhciBwcmVCbG9iID0gbmV3IEJsb2IocHJlRGF0YVBhcnRzKSwgcG9zdEJsb2IgPSBuZXcgQmxvYihwb3N0RGF0YVBhcnRzKTtcclxuICAgIGZvciAodmFyIGYgPSAwOyBmIDwgYW5pbS5mcmFtZXMubGVuZ3RoOyBmKyspIHtcclxuICAgICAgZnJhbWUgPSBhbmltLmZyYW1lc1tmXTtcclxuXHJcbiAgICAgIHZhciBiYiA9IFtdO1xyXG4gICAgICBiYi5wdXNoKHN1cHBvcnQuUE5HX1NJR05BVFVSRV9CWVRFUyk7XHJcbiAgICAgIGhlYWRlckRhdGFCeXRlcy5zZXQobWFrZURXb3JkQXJyYXkoZnJhbWUud2lkdGgpLCAwKTtcclxuICAgICAgaGVhZGVyRGF0YUJ5dGVzLnNldChtYWtlRFdvcmRBcnJheShmcmFtZS5oZWlnaHQpLCA0KTtcclxuICAgICAgYmIucHVzaChtYWtlQ2h1bmtCeXRlcyhcIklIRFJcIiwgaGVhZGVyRGF0YUJ5dGVzKSk7XHJcbiAgICAgIGJiLnB1c2gocHJlQmxvYik7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZnJhbWUuZGF0YVBhcnRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgYmIucHVzaChtYWtlQ2h1bmtCeXRlcyhcIklEQVRcIiwgZnJhbWUuZGF0YVBhcnRzW2pdKSk7XHJcbiAgICAgIH1cclxuICAgICAgYmIucHVzaChwb3N0QmxvYik7XHJcbiAgICAgIHZhciB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKGJiLCB7XCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCJ9KSk7XHJcbiAgICAgIGRlbGV0ZSBmcmFtZS5kYXRhUGFydHM7XHJcbiAgICAgIGJiID0gbnVsbDtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBVc2luZyBcImNyZWF0ZUVsZW1lbnRcIiBpbnN0ZWFkIG9mIFwibmV3IEltYWdlXCIgYmVjYXVzZSBvZiBidWcgaW4gQ2hyb21lIDI3XHJcbiAgICAgICAqIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yMzgwNzFcclxuICAgICAgICogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjM3NzM3NS91c2luZy1jYW52YXMtZHJhd2ltYWdlLWluLWNocm9tZS1leHRlbnNpb24tY29udGVudC1zY3JpcHQvMTYzNzgyNzBcclxuICAgICAgICovXHJcbiAgICAgIGZyYW1lLmltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICBmcmFtZS5pbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5zcmMpO1xyXG4gICAgICAgIGNyZWF0ZWRJbWFnZXMrKztcclxuICAgICAgICBpZiAoY3JlYXRlZEltYWdlcyA9PT0gYW5pbS5mcmFtZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICByZXNvbHZlKGFuaW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgZnJhbWUuaW1nLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmVqZWN0KFwiSW1hZ2UgY3JlYXRpb24gZXJyb3JcIik7XHJcbiAgICAgIH07XHJcbiAgICAgIGZyYW1lLmltZy5zcmMgPSB1cmw7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZywgVWludDhBcnJheSwgaW50LCBpbnQpfSBjYWxsYmFja1xyXG4gKi9cclxudmFyIHBhcnNlQ2h1bmtzID0gZnVuY3Rpb24gKGJ5dGVzLCBjYWxsYmFjaykge1xyXG4gIHZhciBvZmYgPSA4O1xyXG4gIGRvIHtcclxuICAgIHZhciBsZW5ndGggPSByZWFkRFdvcmQoYnl0ZXMsIG9mZik7XHJcbiAgICB2YXIgdHlwZSA9IHJlYWRTdHJpbmcoYnl0ZXMsIG9mZiArIDQsIDQpO1xyXG4gICAgdmFyIHJlcyA9IGNhbGxiYWNrKHR5cGUsIGJ5dGVzLCBvZmYsIGxlbmd0aCk7XHJcbiAgICBvZmYgKz0gMTIgKyBsZW5ndGg7XHJcbiAgfSB3aGlsZSAocmVzICE9PSBmYWxzZSAmJiB0eXBlICE9IFwiSUVORFwiICYmIG9mZiA8IGJ5dGVzLmxlbmd0aCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2ludH0gb2ZmXHJcbiAqIEByZXR1cm4ge2ludH1cclxuICovXHJcbnZhciByZWFkRFdvcmQgPSBmdW5jdGlvbiAoYnl0ZXMsIG9mZikge1xyXG4gIHZhciB4ID0gMDtcclxuICAvLyBGb3JjZSB0aGUgbW9zdC1zaWduaWZpY2FudCBieXRlIHRvIHVuc2lnbmVkLlxyXG4gIHggKz0gKChieXRlc1swICsgb2ZmXSA8PCAyNCApID4+PiAwKTtcclxuICBmb3IgKHZhciBpID0gMTsgaSA8IDQ7IGkrKykgeCArPSAoIChieXRlc1tpICsgb2ZmXSA8PCAoKDMgLSBpKSAqIDgpKSApO1xyXG4gIHJldHVybiB4O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYnl0ZXNcclxuICogQHBhcmFtIHtpbnR9IG9mZlxyXG4gKiBAcmV0dXJuIHtpbnR9XHJcbiAqL1xyXG52YXIgcmVhZFdvcmQgPSBmdW5jdGlvbiAoYnl0ZXMsIG9mZikge1xyXG4gIHZhciB4ID0gMDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IDI7IGkrKykgeCArPSAoYnl0ZXNbaSArIG9mZl0gPDwgKCgxIC0gaSkgKiA4KSk7XHJcbiAgcmV0dXJuIHg7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2ludH0gb2ZmXHJcbiAqIEByZXR1cm4ge2ludH1cclxuICovXHJcbnZhciByZWFkQnl0ZSA9IGZ1bmN0aW9uIChieXRlcywgb2ZmKSB7XHJcbiAgcmV0dXJuIGJ5dGVzW29mZl07XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2ludH0gc3RhcnRcclxuICogQHBhcmFtIHtpbnR9IGxlbmd0aFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fVxyXG4gKi9cclxudmFyIHN1YkJ1ZmZlciA9IGZ1bmN0aW9uIChieXRlcywgc3RhcnQsIGxlbmd0aCkge1xyXG4gIHZhciBhID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtcclxuICBhLnNldChieXRlcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW5ndGgpKTtcclxuICByZXR1cm4gYTtcclxufTtcclxuXHJcbnZhciByZWFkU3RyaW5nID0gZnVuY3Rpb24gKGJ5dGVzLCBvZmYsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFycyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ5dGVzLnN1YmFycmF5KG9mZiwgb2ZmICsgbGVuZ3RoKSk7XHJcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjaGFycyk7XHJcbn07XHJcblxyXG52YXIgbWFrZURXb3JkQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xyXG4gIHJldHVybiBbKHggPj4+IDI0KSAmIDB4ZmYsICh4ID4+PiAxNikgJiAweGZmLCAoeCA+Pj4gOCkgJiAweGZmLCB4ICYgMHhmZl07XHJcbn07XHJcbnZhciBtYWtlU3RyaW5nQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xyXG4gIHZhciByZXMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHJlcy5wdXNoKHguY2hhckNvZGVBdChpKSk7XHJcbiAgcmV0dXJuIHJlcztcclxufTtcclxuLyoqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXHJcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YUJ5dGVzXHJcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9XHJcbiAqL1xyXG52YXIgbWFrZUNodW5rQnl0ZXMgPSBmdW5jdGlvbiAodHlwZSwgZGF0YUJ5dGVzKSB7XHJcbiAgdmFyIGNyY0xlbiA9IHR5cGUubGVuZ3RoICsgZGF0YUJ5dGVzLmxlbmd0aDtcclxuICB2YXIgYnl0ZXMgPSBuZXcgVWludDhBcnJheShuZXcgQXJyYXlCdWZmZXIoY3JjTGVuICsgOCkpO1xyXG4gIGJ5dGVzLnNldChtYWtlRFdvcmRBcnJheShkYXRhQnl0ZXMubGVuZ3RoKSwgMCk7XHJcbiAgYnl0ZXMuc2V0KG1ha2VTdHJpbmdBcnJheSh0eXBlKSwgNCk7XHJcbiAgYnl0ZXMuc2V0KGRhdGFCeXRlcywgOCk7XHJcbiAgdmFyIGNyYyA9IGNyYzMyKGJ5dGVzLCA0LCBjcmNMZW4pO1xyXG4gIGJ5dGVzLnNldChtYWtlRFdvcmRBcnJheShjcmMpLCBjcmNMZW4gKyA0KTtcclxuICByZXR1cm4gYnl0ZXM7XHJcbn07XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBbmltYXRpb24gPSByZXF1aXJlKCcuL2FuaW1hdGlvbicpO1xyXG52YXIgY3JjMzIgPSByZXF1aXJlKCcuL2NyYzMyJyk7XHJcbmNvbnN0IHN1cHBvcnQgPSByZXF1aXJlKFwiLi9zdXBwb3J0LXRlc3RcIik7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYnVmZmVyXHJcbiAqIEByZXR1cm4ge1Byb21pc2V9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChidWZmZXIpIHtcclxuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIC8vIGZhc3QgYW5pbWF0aW9uIHRlc3RcclxuICAgIGxldCBpc0FuaW1hdGVkID0gZmFsc2U7XHJcbiAgICBwYXJzZUNodW5rcyhieXRlcywgZnVuY3Rpb24gKHR5cGUsIGJ5dGVzLCBvZmYsIGxlbmd0aCkge1xyXG4gICAgICBpZiAodHlwZSA9PT0gXCJBTklNXCIpIHtcclxuICAgICAgICBpc0FuaW1hdGVkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxuICAgIGlmICghaXNBbmltYXRlZCkge1xyXG4gICAgICByZWplY3QoXCJOb3QgYW4gYW5pbWF0ZWQgV2ViUFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFuaW0gPSBuZXcgQW5pbWF0aW9uKCk7XHJcbiAgICBsZXRcclxuICAgICAgaGVhZGVyRGF0YUJ5dGVzID0gbnVsbCxcclxuICAgICAgZnJhbWUgPSBudWxsO1xyXG5cclxuICAgIHBhcnNlQ2h1bmtzKGJ5dGVzLCBmdW5jdGlvbiAodHlwZSwgYnl0ZXMsIG9mZiwgbGVuZ3RoKSB7XHJcbiAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgXCJWUDhYXCI6XHJcbiAgICAgICAgICBoZWFkZXJEYXRhQnl0ZXMgPSBieXRlcy5zdWJhcnJheShvZmYsIG9mZiArIGxlbmd0aCk7XHJcbiAgICAgICAgICBhbmltLndpZHRoID0gcmVhZDNCeXRlcyhieXRlcywgb2ZmICsgOCArIDQpICsgMTtcclxuICAgICAgICAgIGFuaW0uaGVpZ2h0ID0gcmVhZDNCeXRlcyhieXRlcywgb2ZmICsgOCArIDQgKyAzKSArIDE7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiQU5JTVwiOlxyXG4gICAgICAgICAgYW5pbS5udW1QbGF5cyA9IHJlYWRXb3JkKGJ5dGVzLCBvZmYgKyA4ICsgNCk7XHJcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGBCR0NvbG9yOiAke3JlYWREV29yZChieXRlcywgb2ZmICsgOCl9YCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiQU5NRlwiOlxyXG4gICAgICAgICAgaWYgKGZyYW1lKSBhbmltLmZyYW1lcy5wdXNoKGZyYW1lKTtcclxuICAgICAgICAgIGZyYW1lID0ge307XHJcbiAgICAgICAgICBmcmFtZS5kZWxheSA9IHJlYWQzQnl0ZXMoYnl0ZXMsIG9mZiArIDggKyAxMik7XHJcbiAgICAgICAgICBpZiAoZnJhbWUuZGVsYXkgPD0gMTApIGZyYW1lLmRlbGF5ID0gMTAwO1xyXG4gICAgICAgICAgYW5pbS5wbGF5VGltZSArPSBmcmFtZS5kZWxheTtcclxuICAgICAgICAgIGZyYW1lLndpZHRoID0gcmVhZDNCeXRlcyhieXRlcywgb2ZmICsgOCArIDYpICsgMTtcclxuICAgICAgICAgIGZyYW1lLmhlaWdodCA9IHJlYWQzQnl0ZXMoYnl0ZXMsIG9mZiArIDggKyA5KSArIDE7XHJcbiAgICAgICAgICBmcmFtZS5sZWZ0ID0gcmVhZDNCeXRlcyhieXRlcywgb2ZmICsgOCkgKiAyO1xyXG4gICAgICAgICAgZnJhbWUudG9wID0gcmVhZDNCeXRlcyhieXRlcywgb2ZmICsgOCArIDMpICogMjtcclxuICAgICAgICAgIGNvbnN0IGJpdHMgPSBieXRlVG9CaXRBcnIocmVhZEJ5dGUoYnl0ZXMsIG9mZiArIDggKyAxNSkpO1xyXG4gICAgICAgICAgZnJhbWUuZGlzcG9zZU9wID0gYml0c1s3XSA/IDEgOiAwO1xyXG4gICAgICAgICAgZnJhbWUuYmxlbmRPcCA9IGJpdHNbNl0gPyAwIDogMTtcclxuICAgICAgICAgIGZyYW1lLmRhdGEgPSBzdWJCdWZmZXIoYnl0ZXMsIG9mZiArIDggKyAxNiwgbGVuZ3RoIC0gOCAtIDE2KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgaWYgKGZyYW1lKSBhbmltLmZyYW1lcy5wdXNoKGZyYW1lKTtcclxuXHJcbiAgICBpZiAoYW5pbS5mcmFtZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJlamVjdChcIk5vdCBhbiBhbmltYXRlZCBXZWJQXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRpbmcgaW1hZ2VzXHJcbiAgICBsZXQgY3JlYXRlZEltYWdlcyA9IDA7XHJcbiAgICBmb3IgKHZhciBmID0gMDsgZiA8IGFuaW0uZnJhbWVzLmxlbmd0aDsgZisrKSB7XHJcbiAgICAgIGZyYW1lID0gYW5pbS5mcmFtZXNbZl07XHJcblxyXG4gICAgICB2YXIgYmIgPSBbXTtcclxuICAgICAgY29uc3QgbGVuZ3RoID0gbWFrZURXb3JkQXJyYXkoNCArIGhlYWRlckRhdGFCeXRlcy5ieXRlTGVuZ3RoICsgZnJhbWUuZGF0YS5ieXRlTGVuZ3RoKTtcclxuICAgICAgY29uc3QgaGVhZGVyQXJyYXkgPSBzdXBwb3J0LldFQlBfQ0hFQ0tfQllURVMubWFwKChiaXRlLCBpKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGkgPiAzICYmIGkgPCA4ID8gbGVuZ3RoW2kgLSA0XSA6IHN1cHBvcnQuV0VCUF9DSEVDS19CWVRFU1tpXTtcclxuICAgICAgfSk7XHJcbiAgICAgIGJiLnB1c2goaGVhZGVyQXJyYXkpO1xyXG4gICAgICBjb25zdCBiaXRzID0gYnl0ZVRvQml0QXJyKHJlYWRCeXRlKGhlYWRlckRhdGFCeXRlcywgOCkpO1xyXG4gICAgICBiaXRzWzRdID0gZmFsc2U7IC8vIEVYSUYgbWV0YWRhdGEgKEUpOiAxIGJpdFxyXG4gICAgICBiaXRzWzVdID0gZmFsc2U7IC8vIFhNUCBtZXRhZGF0YSAoWCk6IDEgYml0XHJcbiAgICAgIGJpdHNbNl0gPSBmYWxzZTsgLy8gQW5pbWF0aW9uIChBKTogMSBiaXRcclxuICAgICAgaGVhZGVyRGF0YUJ5dGVzLnNldChbYml0c1RvTnVtKGJpdHMpXSwgOCk7XHJcbiAgICAgIGhlYWRlckRhdGFCeXRlcy5zZXQobWFrZTNCeXRlc0FycmF5KGZyYW1lLndpZHRoIC0gMSksIDggKyA0KTtcclxuICAgICAgaGVhZGVyRGF0YUJ5dGVzLnNldChtYWtlM0J5dGVzQXJyYXkoZnJhbWUuaGVpZ2h0IC0gMSksIDggKyA0ICsgMyk7XHJcbiAgICAgIGJiLnB1c2goaGVhZGVyRGF0YUJ5dGVzKTtcclxuICAgICAgYmIucHVzaChmcmFtZS5kYXRhKTtcclxuICAgICAgdmFyIHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoYmIsIHtcInR5cGVcIjogXCJpbWFnZS93ZWJwXCJ9KSk7XHJcbiAgICAgIGRlbGV0ZSBmcmFtZS5kYXRhO1xyXG4gICAgICBiYiA9IG51bGw7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVXNpbmcgXCJjcmVhdGVFbGVtZW50XCIgaW5zdGVhZCBvZiBcIm5ldyBJbWFnZVwiIGJlY2F1c2Ugb2YgYnVnIGluIENocm9tZSAyN1xyXG4gICAgICAgKiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjM4MDcxXHJcbiAgICAgICAqIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYzNzczNzUvdXNpbmctY2FudmFzLWRyYXdpbWFnZS1pbi1jaHJvbWUtZXh0ZW5zaW9uLWNvbnRlbnQtc2NyaXB0LzE2Mzc4MjcwXHJcbiAgICAgICAqL1xyXG4gICAgICBmcmFtZS5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgZnJhbWUuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRoaXMuc3JjKTtcclxuICAgICAgICBjcmVhdGVkSW1hZ2VzKys7XHJcbiAgICAgICAgaWYgKGNyZWF0ZWRJbWFnZXMgPT09IGFuaW0uZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcmVzb2x2ZShhbmltKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGZyYW1lLmltZy5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlamVjdChcIkltYWdlIGNyZWF0aW9uIGVycm9yXCIpO1xyXG4gICAgICB9O1xyXG4gICAgICBmcmFtZS5pbWcuc3JjID0gdXJsO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYnl0ZXNcclxuICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcsIFVpbnQ4QXJyYXksIGludCwgaW50KX0gY2FsbGJhY2tcclxuICovXHJcbnZhciBwYXJzZUNodW5rcyA9IGZ1bmN0aW9uIChieXRlcywgY2FsbGJhY2ssIG9mZiwgbGltaXQpIHtcclxuICBpZiAoIW9mZikgb2ZmID0gMTI7XHJcbiAgY29uc3QgbGltaXRPZmYgPSBsaW1pdCA/IGxpbWl0ICsgb2ZmIDogYnl0ZXMubGVuZ3RoO1xyXG4gIGxldCByZXMsIGxlbmd0aCwgdHlwZTtcclxuICBkbyB7XHJcbiAgICBjb25zdCB0eXBlID0gcmVhZFN0cmluZyhieXRlcywgb2ZmLCA0KTtcclxuICAgIGxldCBsZW5ndGggPSByZWFkRFdvcmQoYnl0ZXMsIG9mZiArIDQpO1xyXG4gICAgaWYgKGxlbmd0aCAlIDIpIGxlbmd0aCsrO1xyXG4gICAgcmVzID0gY2FsbGJhY2sodHlwZSwgYnl0ZXMsIG9mZiwgbGVuZ3RoICsgOCk7XHJcbiAgICBvZmYgKz0gbGVuZ3RoICsgODtcclxuICB9IHdoaWxlIChyZXMgIT09IGZhbHNlICYmIG9mZiA8IGxpbWl0T2ZmKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGJ5dGVzXHJcbiAqIEBwYXJhbSB7aW50fSBvZmZcclxuICogQHJldHVybiB7aW50fVxyXG4gKi9cclxudmFyIHJlYWREV29yZCA9IGZ1bmN0aW9uIChieXRlcywgb2ZmKSB7IC8vIGdpZiByZWFkeSwgZm9yIGxpdHRsZSBlbmRpYW5cclxuICB2YXIgeCA9IDA7XHJcbiAgLy8gRm9yY2UgdGhlIG1vc3Qtc2lnbmlmaWNhbnQgYnl0ZSB0byB1bnNpZ25lZC5cclxuICB4ICs9ICgoYnl0ZXNbb2ZmICsgM10gPDwgMjQgKSA+Pj4gMCk7XHJcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCA0OyBpKyspIHggKz0gKCAoYnl0ZXNbb2ZmICsgMyAtIGldIDw8ICgoMyAtIGkpICogOCkpICk7XHJcbiAgcmV0dXJuIHg7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xyXG4gKiBAcGFyYW0ge2ludH0gb2ZmXHJcbiAqIEByZXR1cm4ge2ludH1cclxuICovXHJcbnZhciByZWFkV29yZCA9IGZ1bmN0aW9uIChieXRlcywgb2ZmKSB7IC8vIGdpZiByZWFkeSwgZm9yIGxpdHRsZSBlbmRpYW5cclxuICB2YXIgeCA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOyBpKyspIHggKz0gKGJ5dGVzW29mZiArIDEgLSBpXSA8PCAoKDEgLSBpKSAqIDgpKTtcclxuICByZXR1cm4geDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGJ5dGVzXHJcbiAqIEBwYXJhbSB7aW50fSBvZmZcclxuICogQHJldHVybiB7aW50fVxyXG4gKi9cclxudmFyIHJlYWQzQnl0ZXMgPSBmdW5jdGlvbiAoYnl0ZXMsIG9mZikgeyAvLyBnaWYgcmVhZHksIGZvciBsaXR0bGUgZW5kaWFuXHJcbiAgdmFyIHggPSAwO1xyXG4gIC8vIEZvcmNlIHRoZSBtb3N0LXNpZ25pZmljYW50IGJ5dGUgdG8gdW5zaWduZWQuXHJcbiAgeCArPSAoKGJ5dGVzW29mZiArIDJdIDw8IDE2ICkgPj4+IDApO1xyXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgMzsgaSsrKSB4ICs9ICggKGJ5dGVzW29mZiArIDIgLSBpXSA8PCAoKDIgLSBpKSAqIDgpKSApO1xyXG4gIHJldHVybiB4O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYnl0ZXNcclxuICogQHBhcmFtIHtpbnR9IG9mZlxyXG4gKiBAcmV0dXJuIHtpbnR9XHJcbiAqL1xyXG52YXIgcmVhZEJ5dGUgPSBmdW5jdGlvbiAoYnl0ZXMsIG9mZikgeyAvLyBnaWYgcmVhZHksIG5vIGN1c3RvbWl6ZVxyXG4gIHJldHVybiBieXRlc1tvZmZdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYnl0ZXNcclxuICogQHBhcmFtIHtpbnR9IHN0YXJ0XHJcbiAqIEBwYXJhbSB7aW50fSBsZW5ndGhcclxuICogQHJldHVybiB7VWludDhBcnJheX1cclxuICovXHJcbnZhciBzdWJCdWZmZXIgPSBmdW5jdGlvbiAoYnl0ZXMsIHN0YXJ0LCBsZW5ndGgpIHsgLy8gZ2lmIHJlYWR5LCBubyBjdXN0b21pemVcclxuICB2YXIgYSA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XHJcbiAgYS5zZXQoYnl0ZXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuZ3RoKSk7XHJcbiAgcmV0dXJuIGE7XHJcbn07XHJcblxyXG52YXIgcmVhZFN0cmluZyA9IGZ1bmN0aW9uIChieXRlcywgb2ZmLCBsZW5ndGgpIHsgLy8gZ2lmIHJlYWR5LCBubyBjdXN0b21pemVcclxuICB2YXIgY2hhcnMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChieXRlcy5zdWJhcnJheShvZmYsIG9mZiArIGxlbmd0aCkpO1xyXG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY2hhcnMpO1xyXG59O1xyXG5cclxudmFyIG1ha2VEV29yZEFycmF5ID0gZnVuY3Rpb24gKHgpIHsgLy8gZ2lmIHJlYWR5LCBmb3IgbGl0dGxlIGVuZGlhblxyXG4gIHJldHVybiBbeCAmIDB4ZmYsICh4ID4+PiA4KSAmIDB4ZmYsICh4ID4+PiAxNikgJiAweGZmLCAoeCA+Pj4gMjQpICYgMHhmZl07XHJcbn07XHJcblxyXG52YXIgbWFrZVdvcmRBcnJheSA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgcmV0dXJuIFt4ICYgMHhmZiwgKHggPj4+IDgpICYgMHhmZl07XHJcbn07XHJcblxyXG52YXIgbWFrZTNCeXRlc0FycmF5ID0gZnVuY3Rpb24gKHgpIHsgLy8gZ2lmIHJlYWR5LCBmb3IgbGl0dGxlIGVuZGlhblxyXG4gIHJldHVybiBbeCAmIDB4ZmYsICh4ID4+PiA4KSAmIDB4ZmYsICh4ID4+PiAxNikgJiAweGZmXTtcclxufTtcclxuXHJcbnZhciBtYWtlU3RyaW5nQXJyYXkgPSBmdW5jdGlvbiAoeCkgeyAvLyBnaWYgcmVhZHksIG5vIGN1c3RvbWl6ZVxyXG4gIHZhciByZXMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHJlcy5wdXNoKHguY2hhckNvZGVBdChpKSk7XHJcbiAgcmV0dXJuIHJlcztcclxufTtcclxuXHJcbnZhciBiaXRzVG9OdW0gPSBmdW5jdGlvbiAoYmEpIHsgLy8gZ2lmIHJlYWR5LCBubyBjdXN0b21pemVcclxuICByZXR1cm4gYmEucmVkdWNlKGZ1bmN0aW9uIChzLCBuKSB7XHJcbiAgICByZXR1cm4gcyAqIDIgKyBuO1xyXG4gIH0sIDApO1xyXG59O1xyXG5cclxudmFyIGJ5dGVUb0JpdEFyciA9IGZ1bmN0aW9uIChiaXRlKSB7IC8vIGdpZiByZWFkeSwgbm8gY3VzdG9taXplXHJcbiAgdmFyIGEgPSBbXTtcclxuICBmb3IgKHZhciBpID0gNzsgaSA+PSAwOyBpLS0pIHtcclxuICAgIGEucHVzaCggISEgKGJpdGUgJiAoMSA8PCBpKSkpO1xyXG4gIH1cclxuICByZXR1cm4gYTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxyXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFCeXRlc1xyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fVxyXG4gKi9cclxudmFyIG1ha2VDaHVua0J5dGVzID0gZnVuY3Rpb24gKHR5cGUsIGRhdGFCeXRlcykge1xyXG4gIHZhciBjcmNMZW4gPSB0eXBlLmxlbmd0aCArIGRhdGFCeXRlcy5sZW5ndGg7XHJcbiAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobmV3IEFycmF5QnVmZmVyKGNyY0xlbiArIDgpKTtcclxuICBieXRlcy5zZXQobWFrZURXb3JkQXJyYXkoZGF0YUJ5dGVzLmxlbmd0aCksIDApO1xyXG4gIGJ5dGVzLnNldChtYWtlU3RyaW5nQXJyYXkodHlwZSksIDQpO1xyXG4gIGJ5dGVzLnNldChkYXRhQnl0ZXMsIDgpO1xyXG4gIHZhciBjcmMgPSBjcmMzMihieXRlcywgNCwgY3JjTGVuKTtcclxuICBieXRlcy5zZXQobWFrZURXb3JkQXJyYXkoY3JjKSwgY3JjTGVuICsgNCk7XHJcbiAgcmV0dXJuIGJ5dGVzO1xyXG59O1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUHJvbWlzZSA9IFByb21pc2UgfHwgcmVxdWlyZSgnZXM2LXByb21pc2UnKS5Qcm9taXNlO1xyXG5cclxuLy8gXCJcXHg4OVBOR1xceDBkXFx4MGFcXHgxYVxceDBhXCJcclxuY29uc3QgUE5HX1NJR05BVFVSRV9CWVRFUyA9IG5ldyBVaW50OEFycmF5KFsweDg5LCAweDUwLCAweDRlLCAweDQ3LCAweDBkLCAweDBhLCAweDFhLCAweDBhXSk7XHJcbmNvbnN0IEdJRjg3X1NJR05BVFVSRV9CWVRFUyA9IG5ldyBVaW50OEFycmF5KFsweDQ3LCAweDQ5LCAweDQ2LCAweDM4LCAweDM3LCAweDYxXSk7XHJcbmNvbnN0IEdJRjg5X1NJR05BVFVSRV9CWVRFUyA9IG5ldyBVaW50OEFycmF5KFsweDQ3LCAweDQ5LCAweDQ2LCAweDM4LCAweDM5LCAweDYxXSk7XHJcbmNvbnN0IFdFQlBfQ0hFQ0tfQllURVMgPSBuZXcgVWludDhBcnJheShbMHg1MiwgMHg0OSwgMHg0NiwgMHg0NiwgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgMHg1NywgMHg0NSwgMHg0MiwgMHg1MF0pO1xyXG5cclxudmFyIG9uY2VQcm9taXNlID0gZnVuY3Rpb24gKGZvbykge1xyXG4gIHZhciBwcm9taXNlID0gbnVsbDtcclxuICByZXR1cm4gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICBpZiAoIXByb21pc2UpIHByb21pc2UgPSBuZXcgUHJvbWlzZShmb28pO1xyXG4gICAgaWYgKGNhbGxiYWNrKSBwcm9taXNlLnRoZW4oY2FsbGJhY2spO1xyXG4gICAgcmV0dXJuIHByb21pc2U7XHJcbiAgfTtcclxufTtcclxuXHJcbnZhciBjaGVja05hdGl2ZUZlYXR1cmVzID0gb25jZVByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgVHlwZWRBcnJheXM6IChcIkFycmF5QnVmZmVyXCIgaW4gZ2xvYmFsKSxcclxuICAgIEJsb2JVUkxzOiAoXCJVUkxcIiBpbiBnbG9iYWwpLFxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAoXCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIiBpbiBnbG9iYWwpLFxyXG4gICAgcGFnZVByb3RvY29sOiAobG9jYXRpb24ucHJvdG9jb2wgPT0gXCJodHRwOlwiIHx8IGxvY2F0aW9uLnByb3RvY29sID09IFwiaHR0cHM6XCIpLFxyXG4gICAgY2FudmFzOiAoXCJnZXRDb250ZXh0XCIgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSksXHJcbiAgICBBUE5HOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIGlmIChyZXN1bHQuY2FudmFzKSB7XHJcbiAgICAvLyBzZWUgaHR0cDovL2VsaWdyZXkuY29tL2Jsb2cvcG9zdC9hcG5nLWZlYXR1cmUtZGV0ZWN0aW9uXHJcbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xyXG4gICAgICByZXN1bHQuQVBORyA9IChjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIDEsIDEpLmRhdGFbM10gPT09IDApO1xyXG4gICAgICByZXNvbHZlKHJlc3VsdCk7XHJcbiAgICB9O1xyXG4gICAgLy8gZnJhbWUgMSAoc2tpcHBlZCBvbiBhcG5nLXN1cHBvcnRpbmcgYnJvd3NlcnMpOiBbMCwgMCwgMCwgMjU1XVxyXG4gICAgLy8gZnJhbWUgMjogWzAsIDAsIDAsIDBdXHJcbiAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQ0dGalZcIiArXHJcbiAgICBcIkV3QUFBQUJBQUFBQWNNcTJUWUFBQUFOU1VSQlZBaVpZMkJnWVBnUEFBRUVBUUI5c3NqZkFBQUFHbVpqVkV3QUFBQUFBQUFBQVFBQUFBRUFBQVwiICtcclxuICAgIFwiQUFBQUFBQUFENkErZ0JBYk5VKzJzQUFBQVJabVJCVkFBQUFBRUltV05nWUdCZ0FBQUFCUUFCNk16RmRnQUFBQUJKUlU1RXJrSmdnZz09XCI7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJlc29sdmUocmVzdWx0KTtcclxuICB9XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lnbm9yZU5hdGl2ZUFQTkddXHJcbiAqIEByZXR1cm4ge1Byb21pc2V9XHJcbiAqL1xyXG52YXIgaWZOZWVkZWQgPSBmdW5jdGlvbiAoaWdub3JlTmF0aXZlQVBORykge1xyXG4gIGlmICh0eXBlb2YgaWdub3JlTmF0aXZlQVBORyA9PSAndW5kZWZpbmVkJykgaWdub3JlTmF0aXZlQVBORyA9IGZhbHNlO1xyXG4gIHJldHVybiBjaGVja05hdGl2ZUZlYXR1cmVzKCkudGhlbihmdW5jdGlvbiAoZmVhdHVyZXMpIHtcclxuICAgIGlmIChmZWF0dXJlcy5BUE5HICYmICFpZ25vcmVOYXRpdmVBUE5HKSB7XHJcbiAgICAgIHJlamVjdCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIG9rID0gdHJ1ZTtcclxuICAgICAgZm9yICh2YXIgayBpbiBmZWF0dXJlcykgaWYgKGZlYXR1cmVzLmhhc093blByb3BlcnR5KGspICYmIGsgIT0gJ0FQTkcnKSB7XHJcbiAgICAgICAgb2sgPSBvayAmJiBmZWF0dXJlc1trXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gcG5nQ2hlY2soYnVmZmVyKSB7XHJcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgUE5HX1NJR05BVFVSRV9CWVRFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKFBOR19TSUdOQVRVUkVfQllURVNbaV0gIT09IGJ5dGVzW2ldKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdpZkNoZWNrKGJ1ZmZlcikge1xyXG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IEdJRjg3X1NJR05BVFVSRV9CWVRFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKEdJRjg3X1NJR05BVFVSRV9CWVRFU1tpXSAhPT0gYnl0ZXNbaV0gJiYgR0lGODlfU0lHTkFUVVJFX0JZVEVTW2ldICE9PSBieXRlc1tpXSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB3ZWJwQ2hlY2soYnVmZmVyKSB7XHJcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgV0VCUF9DSEVDS19CWVRFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKFdFQlBfQ0hFQ0tfQllURVNbaV0gIT09IGJ5dGVzW2ldICYmIFdFQlBfQ0hFQ0tfQllURVNbaV0gIT09IDB4MDApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgY2hlY2tOYXRpdmVGZWF0dXJlcyxcclxuICBpZk5lZWRlZCxcclxuICBwbmdDaGVjayxcclxuICBnaWZDaGVjayxcclxuICB3ZWJwQ2hlY2ssXHJcbiAgUE5HX1NJR05BVFVSRV9CWVRFUyxcclxuICBHSUY4N19TSUdOQVRVUkVfQllURVMsXHJcbiAgR0lGODlfU0lHTkFUVVJFX0JZVEVTLFxyXG4gIFdFQlBfQ0hFQ0tfQllURVNcclxufTtcclxuIiwiLyohXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3N0ZWZhbnBlbm5lci9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICB2NC4yLjgrMWU2OGRjZTZcbiAqL1xuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwuRVM2UHJvbWlzZSA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHg7XG4gIHJldHVybiB4ICE9PSBudWxsICYmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuXG5cbnZhciBfaXNBcnJheSA9IHZvaWQgMDtcbmlmIChBcnJheS5pc0FycmF5KSB7XG4gIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbn0gZWxzZSB7XG4gIF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xufVxuXG52YXIgaXNBcnJheSA9IF9pc0FycmF5O1xuXG52YXIgbGVuID0gMDtcbnZhciB2ZXJ0eE5leHQgPSB2b2lkIDA7XG52YXIgY3VzdG9tU2NoZWR1bGVyRm4gPSB2b2lkIDA7XG5cbnZhciBhc2FwID0gZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gIHF1ZXVlW2xlbl0gPSBjYWxsYmFjaztcbiAgcXVldWVbbGVuICsgMV0gPSBhcmc7XG4gIGxlbiArPSAyO1xuICBpZiAobGVuID09PSAyKSB7XG4gICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgLy8gd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhpcyBmbHVzaCB0aGF0IHdlIGFyZSBzY2hlZHVsaW5nLlxuICAgIGlmIChjdXN0b21TY2hlZHVsZXJGbikge1xuICAgICAgY3VzdG9tU2NoZWR1bGVyRm4oZmx1c2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzY2hlZHVsZUZsdXNoKCk7XG4gICAgfVxuICB9XG59O1xuXG5mdW5jdGlvbiBzZXRTY2hlZHVsZXIoc2NoZWR1bGVGbikge1xuICBjdXN0b21TY2hlZHVsZXJGbiA9IHNjaGVkdWxlRm47XG59XG5cbmZ1bmN0aW9uIHNldEFzYXAoYXNhcEZuKSB7XG4gIGFzYXAgPSBhc2FwRm47XG59XG5cbnZhciBicm93c2VyV2luZG93ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB1bmRlZmluZWQ7XG52YXIgYnJvd3Nlckdsb2JhbCA9IGJyb3dzZXJXaW5kb3cgfHwge307XG52YXIgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSBicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xudmFyIGlzTm9kZSA9IHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nO1xuXG4vLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxudmFyIGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcblxuLy8gbm9kZVxuZnVuY3Rpb24gdXNlTmV4dFRpY2soKSB7XG4gIC8vIG5vZGUgdmVyc2lvbiAwLjEwLnggZGlzcGxheXMgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHdoZW4gbmV4dFRpY2sgaXMgdXNlZCByZWN1cnNpdmVseVxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2N1am9qcy93aGVuL2lzc3Vlcy80MTAgZm9yIGRldGFpbHNcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gIH07XG59XG5cbi8vIHZlcnR4XG5mdW5jdGlvbiB1c2VWZXJ0eFRpbWVyKCkge1xuICBpZiAodHlwZW9mIHZlcnR4TmV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmVydHhOZXh0KGZsdXNoKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHVzZVNldFRpbWVvdXQoKTtcbn1cblxuZnVuY3Rpb24gdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICB2YXIgb2JzZXJ2ZXIgPSBuZXcgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIoZmx1c2gpO1xuICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBub2RlLmRhdGEgPSBpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMjtcbiAgfTtcbn1cblxuLy8gd2ViIHdvcmtlclxuZnVuY3Rpb24gdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZmx1c2g7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHVzZVNldFRpbWVvdXQoKSB7XG4gIC8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIGVzNi1wcm9taXNlIHdpbGwgYmUgdW5hZmZlY3RlZCBieVxuICAvLyBvdGhlciBjb2RlIG1vZGlmeWluZyBzZXRUaW1lb3V0IChsaWtlIHNpbm9uLnVzZUZha2VUaW1lcnMoKSlcbiAgdmFyIGdsb2JhbFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnbG9iYWxTZXRUaW1lb3V0KGZsdXNoLCAxKTtcbiAgfTtcbn1cblxudmFyIHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuZnVuY3Rpb24gZmx1c2goKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBxdWV1ZVtpXTtcbiAgICB2YXIgYXJnID0gcXVldWVbaSArIDFdO1xuXG4gICAgY2FsbGJhY2soYXJnKTtcblxuICAgIHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgIHF1ZXVlW2kgKyAxXSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGxlbiA9IDA7XG59XG5cbmZ1bmN0aW9uIGF0dGVtcHRWZXJ0eCgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgdmVydHggPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpLnJlcXVpcmUoJ3ZlcnR4Jyk7XG4gICAgdmVydHhOZXh0ID0gdmVydHgucnVuT25Mb29wIHx8IHZlcnR4LnJ1bk9uQ29udGV4dDtcbiAgICByZXR1cm4gdXNlVmVydHhUaW1lcigpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHVzZVNldFRpbWVvdXQoKTtcbiAgfVxufVxuXG52YXIgc2NoZWR1bGVGbHVzaCA9IHZvaWQgMDtcbi8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG5pZiAoaXNOb2RlKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xufSBlbHNlIGlmIChCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTXV0YXRpb25PYnNlcnZlcigpO1xufSBlbHNlIGlmIChpc1dvcmtlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTWVzc2FnZUNoYW5uZWwoKTtcbn0gZWxzZSBpZiAoYnJvd3NlcldpbmRvdyA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSBhdHRlbXB0VmVydHgoKTtcbn0gZWxzZSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VTZXRUaW1lb3V0KCk7XG59XG5cbmZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgdmFyIHBhcmVudCA9IHRoaXM7XG5cbiAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3Iobm9vcCk7XG5cbiAgaWYgKGNoaWxkW1BST01JU0VfSURdID09PSB1bmRlZmluZWQpIHtcbiAgICBtYWtlUHJvbWlzZShjaGlsZCk7XG4gIH1cblxuICB2YXIgX3N0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuXG4gIGlmIChfc3RhdGUpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbX3N0YXRlIC0gMV07XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW52b2tlQ2FsbGJhY2soX3N0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHBhcmVudC5fcmVzdWx0KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICB9XG5cbiAgcmV0dXJuIGNoaWxkO1xufVxuXG4vKipcbiAgYFByb21pc2UucmVzb2x2ZWAgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlY29tZSByZXNvbHZlZCB3aXRoIHRoZVxuICBwYXNzZWQgYHZhbHVlYC4gSXQgaXMgc2hvcnRoYW5kIGZvciB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHJlc29sdmUoMSk7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKDEpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcmVzb2x2ZVxuICBAc3RhdGljXG4gIEBwYXJhbSB7QW55fSB2YWx1ZSB2YWx1ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aFxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIGZ1bGZpbGxlZCB3aXRoIHRoZSBnaXZlblxuICBgdmFsdWVgXG4qL1xuZnVuY3Rpb24gcmVzb2x2ZSQxKG9iamVjdCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcbiAgcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICByZXR1cm4gcHJvbWlzZTtcbn1cblxudmFyIFBST01JU0VfSUQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMik7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG52YXIgUEVORElORyA9IHZvaWQgMDtcbnZhciBGVUxGSUxMRUQgPSAxO1xudmFyIFJFSkVDVEVEID0gMjtcblxuZnVuY3Rpb24gc2VsZkZ1bGZpbGxtZW50KCkge1xuICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIik7XG59XG5cbmZ1bmN0aW9uIGNhbm5vdFJldHVybk93bigpIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS4nKTtcbn1cblxuZnVuY3Rpb24gdHJ5VGhlbih0aGVuJCQxLCB2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKSB7XG4gIHRyeSB7XG4gICAgdGhlbiQkMS5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlLCB0aGVuJCQxKSB7XG4gIGFzYXAoZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICB2YXIgc2VhbGVkID0gZmFsc2U7XG4gICAgdmFyIGVycm9yID0gdHJ5VGhlbih0aGVuJCQxLCB0aGVuYWJsZSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoc2VhbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgaWYgKHNlYWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuXG4gICAgICByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICB9LCAnU2V0dGxlOiAnICsgKHByb21pc2UuX2xhYmVsIHx8ICcgdW5rbm93biBwcm9taXNlJykpO1xuXG4gICAgaWYgKCFzZWFsZWQgJiYgZXJyb3IpIHtcbiAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgIH1cbiAgfSwgcHJvbWlzZSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlKSB7XG4gIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IEZVTEZJTExFRCkge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gIH0gZWxzZSBpZiAodGhlbmFibGUuX3N0YXRlID09PSBSRUpFQ1RFRCkge1xuICAgIHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgfSBlbHNlIHtcbiAgICBzdWJzY3JpYmUodGhlbmFibGUsIHVuZGVmaW5lZCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgcmV0dXJuIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbiQkMSkge1xuICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3RvciAmJiB0aGVuJCQxID09PSB0aGVuICYmIG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IucmVzb2x2ZSA9PT0gcmVzb2x2ZSQxKSB7XG4gICAgaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRoZW4kJDEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odGhlbiQkMSkpIHtcbiAgICAgIGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuJCQxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICByZWplY3QocHJvbWlzZSwgc2VsZkZ1bGZpbGxtZW50KCkpO1xuICB9IGVsc2UgaWYgKG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIHRoZW4kJDEgPSB2b2lkIDA7XG4gICAgdHJ5IHtcbiAgICAgIHRoZW4kJDEgPSB2YWx1ZS50aGVuO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlLCB0aGVuJCQxKTtcbiAgfSBlbHNlIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gIH1cblxuICBwdWJsaXNoKHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICBwcm9taXNlLl9zdGF0ZSA9IEZVTEZJTExFRDtcblxuICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwcm9taXNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuICBwcm9taXNlLl9zdGF0ZSA9IFJFSkVDVEVEO1xuICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgYXNhcChwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBfc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICB2YXIgbGVuZ3RoID0gX3N1YnNjcmliZXJzLmxlbmd0aDtcblxuXG4gIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgX3N1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgX3N1YnNjcmliZXJzW2xlbmd0aCArIEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICBfc3Vic2NyaWJlcnNbbGVuZ3RoICsgUkVKRUNURURdID0gb25SZWplY3Rpb247XG5cbiAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwYXJlbnQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2gocHJvbWlzZSkge1xuICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNoaWxkID0gdm9pZCAwLFxuICAgICAgY2FsbGJhY2sgPSB2b2lkIDAsXG4gICAgICBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICBpZiAoY2hpbGQpIHtcbiAgICAgIGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICB9XG4gIH1cblxuICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xufVxuXG5mdW5jdGlvbiBpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gIHZhciBoYXNDYWxsYmFjayA9IGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgdmFsdWUgPSB2b2lkIDAsXG4gICAgICBlcnJvciA9IHZvaWQgMCxcbiAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG5cbiAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhbHVlID0gY2FsbGJhY2soZGV0YWlsKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgIGVycm9yID0gZTtcbiAgICB9XG5cbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCBjYW5ub3RSZXR1cm5Pd24oKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gZGV0YWlsO1xuICB9XG5cbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgLy8gbm9vcFxuICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKHN1Y2NlZWRlZCA9PT0gZmFsc2UpIHtcbiAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IEZVTEZJTExFRCkge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IFJFSkVDVEVEKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICB0cnkge1xuICAgIHJlc29sdmVyKGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbHVlKSB7XG4gICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZWplY3QocHJvbWlzZSwgZSk7XG4gIH1cbn1cblxudmFyIGlkID0gMDtcbmZ1bmN0aW9uIG5leHRJZCgpIHtcbiAgcmV0dXJuIGlkKys7XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKHByb21pc2UpIHtcbiAgcHJvbWlzZVtQUk9NSVNFX0lEXSA9IGlkKys7XG4gIHByb21pc2UuX3N0YXRlID0gdW5kZWZpbmVkO1xuICBwcm9taXNlLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gIHByb21pc2UuX3N1YnNjcmliZXJzID0gW107XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRpb25FcnJvcigpIHtcbiAgcmV0dXJuIG5ldyBFcnJvcignQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5Jyk7XG59XG5cbnZhciBFbnVtZXJhdG9yID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCkge1xuICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG5cbiAgICBpZiAoIXRoaXMucHJvbWlzZVtQUk9NSVNFX0lEXSkge1xuICAgICAgbWFrZVByb21pc2UodGhpcy5wcm9taXNlKTtcbiAgICB9XG5cbiAgICBpZiAoaXNBcnJheShpbnB1dCkpIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAgICAgdGhpcy5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuXG4gICAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDA7XG4gICAgICAgIHRoaXMuX2VudW1lcmF0ZShpbnB1dCk7XG4gICAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICBmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZWplY3QodGhpcy5wcm9taXNlLCB2YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgfVxuICB9XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uIF9lbnVtZXJhdGUoaW5wdXQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgdGhpcy5fc3RhdGUgPT09IFBFTkRJTkcgJiYgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgIH1cbiAgfTtcblxuICBFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24gX2VhY2hFbnRyeShlbnRyeSwgaSkge1xuICAgIHZhciBjID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcbiAgICB2YXIgcmVzb2x2ZSQkMSA9IGMucmVzb2x2ZTtcblxuXG4gICAgaWYgKHJlc29sdmUkJDEgPT09IHJlc29sdmUkMSkge1xuICAgICAgdmFyIF90aGVuID0gdm9pZCAwO1xuICAgICAgdmFyIGVycm9yID0gdm9pZCAwO1xuICAgICAgdmFyIGRpZEVycm9yID0gZmFsc2U7XG4gICAgICB0cnkge1xuICAgICAgICBfdGhlbiA9IGVudHJ5LnRoZW47XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGRpZEVycm9yID0gdHJ1ZTtcbiAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgfVxuXG4gICAgICBpZiAoX3RoZW4gPT09IHRoZW4gJiYgZW50cnkuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgX3RoZW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IGVudHJ5O1xuICAgICAgfSBlbHNlIGlmIChjID09PSBQcm9taXNlJDEpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgYyhub29wKTtcbiAgICAgICAgaWYgKGRpZEVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIGVudHJ5LCBfdGhlbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHByb21pc2UsIGkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KG5ldyBjKGZ1bmN0aW9uIChyZXNvbHZlJCQxKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUkJDEoZW50cnkpO1xuICAgICAgICB9KSwgaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChyZXNvbHZlJCQxKGVudHJ5KSwgaSk7XG4gICAgfVxuICB9O1xuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbiBfc2V0dGxlZEF0KHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuXG5cbiAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09IFBFTkRJTkcpIHtcbiAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuXG4gICAgICBpZiAoc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgICAgIHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICBmdWxmaWxsKHByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgfVxuICB9O1xuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbiBfd2lsbFNldHRsZUF0KHByb21pc2UsIGkpIHtcbiAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICBzdWJzY3JpYmUocHJvbWlzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgcmV0dXJuIGVudW1lcmF0b3IuX3NldHRsZWRBdChSRUpFQ1RFRCwgaSwgcmVhc29uKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gRW51bWVyYXRvcjtcbn0oKTtcblxuLyoqXG4gIGBQcm9taXNlLmFsbGAgYWNjZXB0cyBhbiBhcnJheSBvZiBwcm9taXNlcywgYW5kIHJldHVybnMgYSBuZXcgcHJvbWlzZSB3aGljaFxuICBpcyBmdWxmaWxsZWQgd2l0aCBhbiBhcnJheSBvZiBmdWxmaWxsbWVudCB2YWx1ZXMgZm9yIHRoZSBwYXNzZWQgcHJvbWlzZXMsIG9yXG4gIHJlamVjdGVkIHdpdGggdGhlIHJlYXNvbiBvZiB0aGUgZmlyc3QgcGFzc2VkIHByb21pc2UgdG8gYmUgcmVqZWN0ZWQuIEl0IGNhc3RzIGFsbFxuICBlbGVtZW50cyBvZiB0aGUgcGFzc2VkIGl0ZXJhYmxlIHRvIHByb21pc2VzIGFzIGl0IHJ1bnMgdGhpcyBhbGdvcml0aG0uXG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IHJlc29sdmUoMSk7XG4gIGxldCBwcm9taXNlMiA9IHJlc29sdmUoMik7XG4gIGxldCBwcm9taXNlMyA9IHJlc29sdmUoMyk7XG4gIGxldCBwcm9taXNlcyA9IFsgcHJvbWlzZTEsIHByb21pc2UyLCBwcm9taXNlMyBdO1xuXG4gIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyBUaGUgYXJyYXkgaGVyZSB3b3VsZCBiZSBbIDEsIDIsIDMgXTtcbiAgfSk7XG4gIGBgYFxuXG4gIElmIGFueSBvZiB0aGUgYHByb21pc2VzYCBnaXZlbiB0byBgYWxsYCBhcmUgcmVqZWN0ZWQsIHRoZSBmaXJzdCBwcm9taXNlXG4gIHRoYXQgaXMgcmVqZWN0ZWQgd2lsbCBiZSBnaXZlbiBhcyBhbiBhcmd1bWVudCB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZXMnc1xuICByZWplY3Rpb24gaGFuZGxlci4gRm9yIGV4YW1wbGU6XG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IHJlc29sdmUoMSk7XG4gIGxldCBwcm9taXNlMiA9IHJlamVjdChuZXcgRXJyb3IoXCIyXCIpKTtcbiAgbGV0IHByb21pc2UzID0gcmVqZWN0KG5ldyBFcnJvcihcIjNcIikpO1xuICBsZXQgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihhcnJheSl7XG4gICAgLy8gQ29kZSBoZXJlIG5ldmVyIHJ1bnMgYmVjYXVzZSB0aGVyZSBhcmUgcmVqZWN0ZWQgcHJvbWlzZXMhXG4gIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgLy8gZXJyb3IubWVzc2FnZSA9PT0gXCIyXCJcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgYWxsXG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBcnJheX0gZW50cmllcyBhcnJheSBvZiBwcm9taXNlc1xuICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gYWxsIGBwcm9taXNlc2AgaGF2ZSBiZWVuXG4gIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQgaWYgYW55IG9mIHRoZW0gYmVjb21lIHJlamVjdGVkLlxuICBAc3RhdGljXG4qL1xuZnVuY3Rpb24gYWxsKGVudHJpZXMpIHtcbiAgcmV0dXJuIG5ldyBFbnVtZXJhdG9yKHRoaXMsIGVudHJpZXMpLnByb21pc2U7XG59XG5cbi8qKlxuICBgUHJvbWlzZS5yYWNlYCByZXR1cm5zIGEgbmV3IHByb21pc2Ugd2hpY2ggaXMgc2V0dGxlZCBpbiB0aGUgc2FtZSB3YXkgYXMgdGhlXG4gIGZpcnN0IHBhc3NlZCBwcm9taXNlIHRvIHNldHRsZS5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKCdwcm9taXNlIDEnKTtcbiAgICB9LCAyMDApO1xuICB9KTtcblxuICBsZXQgcHJvbWlzZTIgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMicpO1xuICAgIH0sIDEwMCk7XG4gIH0pO1xuXG4gIFByb21pc2UucmFjZShbcHJvbWlzZTEsIHByb21pc2UyXSkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIHJlc3VsdCA9PT0gJ3Byb21pc2UgMicgYmVjYXVzZSBpdCB3YXMgcmVzb2x2ZWQgYmVmb3JlIHByb21pc2UxXG4gICAgLy8gd2FzIHJlc29sdmVkLlxuICB9KTtcbiAgYGBgXG5cbiAgYFByb21pc2UucmFjZWAgaXMgZGV0ZXJtaW5pc3RpYyBpbiB0aGF0IG9ubHkgdGhlIHN0YXRlIG9mIHRoZSBmaXJzdFxuICBzZXR0bGVkIHByb21pc2UgbWF0dGVycy4gRm9yIGV4YW1wbGUsIGV2ZW4gaWYgb3RoZXIgcHJvbWlzZXMgZ2l2ZW4gdG8gdGhlXG4gIGBwcm9taXNlc2AgYXJyYXkgYXJndW1lbnQgYXJlIHJlc29sdmVkLCBidXQgdGhlIGZpcnN0IHNldHRsZWQgcHJvbWlzZSBoYXNcbiAgYmVjb21lIHJlamVjdGVkIGJlZm9yZSB0aGUgb3RoZXIgcHJvbWlzZXMgYmVjYW1lIGZ1bGZpbGxlZCwgdGhlIHJldHVybmVkXG4gIHByb21pc2Ugd2lsbCBiZWNvbWUgcmVqZWN0ZWQ6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMScpO1xuICAgIH0sIDIwMCk7XG4gIH0pO1xuXG4gIGxldCBwcm9taXNlMiA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcigncHJvbWlzZSAyJykpO1xuICAgIH0sIDEwMCk7XG4gIH0pO1xuXG4gIFByb21pc2UucmFjZShbcHJvbWlzZTEsIHByb21pc2UyXSkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIENvZGUgaGVyZSBuZXZlciBydW5zXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdwcm9taXNlIDInIGJlY2F1c2UgcHJvbWlzZSAyIGJlY2FtZSByZWplY3RlZCBiZWZvcmVcbiAgICAvLyBwcm9taXNlIDEgYmVjYW1lIGZ1bGZpbGxlZFxuICB9KTtcbiAgYGBgXG5cbiAgQW4gZXhhbXBsZSByZWFsLXdvcmxkIHVzZSBjYXNlIGlzIGltcGxlbWVudGluZyB0aW1lb3V0czpcblxuICBgYGBqYXZhc2NyaXB0XG4gIFByb21pc2UucmFjZShbYWpheCgnZm9vLmpzb24nKSwgdGltZW91dCg1MDAwKV0pXG4gIGBgYFxuXG4gIEBtZXRob2QgcmFjZVxuICBAc3RhdGljXG4gIEBwYXJhbSB7QXJyYXl9IHByb21pc2VzIGFycmF5IG9mIHByb21pc2VzIHRvIG9ic2VydmVcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2Ugd2hpY2ggc2V0dGxlcyBpbiB0aGUgc2FtZSB3YXkgYXMgdGhlIGZpcnN0IHBhc3NlZFxuICBwcm9taXNlIHRvIHNldHRsZS5cbiovXG5mdW5jdGlvbiByYWNlKGVudHJpZXMpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICBpZiAoIWlzQXJyYXkoZW50cmllcykpIHtcbiAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIChfLCByZWplY3QpIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLicpKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBsZW5ndGggPSBlbnRyaWVzLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgQ29uc3RydWN0b3IucmVzb2x2ZShlbnRyaWVzW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gIGBQcm9taXNlLnJlamVjdGAgcmV0dXJucyBhIHByb21pc2UgcmVqZWN0ZWQgd2l0aCB0aGUgcGFzc2VkIGByZWFzb25gLlxuICBJdCBpcyBzaG9ydGhhbmQgZm9yIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgcmVqZWN0KG5ldyBFcnJvcignV0hPT1BTJykpO1xuICB9KTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIENvZGUgaGVyZSBkb2Vzbid0IHJ1biBiZWNhdXNlIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIVxuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHJlYXNvbi5tZXNzYWdlID09PSAnV0hPT1BTJ1xuICB9KTtcbiAgYGBgXG5cbiAgSW5zdGVhZCBvZiB3cml0aW5nIHRoZSBhYm92ZSwgeW91ciBjb2RlIG5vdyBzaW1wbHkgYmVjb21lcyB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1dIT09QUycpKTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIENvZGUgaGVyZSBkb2Vzbid0IHJ1biBiZWNhdXNlIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIVxuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHJlYXNvbi5tZXNzYWdlID09PSAnV0hPT1BTJ1xuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCByZWplY3RcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FueX0gcmVhc29uIHZhbHVlIHRoYXQgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSByZWplY3RlZCB3aXRoIHRoZSBnaXZlbiBgcmVhc29uYC5cbiovXG5mdW5jdGlvbiByZWplY3QkMShyZWFzb24pIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG4gIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gbmVlZHNSZXNvbHZlcigpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xufVxuXG5mdW5jdGlvbiBuZWVkc05ldygpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbn1cblxuLyoqXG4gIFByb21pc2Ugb2JqZWN0cyByZXByZXNlbnQgdGhlIGV2ZW50dWFsIHJlc3VsdCBvZiBhbiBhc3luY2hyb25vdXMgb3BlcmF0aW9uLiBUaGVcbiAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGUgcmVhc29uXG4gIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gIFRlcm1pbm9sb2d5XG4gIC0tLS0tLS0tLS0tXG5cbiAgLSBgcHJvbWlzZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHdpdGggYSBgdGhlbmAgbWV0aG9kIHdob3NlIGJlaGF2aW9yIGNvbmZvcm1zIHRvIHRoaXMgc3BlY2lmaWNhdGlvbi5cbiAgLSBgdGhlbmFibGVgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBgdGhlbmAgbWV0aG9kLlxuICAtIGB2YWx1ZWAgaXMgYW55IGxlZ2FsIEphdmFTY3JpcHQgdmFsdWUgKGluY2x1ZGluZyB1bmRlZmluZWQsIGEgdGhlbmFibGUsIG9yIGEgcHJvbWlzZSkuXG4gIC0gYGV4Y2VwdGlvbmAgaXMgYSB2YWx1ZSB0aGF0IGlzIHRocm93biB1c2luZyB0aGUgdGhyb3cgc3RhdGVtZW50LlxuICAtIGByZWFzb25gIGlzIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2h5IGEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gIC0gYHNldHRsZWRgIHRoZSBmaW5hbCByZXN0aW5nIHN0YXRlIG9mIGEgcHJvbWlzZSwgZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuXG4gIEEgcHJvbWlzZSBjYW4gYmUgaW4gb25lIG9mIHRocmVlIHN0YXRlczogcGVuZGluZywgZnVsZmlsbGVkLCBvciByZWplY3RlZC5cblxuICBQcm9taXNlcyB0aGF0IGFyZSBmdWxmaWxsZWQgaGF2ZSBhIGZ1bGZpbGxtZW50IHZhbHVlIGFuZCBhcmUgaW4gdGhlIGZ1bGZpbGxlZFxuICBzdGF0ZS4gIFByb21pc2VzIHRoYXQgYXJlIHJlamVjdGVkIGhhdmUgYSByZWplY3Rpb24gcmVhc29uIGFuZCBhcmUgaW4gdGhlXG4gIHJlamVjdGVkIHN0YXRlLiAgQSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZXZlciBhIHRoZW5hYmxlLlxuXG4gIFByb21pc2VzIGNhbiBhbHNvIGJlIHNhaWQgdG8gKnJlc29sdmUqIGEgdmFsdWUuICBJZiB0aGlzIHZhbHVlIGlzIGFsc28gYVxuICBwcm9taXNlLCB0aGVuIHRoZSBvcmlnaW5hbCBwcm9taXNlJ3Mgc2V0dGxlZCBzdGF0ZSB3aWxsIG1hdGNoIHRoZSB2YWx1ZSdzXG4gIHNldHRsZWQgc3RhdGUuICBTbyBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IHJlamVjdHMgd2lsbFxuICBpdHNlbGYgcmVqZWN0LCBhbmQgYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCBmdWxmaWxscyB3aWxsXG4gIGl0c2VsZiBmdWxmaWxsLlxuXG5cbiAgQmFzaWMgVXNhZ2U6XG4gIC0tLS0tLS0tLS0tLVxuXG4gIGBgYGpzXG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgLy8gb24gc3VjY2Vzc1xuICAgIHJlc29sdmUodmFsdWUpO1xuXG4gICAgLy8gb24gZmFpbHVyZVxuICAgIHJlamVjdChyZWFzb24pO1xuICB9KTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAvLyBvbiBmdWxmaWxsbWVudFxuICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAvLyBvbiByZWplY3Rpb25cbiAgfSk7XG4gIGBgYFxuXG4gIEFkdmFuY2VkIFVzYWdlOlxuICAtLS0tLS0tLS0tLS0tLS1cblxuICBQcm9taXNlcyBzaGluZSB3aGVuIGFic3RyYWN0aW5nIGF3YXkgYXN5bmNocm9ub3VzIGludGVyYWN0aW9ucyBzdWNoIGFzXG4gIGBYTUxIdHRwUmVxdWVzdGBzLlxuXG4gIGBgYGpzXG4gIGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGhhbmRsZXI7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICB4aHIuc2VuZCgpO1xuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSB0aGlzLkRPTkUpIHtcbiAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignZ2V0SlNPTjogYCcgKyB1cmwgKyAnYCBmYWlsZWQgd2l0aCBzdGF0dXM6IFsnICsgdGhpcy5zdGF0dXMgKyAnXScpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBnZXRKU09OKCcvcG9zdHMuanNvbicpLnRoZW4oZnVuY3Rpb24oanNvbikge1xuICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgIC8vIG9uIHJlamVjdGlvblxuICB9KTtcbiAgYGBgXG5cbiAgVW5saWtlIGNhbGxiYWNrcywgcHJvbWlzZXMgYXJlIGdyZWF0IGNvbXBvc2FibGUgcHJpbWl0aXZlcy5cblxuICBgYGBqc1xuICBQcm9taXNlLmFsbChbXG4gICAgZ2V0SlNPTignL3Bvc3RzJyksXG4gICAgZ2V0SlNPTignL2NvbW1lbnRzJylcbiAgXSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgIHZhbHVlc1swXSAvLyA9PiBwb3N0c0pTT05cbiAgICB2YWx1ZXNbMV0gLy8gPT4gY29tbWVudHNKU09OXG5cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9KTtcbiAgYGBgXG5cbiAgQGNsYXNzIFByb21pc2VcbiAgQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZXJcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAY29uc3RydWN0b3JcbiovXG5cbnZhciBQcm9taXNlJDEgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFByb21pc2UocmVzb2x2ZXIpIHtcbiAgICB0aGlzW1BST01JU0VfSURdID0gbmV4dElkKCk7XG4gICAgdGhpcy5fcmVzdWx0ID0gdGhpcy5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcblxuICAgIGlmIChub29wICE9PSByZXNvbHZlcikge1xuICAgICAgdHlwZW9mIHJlc29sdmVyICE9PSAnZnVuY3Rpb24nICYmIG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgIHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlID8gaW5pdGlhbGl6ZVByb21pc2UodGhpcywgcmVzb2x2ZXIpIDogbmVlZHNOZXcoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gIHdoaWNoIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlXG4gIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAvLyB1c2VyIGlzIGF2YWlsYWJsZVxuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gIH0pO1xuICBgYGBcbiAgIENoYWluaW5nXG4gIC0tLS0tLS0tXG4gICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZmlyc3QgcHJvbWlzZSdzIGZ1bGZpbGxtZW50XG4gIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIHVzZXIubmFtZTtcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgfSkudGhlbihmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICAvLyBJZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHVzZXJOYW1lYCB3aWxsIGJlIHRoZSB1c2VyJ3MgbmFtZSwgb3RoZXJ3aXNlIGl0XG4gICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gIH0pO1xuICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gbmV2ZXIgcmVhY2hlZFxuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgLy8gaWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGByZWFzb25gIHdpbGwgYmUgJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jy5cbiAgICAvLyBJZiBgZmluZFVzZXJgIHJlamVjdGVkLCBgcmVhc29uYCB3aWxsIGJlICdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jy5cbiAgfSk7XG4gIGBgYFxuICBJZiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIGRvZXMgbm90IHNwZWNpZnkgYSByZWplY3Rpb24gaGFuZGxlciwgcmVqZWN0aW9uIHJlYXNvbnMgd2lsbCBiZSBwcm9wYWdhdGVkIGZ1cnRoZXIgZG93bnN0cmVhbS5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gbmV2ZXIgcmVhY2hlZFxuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgfSk7XG4gIGBgYFxuICAgQXNzaW1pbGF0aW9uXG4gIC0tLS0tLS0tLS0tLVxuICAgU29tZXRpbWVzIHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgdG8gYSBkb3duc3RyZWFtIHByb21pc2UgY2FuIG9ubHkgYmVcbiAgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LiBUaGlzIGNhbiBiZSBhY2hpZXZlZCBieSByZXR1cm5pbmcgYSBwcm9taXNlIGluIHRoZVxuICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICB1bnRpbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBzZXR0bGVkLiBUaGlzIGlzIGNhbGxlZCAqYXNzaW1pbGF0aW9uKi5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gIH0pO1xuICBgYGBcbiAgIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgZnVsZmlsbHMsIHdlJ2xsIGhhdmUgdGhlIHZhbHVlIGhlcmVcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgcmVqZWN0cywgd2UnbGwgaGF2ZSB0aGUgcmVhc29uIGhlcmVcbiAgfSk7XG4gIGBgYFxuICAgU2ltcGxlIEV4YW1wbGVcbiAgLS0tLS0tLS0tLS0tLS1cbiAgIFN5bmNocm9ub3VzIEV4YW1wbGVcbiAgIGBgYGphdmFzY3JpcHRcbiAgbGV0IHJlc3VsdDtcbiAgIHRyeSB7XG4gICAgcmVzdWx0ID0gZmluZFJlc3VsdCgpO1xuICAgIC8vIHN1Y2Nlc3NcbiAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAvLyBmYWlsdXJlXG4gIH1cbiAgYGBgXG4gICBFcnJiYWNrIEV4YW1wbGVcbiAgIGBgYGpzXG4gIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgIGlmIChlcnIpIHtcbiAgICAgIC8vIGZhaWx1cmVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc3VjY2Vzc1xuICAgIH1cbiAgfSk7XG4gIGBgYFxuICAgUHJvbWlzZSBFeGFtcGxlO1xuICAgYGBgamF2YXNjcmlwdFxuICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIHN1Y2Nlc3NcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyBmYWlsdXJlXG4gIH0pO1xuICBgYGBcbiAgIEFkdmFuY2VkIEV4YW1wbGVcbiAgLS0tLS0tLS0tLS0tLS1cbiAgIFN5bmNocm9ub3VzIEV4YW1wbGVcbiAgIGBgYGphdmFzY3JpcHRcbiAgbGV0IGF1dGhvciwgYm9va3M7XG4gICB0cnkge1xuICAgIGF1dGhvciA9IGZpbmRBdXRob3IoKTtcbiAgICBib29rcyAgPSBmaW5kQm9va3NCeUF1dGhvcihhdXRob3IpO1xuICAgIC8vIHN1Y2Nlc3NcbiAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAvLyBmYWlsdXJlXG4gIH1cbiAgYGBgXG4gICBFcnJiYWNrIEV4YW1wbGVcbiAgIGBgYGpzXG4gICBmdW5jdGlvbiBmb3VuZEJvb2tzKGJvb2tzKSB7XG4gICB9XG4gICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuICAgfVxuICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgaWYgKGVycikge1xuICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgLy8gZmFpbHVyZVxuICAgIH0gZWxzZSB7XG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmb3VuZEJvb2tzKGJvb2tzKTtcbiAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICB9XG4gICAgICAvLyBzdWNjZXNzXG4gICAgfVxuICB9KTtcbiAgYGBgXG4gICBQcm9taXNlIEV4YW1wbGU7XG4gICBgYGBqYXZhc2NyaXB0XG4gIGZpbmRBdXRob3IoKS5cbiAgICB0aGVuKGZpbmRCb29rc0J5QXV0aG9yKS5cbiAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgIC8vIGZvdW5kIGJvb2tzXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgfSk7XG4gIGBgYFxuICAgQG1ldGhvZCB0aGVuXG4gIEBwYXJhbSB7RnVuY3Rpb259IG9uRnVsZmlsbGVkXG4gIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0ZWRcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfVxuICAqL1xuXG4gIC8qKlxuICBgY2F0Y2hgIGlzIHNpbXBseSBzdWdhciBmb3IgYHRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbilgIHdoaWNoIG1ha2VzIGl0IHRoZSBzYW1lXG4gIGFzIHRoZSBjYXRjaCBibG9jayBvZiBhIHRyeS9jYXRjaCBzdGF0ZW1lbnQuXG4gIGBgYGpzXG4gIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gIH1cbiAgLy8gc3luY2hyb25vdXNcbiAgdHJ5IHtcbiAgZmluZEF1dGhvcigpO1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICB9XG4gIC8vIGFzeW5jIHdpdGggcHJvbWlzZXNcbiAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gIH0pO1xuICBgYGBcbiAgQG1ldGhvZCBjYXRjaFxuICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGlvblxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG5cblxuICBQcm9taXNlLnByb3RvdHlwZS5jYXRjaCA9IGZ1bmN0aW9uIF9jYXRjaChvblJlamVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24pO1xuICB9O1xuXG4gIC8qKlxuICAgIGBmaW5hbGx5YCB3aWxsIGJlIGludm9rZWQgcmVnYXJkbGVzcyBvZiB0aGUgcHJvbWlzZSdzIGZhdGUganVzdCBhcyBuYXRpdmVcbiAgICB0cnkvY2F0Y2gvZmluYWxseSBiZWhhdmVzXG4gIFxuICAgIFN5bmNocm9ub3VzIGV4YW1wbGU6XG4gIFxuICAgIGBgYGpzXG4gICAgZmluZEF1dGhvcigpIHtcbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBBdXRob3IoKTtcbiAgICB9XG4gIFxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZmluZEF1dGhvcigpOyAvLyBzdWNjZWVkIG9yIGZhaWxcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICByZXR1cm4gZmluZE90aGVyQXV0aGVyKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIGFsd2F5cyBydW5zXG4gICAgICAvLyBkb2Vzbid0IGFmZmVjdCB0aGUgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIGBgYFxuICBcbiAgICBBc3luY2hyb25vdXMgZXhhbXBsZTpcbiAgXG4gICAgYGBganNcbiAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICB9KS5maW5hbGx5KGZ1bmN0aW9uKCl7XG4gICAgICAvLyBhdXRob3Igd2FzIGVpdGhlciBmb3VuZCwgb3Igbm90XG4gICAgfSk7XG4gICAgYGBgXG4gIFxuICAgIEBtZXRob2QgZmluYWxseVxuICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cblxuXG4gIFByb21pc2UucHJvdG90eXBlLmZpbmFsbHkgPSBmdW5jdGlvbiBfZmluYWxseShjYWxsYmFjaykge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICB2YXIgY29uc3RydWN0b3IgPSBwcm9taXNlLmNvbnN0cnVjdG9yO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2UudGhlbihjYWxsYmFjaywgY2FsbGJhY2spO1xuICB9O1xuXG4gIHJldHVybiBQcm9taXNlO1xufSgpO1xuXG5Qcm9taXNlJDEucHJvdG90eXBlLnRoZW4gPSB0aGVuO1xuUHJvbWlzZSQxLmFsbCA9IGFsbDtcblByb21pc2UkMS5yYWNlID0gcmFjZTtcblByb21pc2UkMS5yZXNvbHZlID0gcmVzb2x2ZSQxO1xuUHJvbWlzZSQxLnJlamVjdCA9IHJlamVjdCQxO1xuUHJvbWlzZSQxLl9zZXRTY2hlZHVsZXIgPSBzZXRTY2hlZHVsZXI7XG5Qcm9taXNlJDEuX3NldEFzYXAgPSBzZXRBc2FwO1xuUHJvbWlzZSQxLl9hc2FwID0gYXNhcDtcblxuLypnbG9iYWwgc2VsZiovXG5mdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgdmFyIGxvY2FsID0gdm9pZCAwO1xuXG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvY2FsID0gZ2xvYmFsO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvY2FsID0gc2VsZjtcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWwgPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgdmFyIFAgPSBsb2NhbC5Qcm9taXNlO1xuXG4gIGlmIChQKSB7XG4gICAgdmFyIHByb21pc2VUb1N0cmluZyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHByb21pc2VUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gc2lsZW50bHkgaWdub3JlZFxuICAgIH1cblxuICAgIGlmIChwcm9taXNlVG9TdHJpbmcgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgbG9jYWwuUHJvbWlzZSA9IFByb21pc2UkMTtcbn1cblxuLy8gU3RyYW5nZSBjb21wYXQuLlxuUHJvbWlzZSQxLnBvbHlmaWxsID0gcG9seWZpbGw7XG5Qcm9taXNlJDEuUHJvbWlzZSA9IFByb21pc2UkMTtcblxucmV0dXJuIFByb21pc2UkMTtcblxufSkpKTtcblxuXG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVzNi1wcm9taXNlLm1hcFxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiLyoqXHJcbiAqIEFQSTpcclxuICpcclxuICogaWZOZWVkZWQoW2lnbm9yZU5hdGl2ZUFQTkcgYm9vbF0pIOKGkiBQcm9taXNlKClcclxuICogYW5pbWF0ZUltYWdlKGltZyBIVE1MSW1hZ2VFbGVtZW50KSDihpIgUHJvbWlzZSgpXHJcbiAqXHJcbiAqIGFuaW1hdGVDb250ZXh0KHVybCBTdHJpbmcsIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBjb250ZXh0KSDihpIgUHJvbWlzZShBbmltYXRpb24pXHJcbiAqIHBhcnNlQnVmZmVyKEFycmF5QnVmZmVyKSDihpIgUHJvbWlzZShBbmltYXRpb24pXHJcbiAqIHBhcnNlVVJMKHVybCBTdHJpbmcpIOKGkiBQcm9taXNlKEFuaW1hdGlvbilcclxuICogY2hlY2tOYXRpdmVGZWF0dXJlcygpIOKGkiBQcm9taXNlKGZlYXR1cmVzKVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCBzdXBwb3J0ID0gcmVxdWlyZShcIi4vc3VwcG9ydC10ZXN0XCIpO1xyXG5jb25zdCBwYXJzZUFQTkcgPSByZXF1aXJlKFwiLi9wYXJzZV9hcG5nXCIpO1xyXG5jb25zdCBwYXJzZUFHSUYgPSByZXF1aXJlKFwiLi9wYXJzZV9hZ2lmXCIpO1xyXG5jb25zdCBwYXJzZVdFQlAgPSByZXF1aXJlKFwiLi9wYXJzZV93ZWJwXCIpO1xyXG5jb25zdCBsb2FkVXJsID0gcmVxdWlyZSgnLi9sb2FkZXInKTtcclxuXHJcbmNvbnN0IEd5ZW9uZ2h3b24gPSBnbG9iYWwuR3llb25naHdvbiA9IHt9O1xyXG5cclxuR3llb25naHdvbi5jaGVja05hdGl2ZUZlYXR1cmVzID0gc3VwcG9ydC5jaGVja05hdGl2ZUZlYXR1cmVzO1xyXG5HeWVvbmdod29uLmlmTmVlZGVkID0gc3VwcG9ydC5pZk5lZWRlZDtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBidWZmZXJcclxuICogQHJldHVybiB7UHJvbWlzZX1cclxuICovXHJcbkd5ZW9uZ2h3b24ucGFyc2VCdWZmZXIgPSBmdW5jdGlvbiAoYnVmZmVyKSB7XHJcbiAgcmV0dXJuIHN1cHBvcnQucG5nQ2hlY2soYnVmZmVyKSA/IHBhcnNlQVBORyhidWZmZXIpIDpcclxuICAgIHN1cHBvcnQuZ2lmQ2hlY2soYnVmZmVyKSA/IHBhcnNlQUdJRihidWZmZXIpIDpcclxuICAgICAgc3VwcG9ydC53ZWJwQ2hlY2soYnVmZmVyKSA/IHBhcnNlV0VCUChidWZmZXIpIDpcclxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vdCBhIHN1cHBvcnRlZCBmaWxlIChpbnZhbGlkIGZpbGUgc2lnbmF0dXJlKScpKTtcclxufTtcclxuXHJcbnZhciB1cmwycHJvbWlzZSA9IHt9O1xyXG4vKipcclxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxyXG4gKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gKi9cclxuR3llb25naHdvbi5wYXJzZVVSTCA9IGZ1bmN0aW9uICh1cmwpIHtcclxuICBpZiAoISh1cmwgaW4gdXJsMnByb21pc2UpKSB1cmwycHJvbWlzZVt1cmxdID0gbG9hZFVybCh1cmwpLnRoZW4oR3llb25naHdvbi5wYXJzZUJ1ZmZlcik7XHJcbiAgcmV0dXJuIHVybDJwcm9taXNlW3VybF07XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxyXG4gKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dFxyXG4gKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gKi9cclxuR3llb25naHdvbi5hbmltYXRlQ29udGV4dCA9IGZ1bmN0aW9uICh1cmwsIGNvbnRleHQpIHtcclxuICByZXR1cm4gR3llb25naHdvbi5wYXJzZVVSTCh1cmwpLnRoZW4oZnVuY3Rpb24gKGEpIHtcclxuICAgIGEuYWRkQ29udGV4dChjb250ZXh0KTtcclxuICAgIGEucGxheSgpO1xyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtIVE1MSW1hZ2VFbGVtZW50fSBpbWdcclxuICogQHJldHVybiB7UHJvbWlzZX1cclxuICovXHJcbkd5ZW9uZ2h3b24uYW5pbWF0ZUltYWdlID0gZnVuY3Rpb24gKGltZykge1xyXG4gIGltZy5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlzLWFpbWdcIiwgXCJwcm9ncmVzc1wiKTtcclxuICByZXR1cm4gR3llb25naHdvbi5wYXJzZVVSTChpbWcuc3JjKS50aGVuKFxyXG4gICAgZnVuY3Rpb24gKGFuaW0pIHtcclxuICAgICAgaW1nLnNldEF0dHJpYnV0ZShcImRhdGEtaXMtYWltZ1wiLCBcInllc1wiKTtcclxuICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9IGFuaW0ud2lkdGg7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBhbmltLmhlaWdodDtcclxuICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoaW1nLmF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGF0dHIpIHtcclxuICAgICAgICBpZiAoW1wiYWx0XCIsIFwic3JjXCIsIFwidXNlbWFwXCIsIFwiaXNtYXBcIiwgXCJkYXRhLWlzLWFpbWdcIiwgXCJ3aWR0aFwiLCBcImhlaWdodFwiXS5pbmRleE9mKGF0dHIubm9kZU5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZU5vZGUoYXR0ci5jbG9uZU5vZGUoZmFsc2UpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBjYW52YXMuc2V0QXR0cmlidXRlKFwiZGF0YS1haW1nLXNyY1wiLCBpbWcuc3JjKTtcclxuICAgICAgaWYgKGltZy5hbHQgIT09IFwiXCIpIGNhbnZhcy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpbWcuYWx0KSk7XHJcblxyXG4gICAgICB2YXIgaW1nV2lkdGggPSBcIlwiLCBpbWdIZWlnaHQgPSBcIlwiLCB2YWwgPSAwLCB1bml0ID0gXCJcIjtcclxuXHJcbiAgICAgIGlmIChpbWcuc3R5bGUud2lkdGggIT09IFwiXCIgJiYgaW1nLnN0eWxlLndpZHRoICE9PSBcImF1dG9cIikge1xyXG4gICAgICAgIGltZ1dpZHRoID0gaW1nLnN0eWxlLndpZHRoO1xyXG4gICAgICB9IGVsc2UgaWYgKGltZy5oYXNBdHRyaWJ1dGUoXCJ3aWR0aFwiKSkge1xyXG4gICAgICAgIGltZ1dpZHRoID0gaW1nLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpICsgXCJweFwiO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpbWcuc3R5bGUuaGVpZ2h0ICE9PSBcIlwiICYmIGltZy5zdHlsZS5oZWlnaHQgIT09IFwiYXV0b1wiKSB7XHJcbiAgICAgICAgaW1nSGVpZ2h0ID0gaW1nLnN0eWxlLmhlaWdodDtcclxuICAgICAgfSBlbHNlIGlmIChpbWcuaGFzQXR0cmlidXRlKFwiaGVpZ2h0XCIpKSB7XHJcbiAgICAgICAgaW1nSGVpZ2h0ID0gaW1nLmdldEF0dHJpYnV0ZShcImhlaWdodFwiKSArIFwicHhcIjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaW1nV2lkdGggIT09IFwiXCIgJiYgaW1nSGVpZ2h0ID09PSBcIlwiKSB7XHJcbiAgICAgICAgdmFsID0gcGFyc2VGbG9hdChpbWdXaWR0aCk7XHJcbiAgICAgICAgdW5pdCA9IGltZ1dpZHRoLm1hdGNoKC9cXEQrJC8pWzBdO1xyXG4gICAgICAgIGltZ0hlaWdodCA9IE1hdGgucm91bmQoY2FudmFzLmhlaWdodCAqIHZhbCAvIGNhbnZhcy53aWR0aCkgKyB1bml0O1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpbWdIZWlnaHQgIT09IFwiXCIgJiYgaW1nV2lkdGggPT09IFwiXCIpIHtcclxuICAgICAgICB2YWwgPSBwYXJzZUZsb2F0KGltZ0hlaWdodCk7XHJcbiAgICAgICAgdW5pdCA9IGltZ0hlaWdodC5tYXRjaCgvXFxEKyQvKVswXTtcclxuICAgICAgICBpbWdXaWR0aCA9IE1hdGgucm91bmQoY2FudmFzLndpZHRoICogdmFsIC8gY2FudmFzLmhlaWdodCkgKyB1bml0O1xyXG4gICAgICB9XHJcbiAgICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGltZ1dpZHRoO1xyXG4gICAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gaW1nSGVpZ2h0O1xyXG5cclxuICAgICAgdmFyIHAgPSBpbWcucGFyZW50Tm9kZTtcclxuICAgICAgcC5pbnNlcnRCZWZvcmUoY2FudmFzLCBpbWcpO1xyXG4gICAgICBwLnJlbW92ZUNoaWxkKGltZyk7XHJcbiAgICAgIGFuaW0uYWRkQ29udGV4dChjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpKTtcclxuICAgICAgYW5pbS5wbGF5KCk7XHJcbiAgICB9LFxyXG4gICAgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlzLWFpbWdcIiwgXCJub1wiKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhc1xyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cclxuR3llb25naHdvbi5yZWxlYXNlQ2FudmFzID0gZnVuY3Rpb24oY2FudmFzKSB7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgaWYgKCdfYWltZ19hbmltYXRpb24nIGluIGN0eCkge1xyXG4gICAgY3R4WydfYWltZ19hbmltYXRpb24nXS5yZW1vdmVDb250ZXh0KGN0eCk7XHJcbiAgfVxyXG59OyJdLCJzb3VyY2VSb290IjoiIn0=