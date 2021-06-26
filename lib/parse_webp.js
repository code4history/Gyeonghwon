"use strict";
import Animation from './animation';
import { support } from './support-test';
import { bitsToNum, byteToBitArr, make3BytesArray, makeDWordArray, read3Bytes, readByte, readDWord, readString, readWord, subBuffer } from "./parse_base";
export default async function (buffer, options = { ignoreSingle: false, forceLoop: false }) {
    const ignoreSingle = !!(options.ignoreSingle);
    const forceLoop = !!(options.forceLoop);
    const bytes = new Uint8Array(buffer);
    return new Promise((resolve, reject) => {
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
        let headerDataBytes, frame;
        parseChunks(bytes, (type, bytes, off, length) => {
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
                    let delay = read3Bytes(bytes, off + 8 + 12);
                    if (delay <= 10)
                        delay = 100;
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
        if (frame)
            anim.frames.push(frame);
        if (anim.frames.length <= 1) {
            if (ignoreSingle) {
                reject("Not an animated WebP");
                return;
            }
            else {
                anim.numPlays = 1;
            }
        }
        else if (forceLoop)
            anim.numPlays = 0;
        let createdImages = 0;
        for (let f = 0; f < anim.frames.length; f++) {
            frame = anim.frames[f];
            let bb = [];
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
            const url = URL.createObjectURL(new Blob(bb, { "type": "image/webp" }));
            delete frame.data;
            bb = [];
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
function parseChunks(bytes, callback, off = 12, limit) {
    const limitOff = limit ? limit + off : bytes.length;
    let res = true;
    do {
        const type = readString(bytes, off, 4);
        let length = readDWord(bytes, off + 4);
        if (length % 2)
            length++;
        res = callback(type, bytes, off, length + 8);
        off += length + 8;
    } while (res && off < limitOff);
}
;
//# sourceMappingURL=parse_webp.js.map