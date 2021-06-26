"use strict";
import EventTarget from "ol/events/Target";
import BaseEvent from "ol/events/Event";
export class AnimationEvent extends BaseEvent {
    constructor(now, tag) {
        super('render');
        this.now = now;
        this.tag = tag;
    }
}
class GAnimation extends EventTarget {
    constructor(tag = '') {
        super();
        this.width = 0;
        this.height = 0;
        this.numPlays = 0;
        this.playTime = 0;
        this.frames = [];
        this.nextRenderTime = 0;
        this.fNum = 0;
        this.played = false;
        this.finished = false;
        this.contexts = [];
        this.tag = tag;
        const ani = this;
        const renderFrame = (now) => {
            const f = ani.fNum++ % ani.frames.length;
            const frame = ani.frames[f];
            if (!(ani.numPlays === 0 || ani.fNum / ani.frames.length <= ani.numPlays)) {
                ani.played = false;
                ani.finished = true;
                return;
            }
            if (f === 0) {
                ani.contexts.forEach(function (ctx) { ctx.clearRect(0, 0, ani.width, ani.height); });
                ani.prevF = undefined;
                if (frame.disposeOp === 2)
                    frame.disposeOp = 1;
            }
            if (ani.prevF && ani.prevF.disposeOp === 1) {
                ani.contexts.forEach(function (ctx) { ctx.clearRect(ani.prevF.left, ani.prevF.top, ani.prevF.width, ani.prevF.height); });
            }
            else if (ani.prevF && ani.prevF.disposeOp === 2) {
                ani.contexts.forEach(function (ctx) { ctx.putImageData(ani.prevF.iData, ani.prevF.left, ani.prevF.top); });
            }
            ani.prevF = frame;
            ani.prevF.iData = null;
            if (ani.prevF.disposeOp === 2) {
                ani.prevF.iData = ani.contexts[0].getImageData(frame.left, frame.top, frame.width, frame.height);
            }
            if (frame.blendOp === 0) {
                ani.contexts.forEach(function (ctx) { ctx.clearRect(frame.left, frame.top, frame.width, frame.height); });
            }
            ani.contexts.forEach(function (ctx) { ctx.drawImage(frame.img, frame.left, frame.top); });
            const event = new AnimationEvent(now, this.tag);
            ani.dispatchEvent(event);
            if (ani.nextRenderTime === 0)
                ani.nextRenderTime = now;
            while (now > ani.nextRenderTime + ani.playTime)
                ani.nextRenderTime += ani.playTime;
            ani.nextRenderTime += frame.delay;
        };
        this.tick = (now) => {
            while (ani.played && ani.nextRenderTime <= now)
                renderFrame(now);
            if (ani.played)
                requestAnimationFrame(ani.tick);
        };
    }
    setTag(tag) {
        this.tag = tag;
    }
    play() {
        if (this.played || this.finished)
            return;
        this.rewind();
        this.played = true;
        requestAnimationFrame(this.tick);
    }
    ;
    rewind() {
        this.nextRenderTime = 0;
        this.fNum = 0;
        this.prevF = undefined;
        this.played = false;
        this.finished = false;
    }
    ;
    addContext(ctx) {
        if (this.contexts.length > 0) {
            const dat = this.contexts[0].getImageData(0, 0, this.width, this.height);
            ctx.putImageData(dat, 0, 0);
        }
        this.contexts.push(ctx);
        ctx['_aimg_animation'] = this;
    }
    ;
    removeContext(ctx) {
        const idx = this.contexts.indexOf(ctx);
        if (idx === -1) {
            return;
        }
        this.contexts.splice(idx, 1);
        if (this.contexts.length === 0) {
            this.rewind();
        }
        if ('_aimg_animation' in ctx) {
            delete ctx['_aimg_animation'];
        }
    }
    ;
    removeAllContexts() {
        this.contexts.forEach(ctx => {
            this.removeContext(ctx);
        });
    }
    latestContext() {
        return this.contexts[this.contexts.length - 1];
    }
    isPlayed() { return this.played; }
    ;
    isFinished() { return this.finished; }
    ;
}
export default GAnimation;
//# sourceMappingURL=animation.js.map