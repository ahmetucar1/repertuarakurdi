// Çıktı: assets/chords/{pdf}.json
import fs from "fs";
import path from "path";

function ensureDOMMatrix(){
  if(typeof globalThis.DOMMatrix !== "undefined") return;
  class SimpleDOMMatrix{
    constructor(init){
      if(Array.isArray(init) || ArrayBuffer.isView(init)){
        const a = Array.from(init);
        this.a = a[0] ?? 1; this.b = a[1] ?? 0;
        this.c = a[2] ?? 0; this.d = a[3] ?? 1;
        this.e = a[4] ?? 0; this.f = a[5] ?? 0;
      } else if(init instanceof SimpleDOMMatrix){
        this.a = init.a; this.b = init.b; this.c = init.c; this.d = init.d; this.e = init.e; this.f = init.f;
      } else {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      }
      this.is2D = true;
      this.isIdentity = this.a ===1 && this.b===0 && this.c===0 && this.d===1 && this.e===0 && this.f===0;
    }
    multiplySelf(m){
      const ma = m instanceof SimpleDOMMatrix ? m : new SimpleDOMMatrix(m);
      const a = this.a*ma.a + this.c*ma.b;
      const b = this.b*ma.a + this.d*ma.b;
      const c = this.a*ma.c + this.c*ma.d;
      const d = this.b*ma.c + this.d*ma.d;
      const e = this.a*ma.e + this.c*ma.f + this.e;
      const f = this.b*ma.e + this.d*ma.f + this.f;
      this.a=a; this.b=b; this.c=c; this.d=d; this.e=e; this.f=f;
      return this;
    }
    preMultiplySelf(m){
      const ma = m instanceof SimpleDOMMatrix ? m : new SimpleDOMMatrix(m);
      const a = ma.a*this.a + ma.c*this.b;
      const b = ma.b*this.a + ma.d*this.b;
      const c = ma.a*this.c + ma.c*this.d;
      const d = ma.b*this.c + ma.d*this.d;
      const e = ma.a*this.e + ma.c*this.f + ma.e;
      const f = ma.b*this.e + ma.d*this.f + ma.f;
      this.a=a; this.b=b; this.c=c; this.d=d; this.e=e; this.f=f;
      return this;
    }
    translate(x=0, y=0){
      this.e += x;
      this.f += y;
      return this;
    }
    scale(x=1, y=x){
      this.a *= x; this.c *= x; this.e *= x;
      this.b *= y; this.d *= y; this.f *= y;
      return this;
    }
    rotate(_deg){ return this; }
    invertSelf(){
      const det = this.a*this.d - this.b*this.c;
      if(!det) return this;
      const a = this.d/det;
      const b = -this.b/det;
      const c = -this.c/det;
      const d = this.a/det;
      const e = (this.c*this.f - this.d*this.e)/det;
      const f = (this.b*this.e - this.a*this.f)/det;
      this.a=a; this.b=b; this.c=c; this.d=d; this.e=e; this.f=f;
      return this;
    }
    toFloat32Array(){ return new Float32Array([this.a,this.b,this.c,this.d,this.e,this.f]); }
  }
  globalThis.DOMMatrix = SimpleDOMMatrix;
}

ensureDOMMatrix();
const pdfjsLib = await import("../pdfjs/build/pdf.mjs");

const input = process.argv[2];
const output = process.argv[3] || "assets/chords/output.json";

if(!input){
  console.error("Kullanım: node scripts/extract-chords.mjs pdf/pdf1.pdf assets/chords/pdf1.json");
  process.exit(1);
}

const NOTE_TO_I = {
  "C":0, "B#":0,
  "C#":1, "Db":1,
  "D":2,
  "D#":3, "Eb":3,
  "E":4, "Fb":4,
  "F":5, "E#":5,
  "F#":6, "Gb":6,
  "G":7,
  "G#":8, "Ab":8,
  "A":9,
  "A#":10, "Bb":10,
  "B":11, "Cb":11
};
const CHORD_RE = /^[A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add)?\d*(?:[b#]\d+)?(?:\([^)]*\))?(?:\/[A-G](?:#|b)?)?$/;

const cleanTok = (tok) => (tok || "").replace(/[.,;:!?]+$/g, "");
function isChordToken(tok){
  tok = cleanTok(tok.trim());
  if(!tok) return false;
  if(/^N\.?C\.?$/i.test(tok)) return false;
  if(/^[-–—|]+$/.test(tok)) return false;
  if(tok.length > 12) return false;
  return CHORD_RE.test(tok);
}
const hasWordLetters = (tok) => /[A-Za-zÇĞİÖŞÜçğıöşü]{2,}/.test(tok);
const yBucket = (px) => Math.round(px / 10);
const xBucket = (px) => Math.round(px / 6);
const median = (arr) => {
  if(!arr.length) return 0;
  const a = arr.slice().sort((x,y)=>x-y);
  const mid = Math.floor(a.length/2);
  return a.length % 2 ? a[mid] : (a[mid-1]+a[mid])/2;
};

async function extract(){
  const loadingTask = pdfjsLib.getDocument({ url: input });
  const pdf = await loadingTask.promise;

  const pages = {};
  let baseW = 0, baseH = 0;

  for(let p=1; p<=pdf.numPages; p++){
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    baseW = viewport.width;
    baseH = viewport.height;

    const text = await page.getTextContent();
    const items = text.items || [];

    const fontSizes = [];
    for(const it of items){
      if(!it || !it.str) continue;
      const fs = Math.max(10, Math.hypot(it.transform?.[0]||0, it.transform?.[1]||0) * viewport.scale);
      fontSizes.push(fs);
    }
    const medFs = median(fontSizes) || 14;
    const titleFsThreshold = Math.max(24, medFs * 1.75);

    const lines = new Map();

    for(const it of items){
      const raw = (it.str || "").trim();
      if(!raw) continue;

      const [xStart, yStart] = viewport.convertToViewportPoint(it.transform[4], it.transform[5]);
      const fontSize = Math.max(10, Math.hypot(it.transform[0], it.transform[1]) * viewport.scale);
      const totalW = (it.width || 0) * viewport.scale;
      const top = Math.max(0, yStart - fontSize);

      if(fontSize >= titleFsThreshold) continue;

      const toks = [];
      const re = /\S+/g;
      let m;
      while((m = re.exec(raw))){
        const t = cleanTok(m[0]);
        if(!t) continue;
        toks.push({ tok:t, idx:m.index });
      }
      if(!toks.length) continue;

      const lineKey = yBucket(top);
      let line = lines.get(lineKey);
      if(!line){
        line = { chords:[], nonChordLetterCount:0, tokenCount:0, maxFs:0 };
        lines.set(lineKey, line);
      }

      line.tokenCount += toks.length;
      if(fontSize > line.maxFs) line.maxFs = fontSize;

      for(const t of toks){
        if(isChordToken(t.tok)){
          const rel = t.idx / Math.max(1, raw.length);
          const x = xStart + (totalW ? totalW * rel : 0);
          // width tahmini: token uzunluğu / toplam uzunluk * item width
          const frac = Math.max(0.08, Math.min(1, t.tok.length / Math.max(1, raw.length)));
          const w = Math.max(6, (it.width || 0) * viewport.scale * frac);
          const h = fontSize * 1.1;
          line.chords.push({ tok: t.tok, x, top, fontSize, width: w, height: h });
        } else if(hasWordLetters(t.tok)){
          line.nonChordLetterCount++;
        }
      }
    }

    const used = new Set();
    const chords = [];

    for(const [lk, line] of lines.entries()){
      const chordCount = line.chords.length;
      if(!chordCount) continue;
      if(line.maxFs >= titleFsThreshold) continue;

      const ratio = chordCount / Math.max(1, line.tokenCount);
      let accept = false;

      if(line.nonChordLetterCount >= 2 && ratio < 0.45) continue;
      if(chordCount >= 3) accept = ratio >= 0.30;
      else if(chordCount === 2) accept = ratio >= 0.40;
      else {
        const only = line.chords[0].tok;
        const isSingleRoot = /^[A-G](?:#|b)?$/.test(only);
        if(line.nonChordLetterCount <= 1 && line.tokenCount <= 3){
          accept = isSingleRoot || only.length >= 2;
        }
      }
      if(!accept) continue;

      line.chords.sort((a,b)=>a.x-b.x);
      for(const c of line.chords){
        const key = `${xBucket(c.x)}|${lk}`;
        if(used.has(key)) continue;
        used.add(key);
        chords.push({
          text: c.tok,
          x: c.x / viewport.width,
          y: c.top / viewport.height,
          fs: c.fontSize,
          w: c.width / viewport.width,
          h: c.height / viewport.height
        });
      }
    }

    if(chords.length){
      pages[p] = chords;
    }
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({
    meta: {
      pdf: path.basename(input),
      normalized: true,
      viewportWidth: baseW,
      viewportHeight: baseH,
      extractedAt: new Date().toISOString()
    },
    pages
  }, null, 2), "utf8");

  console.log(`Yazıldı: ${output}`);
}

extract().catch(err => {
  console.error(err);
  process.exit(1);
});
