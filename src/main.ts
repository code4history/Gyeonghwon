/**
 * API:
 *
 * ifNeeded([ignoreNativeAPNG bool]) → Promise()
 * animateImage(img HTMLImageElement) → Promise()
 *
 * animateContext(url String, CanvasRenderingContext2D context) → Promise(Animation)
 * parseBuffer(ArrayBuffer) → Promise(Animation)
 * parseURL(url String) → Promise(Animation)
 * checkNativeFeatures() → Promise(features)
 */
"use strict";

import parseAPNG from './parse_apng';
import parseAGIF from './parse_agif';
import parseWEBP from './parse_webp';
import loadUrl from './loader';
import {gifCheck, pngCheck, webpCheck} from "./support-test";
import Animation from './animation';

interface Url2Promise {
  [index: string]: Promise<any>;
}

export class Gyeonghwon {
  static url2promise: Url2Promise = {};

  /**
   * @param {ArrayBuffer} buffer
   * @return {Promise}
   */
  static parseBuffer(buffer: ArrayBufferLike): Promise<any> {
    return pngCheck(buffer) ? parseAPNG(buffer) :
      gifCheck(buffer) ? parseAGIF(buffer) :
        webpCheck(buffer) ? parseWEBP(buffer) :
           Promise.reject(new Error('Not a supported file (invalid file signature)'));
  }

  /**
   * @param {String} url
   * @return {Promise}
   */
  static parseURL(url: string) {
    if (!(url in Gyeonghwon.url2promise)) Gyeonghwon.url2promise[url] = loadUrl(url).then(Gyeonghwon.parseBuffer);
    return Gyeonghwon.url2promise[url];
  }

  /**
   * @param {String} url
   * @param {CanvasRenderingContext2D} context
   * @return {Promise}
   */
  static animateContext(url: string, context: CanvasRenderingContext2D): Promise<any> {
    return Gyeonghwon.parseURL(url).then((a: Animation) => {
      a.addContext(context);
      a.play();
      return a;
    });
  }

  /**
   * @param {HTMLImageElement} img
   * @return {Promise}
   */
  static animateImage(img: HTMLImageElement): Promise<any> {
    img.setAttribute("data-is-aimg", "progress");
    return Gyeonghwon.parseURL(img.src).then(
      (anim) => {
        img.setAttribute("data-is-aimg", "yes");
        const canvas = document.createElement("canvas");
        canvas.width = anim.width;
        canvas.height = anim.height;
        Array.prototype.slice.call(img.attributes).forEach((attr: any) => {
          if (["alt", "src", "usemap", "ismap", "data-is-aimg", "width", "height"].indexOf(attr.nodeName) === -1) {
            canvas.setAttributeNode(attr.cloneNode(false));
          }
        });
        canvas.setAttribute("data-aimg-src", img.src);
        if (img.alt !== "") canvas.appendChild(document.createTextNode(img.alt));

        let imgWidth = "", imgHeight = "", val = 0, unit = "";

        if (img.style.width !== "" && img.style.width !== "auto") {
          imgWidth = img.style.width;
        } else if (img.hasAttribute("width")) {
          imgWidth = img.getAttribute("width") + "px";
        }
        if (img.style.height !== "" && img.style.height !== "auto") {
          imgHeight = img.style.height;
        } else if (img.hasAttribute("height")) {
          imgHeight = img.getAttribute("height") + "px";
        }
        if (imgWidth !== "" && imgHeight === "") {
          val = parseFloat(imgWidth);
          unit = imgWidth.match(/\D+$/)![0];
          imgHeight = Math.round(canvas.height * val / canvas.width) + unit;
        }
        if (imgHeight !== "" && imgWidth === "") {
          val = parseFloat(imgHeight);
          unit = imgHeight.match(/\D+$/)![0];
          imgWidth = Math.round(canvas.width * val / canvas.height) + unit;
        }
        canvas.style.width = imgWidth;
        canvas.style.height = imgHeight;

        const p = img.parentNode;
        p!.insertBefore(canvas, img);
        p!.removeChild(img);
        anim.addContext(canvas.getContext("2d"));
        anim.play();
      },
      (e) => {
        console.log(e);
        img.setAttribute("data-is-aimg", "no");
      });
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @return {void}
   */
  releaseCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("2d");
    if ('_aimg_animation' in ctx!) {
      (ctx['_aimg_animation'] as any).removeContext(ctx);
    }
  }
}

// @ts-ignore
global.Gyeonghwon = Gyeonghwon;
/**
 * @param {ArrayBuffer} buffer
 * @return {Promise}
 * /
Gyeonghwon.parseBuffer = function (buffer) {
  return pngCheck(buffer) ? parseAPNG(buffer) :
    gifCheck(buffer) ? parseAGIF(buffer) :
      webpCheck(buffer) ? parseWEBP(buffer) :
        Promise.reject(new Error('Not a supported file (invalid file signature)'));
};* /

var url2promise = {};
/**
 * @param {String} url
 * @return {Promise}
 * /
Gyeonghwon.parseURL = function (url) {
  if (!(url in url2promise)) url2promise[url] = loadUrl(url).then(Gyeonghwon.parseBuffer);
  return url2promise[url];
};

/**
 * @param {String} url
 * @param {CanvasRenderingContext2D} context
 * @return {Promise}
 * /
Gyeonghwon.animateContext = function (url, context) {
  return Gyeonghwon.parseURL(url).then(function (a) {
    a.addContext(context);
    a.play();
    return a;
  });
};

/**
 * @param {HTMLImageElement} img
 * @return {Promise}
 * /
Gyeonghwon.animateImage = function (img) {
  img.setAttribute("data-is-aimg", "progress");
  return Gyeonghwon.parseURL(img.src).then(
    function (anim) {
      img.setAttribute("data-is-aimg", "yes");
      var canvas = document.createElement("canvas");
      canvas.width = anim.width;
      canvas.height = anim.height;
      Array.prototype.slice.call(img.attributes).forEach(function (attr) {
        if (["alt", "src", "usemap", "ismap", "data-is-aimg", "width", "height"].indexOf(attr.nodeName) === -1) {
          canvas.setAttributeNode(attr.cloneNode(false));
        }
      });
      canvas.setAttribute("data-aimg-src", img.src);
      if (img.alt !== "") canvas.appendChild(document.createTextNode(img.alt));

      var imgWidth = "", imgHeight = "", val = 0, unit = "";

      if (img.style.width !== "" && img.style.width !== "auto") {
        imgWidth = img.style.width;
      } else if (img.hasAttribute("width")) {
        imgWidth = img.getAttribute("width") + "px";
      }
      if (img.style.height !== "" && img.style.height !== "auto") {
        imgHeight = img.style.height;
      } else if (img.hasAttribute("height")) {
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

      var p = img.parentNode;
      p.insertBefore(canvas, img);
      p.removeChild(img);
      anim.addContext(canvas.getContext("2d"));
      anim.play();
    },
    function (e) {
      console.log(e);
      img.setAttribute("data-is-aimg", "no");
    });
};

/**
 * @param {HTMLCanvasElement} canvas
 * @return {void}
 * /
Gyeonghwon.releaseCanvas = function(canvas) {
  var ctx = canvas.getContext("2d");
  if ('_aimg_animation' in ctx) {
    ctx['_aimg_animation'].removeContext(ctx);
  }
};*/