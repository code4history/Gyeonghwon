import Animation from './animation';
import EventTarget from "ol/events/Target";
export default class Gyeonghwon extends EventTarget {
    #private;
    waitingMilliSec: number;
    constructor(waitingMilliSec?: number);
    parseBuffer(buffer: ArrayBufferLike): Promise<Animation>;
    parseURL(url: string): Promise<Animation>;
    animateExistContext(url: string, context: CanvasRenderingContext2D): Promise<Animation>;
    animateNewContext(url: string): Promise<Animation>;
    animateImage(img: HTMLImageElement): Promise<Animation | void>;
    releaseCanvas(canvas: HTMLCanvasElement): void;
}
