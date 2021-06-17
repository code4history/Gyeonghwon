"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _GAnimation_nextRenderTime, _GAnimation_fNum, _GAnimation_prevF, _GAnimation_played, _GAnimation_finished, _GAnimation_contexts, _GAnimation_tick;
class GAnimation {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.numPlays = 0;
        this.playTime = 0;
        this.frames = [];
        _GAnimation_nextRenderTime.set(this, 0);
        _GAnimation_fNum.set(this, 0);
        _GAnimation_prevF.set(this, void 0);
        _GAnimation_played.set(this, false);
        _GAnimation_finished.set(this, false);
        _GAnimation_contexts.set(this, []);
        _GAnimation_tick.set(this, void 0);
        const ani = this;
        const renderFrame = (now) => {
            var _a, _b, _c, _d;
            const f = (__classPrivateFieldSet(_a = ani, _GAnimation_fNum, (_b = +__classPrivateFieldGet(_a, _GAnimation_fNum, "f")) + 1, "f"), _b) % ani.frames.length;
            const frame = ani.frames[f];
            if (!(ani.numPlays === 0 || __classPrivateFieldGet(ani, _GAnimation_fNum, "f") / ani.frames.length <= ani.numPlays)) {
                __classPrivateFieldSet(ani, _GAnimation_played, false, "f");
                __classPrivateFieldSet(ani, _GAnimation_finished, true, "f");
                return;
            }
            if (f === 0) {
                __classPrivateFieldGet(ani, _GAnimation_contexts, "f").forEach(function (ctx) { ctx.clearRect(0, 0, ani.width, ani.height); });
                __classPrivateFieldSet(ani, _GAnimation_prevF, undefined, "f");
                if (frame.disposeOp === 2)
                    frame.disposeOp = 1;
            }
            if (__classPrivateFieldGet(ani, _GAnimation_prevF, "f") && __classPrivateFieldGet(ani, _GAnimation_prevF, "f").disposeOp === 1) {
                __classPrivateFieldGet(ani, _GAnimation_contexts, "f").forEach(function (ctx) { ctx.clearRect(__classPrivateFieldGet(ani, _GAnimation_prevF, "f").left, __classPrivateFieldGet(ani, _GAnimation_prevF, "f").top, __classPrivateFieldGet(ani, _GAnimation_prevF, "f").width, __classPrivateFieldGet(ani, _GAnimation_prevF, "f").height); });
            }
            else if (__classPrivateFieldGet(ani, _GAnimation_prevF, "f") && __classPrivateFieldGet(ani, _GAnimation_prevF, "f").disposeOp === 2) {
                __classPrivateFieldGet(ani, _GAnimation_contexts, "f").forEach(function (ctx) { ctx.putImageData(__classPrivateFieldGet(ani, _GAnimation_prevF, "f").iData, __classPrivateFieldGet(ani, _GAnimation_prevF, "f").left, __classPrivateFieldGet(ani, _GAnimation_prevF, "f").top); });
            }
            __classPrivateFieldSet(ani, _GAnimation_prevF, frame, "f");
            __classPrivateFieldGet(ani, _GAnimation_prevF, "f").iData = null;
            if (__classPrivateFieldGet(ani, _GAnimation_prevF, "f").disposeOp === 2) {
                __classPrivateFieldGet(ani, _GAnimation_prevF, "f").iData = __classPrivateFieldGet(ani, _GAnimation_contexts, "f")[0].getImageData(frame.left, frame.top, frame.width, frame.height);
            }
            if (frame.blendOp === 0) {
                __classPrivateFieldGet(ani, _GAnimation_contexts, "f").forEach(function (ctx) { ctx.clearRect(frame.left, frame.top, frame.width, frame.height); });
            }
            __classPrivateFieldGet(ani, _GAnimation_contexts, "f").forEach(function (ctx) { ctx.drawImage(frame.img, frame.left, frame.top); });
            if (__classPrivateFieldGet(ani, _GAnimation_nextRenderTime, "f") === 0)
                __classPrivateFieldSet(ani, _GAnimation_nextRenderTime, now, "f");
            while (now > __classPrivateFieldGet(ani, _GAnimation_nextRenderTime, "f") + ani.playTime)
                __classPrivateFieldSet(_c = ani, _GAnimation_nextRenderTime, __classPrivateFieldGet(_c, _GAnimation_nextRenderTime, "f") + ani.playTime, "f");
            __classPrivateFieldSet(_d = ani, _GAnimation_nextRenderTime, __classPrivateFieldGet(_d, _GAnimation_nextRenderTime, "f") + frame.delay, "f");
        };
        __classPrivateFieldSet(this, _GAnimation_tick, (now) => {
            while (__classPrivateFieldGet(ani, _GAnimation_played, "f") && __classPrivateFieldGet(ani, _GAnimation_nextRenderTime, "f") <= now)
                renderFrame(now);
            if (__classPrivateFieldGet(ani, _GAnimation_played, "f"))
                requestAnimationFrame(__classPrivateFieldGet(ani, _GAnimation_tick, "f"));
        }, "f");
    }
    play() {
        if (__classPrivateFieldGet(this, _GAnimation_played, "f") || __classPrivateFieldGet(this, _GAnimation_finished, "f"))
            return;
        this.rewind();
        __classPrivateFieldSet(this, _GAnimation_played, true, "f");
        requestAnimationFrame(__classPrivateFieldGet(this, _GAnimation_tick, "f"));
    }
    ;
    rewind() {
        __classPrivateFieldSet(this, _GAnimation_nextRenderTime, 0, "f");
        __classPrivateFieldSet(this, _GAnimation_fNum, 0, "f");
        __classPrivateFieldSet(this, _GAnimation_prevF, undefined, "f");
        __classPrivateFieldSet(this, _GAnimation_played, false, "f");
        __classPrivateFieldSet(this, _GAnimation_finished, false, "f");
    }
    ;
    addContext(ctx) {
        if (__classPrivateFieldGet(this, _GAnimation_contexts, "f").length > 0) {
            const dat = __classPrivateFieldGet(this, _GAnimation_contexts, "f")[0].getImageData(0, 0, this.width, this.height);
            ctx.putImageData(dat, 0, 0);
        }
        __classPrivateFieldGet(this, _GAnimation_contexts, "f").push(ctx);
        ctx['_aimg_animation'] = this;
    }
    ;
    removeContext(ctx) {
        const idx = __classPrivateFieldGet(this, _GAnimation_contexts, "f").indexOf(ctx);
        if (idx === -1) {
            return;
        }
        __classPrivateFieldGet(this, _GAnimation_contexts, "f").splice(idx, 1);
        if (__classPrivateFieldGet(this, _GAnimation_contexts, "f").length === 0) {
            this.rewind();
        }
        if ('_aimg_animation' in ctx) {
            delete ctx['_aimg_animation'];
        }
    }
    ;
    isPlayed() { return __classPrivateFieldGet(this, _GAnimation_played, "f"); }
    ;
    isFinished() { return __classPrivateFieldGet(this, _GAnimation_finished, "f"); }
    ;
}
_GAnimation_nextRenderTime = new WeakMap(), _GAnimation_fNum = new WeakMap(), _GAnimation_prevF = new WeakMap(), _GAnimation_played = new WeakMap(), _GAnimation_finished = new WeakMap(), _GAnimation_contexts = new WeakMap(), _GAnimation_tick = new WeakMap();
export default GAnimation;
//# sourceMappingURL=animation.js.map