interface Url2Promise {
    [index: string]: Promise<any>;
}
export declare class Gyeonghwon {
    static url2promise: Url2Promise;
    static parseBuffer(buffer: ArrayBufferLike): Promise<any>;
    static parseURL(url: string): Promise<any>;
    static animateContext(url: string, context: CanvasRenderingContext2D): Promise<any>;
    static animateImage(img: HTMLImageElement): Promise<any>;
    releaseCanvas(canvas: HTMLCanvasElement): void;
}
export {};
