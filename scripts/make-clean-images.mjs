// Render PDF pages to PNG and clean old chords using bbox data from JSON.
// Usage:
//   node scripts/make-clean-images.mjs pdf/pdf1.pdf assets/chords/pdf1.json pages/pdf1
//
// Requires: pdftocairo (poppler) and ImageMagick convert.
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }

function run(cmd, args, opts={}){
  try{
    execFileSync(cmd, args, { stdio: "inherit", ...opts });
  }catch(err){
    console.error(`Komut başarısız: ${cmd} ${args.join(" ")}`);
    throw err;
  }
}

function readJson(p){
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function buildDrawArgs(chords, imgW, imgH){
  // ImageMagick rectangle komutları
  const parts = [];
  for(const c of chords){
    const raw = c.text || c.t || c.chord || "";
    if(!raw) continue;
    const cx = Number(c.x) || 0;
    const cy = Number(c.y) || 0;
    const cw = Number(c.w);
    const ch = Number(c.h);
    if(cw == null || ch == null) continue;
    const x = Math.max(0, Math.floor(cx * imgW));
    const y = Math.max(0, Math.floor(cy * imgH));
    const w = Math.max(4, Math.floor(cw * imgW));
    const h = Math.max(4, Math.floor(ch * imgH));
    const x2 = Math.min(imgW, x + w);
    const y2 = Math.min(imgH, y + h);
    parts.push(`rectangle ${x},${y} ${x2},${y2}`);
  }
  return parts;
}

function main(){
  const pdfPath = process.argv[2];
  const jsonPath = process.argv[3];
  const outDir = process.argv[4] || "pages/clean";
  if(!pdfPath || !jsonPath){
    console.error("Kullanım: node scripts/make-clean-images.mjs pdf/pdf1.pdf assets/chords/pdf1.json pages/pdf1");
    process.exit(1);
  }
  if(!fs.existsSync(pdfPath)) throw new Error(`PDF yok: ${pdfPath}`);
  if(!fs.existsSync(jsonPath)) throw new Error(`JSON yok: ${jsonPath}`);

  ensureDir(outDir);

  const baseName = path.join(outDir, path.basename(pdfPath, path.extname(pdfPath)));
  // Render all pages to PNG (baseName-1.png ...)
  run("pdftocairo", ["-png", "-r", "150", pdfPath, baseName]);

  const data = readJson(jsonPath);
  const pages = data.pages || {};

  for(const [pageStr, chords] of Object.entries(pages)){
    const page = Number(pageStr);
    if(!Number.isFinite(page) || page <= 0) continue;
    const src = `${baseName}-${page}.png`;
    const dst = `${baseName}-${page}.png`; // overwrite
    if(!fs.existsSync(src)){
      console.warn(`Atlandı, PNG yok: ${src}`);
      continue;
    }
    // Boyutları almak için identify
    const identify = execFileSync("identify", ["-format", "%w %h", src], { encoding:"utf8" }).trim();
    const [w,h] = identify.split(/\s+/).map(Number);
    const draws = buildDrawArgs(chords, w, h);
    if(!draws.length){
      console.log(`Sayfa ${page}: chord yok, atlandı`);
      continue;
    }
    const args = [src, "-fill", "white"];
    draws.forEach(d => args.push("-draw", d));
    args.push(dst);
    run("convert", args);
    console.log(`Temizlendi: ${dst}`);
  }
}

main();
