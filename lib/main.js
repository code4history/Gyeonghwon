"use strict";
import parseAPNG from './parse_apng';
import parseAGIF from './parse_agif';
import parseWEBP from './parse_webp';
import loadUrl from './loader';
import { gifCheck, pngCheck, webpCheck } from "./support-test";
export class Gyeonghwon {
    static parseBuffer(buffer) {
        return pngCheck(buffer) ? parseAPNG(buffer) :
            gifCheck(buffer) ? parseAGIF(buffer) :
                webpCheck(buffer) ? parseWEBP(buffer) :
                    Promise.reject(new Error('Not a supported file (invalid file signature)'));
    }
    static parseURL(url) {
        if (!(url in Gyeonghwon.url2promise))
            Gyeonghwon.url2promise[url] = loadUrl(url).then(Gyeonghwon.parseBuffer);
        return Gyeonghwon.url2promise[url];
    }
    static animateContext(url, context) {
        return Gyeonghwon.parseURL(url).then((a) => {
            a.addContext(context);
            a.play();
            return a;
        });
    }
    static animateImage(img) {
        img.setAttribute("data-is-aimg", "progress");
        return Gyeonghwon.parseURL(img.src).then((anim) => {
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
Gyeonghwon.url2promise = {};
global.Gyeonghwon = Gyeonghwon;
//# sourceMappingURL=main.js.map