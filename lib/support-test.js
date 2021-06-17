"use strict";
var Promise = Promise || require('es6-promise').Promise;
const PNG_SIGNATURE_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF87_SIGNATURE_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
const GIF89_SIGNATURE_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const WEBP_CHECK_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
var oncePromise = function (foo) {
    var promise = null;
    return function (callback) {
        if (!promise)
            promise = new Promise(foo);
        if (callback)
            promise.then(callback);
        return promise;
    };
};
var checkNativeFeatures = oncePromise(function (resolve) {
    var canvas = document.createElement("canvas");
    var result = {
        TypedArrays: ("ArrayBuffer" in global),
        BlobURLs: ("URL" in global),
        requestAnimationFrame: ("requestAnimationFrame" in global),
        pageProtocol: (location.protocol == "http:" || location.protocol == "https:"),
        canvas: ("getContext" in document.createElement("canvas")),
        APNG: false
    };
    if (result.canvas) {
        var img = new Image();
        img.onload = function () {
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            result.APNG = (ctx.getImageData(0, 0, 1, 1).data[3] === 0);
            resolve(result);
        };
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjV" +
            "EwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAA" +
            "AAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==";
    }
    else {
        resolve(result);
    }
});
var ifNeeded = function (ignoreNativeAPNG) {
    if (typeof ignoreNativeAPNG == 'undefined')
        ignoreNativeAPNG = false;
    return checkNativeFeatures().then(function (features) {
        if (features.APNG && !ignoreNativeAPNG) {
            reject();
        }
        else {
            var ok = true;
            for (var k in features)
                if (features.hasOwnProperty(k) && k != 'APNG') {
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
//# sourceMappingURL=support-test.js.map