interface NativeFeatures {
  TypedArrays: boolean;
  BlobURLs: boolean;
  requestAnimationFrame: boolean;
  pageProtocol: boolean;
  canvas: boolean;
  canvasContext: boolean;
}
  
const oncePromise = function (foo: any) {
  let promise: Promise<any>;
  return function (callback?: (value: any) => any) {
    if (!promise) promise = new Promise(foo);
    if (callback) promise.then(callback);
    return promise;
  };
};
  
export const checkNativeFeatures = oncePromise(function (resolve: (value: NativeFeatures) => void) {
  const canvas = document.createElement("canvas");
  const result: NativeFeatures = {
    TypedArrays: ("ArrayBuffer" in global),
    BlobURLs: ("URL" in global),
    requestAnimationFrame: ("requestAnimationFrame" in global),
    pageProtocol: (location.protocol == "http:" || location.protocol == "https:"),
    canvas: !!canvas,
    canvasContext: !!canvas.getContext("2d")
  };
  resolve(result);
});