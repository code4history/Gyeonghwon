/*! For license information please see index.js.LICENSE.txt */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Tin=e():t.Tin=e()}(this,(function(){return(()=>{var t={868:t=>{"use strict";t.exports=function(){this.width=0,this.height=0,this.numPlays=0,this.playTime=0,this.frames=[],this.play=function(){i||o||(this.rewind(),i=!0,requestAnimationFrame(s))},this.rewind=function(){e=0,n=0,r=null,i=!1,o=!1},this.addContext=function(t){if(a.length>0){var e=a[0].getImageData(0,0,this.width,this.height);t.putImageData(e,0,0)}a.push(t),t._apng_animation=this},this.removeContext=function(t){var e=a.indexOf(t);-1!==e&&(a.splice(e,1),0===a.length&&this.rewind(),"_apng_animation"in t&&delete t._apng_animation)},this.isPlayed=function(){return i},this.isFinished=function(){return o};var t=this,e=0,n=0,r=null,i=!1,o=!1,a=[],s=function(t){for(;i&&e<=t;)u(t);i&&requestAnimationFrame(s)},u=function(s){var u=n++%t.frames.length,c=t.frames[u];if(!(0==t.numPlays||n/t.frames.length<=t.numPlays))return i=!1,void(o=!0);for(0==u&&(a.forEach((function(e){e.clearRect(0,0,t.width,t.height)})),r=null,2==c.disposeOp&&(c.disposeOp=1)),r&&1==r.disposeOp?a.forEach((function(t){t.clearRect(r.left,r.top,r.width,r.height)})):r&&2==r.disposeOp&&a.forEach((function(t){t.putImageData(r.iData,r.left,r.top)})),(r=c).iData=null,2==r.disposeOp&&(r.iData=a[0].getImageData(c.left,c.top,c.width,c.height)),0==c.blendOp&&a.forEach((function(t){t.clearRect(c.left,c.top,c.width,c.height)})),a.forEach((function(t){t.drawImage(c.img,c.left,c.top)})),0==e&&(e=s);s>e+t.playTime;)e+=t.playTime;e+=c.delay}}},445:t=>{"use strict";for(var e=new Uint32Array(256),n=0;n<256;n++){for(var r=n,i=0;i<8;i++)r=1&r?3988292384^r>>>1:r>>>1;e[n]=r}t.exports=function(t,n,r){for(var i=-1,o=n=n||0,a=n+(r=r||t.length-n);o<a;o++)i=i>>>8^e[255&(i^t[o])];return-1^i}},398:(t,e,n)=>{"use strict";var r=r||n(702).Promise;t.exports=function(t){return new r((function(e,n){var r=new XMLHttpRequest;r.open("GET",t),r.responseType="arraybuffer",r.onload=function(){200==this.status?e(this.response):n(this)},r.send()}))}},510:(t,e,n)=>{"use strict";var r=r||n(702).Promise,i=n(868),o=n(445),a=new Uint8Array([137,80,78,71,13,10,26,10]);t.exports=function(t){var e=new Uint8Array(t);return new r((function(t,n){for(var r=0;r<a.length;r++)if(a[r]!=e[r])return void n("Not a PNG file (invalid file signature)");var o=!1;if(s(e,(function(t){return"acTL"!=t||(o=!0,!1)})),o){var l=[],v=[],A=null,g=null,m=new i;if(s(e,(function(t,e,n,r){switch(t){case"IHDR":A=e.subarray(n+8,n+8+r),m.width=u(e,n+8),m.height=u(e,n+12);break;case"acTL":m.numPlays=u(e,n+8+4);break;case"fcTL":g&&m.frames.push(g),(g={}).width=u(e,n+8+4),g.height=u(e,n+8+8),g.left=u(e,n+8+12),g.top=u(e,n+8+16);var i=c(e,n+8+20),o=c(e,n+8+22);0==o&&(o=100),g.delay=1e3*i/o,g.delay<=10&&(g.delay=100),m.playTime+=g.delay,g.disposeOp=h(e,n+8+24),g.blendOp=h(e,n+8+25),g.dataParts=[];break;case"fdAT":g&&g.dataParts.push(e.subarray(n+8+4,n+8+r));break;case"IDAT":g&&g.dataParts.push(e.subarray(n+8,n+8+r));break;case"IEND":v.push(f(e,n,12+r));break;default:l.push(f(e,n,12+r))}})),g&&m.frames.push(g),0!=m.frames.length)for(var y=0,w=new Blob(l),_=new Blob(v),b=0;b<m.frames.length;b++){g=m.frames[b];var x=[];x.push(a),A.set(p(g.width),0),A.set(p(g.height),4),x.push(d("IHDR",A)),x.push(w);for(var P=0;P<g.dataParts.length;P++)x.push(d("IDAT",g.dataParts[P]));x.push(_);var E=URL.createObjectURL(new Blob(x,{type:"image/png"}));delete g.dataParts,x=null,g.img=document.createElement("img"),g.img.onload=function(){URL.revokeObjectURL(this.src),++y==m.frames.length&&t(m)},g.img.onerror=function(){n("Image creation error")},g.img.src=E}else n("Not an animated PNG")}else n("Not an animated PNG")}))};var s=function(t,e){var n=8;do{var r=u(t,n),i=l(t,n+4,4),o=e(i,t,n,r);n+=12+r}while(!1!==o&&"IEND"!=i&&n<t.length)},u=function(t,e){var n=0;n+=t[0+e]<<24>>>0;for(var r=1;r<4;r++)n+=t[r+e]<<8*(3-r);return n},c=function(t,e){for(var n=0,r=0;r<2;r++)n+=t[r+e]<<8*(1-r);return n},h=function(t,e){return t[e]},f=function(t,e,n){var r=new Uint8Array(n);return r.set(t.subarray(e,e+n)),r},l=function(t,e,n){var r=Array.prototype.slice.call(t.subarray(e,e+n));return String.fromCharCode.apply(String,r)},p=function(t){return[t>>>24&255,t>>>16&255,t>>>8&255,255&t]},d=function(t,e){var n=t.length+e.length,r=new Uint8Array(new ArrayBuffer(n+8));r.set(p(e.length),0),r.set(function(t){for(var e=[],n=0;n<t.length;n++)e.push(t.charCodeAt(n));return e}(t),4),r.set(e,8);var i=o(r,4,n);return r.set(p(i),n+4),r}},78:(t,e,n)=>{"use strict";var r,i,o=o||n(702).Promise,a=(r=function(t){var e=document.createElement("canvas"),r={TypedArrays:"ArrayBuffer"in n.g,BlobURLs:"URL"in n.g,requestAnimationFrame:"requestAnimationFrame"in n.g,pageProtocol:"http:"==location.protocol||"https:"==location.protocol,canvas:"getContext"in document.createElement("canvas"),APNG:!1};if(r.canvas){var i=new Image;i.onload=function(){var n=e.getContext("2d");n.drawImage(i,0,0),r.APNG=0===n.getImageData(0,0,1,1).data[3],t(r)},i.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg=="}else t(r)},i=null,function(t){return i||(i=new o(r)),t&&i.then(t),i});t.exports={checkNativeFeatures:a,ifNeeded:function(t){return void 0===t&&(t=!1),a().then((function(e){if(e.APNG&&!t)reject();else{var n=!0;for(var r in e)e.hasOwnProperty(r)&&"APNG"!=r&&(n=n&&e[r])}}))}}},702:function(t,e,n){t.exports=function(){"use strict";function t(t){return"function"==typeof t}var e=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},r=0,i=void 0,o=void 0,a=function(t,e){p[r]=t,p[r+1]=e,2===(r+=2)&&(o?o(d):y())};var s="undefined"!=typeof window?window:void 0,u=s||{},c=u.MutationObserver||u.WebKitMutationObserver,h="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),f="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel;function l(){var t=setTimeout;return function(){return t(d,1)}}var p=new Array(1e3);function d(){for(var t=0;t<r;t+=2)(0,p[t])(p[t+1]),p[t]=void 0,p[t+1]=void 0;r=0}var v,A,g,m,y=void 0;function w(t,e){var n=this,r=new this.constructor(x);void 0===r[b]&&D(r);var i=n._state;if(i){var o=arguments[i-1];a((function(){return R(i,r,o,n._result)}))}else B(n,r,t,e);return r}function _(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var e=new this(x);return N(e,t),e}y=h?function(){return process.nextTick(d)}:c?(A=0,g=new c(d),m=document.createTextNode(""),g.observe(m,{characterData:!0}),function(){m.data=A=++A%2}):f?((v=new MessageChannel).port1.onmessage=d,function(){return v.port2.postMessage(0)}):void 0===s?function(){try{var t=Function("return this")().require("vertx");return void 0!==(i=t.runOnLoop||t.runOnContext)?function(){i(d)}:l()}catch(t){return l()}}():l();var b=Math.random().toString(36).substring(2);function x(){}var P=void 0;function E(e,n,r){n.constructor===e.constructor&&r===w&&n.constructor.resolve===_?function(t,e){1===e._state?C(t,e._result):2===e._state?j(t,e._result):B(e,void 0,(function(e){return N(t,e)}),(function(e){return j(t,e)}))}(e,n):void 0===r?C(e,n):t(r)?function(t,e,n){a((function(t){var r=!1,i=function(t,e,n,r){try{t.call(e,n,r)}catch(t){return t}}(n,e,(function(n){r||(r=!0,e!==n?N(t,n):C(t,n))}),(function(e){r||(r=!0,j(t,e))}),t._label);!r&&i&&(r=!0,j(t,i))}),t)}(e,n,r):C(e,n)}function N(t,e){if(t===e)j(t,new TypeError("You cannot resolve a promise with itself"));else if(i=typeof(r=e),null===r||"object"!==i&&"function"!==i)C(t,e);else{var n=void 0;try{n=e.then}catch(e){return void j(t,e)}E(t,e,n)}var r,i}function T(t){t._onerror&&t._onerror(t._result),O(t)}function C(t,e){t._state===P&&(t._result=e,t._state=1,0!==t._subscribers.length&&a(O,t))}function j(t,e){t._state===P&&(t._state=2,t._result=e,a(T,t))}function B(t,e,n,r){var i=t._subscribers,o=i.length;t._onerror=null,i[o]=e,i[o+1]=n,i[o+2]=r,0===o&&t._state&&a(O,t)}function O(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var r=void 0,i=void 0,o=t._result,a=0;a<e.length;a+=3)r=e[a],i=e[a+n],r?R(n,r,i,o):i(o);t._subscribers.length=0}}function R(e,n,r,i){var o=t(r),a=void 0,s=void 0,u=!0;if(o){try{a=r(i)}catch(t){u=!1,s=t}if(n===a)return void j(n,new TypeError("A promises callback cannot return that same promise."))}else a=i;n._state!==P||(o&&u?N(n,a):!1===u?j(n,s):1===e?C(n,a):2===e&&j(n,a))}var U=0;function D(t){t[b]=U++,t._state=void 0,t._result=void 0,t._subscribers=[]}var F=function(){function t(t,n){this._instanceConstructor=t,this.promise=new t(x),this.promise[b]||D(this.promise),e(n)?(this.length=n.length,this._remaining=n.length,this._result=new Array(this.length),0===this.length?C(this.promise,this._result):(this.length=this.length||0,this._enumerate(n),0===this._remaining&&C(this.promise,this._result))):j(this.promise,new Error("Array Methods must be provided an Array"))}return t.prototype._enumerate=function(t){for(var e=0;this._state===P&&e<t.length;e++)this._eachEntry(t[e],e)},t.prototype._eachEntry=function(t,e){var n=this._instanceConstructor,r=n.resolve;if(r===_){var i=void 0,o=void 0,a=!1;try{i=t.then}catch(t){a=!0,o=t}if(i===w&&t._state!==P)this._settledAt(t._state,e,t._result);else if("function"!=typeof i)this._remaining--,this._result[e]=t;else if(n===I){var s=new n(x);a?j(s,o):E(s,t,i),this._willSettleAt(s,e)}else this._willSettleAt(new n((function(e){return e(t)})),e)}else this._willSettleAt(r(t),e)},t.prototype._settledAt=function(t,e,n){var r=this.promise;r._state===P&&(this._remaining--,2===t?j(r,n):this._result[e]=n),0===this._remaining&&C(r,this._result)},t.prototype._willSettleAt=function(t,e){var n=this;B(t,void 0,(function(t){return n._settledAt(1,e,t)}),(function(t){return n._settledAt(2,e,t)}))},t}();var I=function(){function e(t){this[b]=U++,this._result=this._state=void 0,this._subscribers=[],x!==t&&("function"!=typeof t&&function(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}(),this instanceof e?function(t,e){try{e((function(e){N(t,e)}),(function(e){j(t,e)}))}catch(e){j(t,e)}}(this,t):function(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}())}return e.prototype.catch=function(t){return this.then(null,t)},e.prototype.finally=function(e){var n=this,r=n.constructor;return t(e)?n.then((function(t){return r.resolve(e()).then((function(){return t}))}),(function(t){return r.resolve(e()).then((function(){throw t}))})):n.then(e,e)},e}();return I.prototype.then=w,I.all=function(t){return new F(this,t).promise},I.race=function(t){var n=this;return e(t)?new n((function(e,r){for(var i=t.length,o=0;o<i;o++)n.resolve(t[o]).then(e,r)})):new n((function(t,e){return e(new TypeError("You must pass an array to race."))}))},I.resolve=_,I.reject=function(t){var e=new this(x);return j(e,t),e},I._setScheduler=function(t){o=t},I._setAsap=function(t){a=t},I._asap=a,I.polyfill=function(){var t=void 0;if(void 0!==n.g)t=n.g;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(t){throw new Error("polyfill failed because global object is unavailable in this environment")}var e=t.Promise;if(e){var r=null;try{r=Object.prototype.toString.call(e.resolve())}catch(t){}if("[object Promise]"===r&&!e.cast)return}t.Promise=I},I.Promise=I,I}()}},e={};function n(r){var i=e[r];if(void 0!==i)return i.exports;var o=e[r]={exports:{}};return t[r].call(o.exports,o,o.exports,n),o.exports}n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}();var r={};return(()=>{"use strict";var t=n(78),e=n(510),r=n(398),i=n.g.APNG={};i.checkNativeFeatures=t.checkNativeFeatures,i.ifNeeded=t.ifNeeded,i.parseBuffer=function(t){return e(t)};var o={};i.parseURL=function(t){return t in o||(o[t]=r(t).then(e)),o[t]},i.animateContext=function(t,e){return i.parseURL(t).then((function(t){return t.addContext(e),t.play(),t}))},i.animateImage=function(t){return t.setAttribute("data-is-apng","progress"),i.parseURL(t.src).then((function(e){t.setAttribute("data-is-apng","yes");var n=document.createElement("canvas");n.width=e.width,n.height=e.height,Array.prototype.slice.call(t.attributes).forEach((function(t){-1==["alt","src","usemap","ismap","data-is-apng","width","height"].indexOf(t.nodeName)&&n.setAttributeNode(t.cloneNode(!1))})),n.setAttribute("data-apng-src",t.src),""!=t.alt&&n.appendChild(document.createTextNode(t.alt));var r="",i="",o=0,a="";""!=t.style.width&&"auto"!=t.style.width?r=t.style.width:t.hasAttribute("width")&&(r=t.getAttribute("width")+"px"),""!=t.style.height&&"auto"!=t.style.height?i=t.style.height:t.hasAttribute("height")&&(i=t.getAttribute("height")+"px"),""!=r&&""==i&&(o=parseFloat(r),a=r.match(/\D+$/)[0],i=Math.round(n.height*o/n.width)+a),""!=i&&""==r&&(o=parseFloat(i),a=i.match(/\D+$/)[0],r=Math.round(n.width*o/n.height)+a),n.style.width=r,n.style.height=i;var s=t.parentNode;s.insertBefore(n,t),s.removeChild(t),e.addContext(n.getContext("2d")),e.play()}),(function(){t.setAttribute("data-is-apng","no")}))},i.releaseCanvas=function(t){var e=t.getContext("2d");"_apng_animation"in e&&e._apng_animation.removeContext(e)}})(),r.default})()}));
//# sourceMappingURL=index.js.map