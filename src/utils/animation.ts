"use strict";

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

export class AnimationEvent extends Event {
    readonly now: number;
    readonly tag: string;
    constructor(now: number, tag: string) {
        super('render');
        this.now = now;
        this.tag = tag;
    }
}

export class GAnimation extends EventTarget {
    // Public
    width = 0;
    height = 0;
    numPlays = 0;
    playTime = 0;
    frames: Frame[] = [];
    tag: string;
    private nextRenderTime = 0;
    private fNum = 0;
    private prevF?: Frame;
    private played = false;
    private finished = false;
    private contexts: CanvasRenderingContext2D[] = [];
    private readonly tick: FrameRequestCallback;

    constructor(tag = '') {
        super();
        this.tag = tag;
        const ani = this;
        const renderFrame = (now: number) => {
            const f = ani.fNum++ % ani.frames.length;
            const frame = ani.frames[f];

            if (!(ani.numPlays === 0 || ani.fNum / ani.frames.length <= ani.numPlays)) {
                ani.played = false;
                ani.finished = true;
                return;
            }
            if (f === 0) {
                ani.contexts.forEach(function (ctx: any) {
                    ctx.clearRect(0, 0, ani.width, ani.height);
                });
                ani.prevF = undefined;
                if (frame.disposeOp === 2) frame.disposeOp = 1;
            }
            if (ani.prevF && ani.prevF.disposeOp === 1) {
                ani.contexts.forEach(function (ctx: any) {
                    ctx.clearRect(ani.prevF!.left, ani.prevF!.top, ani.prevF!.width, ani.prevF!.height);
                });
            } else if (ani.prevF && ani.prevF.disposeOp === 2) {
                ani.contexts.forEach(function (ctx: any) {
                    ctx.putImageData(ani.prevF!.iData, ani.prevF!.left, ani.prevF!.top);
                });
            }
            ani.prevF = frame;
            ani.prevF.iData = null;
            if (ani.prevF.disposeOp === 2) {
                ani.prevF.iData = ani.contexts[0].getImageData(frame.left, frame.top, frame.width, frame.height);
            }
            if (frame.blendOp === 0) {
                ani.contexts.forEach(function (ctx) {
                    ctx.clearRect(frame.left, frame.top, frame.width, frame.height);
                });
            }
            ani.contexts.forEach(function (ctx) {
                ctx.drawImage(frame.img, frame.left, frame.top);
            });
            const event = new AnimationEvent(now, this.tag);
            ani.dispatchEvent(event);
            if (ani.nextRenderTime === 0) ani.nextRenderTime = now;
            while (now > ani.nextRenderTime + ani.playTime) ani.nextRenderTime += ani.playTime;
            ani.nextRenderTime += frame.delay;
        };

        this.tick = (now: number) => {
            while (ani.played && ani.nextRenderTime <= now) renderFrame(now);
            if (ani.played) requestAnimationFrame(ani.tick);
        };
    }

    setTag(tag: string) {
        this.tag = tag;
    }

    play() {
        if (this.played || this.finished) return;
        this.rewind();
        this.played = true;
        requestAnimationFrame(this.tick);
    }

    rewind() {
        this.nextRenderTime = 0;
        this.fNum = 0;
        this.prevF = undefined;
        this.played = false;
        this.finished = false;
    }

    addContext(ctx: CanvasRenderingContext2D) {
        if (this.contexts.length > 0) {
            const dat = this.contexts[0].getImageData(0, 0, this.width, this.height);
            ctx.putImageData(dat, 0, 0);
        }
        this.contexts.push(ctx);
        (ctx as any)['_aimg_animation'] = this;
    }

    removeContext(ctx: CanvasRenderingContext2D) {
        const idx = this.contexts.indexOf(ctx);
        if (idx === -1) {
            return;
        }
        this.contexts.splice(idx, 1);
        if (this.contexts.length === 0) {
            this.rewind();
        }
        if ('_aimg_animation' in ctx) {
            delete (ctx as any)['_aimg_animation'];
        }
    }

    removeAllContexts() {
        this.contexts.forEach(ctx => {
            this.removeContext(ctx);
        });
    }

    latestContext() {
        return this.contexts[this.contexts.length - 1];
    }

    isPlayed() { 
        return this.played; 
    }

    isFinished() { 
        return this.finished; 
    }
}

export default GAnimation;