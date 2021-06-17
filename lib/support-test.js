"use strict";
export const PNG_SIGNATURE_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
export const GIF87_SIGNATURE_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
export const GIF89_SIGNATURE_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
export const WEBP_CHECK_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
const oncePromise = function (foo) {
    let promise;
    return function (callback) {
        if (!promise)
            promise = new Promise(foo);
        if (callback)
            promise.then(callback);
        return promise;
    };
};
export const checkNativeFeatures = oncePromise(function (resolve) {
    const canvas = document.createElement("canvas");
    const result = {
        TypedArrays: ("ArrayBuffer" in global),
        BlobURLs: ("URL" in global),
        requestAnimationFrame: ("requestAnimationFrame" in global),
        pageProtocol: (location.protocol == "http:" || location.protocol == "https:"),
        canvas: ("getContext" in document.createElement("canvas")),
        APNG: false
    };
    if (result.canvas) {
        const img = new Image();
        img.onload = function () {
            const ctx = canvas.getContext("2d");
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
export const ifNeeded = function (ignoreNativeAPNG = false) {
    return checkNativeFeatures().then(function (features) {
        if (features.APNG && !ignoreNativeAPNG) {
        }
        else {
            let ok = true;
            for (let k in features)
                if (features.hasOwnProperty(k) && k != 'APNG') {
                    ok = ok && features[k];
                }
        }
    });
};
export function pngCheck(buffer) {
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < PNG_SIGNATURE_BYTES.length; i++) {
        if (PNG_SIGNATURE_BYTES[i] !== bytes[i]) {
            return false;
        }
    }
    return true;
}
export function gifCheck(buffer) {
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < GIF87_SIGNATURE_BYTES.length; i++) {
        if (GIF87_SIGNATURE_BYTES[i] !== bytes[i] && GIF89_SIGNATURE_BYTES[i] !== bytes[i]) {
            return false;
        }
    }
    return true;
}
export function webpCheck(buffer) {
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < WEBP_CHECK_BYTES.length; i++) {
        if (WEBP_CHECK_BYTES[i] !== bytes[i] && WEBP_CHECK_BYTES[i] !== 0x00) {
            return false;
        }
    }
    return true;
}
export const support = {
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