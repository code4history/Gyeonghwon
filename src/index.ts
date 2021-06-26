/**
 * API:
 *
 * animateImage(img HTMLImageElement) → Promise()
 *
 * animateExistContext(url String, CanvasRenderingContext2D context) → Promise(Animation)
 * parseBuffer(ArrayBuffer) → Promise(Animation)
 * parseURL(url String) → Promise(Animation)
 */

"use strict";

import parseAPNG from './parse_apng';
import parseAGIF from './parse_agif';
import parseWEBP from './parse_webp';
import { ParseOptions } from './parse_base';
import loadUrl from './loader';
import {gifCheck, pngCheck, webpCheck} from "./support-test";
import Animation, {AnimationEvent} from './animation';
import BaseEvent from "ol/events/Event";
import EventTarget from "ol/events/Target";

type GyeonghwonOptions = ParseOptions & {
  waitingMilliSec?: number;
};

interface Url2Promise {
  [index: string]: Promise<any>;
}

interface WaitingBuffer {
  timestamp: number;
  buffer: {
    [index: string]: boolean;
  },
  timer_id: number;
}

export default class Gyeonghwon extends EventTarget {
  waitingMilliSec: number;
  forceLoop: boolean;
  ignoreSingle: boolean;
  private url2promise: Url2Promise;
  private dispatcher: (event: BaseEvent) => boolean;
  private waitingBuffer?: WaitingBuffer;
  private animates:Animation[] = [];

  constructor(options: GyeonghwonOptions = { ignoreSingle: false, forceLoop: false, waitingMilliSec: 10}) {
    super();
    const self = this;
    if (!options.waitingMilliSec || options.waitingMilliSec < 10) options.waitingMilliSec = 10;
    if (!options.ignoreSingle) options.ignoreSingle = false;
    if (!options.forceLoop) options.forceLoop = false;
    this.waitingMilliSec = options.waitingMilliSec;
    this.forceLoop = options.forceLoop;
    this.ignoreSingle = options.ignoreSingle;
    this.url2promise = {};
    this.dispatcher = (event: BaseEvent) => {
      const tag = (event as AnimationEvent).tag;
      const now = (event as AnimationEvent).now;

      const setupTimeout = () => {
        const timer_id = setTimeout(() => {
          self.dispatchEvent(new BaseEvent('need_render'));
          self.waitingBuffer = undefined;
        }, self.waitingMilliSec);
        self.waitingBuffer = {
          timestamp: now,
          buffer: {},
          timer_id: ((timer_id as unknown) as number)
        };
        self.waitingBuffer.buffer[tag] = true;
      };

      if (!self.waitingBuffer) {
        setupTimeout();
      } else {
        if (self.waitingBuffer.buffer[tag]) {
          clearTimeout(self.waitingBuffer.timer_id);
          self.dispatchEvent(new BaseEvent('need_render'));
          setupTimeout();
        } else {
          self.waitingBuffer.buffer[tag] = true;
        }
      }

      return false;
    };
  }

  /**
   * @param {ArrayBuffer} buffer
   * @return {Promise}
   */
  async parseBuffer(buffer: ArrayBufferLike): Promise<Animation> {
    return pngCheck(buffer) ? parseAPNG(buffer, {ignoreSingle: this.ignoreSingle, forceLoop: this.forceLoop}) :
      gifCheck(buffer) ? parseAGIF(buffer, {ignoreSingle: this.ignoreSingle, forceLoop: this.forceLoop}) :
        webpCheck(buffer) ? parseWEBP(buffer, {ignoreSingle: this.ignoreSingle, forceLoop: this.forceLoop}) :
          Promise.reject(new Error('Not a supported file (invalid file signature)'));
  }

  /**
   * @param {String} url
   * @return {Promise}
   */
  async parseURL(url: string): Promise<Animation> {
    if (!(url in this.url2promise)) this.url2promise[url] = loadUrl(url).then((buffer) => {
      return this.parseBuffer(buffer);
    });
    return this.url2promise[url];
  }

  /**
   * @param {String} url
   * @param {CanvasRenderingContext2D} context
   * @return {Promise}
   */
  async animateExistContext(url: string, context: CanvasRenderingContext2D): Promise<Animation> {
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

  /**
   * @param {String} url
   * @return {Promise}
   */
  async animateNewContext(url: string): Promise<Animation> {
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

  /**
   * @param {HTMLImageElement} img
   * @return {Promise}
   */
  async animateImage(img: HTMLImageElement): Promise<Animation | void> {
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
      return anim;
    } catch (e) {
      console.log(e);
      img.setAttribute("data-is-aimg", "no");
    }
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