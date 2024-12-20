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
export declare class AnimationEvent extends Event {
    readonly now: number;
    readonly tag: string;
    constructor(now: number, tag: string);
}
export declare class GAnimation extends EventTarget {
    width: number;
    height: number;
    numPlays: number;
    playTime: number;
    frames: Frame[];
    tag: string;
    private nextRenderTime;
    private fNum;
    private prevF?;
    private played;
    private finished;
    private contexts;
    private readonly tick;
    constructor(tag?: string);
    setTag(tag: string): void;
    play(): void;
    rewind(): void;
    addContext(ctx: CanvasRenderingContext2D): void;
    removeContext(ctx: CanvasRenderingContext2D): void;
    removeAllContexts(): void;
    latestContext(): CanvasRenderingContext2D;
    isPlayed(): boolean;
    isFinished(): boolean;
}
export default GAnimation;
