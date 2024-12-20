import { ParseOptions } from './parsers/parse_base';
import { default as GAnimation } from './utils/animation';
type GyeonghwonOptions = ParseOptions & {
    waitingMilliSec?: number;
};
export default class Gyeonghwon extends EventTarget {
    private url2promise;
    private waitingBuffers;
    private waitingMilliSec;
    private forceLoop;
    private ignoreSingle;
    constructor(options?: GyeonghwonOptions);
    parseURL(url: string): Promise<GAnimation>;
    parseBuffer(buffer: ArrayBuffer, options?: ParseOptions): Promise<GAnimation>;
    animateImage(img: HTMLImageElement): Promise<GAnimation | void>;
}
export {};
