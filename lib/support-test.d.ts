export function checkNativeFeatures(callback: any): any;
export function ifNeeded(ignoreNativeAPNG?: boolean | undefined): Promise<any>;
export function pngCheck(buffer: any): boolean;
export function gifCheck(buffer: any): boolean;
export function webpCheck(buffer: any): boolean;
export const PNG_SIGNATURE_BYTES: Uint8Array;
export const GIF87_SIGNATURE_BYTES: Uint8Array;
export const GIF89_SIGNATURE_BYTES: Uint8Array;
export const WEBP_CHECK_BYTES: Uint8Array;
