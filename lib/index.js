"use strict";
import parseAPNG from './parse_apng';
import parseAGIF from './parse_agif';
import parseWEBP from './parse_webp';
import loadUrl from './loader';
import { gifCheck, pngCheck, webpCheck } from "./support-test";
import BaseEvent from "ol/events/Event";
import EventTarget from "ol/events/Target";
export default class Gyeonghwon extends EventTarget {
    constructor(options = { ignoreSingle: false, forceLoop: false, waitingMilliSec: 10 }) {
        super();
        this.animates = [];
        const self = this;
        if (!options.waitingMilliSec || options.waitingMilliSec < 10)
            options.waitingMilliSec = 10;
        if (!options.ignoreSingle)
            options.ignoreSingle = false;
        if (!options.forceLoop)
            options.forceLoop = false;
        this.waitingMilliSec = options.waitingMilliSec;
        this.forceLoop = options.forceLoop;
        this.ignoreSingle = options.ignoreSingle;
        this.url2promise = {};
        this.dispatcher = (event) => {
            const tag = event.tag;
            const now = event.now;
            const setupTimeout = () => {
                const timer_id = setTimeout(() => {
                    self.dispatchEvent(new BaseEvent('need_render'));
                    self.waitingBuffer = undefined;
                }, self.waitingMilliSec);
                self.waitingBuffer = {
                    timestamp: now,
                    buffer: {},
                    timer_id: timer_id
                };
                self.waitingBuffer.buffer[tag] = true;
            };
            if (!self.waitingBuffer) {
                setupTimeout();
            }
            else {
                if (self.waitingBuffer.buffer[tag]) {
                    clearTimeout(self.waitingBuffer.timer_id);
                    self.dispatchEvent(new BaseEvent('need_render'));
                    setupTimeout();
                }
                else {
                    self.waitingBuffer.buffer[tag] = true;
                }
            }
            return false;
        };
    }
    async parseBuffer(buffer) {
        return pngCheck(buffer) ? parseAPNG(buffer, { ignoreSingle: this.ignoreSingle, forceLoop: this.forceLoop }) :
            gifCheck(buffer) ? parseAGIF(buffer, { ignoreSingle: this.ignoreSingle, forceLoop: this.forceLoop }) :
                webpCheck(buffer) ? parseWEBP(buffer, { ignoreSingle: this.ignoreSingle, forceLoop: this.forceLoop }) :
                    Promise.reject(new Error('Not a supported file (invalid file signature)'));
    }
    async parseURL(url) {
        if (!(url in this.url2promise))
            this.url2promise[url] = loadUrl(url).then((buffer) => {
                return this.parseBuffer(buffer);
            });
        return this.url2promise[url];
    }
    async animateExistContext(url, context) {
        const anim = await this.parseURL(url);
        if (!anim.tag) {
            anim.setTag(url);
            anim.addEventListener('render', this.dispatcher);
            this.animates.push(anim);
        }
        anim.addContext(context);
        anim.play();
        return anim;
    }
    async animateNewContext(url) {
        const anim = await this.parseURL(url);
        if (!anim.tag) {
            anim.setTag(url);
            anim.addEventListener('render', this.dispatcher);
            this.animates.push(anim);
        }
        const canvas = document.createElement("canvas");
        canvas.width = anim.width;
        canvas.height = anim.height;
        anim.addContext(canvas.getContext("2d"));
        anim.play();
        return anim;
    }
    async animateImage(img) {
        img.setAttribute("data-is-aimg", "progress");
        const anim = await this.parseURL(img.src);
        try {
            if (!anim.tag) {
                anim.setTag(img.src);
                anim.addEventListener('render', this.dispatcher);
                this.animates.push(anim);
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
        }
        catch (e) {
            console.log(e);
            img.setAttribute("data-is-aimg", "no");
        }
    }
    releaseCanvas(canvas) {
        const ctx = canvas.getContext("2d");
        if ('_aimg_animation' in ctx) {
            ctx['_aimg_animation'].removeContext(ctx);
        }
    }
}
global.Gyeonghwon = Gyeonghwon;
//# sourceMappingURL=index.js.map