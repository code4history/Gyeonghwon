import { ParseOptions } from './parse_base';
import Animation from './animation';
import EventTarget from "ol/events/Target";
declare type GyeonghwonOptions = ParseOptions & {
    waitingMilliSec?: number;
};
export default class Gyeonghwon extends EventTarget {
    #private;
    waitingMilliSec: number;
    forceLoop: boolean;
    ignoreSingle: boolean;
    constructor(options?: GyeonghwonOptions);
    parseBuffer(buffer: ArrayBufferLike): Promise<Animation>;
    parseURL(url: string): Promise<Animation>;
    animateExistContext(url: string, context: CanvasRenderingContext2D): Promise<Animation>;
    animateNewContext(url: string): Promise<Animation>;
    animateImage(img: HTMLImageElement): Promise<Animation | void>;
    releaseCanvas(canvas: HTMLCanvasElement): void;
}
export {};
