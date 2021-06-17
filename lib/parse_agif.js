"use strict";
var Animation = require('./animation');
var crc32 = require('./crc32');
const support = require("./support-test");
module.exports = function (buffer) {
    const bytes = new Uint8Array(buffer);
    return new Promise(function (resolve, reject) {
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
        const postDataParts = [], anim = new Animation();
        let headerDataBytes = null, frame = null;
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
                    if (frame)
                        anim.frames.push(frame);
                    frame = {};
                    frame.delay = readWord(bytes, off + 4) * 10;
                    if (frame.delay <= 10)
                        frame.delay = 100;
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
        if (frame)
            anim.frames.push(frame);
        if (anim.frames.length === 0) {
            reject("Not an animated PNG");
            return;
        }
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
            var url = URL.createObjectURL(new Blob(bb, { "type": "image/gif" }));
            delete frame.data;
            delete frame.gce;
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
const blocksLength = function (bytes, off) {
    let length = 0;
    while (1) {
        const siz = readByte(bytes, off + length);
        length++;
        if (siz === 0x00)
            return length;
        length += siz;
    }
};
var parseBlocks = function (bytes, callback) {
    let off = 6;
    let res, length, type;
    do {
        let type;
        if (off === 6) {
            type = 'HDR';
            length = 7;
            const bits = byteToBitArr(readByte(bytes, off + 4));
            const gctExists = bits[0];
            const gctSize = bitsToNum(bits.splice(5, 3));
            length += gctExists ? Math.pow(2, gctSize + 1) * 3 : 0;
        }
        else {
            const comm = readString(bytes, off, 1);
            switch (comm) {
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
                    type = 'IMG';
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
//# sourceMappingURL=parse_agif.js.map