export declare const PNG_SIGNATURE_BYTES: Uint8Array<ArrayBuffer>;
export declare const GIF87_SIGNATURE_BYTES: Uint8Array<ArrayBuffer>;
export declare const GIF89_SIGNATURE_BYTES: Uint8Array<ArrayBuffer>;
export declare const WEBP_CHECK_BYTES: Uint8Array<ArrayBuffer>;
export declare const checkNativeFeatures: (callback?: (value: any) => any) => Promise<any>;
/**
 * @param {boolean} [ignoreNativeAPNG]
 * @return {Promise}
 */
export declare const ifNeeded: (ignoreNativeAPNG?: boolean) => Promise<void>;
export declare function pngCheck(buffer: ArrayBufferLike): boolean;
export declare function gifCheck(buffer: ArrayBufferLike): boolean;
export declare function webpCheck(buffer: ArrayBufferLike): boolean;
export declare const support: {
    checkNativeFeatures: (callback?: (value: any) => any) => Promise<any>;
    ifNeeded: (ignoreNativeAPNG?: boolean) => Promise<void>;
    pngCheck: typeof pngCheck;
    gifCheck: typeof gifCheck;
    webpCheck: typeof webpCheck;
    PNG_SIGNATURE_BYTES: Uint8Array<ArrayBuffer>;
    GIF87_SIGNATURE_BYTES: Uint8Array<ArrayBuffer>;
    GIF89_SIGNATURE_BYTES: Uint8Array<ArrayBuffer>;
    WEBP_CHECK_BYTES: Uint8Array<ArrayBuffer>;
};
