var Z = Object.defineProperty;
var $ = (n, r, e) => r in n ? Z(n, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[r] = e;
var p = (n, r, e) => $(n, typeof r != "symbol" ? r + "" : r, e);
class X extends Event {
  constructor(e, t) {
    super("render");
    p(this, "now");
    p(this, "tag");
    this.now = e, this.tag = t;
  }
}
class G extends EventTarget {
  constructor(e = "") {
    super();
    // Public
    p(this, "width", 0);
    p(this, "height", 0);
    p(this, "numPlays", 0);
    p(this, "playTime", 0);
    p(this, "frames", []);
    p(this, "tag");
    p(this, "nextRenderTime", 0);
    p(this, "fNum", 0);
    p(this, "prevF");
    p(this, "played", !1);
    p(this, "finished", !1);
    p(this, "contexts", []);
    p(this, "tick");
    this.tag = e;
    const t = this, i = (l) => {
      const g = t.fNum++ % t.frames.length, u = t.frames[g];
      if (!(t.numPlays === 0 || t.fNum / t.frames.length <= t.numPlays)) {
        t.played = !1, t.finished = !0;
        return;
      }
      g === 0 && (t.contexts.forEach(function(m) {
        m.clearRect(0, 0, t.width, t.height);
      }), t.prevF = void 0, u.disposeOp === 2 && (u.disposeOp = 1)), t.prevF && t.prevF.disposeOp === 1 ? t.contexts.forEach(function(m) {
        m.clearRect(t.prevF.left, t.prevF.top, t.prevF.width, t.prevF.height);
      }) : t.prevF && t.prevF.disposeOp === 2 && t.contexts.forEach(function(m) {
        m.putImageData(t.prevF.iData, t.prevF.left, t.prevF.top);
      }), t.prevF = u, t.prevF.iData = null, t.prevF.disposeOp === 2 && (t.prevF.iData = t.contexts[0].getImageData(u.left, u.top, u.width, u.height)), u.blendOp === 0 && t.contexts.forEach(function(m) {
        m.clearRect(u.left, u.top, u.width, u.height);
      }), t.contexts.forEach(function(m) {
        m.drawImage(u.img, u.left, u.top);
      });
      const d = new X(l, this.tag);
      for (t.dispatchEvent(d), t.nextRenderTime === 0 && (t.nextRenderTime = l); l > t.nextRenderTime + t.playTime; ) t.nextRenderTime += t.playTime;
      t.nextRenderTime += u.delay;
    };
    this.tick = (l) => {
      for (; t.played && t.nextRenderTime <= l; ) i(l);
      t.played && requestAnimationFrame(t.tick);
    };
  }
  setTag(e) {
    this.tag = e;
  }
  play() {
    this.played || this.finished || (this.rewind(), this.played = !0, requestAnimationFrame(this.tick));
  }
  rewind() {
    this.nextRenderTime = 0, this.fNum = 0, this.prevF = void 0, this.played = !1, this.finished = !1;
  }
  addContext(e) {
    if (this.contexts.length > 0) {
      const t = this.contexts[0].getImageData(0, 0, this.width, this.height);
      e.putImageData(t, 0, 0);
    }
    this.contexts.push(e), e._aimg_animation = this;
  }
  removeContext(e) {
    const t = this.contexts.indexOf(e);
    t !== -1 && (this.contexts.splice(t, 1), this.contexts.length === 0 && this.rewind(), "_aimg_animation" in e && delete e._aimg_animation);
  }
  removeAllContexts() {
    this.contexts.forEach((e) => {
      this.removeContext(e);
    });
  }
  latestContext() {
    return this.contexts[this.contexts.length - 1];
  }
  isPlayed() {
    return this.played;
  }
  isFinished() {
    return this.finished;
  }
}
const x = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), I = new Uint8Array([71, 73, 70, 56, 55, 97]), V = new Uint8Array([71, 73, 70, 56, 57, 97]), L = new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]), ee = function(n) {
  let r;
  return function(e) {
    return r || (r = new Promise(n)), e && r.then(e), r;
  };
}, q = ee(function(n) {
  const r = document.createElement("canvas"), e = {
    TypedArrays: "ArrayBuffer" in global,
    BlobURLs: "URL" in global,
    requestAnimationFrame: "requestAnimationFrame" in global,
    pageProtocol: location.protocol == "http:" || location.protocol == "https:",
    canvas: "getContext" in document.createElement("canvas"),
    APNG: !1
  };
  if (e.canvas) {
    const t = new Image();
    t.onload = function() {
      const i = r.getContext("2d");
      i.drawImage(t, 0, 0), e.APNG = i.getImageData(0, 0, 1, 1).data[3] === 0, n(e);
    }, t.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==";
  } else
    n(e);
}), te = function(n = !1) {
  return q().then(function(r) {
    if (!(r.APNG && !n)) {
      let e = !0;
      for (let t in r) r.hasOwnProperty(t) && t != "APNG" && (e = e && r[t]);
    }
  });
};
function j(n) {
  const r = new Uint8Array(n);
  for (let e = 0; e < x.length; e++)
    if (x[e] !== r[e])
      return !1;
  return !0;
}
function z(n) {
  const r = new Uint8Array(n);
  for (let e = 0; e < I.length; e++)
    if (I[e] !== r[e] && V[e] !== r[e])
      return !1;
  return !0;
}
function K(n) {
  const r = new Uint8Array(n);
  for (let e = 0; e < L.length; e++)
    if (L[e] !== r[e] && L[e] !== 0)
      return !1;
  return !0;
}
const R = {
  checkNativeFeatures: q,
  ifNeeded: te,
  pngCheck: j,
  gifCheck: z,
  webpCheck: K,
  PNG_SIGNATURE_BYTES: x,
  GIF87_SIGNATURE_BYTES: I,
  GIF89_SIGNATURE_BYTES: V,
  WEBP_CHECK_BYTES: L
}, J = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let r = n;
  for (let e = 0; e < 8; e++) r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
  J[n] = r;
}
function re(n, r, e) {
  r = r || 0, e = e || n.length - r;
  let t = -1;
  for (let i = r, l = r + e; i < l; i++)
    t = t >>> 8 ^ J[(t ^ n[i]) & 255];
  return t ^ -1;
}
function U(n, r, e = !1) {
  return e ? n : r - 1 - n;
}
function k(n, r, e = !1) {
  let t = 0;
  t += n[r + U(0, 4, e)] << 24 >>> 0;
  for (let i = 1; i < 4; i++) t += n[r + U(i, 4, e)] << (3 - i) * 8;
  return t;
}
function P(n, r, e = !1) {
  let t = 0;
  for (let i = 0; i < 2; i++) t += n[r + U(i, 2, e)] << (1 - i) * 8;
  return t;
}
function B(n, r, e = !1) {
  let t = 0;
  t += n[r + U(0, 3, e)] << 16 >>> 0;
  for (let i = 1; i < 3; i++) t += n[r + U(i, 3, e)] << (2 - i) * 8;
  return t;
}
function T(n, r) {
  return n[r];
}
function S(n, r, e) {
  const t = new Uint8Array(e);
  return t.set(n.subarray(r, r + e)), t;
}
function b(n, r, e) {
  const t = Array.prototype.slice.call(n.subarray(r, r + e));
  return String.fromCharCode.apply(String, t);
}
function v(n, r = !1) {
  const e = [n & 255, n >>> 8 & 255, n >>> 16 & 255, n >>> 24 & 255];
  return r ? e.reverse() : e;
}
function _(n, r = !1) {
  const e = [n & 255, n >>> 8 & 255];
  return r ? e.reverse() : e;
}
function O(n, r = !1) {
  const e = [n & 255, n >>> 8 & 255, n >>> 16 & 255];
  return r ? e.reverse() : e;
}
function ne(n) {
  const r = [];
  for (let e = 0; e < n.length; e++) r.push(n.charCodeAt(e));
  return r;
}
function C(n) {
  return n.reduce((r, e) => r * 2 + (e ? 1 : 0), 0);
}
function N(n) {
  const r = [];
  for (let e = 7; e >= 0; e--)
    r.push(!!(n & 1 << e));
  return r;
}
async function ae(n, r = { ignoreSingle: !1, forceLoop: !1 }) {
  const e = !!r.ignoreSingle, t = !!r.forceLoop, i = new Uint8Array(n);
  return new Promise((l, g) => {
    let u = !1;
    if (D(i, (c, o, h, w) => c === "acTL" ? (u = !0, !1) : !0), !u && e) {
      g("Not an animated PNG");
      return;
    }
    const d = [], m = [], s = new G();
    let y, a;
    if (D(i, function(c, o, h, w) {
      switch (c) {
        case "IHDR":
          y = o.subarray(h + 8, h + 8 + w), s.width = k(o, h + 8, !0), s.height = k(o, h + 12, !0);
          break;
        case "acTL":
          s.numPlays = k(o, h + 8 + 4, !0);
          break;
        case "fcTL":
          a && s.frames.push(a), a = {}, a.width = k(o, h + 8 + 4, !0), a.height = k(o, h + 8 + 8, !0), a.left = k(o, h + 8 + 12, !0), a.top = k(o, h + 8 + 16, !0);
          const Q = P(o, h + 8 + 20, !0);
          let F = P(o, h + 8 + 22, !0);
          F == 0 && (F = 100), a.delay = 1e3 * Q / F, a.delay <= 10 && (a.delay = 100), s.playTime += a.delay, a.disposeOp = T(o, h + 8 + 24), a.blendOp = T(o, h + 8 + 25), a.dataParts = [];
          break;
        case "fdAT":
          a && a.dataParts.push(o.subarray(h + 8 + 4, h + 8 + w));
          break;
        case "IDAT":
          a ? a.dataParts.push(o.subarray(h + 8, h + 8 + w)) : (a = {}, a.width = s.width, a.height = s.height, a.left = 0, a.top = 0, a.delay = 100, s.playTime += a.delay, a.disposeOp = 1, a.blendOp = 1, a.dataParts = [o.subarray(h + 8, h + 8 + w)]);
          break;
        case "IEND":
          m.push(S(o, h, 12 + w));
          break;
        default:
          d.push(S(o, h, 12 + w));
      }
      return !0;
    }), a && s.frames.push(a), s.frames.length <= 1)
      if (e) {
        g("Not an animated PNG");
        return;
      } else
        s.numPlays = 1;
    else t && (s.numPlays = 0);
    let f = 0;
    const A = new Blob(d), E = new Blob(m);
    for (let c = 0; c < s.frames.length; c++) {
      a = s.frames[c];
      let o = [];
      o.push(R.PNG_SIGNATURE_BYTES), y.set(v(a.width, !0), 0), y.set(v(a.height, !0), 4), o.push(M("IHDR", y)), o.push(A);
      for (let w = 0; w < a.dataParts.length; w++)
        o.push(M("IDAT", a.dataParts[w]));
      o.push(E);
      const h = URL.createObjectURL(new Blob(o, { type: "image/png" }));
      delete a.dataParts, o = [], a.img = document.createElement("img"), a.img.onload = function() {
        URL.revokeObjectURL(this.src), f++, f === s.frames.length && l(s);
      }, a.img.onerror = function() {
        g("Image creation error");
      }, a.img.src = h;
    }
  });
}
function D(n, r) {
  let e = 8, t, i = !0;
  do {
    const l = k(n, e, !0);
    t = b(n, e + 4, 4), i = r(t, n, e, l), e += 12 + l;
  } while (i && t != "IEND" && e < n.length);
}
function M(n, r) {
  const e = n.length + r.length, t = new Uint8Array(new ArrayBuffer(e + 8));
  t.set(v(r.length, !0), 0), t.set(ne(n), 4), t.set(r, 8);
  const i = re(t, 4, e);
  return t.set(v(i, !0), e + 4), t;
}
async function ie(n, r = { ignoreSingle: !1, forceLoop: !1 }) {
  const e = !!r.ignoreSingle, t = !!r.forceLoop, i = new Uint8Array(n);
  return new Promise((l, g) => {
    let u = !1, d = 0;
    if (W(i, (E, c, o, h) => E === "APP" ? (u = !0, !1) : (E === "GCE" && d++, !0)), !u && d < 2 && e) {
      g("Not an animated GIF");
      return;
    }
    const m = [], s = new G();
    let y, a;
    if (d > 1 && (s.numPlays = 1), W(i, (E, c, o, h) => {
      switch (E) {
        case "HDR":
          y = c.subarray(o, o + h), s.width = P(c, o), s.height = P(c, o + 2);
          break;
        case "APP":
          b(c, o + 3, 11) === "NETSCAPE2.0" && (s.numPlays = P(c, o + 16));
          break;
        case "GCE":
          a && s.frames.push(a), a = {}, a.delay = P(c, o + 4) * 10, a.delay <= 10 && (a.delay = 100), s.playTime += a.delay, a.gce = S(c, o, h);
          break;
        case "IMG":
          a && a.data && (s.frames.push(a), a = {}), a.width = P(c, o + 5), a.height = P(c, o + 7), a.left = P(c, o + 1), a.top = P(c, o + 3), a.data = S(c, o, h), a.disposeOp = 0, a.blendOp = 0;
          break;
        case "COM":
          break;
        case "PTE":
          break;
        case "EOF":
          m.push(S(c, o, h));
          break;
      }
      return !0;
    }), a && s.frames.push(a), s.frames.length <= 1)
      if (e) {
        g("Not an animated PNG");
        return;
      } else
        s.numPlays = 1;
    else t && (s.numPlays = 0);
    let f = 0;
    const A = new Blob(m);
    for (let E = 0; E < s.frames.length; E++) {
      a = s.frames[E];
      let c = [];
      c.push(R.GIF89_SIGNATURE_BYTES), y.set(_(a.width), 0), y.set(_(a.height), 2), c.push(y), c.push(a.gce), c.push(a.data), c.push(A);
      const o = URL.createObjectURL(new Blob(c, { type: "image/gif" }));
      delete a.data, delete a.gce, c = [], a.img = document.createElement("img"), a.img.onload = function() {
        URL.revokeObjectURL(this.src), f++, f === s.frames.length && l(s);
      }, a.img.onerror = function() {
        g("Image creation error");
      }, a.img.src = o;
    }
  });
}
function Y(n, r) {
  let e = 0;
  for (; ; ) {
    const t = T(n, r + e);
    if (e++, t === 0) break;
    e += t;
  }
  return e;
}
function W(n, r) {
  let e = 6, t = !0, i = 0, l;
  do {
    if (e === 6) {
      l = "HDR", i = 7;
      const g = N(T(n, e + 4)), u = g[0], d = C(g.splice(5, 3));
      i += u ? Math.pow(2, d + 1) * 3 : 0;
    } else {
      const g = b(n, e, 1);
      switch (g) {
        case "!":
          switch (T(n, e + 1)) {
            case 249:
              l = "GCE";
              break;
            case 254:
              l = "COM";
              break;
            case 1:
              l = "PTE";
              break;
            case 255:
              l = "APP";
              break;
            default:
              throw new Error("Unknown block");
          }
          i = 2, i += Y(n, e + i);
          break;
        case ",":
          l = "IMG", i = 10;
          const u = N(T(n, e + 9)), d = u[0], m = C(u.splice(5, 3));
          i += (d ? Math.pow(2, m + 1) * 3 : 0) + 1, i += Y(n, e + i);
          break;
        case ";":
          l = "EOF";
          break;
        default:
          throw new Error(`Unknown block ${g}`);
      }
    }
    t = r(l, n, e, i), e += i;
  } while (t && l !== "EOF" && e < n.length);
}
async function se(n, r = { ignoreSingle: !1, forceLoop: !1 }) {
  const e = !!r.ignoreSingle, t = !!r.forceLoop, i = new Uint8Array(n);
  return new Promise((l, g) => {
    let u = !1;
    if (H(i, (a, f, A, E) => a === "ANIM" ? (u = !0, !1) : !0), !u && e) {
      g("Not an animated WebP");
      return;
    }
    const d = new G();
    let m, s;
    if (H(i, (a, f, A, E) => {
      switch (a) {
        case "VP8X":
          m = f.subarray(A, A + E), d.width = B(f, A + 8 + 4) + 1, d.height = B(f, A + 8 + 4 + 3) + 1;
          break;
        case "ANIM":
          d.numPlays = P(f, A + 8 + 4);
          break;
        case "ANMF":
          s && d.frames.push(s);
          let c = B(f, A + 8 + 12);
          c <= 10 && (c = 100);
          const o = N(T(f, A + 8 + 15));
          s = {
            delay: c,
            width: B(f, A + 8 + 6) + 1,
            height: B(f, A + 8 + 9) + 1,
            left: B(f, A + 8) * 2,
            top: B(f, A + 8 + 3) * 2,
            disposeOp: o[7] ? 1 : 0,
            blendOp: o[6] ? 0 : 1,
            data: S(f, A + 8 + 16, E - 8 - 16)
          }, d.playTime += s.delay;
          break;
      }
      return !0;
    }), s && d.frames.push(s), d.frames.length <= 1)
      if (e) {
        g("Not an animated WebP");
        return;
      } else
        d.numPlays = 1;
    else t && (d.numPlays = 0);
    let y = 0;
    for (let a = 0; a < d.frames.length; a++) {
      s = d.frames[a];
      let f = [];
      const A = v(4 + m.byteLength + s.data.byteLength), E = R.WEBP_CHECK_BYTES.map((h, w) => w > 3 && w < 8 ? A[w - 4] : R.WEBP_CHECK_BYTES[w]);
      f.push(E);
      const c = N(T(m, 8));
      c[4] = !1, c[5] = !1, c[6] = !1, m.set([C(c)], 8), m.set(O(s.width - 1), 12), m.set(O(s.height - 1), 15), f.push(m), f.push(s.data);
      const o = URL.createObjectURL(new Blob(f, { type: "image/webp" }));
      delete s.data, f = [], s.img = document.createElement("img"), s.img.onload = function() {
        URL.revokeObjectURL(this.src), y++, y === d.frames.length && l(d);
      }, s.img.onerror = function() {
        g("Image creation error");
      }, s.img.src = o;
    }
  });
}
function H(n, r, e = 12, t) {
  const i = n.length;
  let l = !0;
  do {
    const g = b(n, e, 4);
    let u = k(n, e + 4);
    u % 2 && u++, l = r(g, n, e, u + 8), e += u + 8;
  } while (l && e < i);
}
async function oe(n) {
  try {
    const r = await fetch(n, {
      method: "GET"
    });
    if (r.status !== 200) {
      const e = new Error(`HTTP error! status: ${r.status}`);
      throw e.status = r.status, e.url = n, e;
    }
    return r.arrayBuffer();
  } catch (r) {
    const e = r;
    throw e.url = n, e;
  }
}
class ce extends EventTarget {
  constructor(e = {}) {
    super();
    p(this, "url2promise", {});
    p(this, "waitingBuffers", {});
    p(this, "waitingMilliSec");
    p(this, "forceLoop");
    p(this, "ignoreSingle");
    this.waitingMilliSec = e.waitingMilliSec || 10, this.forceLoop = e.forceLoop || !1, this.ignoreSingle = e.ignoreSingle || !1;
  }
  async parseURL(e) {
    if (e in this.waitingBuffers) {
      const t = this.waitingBuffers[e];
      return await new Promise((i) => setTimeout(i, this.waitingMilliSec)), this.parseBuffer(t.buffer, {
        ignoreSingle: t.ignoreSingle,
        forceLoop: t.forceLoop
      });
    }
    return e in this.url2promise || (this.url2promise[e] = oe(e).then((t) => this.parseBuffer(t))), this.url2promise[e];
  }
  async parseBuffer(e, t = {}) {
    const i = new Uint8Array(e), l = "ignoreSingle" in t ? t.ignoreSingle : this.ignoreSingle, g = "forceLoop" in t ? t.forceLoop : this.forceLoop;
    if (i.length >= 3 && z(e))
      return ie(e, { ignoreSingle: l, forceLoop: g });
    if (i.length >= 4 && j(e))
      return ae(e, { ignoreSingle: l, forceLoop: g });
    if (i.length >= 12 && K(e))
      return se(e, { ignoreSingle: l, forceLoop: g });
    throw new Error("Unknown image format");
  }
  async animateImage(e) {
    e.setAttribute("data-is-aimg", "progress");
    try {
      const t = await this.parseURL(e.src);
      t.tag || t.setTag(e.src), e.setAttribute("data-is-aimg", "yes");
      const i = document.createElement("canvas");
      i.width = t.width, i.height = t.height;
      const l = i.getContext("2d");
      if (!l) throw new Error("Failed to get 2d context");
      return t.addContext(l), t.play(), t;
    } catch (t) {
      throw e.setAttribute("data-is-aimg", "no"), t;
    }
  }
}
globalThis.Gyeonghwon = ce;
export {
  ce as default
};
