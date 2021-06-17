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
declare class GAnimation {
    #private;
    width: number;
    height: number;
    numPlays: number;
    playTime: number;
    frames: Frame[];
    constructor();
    play(): void;
    rewind(): void;
    addContext(ctx: any): void;
    removeContext(ctx: any): void;
    isPlayed(): boolean;
    isFinished(): boolean;
}
export default GAnimation;
