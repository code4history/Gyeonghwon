"use strict";
var Animation = require('./animation');
var crc32 = require('./crc32');
const support = require("./support-test");
module.exports = function (buffer) {
    const bytes = new Uint8Array(buffer);
    return new Promise(function (resolve, reject) {
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
        let headerDataBytes = null, frame = null;
        parseChunks(bytes, function (type, bytes, off, length) {
            switch (type) {
                case "VP8X":
                    headerDataBytes = bytes.subarray(off, off + length);
                    anim.width = read3Bytes(bytes, off + 8 + 4) + 1;
                    anim.height = read3Bytes(bytes, off + 8 + 4 + 3) + 1;
                    break;
                case "ANIM":
                    anim.numPlays = readWord(bytes, off + 8 + 4);
                    break;
                case "ANMF":
                    if (frame)
                        anim.frames.push(frame);
                    frame = {};
                    frame.delay = read3Bytes(bytes, off + 8 + 12);
                    if (frame.delay <= 10)
                        frame.delay = 100;
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
        if (frame)
            anim.frames.push(frame);
        if (anim.frames.length === 0) {
            reject("Not an animated WebP");
            return;
        }
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
            bits[4] = false;
            bits[5] = false;
            bits[6] = false;
            headerDataBytes.set([bitsToNum(bits)], 8);
            headerDataBytes.set(make3BytesArray(frame.width - 1), 8 + 4);
            headerDataBytes.set(make3BytesArray(frame.height - 1), 8 + 4 + 3);
            bb.push(headerDataBytes);
            bb.push(frame.data);
            var url = URL.createObjectURL(new Blob(bb, { "type": "image/webp" }));
            delete frame.data;
            bb = null;
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
var parseChunks = function (bytes, callback, off, limit) {
    if (!off)
        off = 12;
    const limitOff = limit ? limit + off : bytes.length;
    let res, length, type;
    do {
        const type = readString(bytes, off, 4);
        let length = readDWord(bytes, off + 4);
        if (length % 2)
            length++;
        res = callback(type, bytes, off, length + 8);
        off += length + 8;
    } while (res !== false && off < limitOff);
};
var readDWord = function (bytes, off) {
    var x = 0;
    x += ((bytes[off + 3] << 24) >>> 0);
    for (var i = 1; i < 4; i++)
        x += ((bytes[off + 3 - i] << ((3 - i) * 8)));
    return x;
};
var readWord = function (bytes, off) {
    var x = 0;
    for (var i = 0; i < 2; i++)
        x += (bytes[off + 1 - i] << ((1 - i) * 8));
    return x;
};
var read3Bytes = function (bytes, off) {
    var x = 0;
    x += ((bytes[off + 2] << 16) >>> 0);
    for (var i = 1; i < 3; i++)
        x += ((bytes[off + 2 - i] << ((2 - i) * 8)));
    return x;
};
var readByte = function (bytes, off) {
    return bytes[off];
};
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
    return [x & 0xff, (x >>> 8) & 0xff, (x >>> 16) & 0xff, (x >>> 24) & 0xff];
};
var makeWordArray = function (x) {
    return [x & 0xff, (x >>> 8) & 0xff];
};
var make3BytesArray = function (x) {
    return [x & 0xff, (x >>> 8) & 0xff, (x >>> 16) & 0xff];
};
var makeStringArray = function (x) {
    var res = [];
    for (var i = 0; i < x.length; i++)
        res.push(x.charCodeAt(i));
    return res;
};
var bitsToNum = function (ba) {
    return ba.reduce(function (s, n) {
        return s * 2 + n;
    }, 0);
};
var byteToBitArr = function (bite) {
    var a = [];
    for (var i = 7; i >= 0; i--) {
        a.push(!!(bite & (1 << i)));
    }
    return a;
};
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
//# sourceMappingURL=parse_webp.js.map