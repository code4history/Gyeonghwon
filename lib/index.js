"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Gyeonghwon_url2promise, _Gyeonghwon_dispatcher, _Gyeonghwon_WaitingBuffer, _Gyeonghwon_animates;
import parseAPNG from './parse_apng';
import parseAGIF from './parse_agif';
import parseWEBP from './parse_webp';
import loadUrl from './loader';
import { gifCheck, pngCheck, webpCheck } from "./support-test";
import BaseEvent from "ol/events/Event";
import EventTarget from "ol/events/Target";
export default class Gyeonghwon extends EventTarget {
    constructor(waitingMilliSec = 10) {
        super();
        _Gyeonghwon_url2promise.set(this, void 0);
        _Gyeonghwon_dispatcher.set(this, void 0);
        _Gyeonghwon_WaitingBuffer.set(this, void 0);
        _Gyeonghwon_animates.set(this, []);
        const self = this;
        if (waitingMilliSec < 10)
            waitingMilliSec = 10;
        this.waitingMilliSec = waitingMilliSec;
        __classPrivateFieldSet(this, _Gyeonghwon_url2promise, {}, "f");
        __classPrivateFieldSet(this, _Gyeonghwon_dispatcher, (event) => {
            const tag = event.tag;
            const now = event.now;
            const setupTimeout = () => {
                const timer_id = setTimeout(() => {
                    self.dispatchEvent(new BaseEvent('need_render'));
                    __classPrivateFieldSet(self, _Gyeonghwon_WaitingBuffer, undefined, "f");
                }, self.waitingMilliSec);
                __classPrivateFieldSet(self, _Gyeonghwon_WaitingBuffer, {
                    timestamp: now,
                    buffer: {},
                    timer_id: timer_id
                }, "f");
                __classPrivateFieldGet(self, _Gyeonghwon_WaitingBuffer, "f").buffer[tag] = true;
            };
            if (!__classPrivateFieldGet(self, _Gyeonghwon_WaitingBuffer, "f")) {
                setupTimeout();
            }
            else {
                if (__classPrivateFieldGet(self, _Gyeonghwon_WaitingBuffer, "f").buffer[tag]) {
                    clearTimeout(__classPrivateFieldGet(self, _Gyeonghwon_WaitingBuffer, "f").timer_id);
                    self.dispatchEvent(new BaseEvent('need_render'));
                    setupTimeout();
                }
                else {
                    __classPrivateFieldGet(self, _Gyeonghwon_WaitingBuffer, "f").buffer[tag] = true;
                }
            }
            return false;
        }, "f");
    }
    parseBuffer(buffer) {
        return pngCheck(buffer) ? parseAPNG(buffer) :
            gifCheck(buffer) ? parseAGIF(buffer) :
                webpCheck(buffer) ? parseWEBP(buffer) :
                    Promise.reject(new Error('Not a supported file (invalid file signature)'));
    }
    parseURL(url) {
        if (!(url in __classPrivateFieldGet(this, _Gyeonghwon_url2promise, "f")))
            __classPrivateFieldGet(this, _Gyeonghwon_url2promise, "f")[url] = loadUrl(url).then(this.parseBuffer);
        return __classPrivateFieldGet(this, _Gyeonghwon_url2promise, "f")[url];
    }
    animateExistContext(url, context) {
        return this.parseURL(url).then((anim) => {
            if (!anim.tag) {
                anim.setTag(url);
                anim.addEventListener('render', __classPrivateFieldGet(this, _Gyeonghwon_dispatcher, "f"));
                __classPrivateFieldGet(this, _Gyeonghwon_animates, "f").push(anim);
            }
            anim.addContext(context);
            anim.play();
            return anim;
        });
    }
    animateNewContext(url) {
        return this.parseURL(url).then((anim) => {
            if (!anim.tag) {
                anim.setTag(url);
                anim.addEventListener('render', __classPrivateFieldGet(this, _Gyeonghwon_dispatcher, "f"));
                __classPrivateFieldGet(this, _Gyeonghwon_animates, "f").push(anim);
            }
            const canvas = document.createElement("canvas");
            canvas.width = anim.width;
            canvas.height = anim.height;
            anim.addContext(canvas.getContext("2d"));
            anim.play();
            return anim;
        });
    }
    animateImage(img) {
        img.setAttribute("data-is-aimg", "progress");
        return this.parseURL(img.src).then((anim) => {
            if (!anim.tag) {
                anim.setTag(img.src);
                anim.addEventListener('render', __classPrivateFieldGet(this, _Gyeonghwon_dispatcher, "f"));
                __classPrivateFieldGet(this, _Gyeonghwon_animates, "f").push(anim);
            }
            img.setAttribute("data-is-aimg", "yes");
            const canvas = document.createElement("canvas");
            canvas.width = anim.width;
            canvas.height = anim.height;
            Array.prototype.slice.call(img.attributes).forEach((attr) => {
                if (["alt", "src", "usemap", "ismap", "data-is-aimg", "width", "height"].indexOf(attr.nodeName) === -1) {
                    canvas.setAttributeNode(attr.cloneNode(false));
                }
            });
            canvas.setAttribute("data-aimg-src", img.src);
            if (img.alt !== "")
                canvas.appendChild(document.createTextNode(img.alt));
            let imgWidth = "", imgHeight = "", val = 0, unit = "";
            if (img.style.width !== "" && img.style.width !== "auto") {
                imgWidth = img.style.width;
            }
            else if (img.hasAttribute("width")) {
                imgWidth = img.getAttribute("width") + "px";
            }
            if (img.style.height !== "" && img.style.height !== "auto") {
                imgHeight = img.style.height;
            }
            else if (img.hasAttribute("height")) {
                imgHeight = img.getAttribute("height") + "px";
            }
            if (imgWidth !== "" && imgHeight === "") {
                val = parseFloat(imgWidth);
                unit = imgWidth.match(/\D+$/)[0];
                imgHeight = Math.round(canvas.height * val / canvas.width) + unit;
            }
            if (imgHeight !== "" && imgWidth === "") {
                val = parseFloat(imgHeight);
                unit = imgHeight.match(/\D+$/)[0];
                imgWidth = Math.round(canvas.width * val / canvas.height) + unit;
            }
            canvas.style.width = imgWidth;
            canvas.style.height = imgHeight;
            const p = img.parentNode;
            p.insertBefore(canvas, img);
            p.removeChild(img);
            anim.addContext(canvas.getContext("2d"));
            anim.play();
            return anim;
        }, (e) => {
            console.log(e);
            img.setAttribute("data-is-aimg", "no");
        });
    }
    releaseCanvas(canvas) {
        const ctx = canvas.getContext("2d");
        if ('_aimg_animation' in ctx) {
            ctx['_aimg_animation'].removeContext(ctx);
        }
    }
}
_Gyeonghwon_url2promise = new WeakMap(), _Gyeonghwon_dispatcher = new WeakMap(), _Gyeonghwon_WaitingBuffer = new WeakMap(), _Gyeonghwon_animates = new WeakMap();
global.Gyeonghwon = Gyeonghwon;
//# sourceMappingURL=index.js.map