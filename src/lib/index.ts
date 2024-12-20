"use strict";

import parseAPNG from './parsers/parse_apng';
import parseAGIF from './parsers/parse_agif';
import parseWEBP from './parsers/parse_webp';
import { ParseOptions } from './parsers/parse_base';
import loadUrl from './utils/loader';
import { gifCheck, pngCheck, webpCheck } from "./utils/support";
import GAnimation from './utils/animation';

type GyeonghwonOptions = ParseOptions & {
    waitingMilliSec?: number;
};

interface WaitingBuffer {
    buffer: ArrayBuffer;
    ignoreSingle: boolean;
    forceLoop: boolean;
}

export default class Gyeonghwon extends EventTarget {
    private url2promise: { [index: string]: Promise<GAnimation> } = {};
    private waitingBuffers: { [index: string]: WaitingBuffer } = {};
    private waitingMilliSec: number;
    private forceLoop: boolean;
    private ignoreSingle: boolean;

    constructor(options: GyeonghwonOptions = {}) {
        super();
        this.waitingMilliSec = options.waitingMilliSec || 10;
        this.forceLoop = options.forceLoop || false;
        this.ignoreSingle = options.ignoreSingle || false;
    }

    async parseURL(url: string): Promise<GAnimation> {
        if (url in this.waitingBuffers) {
            const buf = this.waitingBuffers[url];
            await new Promise(resolve => setTimeout(resolve, this.waitingMilliSec));
            return this.parseBuffer(buf.buffer, {
                ignoreSingle: buf.ignoreSingle,
                forceLoop: buf.forceLoop
            });
        }
        if (!(url in this.url2promise)) {
            this.url2promise[url] = loadUrl(url)
                .then(buffer => this.parseBuffer(buffer));
        }
        return this.url2promise[url];
    }

    async parseBuffer(buffer: ArrayBuffer, options: ParseOptions = {}): Promise<GAnimation> {
      const bytes = new Uint8Array(buffer);
      const ignoreSingle = 'ignoreSingle' in options ? options.ignoreSingle : this.ignoreSingle;
      const forceLoop = 'forceLoop' in options ? options.forceLoop : this.forceLoop;
  
      if (bytes.length >= 3 && gifCheck(buffer)) {
          return parseAGIF(buffer, { ignoreSingle, forceLoop });
      }
      if (bytes.length >= 4 && pngCheck(buffer)) {
          return parseAPNG(buffer, { ignoreSingle, forceLoop });
      }
      if (bytes.length >= 12 && webpCheck(buffer)) {
          return parseWEBP(buffer, { ignoreSingle, forceLoop });
      }
      throw new Error('Unknown image format');
  }

    async animateImage(img: HTMLImageElement): Promise<GAnimation | void> {
        img.setAttribute('data-is-aimg', 'progress');
        try {
            const anim = await this.parseURL(img.src);
            if (!anim.tag) {
                anim.setTag(img.src);
            }
            img.setAttribute('data-is-aimg', 'yes');
            
            const canvas = document.createElement('canvas');
            canvas.width = anim.width;
            canvas.height = anim.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get 2d context');
            
            anim.addContext(ctx);
            anim.play();
            return anim;
        } catch (e) {
            img.setAttribute('data-is-aimg', 'no');
            throw e;
        }
    }
}

// For browser global
(globalThis as any).Gyeonghwon = Gyeonghwon;