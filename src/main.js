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

const support = require("./support-test");
const parseAPNG = require("./parse_apng");
const parseAGIF = require("./parse_agif");
const parseWEBP = require("./parse_webp");
const loadUrl = require('./loader');

const AnimImg = global.AnimImg = {};

AnimImg.checkNativeFeatures = support.checkNativeFeatures;
AnimImg.ifNeeded = support.ifNeeded;

/**
 * @param {ArrayBuffer} buffer
 * @return {Promise}
 */
AnimImg.parseBuffer = function (buffer) {
  return support.pngCheck(buffer) ? parseAPNG(buffer) :
    support.gifCheck(buffer) ? parseAGIF(buffer) :
      support.webpCheck(buffer) ? parseWEBP(buffer) :
        Promise.reject(new Error('Not a supported file (invalid file signature)'));
};

var url2promise = {};
/**
 * @param {String} url
 * @return {Promise}
 */
AnimImg.parseURL = function (url) {
  if (!(url in url2promise)) url2promise[url] = loadUrl(url).then(AnimImg.parseBuffer);
  return url2promise[url];
};

/**
 * @param {String} url
 * @param {CanvasRenderingContext2D} context
 * @return {Promise}
 */
AnimImg.animateContext = function (url, context) {
  return AnimImg.parseURL(url).then(function (a) {
    a.addContext(context);
    a.play();
    return a;
  });
};

/**
 * @param {HTMLImageElement} img
 * @return {Promise}
 */
AnimImg.animateImage = function (img) {
  img.setAttribute("data-is-aimg", "progress");
  console.log(img);
  return AnimImg.parseURL(img.src).then(
    function (anim) {
      console.log(anim);
      img.setAttribute("data-is-aimg", "yes");
      var canvas = document.createElement("canvas");
      canvas.width = anim.width;
      canvas.height = anim.height;
      Array.prototype.slice.call(img.attributes).forEach(function (attr) {
        if (["alt", "src", "usemap", "ismap", "data-is-aimg", "width", "height"].indexOf(attr.nodeName) == -1) {
          canvas.setAttributeNode(attr.cloneNode(false));
        }
      });
      canvas.setAttribute("data-aimg-src", img.src);
      if (img.alt != "") canvas.appendChild(document.createTextNode(img.alt));

      var imgWidth = "", imgHeight = "", val = 0, unit = "";

      if (img.style.width != "" && img.style.width != "auto") {
        imgWidth = img.style.width;
      } else if (img.hasAttribute("width")) {
        imgWidth = img.getAttribute("width") + "px";
      }
      if (img.style.height != "" && img.style.height != "auto") {
        imgHeight = img.style.height;
      } else if (img.hasAttribute("height")) {
        imgHeight = img.getAttribute("height") + "px";
      }
      if (imgWidth != "" && imgHeight == "") {
        val = parseFloat(imgWidth);
        unit = imgWidth.match(/\D+$/)[0];
        imgHeight = Math.round(canvas.height * val / canvas.width) + unit;
      }
      if (imgHeight != "" && imgWidth == "") {
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
 */
AnimImg.releaseCanvas = function(canvas) {
  var ctx = canvas.getContext("2d");
  if ('_aimg_animation' in ctx) {
    ctx['_aimg_animation'].removeContext(ctx);
  }
};