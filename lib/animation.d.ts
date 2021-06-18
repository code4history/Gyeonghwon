import EventTarget from "ol/events/Target";
import BaseEvent from "ol/events/Event";
export interface Frame {
    disposeOp: number;
    blendOp: number;
    left: number;
    top: number;
    width: number;
    height: number;
    iData?: any;
    img?: any;
    delay: number;
    data?: Uint8Array;
    gce?: Uint8Array;
    dataParts?: Uint8Array[];
}
export declare class AnimationEvent extends BaseEvent {
    readonly now: number;
    readonly tag: string;
    constructor(now: number, tag: string);
}
declare class GAnimation extends EventTarget {
    #private;
    width: number;
    height: number;
    numPlays: number;
    playTime: number;
    frames: Frame[];
    tag: string;
    constructor(tag?: string);
    setTag(tag: string): void;
    play(): void;
    rewind(): void;
    addContext(ctx: any): void;
    removeContext(ctx: any): void;
    removeAllContexts(): void;
    latestContext(): any;
    isPlayed(): boolean;
    isFinished(): boolean;
}
export default GAnimation;
