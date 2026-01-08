// common.js — alîkarên piçûk + tema
// Production mode - console.log'ları minimize et
const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const DEBUG = !IS_PRODUCTION || (window.location.search.includes('debug=true'));

const log = (...args) => {
  if (DEBUG) console.log(...args);
};
const warn = (...args) => {
  if (DEBUG) console.warn(...args);
};
const error = (...args) => {
  // Error'ları her zaman göster
  console.error(...args);
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// Fail-safe: overlay açık kalmışsa kapalı başlat
document.body?.classList.remove("auth-open");

(function ensurePageOverlay(){
  if(!document.body || document.querySelector(".pageOverlay")) return;
  const overlay = document.createElement("div");
  overlay.className = "pageOverlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.prepend(overlay);
})();

const norm = (s) => (s || "")
  .toString()
  .toLowerCase()
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/ı/g, "i")
  .replace(/ğ/g, "g")
  .replace(/ü/g, "u")
  .replace(/ş/g, "s")
  .replace(/ö/g, "o")
  .replace(/ç/g, "c");

const LOCALE = "tr-TR";
function formatSongTitle(title){
  const text = (title || "").toString().trim();
  return text ? text.toLocaleUpperCase(LOCALE) : "";
}
function formatArtistName(name){
  const text = (name || "").toString().trim();
  if(!text) return "";
  const lower = text.toLocaleLowerCase(LOCALE);
  return lower.replace(/(^|[\s'’\-])(\p{L})/gu, (match, sep, ch) => {
    return `${sep}${ch.toLocaleUpperCase(LOCALE)}`;
  });
}
function formatArtistList(value){
  const arr = Array.isArray(value) ? value : (value ? [value] : []);
  return arr.map(v => formatArtistName(v)).filter(Boolean);
}
function formatArtistInputValue(value){
  return formatArtistList(value).join(", ");
}
function normalizeArtistInput(raw){
  const parts = (raw || "")
    .split(/[,;]/)
    .map(s => formatArtistName(s))
    .filter(Boolean);
  if(!parts.length) return "";
  return parts.length === 1 ? parts[0] : parts;
}

const STATIC_BG = true;
const ADMIN_EMAILS = (window.ADMIN_EMAILS || ["ucaraahmet@gmail.com"])
  .map(v => (v || "").toString().trim().toLowerCase())
  .filter(Boolean);

function pickRandom(arr, n){
  const copy = [...(arr || [])];
  // Fisher–Yates shuffle (in-place)
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.max(0, n|0));
}

function uniqueArtistsFromSongs(songs){
  const map = new Map();
  (songs || []).forEach((song) => {
    const list = formatArtistList(song?.artist);
    list.forEach((name) => {
      const key = norm(name);
      if(name && !map.has(key)) map.set(key, name);
    });
  });
  return Array.from(map.values()).sort((a,b) => a.localeCompare(b, LOCALE));
}

function updateGlobalStats(songs){
  const elSongs = document.getElementById("statSongs");
  const elArtists = document.getElementById("statArtists");
  if(!elSongs && !elArtists) return;
  const list = songs || [];
  const songCount = list.length;
  const artistCount = uniqueArtistsFromSongs(list).length;
  if(elSongs) elSongs.textContent = songCount.toString();
  if(elArtists) elArtists.textContent = artistCount.toString();
}

function levenshtein(a, b){
  if(a === b) return 0;
  const m = a.length;
  const n = b.length;
  if(!m) return n;
  if(!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for(let i = 0; i <= m; i++) dp[i][0] = i;
  for(let j = 0; j <= n; j++) dp[0][j] = j;
  for(let i = 1; i <= m; i++){
    for(let j = 1; j <= n; j++){
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

// Fonksiyona lêgerînê ya pêşketî - fuzzy search
function fuzzySearch(query, songs){
  if(!query || query.length < 1) return [];
  
  const q = norm(query);
  const qLength = q.length;
  const results = [];
  
  for(const song of songs){
    const songTitle = norm(song.song || "");
    const artistNames = artistArr(song.artist).map(a => norm(a));
    const searchText = `${songTitle} ${artistNames.join(" ")}`;
    
    let score = 0;
    let matchType = "none";
    
    // 1. Lihevhatina tam (pêşîya herî bilind)
    if(searchText === q){
      score = 1000;
      matchType = "exact";
    }
    // 2. Lihevhatina destpêkê
    else if(searchText.startsWith(q)){
      score = 800 - qLength;
      matchType = "starts";
    }
    // 3. Lihevhatina destpêka peyvê
    else if(searchText.includes(` ${q}`) || searchText.includes(q)){
      const index = searchText.indexOf(q);
      const wordStart = index === 0 || searchText[index - 1] === " ";
      if(wordStart){
        score = 600 - index;
        matchType = "word";
      }else{
        score = 400 - index;
        matchType = "contains";
      }
    }
    // 4. Lihevhatina fuzzy - dûrahiya Levenshtein
    else{
      const words = searchText.split(/\s+/);
      let minDistance = Infinity;
      let bestMatch = "";
      
      // Her peyvê kontrol bike
      for(const word of words){
        if(word.length < 2) continue;
        const distance = levenshtein(q, word);
        if(distance < minDistance){
          minDistance = distance;
          bestMatch = word;
        }
      }
      
      // Hemû nivîsê kontrol bike
      const fullDistance = levenshtein(q, searchText);
      if(fullDistance < minDistance){
        minDistance = fullDistance;
      }
      
      // Puan: dûrahî çiqas piçûktir ew qas baştir
      // Heya 3 tîpela cudahiyê qebûl bike
      if(minDistance <= 3 && qLength >= 2){
        const matchLength = bestMatch ? bestMatch.length : searchText.length;
        score = 300 - (minDistance * 50) - Math.abs(qLength - matchLength);
        matchType = "fuzzy";
      }
      // 5. Ger piraniya tîpelan lihevhatin (lihevhatina qismî)
      else if(qLength >= 3){
        const qChars = q.split("");
        const matchedChars = qChars.filter(c => searchText.includes(c)).length;
        const matchRatio = matchedChars / qLength;
        if(matchRatio >= 0.6){
          score = 100 + (matchRatio * 100);
          matchType = "partial";
        }
      }
    }
    
    if(score > 0){
      results.push({
        song,
        score,
        matchType
      });
    }
  }
  
  // Li gorî puanê rêz bike û encamên herî baş vegerîne
  return results
    .sort((a, b) => {
      if(b.score !== a.score) return b.score - a.score;
      // Ger puan wekhev e alfabetîk rêz bike
      return norm(a.song.song || "").localeCompare(norm(b.song.song || ""), "tr");
    })
    .slice(0, 50)
    .map(r => r.song);
}

window.fuzzySearch = fuzzySearch;
window.pickRandom = pickRandom;

function suggestArtists(query, artists){
  const q = norm(query);
  if(!q || q.length < 2) return [];
  const scored = [];
  for(const name of artists){
    const n = norm(name);
    if(!n || n === q) continue;
    if(n.includes(q)){
      scored.push({ name, score: 0 });
      continue;
    }
    const dist = levenshtein(q, n);
    if(dist <= 2){
      scored.push({ name, score: 1 + dist });
      continue;
    }
    const tokens = n.split(/\s+/);
    let tokenScore = Infinity;
    tokens.forEach((t) => { tokenScore = Math.min(tokenScore, levenshtein(q, t)); });
    if(tokenScore <= 1){
      scored.push({ name, score: 3 + tokenScore });
    }
  }
  return scored
    .sort((a,b) => a.score - b.score || a.name.length - b.name.length)
    .slice(0, 6)
    .map(s => s.name);
}

function initArtistSuggest(inputEl, listEl){
  if(!inputEl || !listEl) return;
  let pool = [];

  const fill = (names) => {
    if(!names.length){
      listEl.innerHTML = "";
      listEl.classList.remove("is-open");
      return;
    }
    listEl.innerHTML = "";
    names.forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggestItem";
      btn.dataset.artist = name;
      btn.textContent = name;
      listEl.appendChild(btn);
    });
    listEl.classList.add("is-open");
  };

  const update = () => {
    const raw = (inputEl.value || "").toString();
    const parts = raw.split(/[,;]/);
    const query = (parts[parts.length - 1] || "").trim();
    const names = suggestArtists(query, pool);
    fill(names);
  };

  const applySuggestion = (name) => {
    const raw = (inputEl.value || "").toString();
    const parts = raw.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    if(parts.length <= 1){
      inputEl.value = name;
      return;
    }
    parts[parts.length - 1] = name;
    inputEl.value = parts.join(", ");
  };

  loadSongs().then((songs) => {
    pool = uniqueArtistsFromSongs(songs);
  });

  inputEl.addEventListener("focus", update);
  inputEl.addEventListener("input", update);
  inputEl.addEventListener("blur", () => {
    const normalized = normalizeArtistInput(inputEl.value);
    if(normalized){
      inputEl.value = formatArtistInputValue(normalized);
    }
    setTimeout(() => fill([]), 120);
  });

  listEl.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.("button[data-artist]");
    if(!btn) return;
    applySuggestion(btn.dataset.artist || "");
    inputEl.focus();
    fill([]);
  });
}

function songId(song){
  if(song?.id) return String(song.id);
  const pdf = (song?.pdf || "").toString().trim();
  const page = song?.page_original;
  if(pdf && page != null && page !== "") return `${pdf}|${page}`;
  return "";
}

function toMs(ts){
  if(!ts) return 0;
  if(typeof ts.toMillis === "function") return ts.toMillis();
  if(typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

function mergeSongs(baseSongs, submissions, options = {}){
  const includePending = options.includePending !== false;
  const currentUserId = options.currentUserId || null;
  const base = (baseSongs || []).map(s => {
    const id = songId(s);
    return {
      ...s,
      id,
      sourceId: id,
      pending: false,
      approved: false,
      submissionId: ""
    };
  });

  const editsBySource = new Map();
  const newItems = [];

  (submissions || []).forEach(sub => {
    const status = (sub?.status || "pending").toString();
    if(status === "rejected") return;
    // Pending değişiklikleri göster: admin ise hepsini, normal kullanıcı ise sadece kendi yaptıklarını
    if(status === "pending" && !includePending){
      // Eğer kullanıcı kendi yaptığı değişikliği görüyorsa, onu da dahil et
      if(currentUserId && sub.createdBy === currentUserId){
        log("✅ Kullanıcının kendi pending değişikliği dahil ediliyor:", sub._id, sub.sourceId);
        // Kullanıcının kendi değişikliği, dahil et - devam et
      } else {
        log("⏭️ Başkasının pending değişikliği atlanıyor:", sub._id);
        return; // Başkasının pending değişikliği, atla
      }
    }
    const type = (sub?.type || "").toString().toLowerCase();
    const sourceId = (sub?.sourceId || "").toString().trim();

    if(type === "new" || !sourceId){
      const id = `new:${sub._id}`;
      newItems.push({
        ...sub,
        id,
        sourceId: "",
        pending: status === "pending",
        approved: status === "approved",
        submissionId: sub._id
      });
      return;
    }

    const prev = editsBySource.get(sourceId);
    const subMs = toMs(sub.updatedAt || sub.createdAt);
    const prevMs = prev ? toMs(prev.updatedAt || prev.createdAt) : -1;
    if(!prev || subMs >= prevMs){
      editsBySource.set(sourceId, sub);
      log("📌 Edit kaydedildi:", sourceId, "status:", sub.status, "createdBy:", sub.createdBy, "type:", sub.type);
    }
  });

  log("🗺️ editsBySource map size:", editsBySource.size, "entries:", Array.from(editsBySource.entries()).map(([k, v]) => ({ sourceId: k, status: v.status, createdBy: v.createdBy })));

  const merged = base.map(song => {
    const sub = editsBySource.get(song.sourceId);
    if(!sub) return song;
    log("🔄 Şarkı merge ediliyor:", song.sourceId, "submission:", sub._id, "status:", sub.status);

    const overlay = {};
    ["song","artist","key","pdf","volume","page_original","text"].forEach(key => {
      const val = sub[key];
      if(val != null && val !== "") overlay[key] = val;
    });
    return {
      ...song,
      ...overlay,
      pending: sub.status === "pending",
      approved: sub.status === "approved",
      submissionId: sub._id
    };
  });

  return merged.concat(newItems);
}

// Global Firebase initialization promise - tüm çağrılar aynı promise'i bekler
let __firebaseInitPromise = null;
function waitForFirebaseInit() {
  if (__firebaseInitPromise) {
    return __firebaseInitPromise;
  }
  
  __firebaseInitPromise = (async () => {
    // Firebase SDK yüklenene kadar bekle
    let retryCount = 0;
    const maxRetries = 20; // 10 saniye
    while (retryCount < maxRetries && (!window.firebase || !window.fbAuth || !window.fbDb)) {
      await new Promise(resolve => setTimeout(resolve, 500));
      retryCount++;
    }
    
    if (!window.firebase) {
      warn("⚠️ Firebase SDK not loaded after waiting");
      return false;
    }
    
    // Auth state hazır olana kadar bekle (sadece ilk kez)
    if (window.fbAuth && !window.__authStateReady) {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          window.__authStateReady = true;
          resolve();
        }, 2000); // Max 2 saniye bekle
        const unsubscribe = window.fbAuth.onAuthStateChanged((user) => {
          clearTimeout(timeout);
          window.__authStateReady = true;
          unsubscribe();
          resolve();
        });
      });
    }
    
    // Firestore'un tamamen hazır olmasını bekle
    if (window.fbDb) {
      try {
        // Firestore'un hazır olduğunu test et - basit bir işlem yap
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(); // Timeout'ta devam et
          }, 2000);
          
          // Firestore'un hazır olduğunu kontrol et
          if (window.fbDb._delegate && window.fbDb._delegate._databaseId) {
            clearTimeout(timeout);
            resolve();
          } else {
            // Biraz bekle ve tekrar dene
            setTimeout(() => {
              clearTimeout(timeout);
              resolve();
            }, 500);
          }
        });
      } catch (err) {
        warn("⚠️ Firestore readiness check failed:", err);
      }
    }
    
    return true;
  })();
  
  return __firebaseInitPromise;
}

// Global loadSongs lock - eşzamanlı çağrıları engelle
let __loadSongsInProgress = null;

async function loadSongs(options = {}){
  // Eğer zaten bir loadSongs çağrısı devam ediyorsa, onu bekle
  if (__loadSongsInProgress) {
    return __loadSongsInProgress;
  }
  
  // Yeni bir promise oluştur
  __loadSongsInProgress = (async () => {
    try {
      // Firebase'in hazır olmasını bekle (tüm çağrılar aynı promise'i bekler)
      await waitForFirebaseInit();
      
      const currentUser = window.fbAuth?.currentUser;
      const includePending = typeof options.includePending === "boolean"
        ? options.includePending
        : !!window.isAdminUser?.(currentUser);
      const currentUserId = currentUser?.uid || null;
      
      // Cache key'e currentUserId de ekle
      const cacheKey = `${includePending}_${currentUserId || 'anonymous'}`;
      
      // Eğer cache varsa ve key eşleşiyorsa, cache'i kullan
      if (window.__songsCache && window.__songsCacheKey === cacheKey && window.__songsCache.length > 0) {
        window.SONGS = window.__songsCache;
        return window.__songsCache;
      }
      
      // Cache key değişmişse temizle
      if (window.__songsCache && window.__songsCacheKey !== cacheKey) {
        window.__songsCache = null;
        window.__songsCacheKey = null;
      }

      let base = [];
      let jsonRetryCount = 0;
      const jsonMaxRetries = 3;
      
      while(jsonRetryCount < jsonMaxRetries && base.length === 0) {
        try{
          const res = await fetch(`/assets/songs.json?v=${Date.now()}`, { 
            cache: "no-store",
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          if(res.ok) {
            base = await res.json();
            break;
          } else {
            // Retry without cache-busting
            const retryRes = await fetch("/assets/songs.json", { cache: "no-store" });
            if(retryRes.ok) {
              base = await retryRes.json();
              break;
            }
          }
        }catch(err){
          jsonRetryCount++;
          if(jsonRetryCount < jsonMaxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * jsonRetryCount));
          }
        }
      }
      
      if(base.length === 0) {
        // Son çare: cache'den dene
        if(window.__songsCache && window.__songsCache.length > 0) {
          window.SONGS = window.__songsCache;
          return window.__songsCache;
        }
        return [];
      }

      let subs = [];
      const db = window.fbDb;
      if(db){
        try{
          // Firestore'un hazır olduğundan emin ol - daha uzun bekleme
          if (!db._delegate || !db._delegate._databaseId) {
            // Firestore henüz hazır değil, daha uzun bekle
            let retries = 0;
            const maxRetries = 10;
            while (retries < maxRetries && (!db._delegate || !db._delegate._databaseId)) {
              await new Promise(resolve => setTimeout(resolve, 500));
              retries++;
            }
          }
          
          // Eğer hala hazır değilse, Firestore sorgusunu atla
          if (!db._delegate || !db._delegate._databaseId) {
            warn("⚠️ Firestore not ready, skipping submissions query");
          } else {
            // Firebase timeout - 8 saniye içinde tamamlanmazsa devam et
            const firebasePromise = db
              .collection("song_submissions")
              .where("status", "in", ["pending","approved"])
              .get();
            
            const timeoutPromise = new Promise((resolve) => {
              setTimeout(() => {
                resolve({ docs: [] });
              }, 8000);
            });
            
            const snap = await Promise.race([firebasePromise, timeoutPromise]);
            subs = snap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
          }
        }catch(err){
          // Firestore hatası - sessizce devam et, sadece base songs kullan
          // "INTERNAL ASSERTION FAILED" hatasını özel olarak yakala
          if (err.message && err.message.includes("INTERNAL ASSERTION FAILED")) {
            warn("⚠️ Firestore internal error, using base songs only");
          } else {
            warn("⚠️ Firestore query failed, using base songs only:", err.message);
          }
        }
      }

      try {
        window.__songsCache = mergeSongs(base, subs, { includePending, currentUserId });
        window.__songsCacheIncludePending = includePending;
        window.__songsCacheKey = cacheKey;
        window.SONGS = window.__songsCache;
        
        updateGlobalStats(window.__songsCache);
        return window.__songsCache;
      } catch(err) {
        error("❌ mergeSongs() error:", err);
        window.__songsCache = base;
        window.__songsCacheKey = cacheKey;
        window.SONGS = window.__songsCache;
        return window.__songsCache;
      }
    } finally {
      // Lock'u temizle
      __loadSongsInProgress = null;
    }
  })();
  
  return __loadSongsInProgress;
}

// loadSongs'u window objesine de ata - mobil search overlay için
window.loadSongs = loadSongs;
// waitForFirebaseInit'i de export et - diğer dosyalar kullanabilsin
window.waitForFirebaseInit = waitForFirebaseInit;

function clearSongsCache(){
  window.__songsCache = null;
  window.__songsCacheIncludePending = null;
  window.__songsCacheKey = null;
  window.SONGS = null;
  // Firebase init promise'i de sıfırla (yeniden başlatmak için)
  __firebaseInitPromise = null;
  // Tüm cache'leri temizle
  if('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  // Service Worker cache'ini de temizle
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
}

// Favorileme fonksiyonları
let userFavoritesCache = null;
let userFavoritesCacheUid = null;

async function loadUserFavorites(uid){
  if(userFavoritesCache && userFavoritesCacheUid === uid){
    return userFavoritesCache;
  }
  const db = window.fbDb;
  if(!db || !uid) return [];
  
  try{
    const snap = await db.collection("favorites").where("uid", "==", uid).get();
    const favorites = snap.docs.map(doc => doc.data().songId).filter(Boolean);
    userFavoritesCache = favorites;
    userFavoritesCacheUid = uid;
    return favorites;
  }catch(err){
    warn("Favoriler yüklenemedi:", err);
    return [];
  }
}

function clearFavoritesCache(){
  userFavoritesCache = null;
  userFavoritesCacheUid = null;
}

function isFavorite(songId, favorites){
  return favorites && favorites.includes(songId);
}

async function toggleFavoriteSong(song){
  const user = window.fbAuth?.currentUser;
  const db = window.fbDb;
  
  if(!user || !db){
    window.requireAuthAction?.(() => {
      toggleFavoriteSong(song);
    }, "Ji bo favorî divê tu têkevî.");
    return false;
  }
  
  const sId = window.songId?.(song) || "";
  if(!sId) return false;
  
  const favId = `${user.uid}_${sId}`;
  const favRef = db.collection("favorites").doc(favId);
  
  try{
    const doc = await favRef.get();
    if(doc.exists){
      await favRef.delete();
      clearFavoritesCache();
      return false; // Favoriden çıkarıldı
    }else{
      const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
      await favRef.set({
        uid: user.uid,
        songId: sId,
        song: song?.song || "",
        artist: song?.artist || "",
        createdAt: stamp
      });
      clearFavoritesCache();
      return true; // Favorilere eklendi
    }
  }catch(err){
    error("Favori kaydedilemedi:", err);
    return null;
  }
}

window.songId = songId;
window.loadSongs = loadSongs;
window.clearSongsCache = clearSongsCache;
window.formatSongTitle = formatSongTitle;
window.norm = norm;
window.pickRandom = pickRandom;
window.formatArtistName = formatArtistName;
window.formatArtistList = formatArtistList;
window.formatArtistInputValue = formatArtistInputValue;
window.normalizeArtistInput = normalizeArtistInput;
window.initArtistSuggest = initArtistSuggest;
window.loadUserFavorites = loadUserFavorites;
window.clearFavoritesCache = clearFavoritesCache;
window.isFavorite = isFavorite;
window.toggleFavoriteSong = toggleFavoriteSong;
window.updateGlobalStats = updateGlobalStats;
window.isAdminUser = (user) => {
  const email = (user?.email || "").toString().trim().toLowerCase();
  return !!email && ADMIN_EMAILS.includes(email);
};

(function initGlobalStats(){
  if(document.getElementById("statSongs") || document.getElementById("statArtists")){
    loadSongs().catch(() => {});
  }
})();

async function ensureProfile(user){
  // Firebase'in hazır olmasını bekle
  if (typeof window.waitForFirebaseInit === "function") {
    await window.waitForFirebaseInit();
  } else {
    // Fallback: Firebase'in hazır olmasını bekle
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries && (!window.fbDb || !window.fbDb._delegate)) {
      await new Promise(resolve => setTimeout(resolve, 300));
      retries++;
    }
  }
  
  const db = window.fbDb;
  if(!db || !user) return;
  
  // Firestore'un hazır olduğundan emin ol
  if (!db._delegate || !db._delegate._databaseId) {
    // Biraz bekle ve tekrar dene
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  try {
    const ref = db.collection("profiles").doc(user.uid);
    const snap = await ref.get().catch(() => null);
    const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
    const payload = {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      lastLoginAt: stamp
    };
    if(!snap || !snap.exists){
      payload.createdAt = stamp;
    }
    await ref.set(payload, { merge: true });
  }catch(err){
    // Sessizce devam et - profil kaydı kritik değil
    warn("Profil kaydı oluşturulamadı:", err.message);
  }
}

function initAddSongPanel(onSaved){
  const auth = window.fbAuth;
  const db = window.fbDb;
  const addToggleWrap = document.getElementById("addSongToggleWrap");
  const addToggle = document.getElementById("addSongToggle");
  const addPanel = document.getElementById("addSongPanel");
  const addClose = document.getElementById("addSongClose");
  const addSave = document.getElementById("addSongSave");
  const addNotice = document.getElementById("addSongNotice");
  const addSongName = document.getElementById("addSongName");
  const addSongArtist = document.getElementById("addSongArtist");
  const addSongKey = document.getElementById("addSongKey");
  const addSongText = document.getElementById("addSongText");
  const addArtistSuggest = document.getElementById("addSongArtistSuggest");

  if(!addPanel) return false;

  const adjustTextareaHeight = (el) => {
    if(!el) return;
    el.style.height = "auto";
    el.style.height = (el.scrollHeight) + "px";
  };

  const setNotice = (msg, isError = false) => {
    if(!addNotice) return;
    addNotice.textContent = msg || "";
    addNotice.style.color = isError ? "#ef4444" : "";
  };

  const resetForm = () => {
    if(addSongName) addSongName.value = "";
    if(addSongArtist) addSongArtist.value = "";
    if(addSongKey) addSongKey.value = "";
    if(addSongText) {
      addSongText.value = "";
      adjustTextareaHeight(addSongText);
    }
  };

  const closePanel = () => {
    addPanel?.classList.add("is-hidden");
    resetForm();
  };

  if(addToggleWrap) addToggleWrap.style.display = "flex";
  if(addSongArtist && addArtistSuggest){
    initArtistSuggest(addSongArtist, addArtistSuggest);
  }
  
  // Artist input tooltip yönetimi
  const artistInfoIcon = document.querySelector("#addSongArtist")?.previousElementSibling?.querySelector(".infoIcon");
  if(artistInfoIcon && addSongArtist){
    let tooltipElement = null;
    let tooltipVisible = false;
    
    const createTooltip = () => {
      if(tooltipElement) return tooltipElement;
      const tooltip = document.createElement("div");
      tooltip.className = "artist-tooltip";
      tooltip.innerHTML = `
        <button class="tooltip-close" aria-label="Kapat">✕</button>
        <div class="tooltip-content">${artistInfoIcon.getAttribute("data-tooltip")}</div>
      `;
      document.body.appendChild(tooltip);
      tooltipElement = tooltip;
      
      // Kapatma butonuna tıklayınca kapat
      tooltip.querySelector(".tooltip-close").addEventListener("click", (e) => {
        e.stopPropagation();
        hideTooltip();
      });
      
      return tooltip;
    };
    
    const showTooltip = () => {
      if(tooltipVisible) return;
      tooltipVisible = true;
      const tooltip = createTooltip();
      tooltip.classList.add("tooltip-visible");
      artistInfoIcon.classList.add("tooltip-active");
    };
    
    const hideTooltip = () => {
      if(!tooltipVisible) return;
      tooltipVisible = false;
      if(tooltipElement) {
        tooltipElement.classList.remove("tooltip-visible");
      }
      artistInfoIcon.classList.remove("tooltip-active");
    };
    
    // Input'a focus olduğunda göster
    addSongArtist.addEventListener("focus", showTooltip);
    
    // Icon'a tıklayınca toggle
    artistInfoIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if(tooltipVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    });
    
    // Input'tan çıkınca kapat (biraz gecikmeyle)
    addSongArtist.addEventListener("blur", () => {
      setTimeout(() => {
        if(document.activeElement !== addSongArtist && document.activeElement !== tooltipElement?.querySelector(".tooltip-close")) {
          hideTooltip();
        }
      }, 200);
    });
    
    // Panel kapanınca tooltip'i temizle
    const panelObserver = new MutationObserver(() => {
      if(addPanel.classList.contains("is-hidden")) {
        hideTooltip();
        if(tooltipElement) {
          tooltipElement.remove();
          tooltipElement = null;
        }
      }
    });
    panelObserver.observe(addPanel, { attributes: true, attributeFilter: ["class"] });
  }
  
  // Textarea otomatik yükseklik ayarlaması
  if(addSongText){
    addSongText.addEventListener("input", () => {
      adjustTextareaHeight(addSongText);
    });
    // İlk yüklemede de ayarla
    setTimeout(() => adjustTextareaHeight(addSongText), 0);
  }
  
  // Initialize enhancements (after panel is ready)
  setTimeout(() => {
    if(document.getElementById("chordDictionary")){
      initChordDictionary("chordDictionary", "addSongText");
    }
    initEditPanelEnhancements(
      "add",
      "addSongText",
      "addSongCharCount",
      "addSongChordCount",
      "addSongValidation",
      "addSongPreview",
      "addSongPreviewToggle"
    );
    
    // Mobilde klavye navigasyonu - Enter ile sonraki alana geç
    if(window.innerWidth <= 768){
      const inputs = [addSongName, addSongArtist, addSongKey].filter(Boolean);
      inputs.forEach((input, index) => {
        if(input && inputs[index + 1]){
          input.addEventListener("keydown", (e) => {
            if(e.key === "Enter" && !e.shiftKey){
              e.preventDefault();
              inputs[index + 1].focus();
              // Mobilde input görünür olsun
              setTimeout(() => {
                inputs[index + 1].scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }
          });
        }
      });
      
      // Input'lara focus olduğunda görünür olsun
      [addSongName, addSongArtist, addSongKey, addSongText].forEach(input => {
        if(input){
          input.addEventListener("focus", () => {
            setTimeout(() => {
              input.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
          });
        }
      });
    }
  }, 100);
  
  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !addPanel.classList.contains("is-hidden")){
      closePanel();
    }
  });
  
  if(auth){
    auth.onAuthStateChanged((user) => {
      if(!user) closePanel();
      window.updateFilterOptions?.(user);
    });
  }

  const openPanel = () => {
    if(!window.fbAuth?.currentUser){
      window.requireAuthAction?.(() => {
        addPanel.classList.remove("is-hidden");
        // Mobilde panel açıldığında scroll ve focus
        if(window.innerWidth <= 768){
          setTimeout(() => {
            addPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
            if(addSongName){
              setTimeout(() => {
                addSongName.focus();
                addSongName.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 300);
            }
          }, 50);
        } else {
          addPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setTimeout(() => adjustTextareaHeight(addSongText), 100);
      }, "Ji bo stran zêde kirinê divê tu têkevî.");
      return;
    }
    addPanel.classList.remove("is-hidden");
    // Mobilde panel açıldığında scroll ve focus
    if(window.innerWidth <= 768){
      setTimeout(() => {
        addPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if(addSongName){
          setTimeout(() => {
            addSongName.focus();
            addSongName.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
        }
      }, 50);
    } else {
      addPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => adjustTextareaHeight(addSongText), 100);
  };

  // openPanel fonksiyonunu global olarak expose et
  window.openAddSongPanel = openPanel;
  
  addToggle?.addEventListener("click", () => {
    if(addPanel.classList.contains("is-hidden")){
      openPanel();
    }else{
      addPanel.classList.add("is-hidden");
    }
  });
  addClose?.addEventListener("click", closePanel);

  addSave?.addEventListener("click", async () => {
    const user = window.fbAuth?.currentUser;
    if(!db || !user){
      window.requireAuthAction?.(() => {
        addPanel.classList.remove("is-hidden");
      }, "Ji bo stran zêde kirinê divê tu têkevî.");
      return;
    }
    
    // Validation
    const song = (addSongName?.value || "").trim();
    const rawArtist = (addSongArtist?.value || "").trim();
    const artist = normalizeArtistInput(rawArtist);
    const key = (addSongKey?.value || "").trim();
    const text = (addSongText?.value || "").toString();
    
    // Remove error classes
    if(addSongName) addSongName.classList.remove("error");
    if(addSongArtist) addSongArtist.classList.remove("error");
    if(addSongKey) addSongKey.classList.remove("error");
    if(addSongText) addSongText.classList.remove("error");
    
    let hasError = false;
    
    if(!song){
      setNotice("Navê stranê pêwîst e.", true);
      if(addSongName){
        addSongName.classList.add("error");
        addSongName.focus();
      }
      hasError = true;
    }
    
    if(!rawArtist || !artist){
      if(!hasError){
        setNotice("Navê hunermendê pêwîst e.", true);
        if(addSongArtist){
          addSongArtist.classList.add("error");
          addSongArtist.focus();
        }
        hasError = true;
      }
    }
    
    if(!key){
      if(!hasError){
        setNotice("Tonê orîjînal pêwîst e.", true);
        if(addSongKey){
          addSongKey.classList.add("error");
          addSongKey.focus();
        }
        hasError = true;
      }
    }
    
    if(!text || !text.trim()){
      if(!hasError){
        setNotice("Nivîsa stranê pêwîst e.", true);
        if(addSongText){
          addSongText.classList.add("error");
          addSongText.focus();
        }
        hasError = true;
      }
    }
    
    if(hasError) return;

    try{
      const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
      await db.collection("song_submissions").add({
        type: "new",
        status: "pending",
        song,
        artist,
        key,
        text,
        volume: "USER",
        createdBy: user.uid,
        createdByEmail: user.email || "",
        createdAt: stamp,
        updatedAt: stamp
      });

      clearSongsCache?.();
      setNotice("Niha tomar kir. Guhertinên te ji bo pejirandina edîtorê li benda ne. Piştî pejirandinê guhertinên te dê xuya bibin.");
      if(addNotice){
        addNotice.style.color = "#059669";
        addNotice.style.background = "rgba(5, 150, 105, 0.1)";
        addNotice.style.border = "1px solid rgba(5, 150, 105, 0.2)";
        addNotice.style.padding = "12px 16px";
        addNotice.style.borderRadius = "8px";
        addNotice.style.marginTop = "16px";
      }
      
      // Mesajı 2 saniye göster, sonra formu temizle ve panel'i kapat
      setTimeout(() => {
        resetForm();
        closePanel();
        if(typeof onSaved === "function") onSaved();
      }, 2000);
    }catch(err){
      setNotice(translateError(err) || "Nehat tomarkirin.", true);
    }
  });

  window.openAddSongPanel = openPanel;

  const openFromHash = () => {
    if(location.hash === "#add-song"){
      openPanel();
    }
  };
  window.addEventListener("hashchange", openFromHash);
  setTimeout(openFromHash, 0);

  return true;
}

// ============================================
// EDIT PANEL ENHANCEMENTS
// ============================================

// Chord validation
function validateChords(text){
  const chordPattern = /\b([A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?)\b/g;
  const matches = text.match(chordPattern) || [];
  const validRoots = ["C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B"];
  const errors = [];
  const warnings = [];
  
  matches.forEach(chord => {
    // Extract root note (before any modifiers)
    const rootMatch = chord.match(/^([A-G][#b]?)/);
    if(!rootMatch){
      if(!errors.includes(chord)){
        errors.push(chord);
      }
      return;
    }
    
    const root = rootMatch[1];
    if(!validRoots.includes(root)){
      if(!errors.includes(chord)){
        errors.push(chord);
      }
    }
  });
  
  return { errors, warnings, chordCount: matches.length };
}

// Extract chords from text
function extractChords(text){
  const chordPattern = /\b([A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?)\b/g;
  const matches = text.match(chordPattern) || [];
  return [...new Set(matches)];
}

// Highlight chords in text (for preview)
function highlightChordsInText(text){
  const chordPattern = /\b([A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?)\b/g;
  return escapeHtml(text).replace(chordPattern, '<strong class="chordTok">$1</strong>');
}

// Song templates - akorlar sözlerin üstünde, parantez yok
const SONG_TEMPLATES = {
  verse: "C        Am\nStranên te\nF        G\nBi stranên min\n\nC        Am\nLi hev bûn\nF        G\nEm bûn yek",
  chorus: "C        Am\nNakokî\nF        G\nNakokî",
  bridge: "Am       F\nBridge\nC        G\nBridge"
};

// Common chords for dictionary
const COMMON_CHORDS = [
  "C", "Cm", "C#", "C#m", "Db", "Dbm",
  "D", "Dm", "D#", "D#m", "Eb", "Ebm",
  "E", "Em", "F", "Fm", "F#", "F#m", "Gb", "Gbm",
  "G", "Gm", "G#", "G#m", "Ab", "Abm",
  "A", "Am", "A#", "A#m", "Bb", "Bbm",
  "B", "Bm"
];

// Initialize chord dictionary
function initChordDictionary(containerId, textareaId){
  const container = document.getElementById(containerId);
  const grid = container?.querySelector(".chordDictGrid");
  const textarea = document.getElementById(textareaId);
  
  if(!grid || !textarea) return;
  
  grid.innerHTML = COMMON_CHORDS.map(chord => 
    `<button type="button" class="chordDictBtn" data-chord="${chord}">${chord}</button>`
  ).join("");
  
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".chordDictBtn");
    if(!btn) return;
    
    const chord = btn.dataset.chord;
    const textareaEl = document.getElementById(textareaId);
    if(!textareaEl) return;
    
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;
    const text = textareaEl.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    // Akor parantez olmadan ekleniyor
    textareaEl.value = before + chord + after;
    textareaEl.selectionStart = textareaEl.selectionEnd = start + chord.length;
    textareaEl.focus();
    
    // Trigger input event for validation
    textareaEl.dispatchEvent(new Event("input"));
  });
}

// Update line numbers
function updateLineNumbers(textareaId, lineNumbersId){
  const textarea = document.getElementById(textareaId);
  const lineNumbers = document.getElementById(lineNumbersId);
  
  if(!textarea || !lineNumbers) return;
  
  const text = textarea.value;
  const lines = text.split('\n');
  const currentLine = text.substring(0, textarea.selectionStart).split('\n').length;
  
  // Calculate visible lines based on scroll
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 2.2 * 14;
  const scrollTop = textarea.scrollTop;
  const visibleStart = Math.floor(scrollTop / lineHeight);
  const visibleEnd = Math.ceil((scrollTop + textarea.clientHeight) / lineHeight);
  
  lineNumbers.innerHTML = lines.map((line, index) => {
    const lineNum = index + 1;
    const isCurrent = lineNum === currentLine;
    const hasError = false; // Can be enhanced with per-line validation
    
    let className = "lineNumber";
    if(isCurrent) className += " current-line";
    if(hasError) className += " has-error";
    
    return `<span class="${className}" data-line="${lineNum}">${lineNum}</span>`;
  }).join('\n');
  
  // Sync scroll
  lineNumbers.scrollTop = textarea.scrollTop;
}

// Initialize edit panel enhancements
function initEditPanelEnhancements(panelPrefix, textareaId, charCountId, chordCountId, validationId, previewId, previewToggleId){
  const textarea = document.getElementById(textareaId);
  const charCount = document.getElementById(charCountId);
  const chordCount = document.getElementById(chordCountId);
  const validation = document.getElementById(validationId);
  const preview = document.getElementById(previewId);
  const previewToggle = document.getElementById(previewToggleId);
  const lineNumbersId = `${panelPrefix === "add" ? "addSong" : "edit"}LineNumbers`;
  
  if(!textarea) return;
  
  // Character and chord counting
  const updateCounts = () => {
    const text = textarea.value;
    // Boşlukları (space, tab, newline, vb.) çıkararak karakter sayısı
    const textWithoutSpaces = text.replace(/\s+/g, ''); // Tüm whitespace karakterleri
    const charLength = textWithoutSpaces.length;
    if(charCount) charCount.textContent = `${charLength} karakter`;
    
    const chords = extractChords(text);
    if(chordCount) chordCount.textContent = `${chords.length} akor`;
    
    // Update line numbers
    updateLineNumbers(textareaId, lineNumbersId);
    
    // Validation
    if(validation){
      const validationResult = validateChords(text);
      validation.className = "validationStatus";
      
      if(validationResult.errors.length > 0){
        validation.className += " has-errors";
        validation.textContent = `⚠️ ${validationResult.errors.length} geçersiz akor: ${validationResult.errors.slice(0, 3).join(", ")}`;
      } else if(text.length > 0 && chords.length === 0){
        validation.className += " has-warnings";
        validation.textContent = "ℹ️ Akor bulunamadı";
      } else if(text.length > 0){
        validation.className += " is-valid";
        validation.textContent = "✓ Format doğru";
      } else {
        validation.textContent = "";
      }
    }
    
    // Preview
    if(preview){
      preview.innerHTML = highlightChordsInText(text);
    }
  };
  
  // Sync scroll between textarea and line numbers
  const syncScroll = () => {
    const lineNumbers = document.getElementById(lineNumbersId);
    if(lineNumbers) lineNumbers.scrollTop = textarea.scrollTop;
  };
  
  textarea.addEventListener("scroll", syncScroll);
  
  // Update on cursor move (cross-browser compatible)
  const updateCursor = () => {
    updateCounts();
    syncScroll();
  };
  
  textarea.addEventListener("keyup", updateCursor);
  textarea.addEventListener("click", updateCursor);
  textarea.addEventListener("input", () => {
    updateCounts();
    // Small delay to ensure cursor position is updated
    setTimeout(syncScroll, 0);
  });
  
  // Also update on mouse move in textarea
  textarea.addEventListener("mousemove", () => {
    if(document.activeElement === textarea){
      updateCursor();
    }
  });
  
  textarea.addEventListener("input", updateCounts);
  updateCounts();
  
  // Preview toggle
  if(previewToggle && preview){
    previewToggle.addEventListener("click", () => {
      preview.classList.toggle("is-hidden");
      previewToggle.textContent = preview.classList.contains("is-hidden") ? "Önizleme" : "Düzenle";
    });
  }
  
  // Template buttons
  const verseBtn = document.getElementById(`${panelPrefix === "add" ? "add" : "edit"}TemplateVerse`);
  const chorusBtn = document.getElementById(`${panelPrefix === "add" ? "add" : "edit"}TemplateChorus`);
  const bridgeBtn = document.getElementById(`${panelPrefix === "add" ? "add" : "edit"}TemplateBridge`);
  
  const insertTemplate = (template) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const templateText = template + "\n\n";
    textarea.value = before + templateText + after;
    textarea.selectionStart = textarea.selectionEnd = start + templateText.length;
    
    // Textarea yüksekliğini içeriğe göre ayarla
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(300, textarea.scrollHeight) + 'px';
    
    textarea.focus();
    updateCounts();
    
    // Scroll'u en üste al (mobilde görünürlük için)
    setTimeout(() => {
      textarea.scrollTop = 0;
      const lineNumbers = document.getElementById(lineNumbersId);
      if(lineNumbers) lineNumbers.scrollTop = 0;
    }, 50);
  };
  
  if(verseBtn) verseBtn.addEventListener("click", () => insertTemplate(SONG_TEMPLATES.verse));
  if(chorusBtn) chorusBtn.addEventListener("click", () => insertTemplate(SONG_TEMPLATES.chorus));
  if(bridgeBtn) bridgeBtn.addEventListener("click", () => insertTemplate(SONG_TEMPLATES.bridge));
  
  // Format help is now always visible when needed, no toggle button
  
  // Chord dictionary toggle
  const chordDictToggle = document.getElementById(`toggleChordDict${panelPrefix === "add" ? "" : "Edit"}`);
  const chordDictPanel = document.getElementById(`chordDictionary${panelPrefix === "add" ? "" : "Edit"}`);
  if(chordDictToggle && chordDictPanel){
    chordDictToggle.addEventListener("click", () => {
      chordDictPanel.classList.toggle("is-hidden");
    });
    
    // Close on outside click
    document.addEventListener("click", (e) => {
      if(!chordDictPanel.contains(e.target) && !chordDictToggle.contains(e.target)){
        chordDictPanel.classList.add("is-hidden");
      }
    });
  }
  
  // Keyboard shortcuts
  textarea.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + S: Save
    if((e.ctrlKey || e.metaKey) && e.key === "s"){
      e.preventDefault();
      const saveBtn = document.getElementById(`${panelPrefix === "add" ? "addSong" : "edit"}Save`);
      if(saveBtn) saveBtn.click();
    }
  });
  
  // Key suggestion based on song name
  const songNameInput = document.getElementById(`${panelPrefix === "add" ? "addSong" : "edit"}Name`) || document.getElementById(`${panelPrefix === "add" ? "addSong" : "edit"}Song`);
  const keySuggestion = document.getElementById(`${panelPrefix === "add" ? "addSong" : "editSong"}KeySuggestion`);
  const keySelect = document.getElementById(`${panelPrefix === "add" ? "addSong" : "edit"}Key`);
  
  if(songNameInput && keySuggestion){
    songNameInput.addEventListener("input", () => {
      const songName = songNameInput.value.toLowerCase();
      // Simple heuristic: check if song name contains common key indicators
      const keyMap = {
        "c": "C", "d": "D", "e": "E", "f": "F", "g": "G", "a": "A", "b": "B"
      };
      
      for(const [key, value] of Object.entries(keyMap)){
        if(songName.includes(key)){
          keySuggestion.textContent = `💡 Öneri: ${value} tonu`;
          keySuggestion.style.display = "block";
          if(keySelect && !keySelect.value){
            // Auto-select if empty
            const option = Array.from(keySelect.options).find(opt => opt.value === value);
            if(option) keySelect.value = value;
          }
          return;
        }
      }
      keySuggestion.style.display = "none";
    });
  }
}

window.initEditPanelEnhancements = initEditPanelEnhancements;
window.initChordDictionary = initChordDictionary;
window.validateChords = validateChords;
window.extractChords = extractChords;
window.highlightChordsInText = highlightChordsInText;
window.updateLineNumbers = updateLineNumbers;

window.initAddSongPanel = initAddSongPanel;

(function initTheme(){
  document.documentElement.setAttribute("data-theme", "dark");
})();

(function initAddSongMenu(){
  // Hero karttaki giriş butonunu yönet
  const updateHeroLoginBtn = (user) => {
    const heroLoginBtn = document.getElementById("heroLoginBtn");
    if(!heroLoginBtn) return;
    
    if(user){
      // Giriş yapmış kullanıcı için butonu gizle
      heroLoginBtn.style.display = "none";
    } else {
      // Giriş yapmamış kullanıcı için butonu göster
      heroLoginBtn.style.display = "inline-flex";
    }
  };
  
  // Auth state değişikliğini dinle
  if(window.fbAuth){
    window.fbAuth.onAuthStateChanged((user) => {
      updateHeroLoginBtn(user);
    });
  } else {
    // Firebase henüz yüklenmemiş, bekle
    let attempts = 0;
    const waitForAuth = setInterval(() => {
      attempts++;
      if(window.fbAuth){
        clearInterval(waitForAuth);
        window.fbAuth.onAuthStateChanged((user) => {
          updateHeroLoginBtn(user);
        });
        // İlk durumu kontrol et
        updateHeroLoginBtn(window.fbAuth.currentUser);
      } else if(attempts >= 30){
        clearInterval(waitForAuth);
      }
    }, 100);
  }
  
  // Hero login butonuna event listener ekle
  const setupHeroLoginBtn = () => {
    const heroLoginBtn = document.getElementById("heroLoginBtn");
    if(!heroLoginBtn) {
      setTimeout(setupHeroLoginBtn, 200);
      return;
    }
    
    heroLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Auth panelini aç
      const authOpen = document.getElementById("authOpen");
      if(authOpen) {
        authOpen.click();
      }
    });
  };
  
  // DOM hazır olduğunda hero login butonunu ayarla
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", setupHeroLoginBtn);
  } else {
    setTimeout(setupHeroLoginBtn, 100);
  }
  
  // Topbar'daki Zêdeke butonunu yönet - AGRESIF YÖNTEM
  const setupTopbarButton = () => {
    const btn = document.getElementById("addSongMenuBtn");
    if(!btn) {
      setTimeout(setupTopbarButton, 100);
      return;
    }
    
    // Tüm event listener'ları temizlemek için clone et
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Çoklu event listener ekle - kesin çalışsın
    const handleClick = (e) => {
      if(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      
      // Giriş kontrolü - Firebase beklemeden direkt kontrol et
      const user = window.fbAuth?.currentUser;
      
      if(!user){
        // Giriş yapmamış - auth panelini aç
        if(typeof window.requireAuthAction === "function"){
          window.requireAuthAction(() => {
            setTimeout(() => {
              if(typeof window.openAddSongPanel === "function"){
                window.openAddSongPanel();
              } else {
                const panel = document.getElementById("addSongPanel");
                if(panel){
                  panel.classList.remove("is-hidden");
                  panel.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            }, 500);
          }, "Ji bo stran zêde kirinê divê tu têkevî.");
        } else {
          const authOpen = document.getElementById("authOpen");
          if(authOpen) authOpen.click();
        }
        return;
      }
      
      // Giriş yapmış - paneli aç
      if(typeof window.openAddSongPanel === "function"){
        window.openAddSongPanel();
      } else {
        const panel = document.getElementById("addSongPanel");
        if(panel){
          panel.classList.remove("is-hidden");
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.href = "/index.html#add-song";
        }
      }
    };
    
    // Hem onclick hem addEventListener ekle
    newBtn.onclick = handleClick;
    newBtn.addEventListener("click", handleClick, true); // capture phase
    newBtn.addEventListener("click", handleClick, false); // bubble phase
    newBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      handleClick(e);
    }, true);
  };
  
  // Çoklu deneme - kesin çalışsın
  const initTopbarButton = () => {
    setupTopbarButton();
    setTimeout(setupTopbarButton, 200);
    setTimeout(setupTopbarButton, 500);
    setTimeout(setupTopbarButton, 1000);
    setTimeout(setupTopbarButton, 2000);
    
    if(document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupTopbarButton, 100);
        setTimeout(setupTopbarButton, 500);
        setTimeout(setupTopbarButton, 1000);
      });
    }
  };
  
  // Hemen başlat ve tekrar tekrar dene
  initTopbarButton();
  
  // Window load'ta da dene
  window.addEventListener("load", () => {
    setTimeout(setupTopbarButton, 100);
    setTimeout(setupTopbarButton, 500);
  });
})();

(function initLiveBackground(){
  if (document.body?.dataset?.noBg === "true") {
    // Di rewşên wek rûpela stranê de çêkirina paşxane
    // varsa eski arka plan parçalarını temizle
    document.getElementById("bgScene")?.remove();
    document.getElementById("bgNotes")?.remove();
    document.querySelector(".bgGrain")?.remove();
    document.querySelector(".bgVignette")?.remove();
    return;
  }
  const staticBg = STATIC_BG === true;
  if(staticBg){
    document.body?.setAttribute("data-static-bg", "true");
  }
  // İki kere eklenmesin
  if (document.getElementById("bgNotes")) return;

  // Grain + vignette + notes container
  const grain = document.createElement("div");
  grain.className = "bgGrain";
  document.body.appendChild(grain);

  const vignette = document.createElement("div");
  vignette.className = "bgVignette";
  document.body.appendChild(vignette);

  const wrap = document.createElement("div");
  wrap.className = "bgNotes";
  wrap.id = "bgNotes";
  document.body.appendChild(wrap);

  // --- PRO scene (ud + davul + hareketli tel) ---
  function ensureProScene(){
    if (document.getElementById("bgScene")) return;

    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = document.createElement("div");
    scene.className = "bgScene";
    scene.id = "bgScene";

    const kilim = document.createElement("div");
    kilim.className = "bgKilim";
    scene.appendChild(kilim);

    const ud = document.createElement("img");
    ud.className = "bgInstrument bgInstrument--ud";
    ud.alt = "";
    ud.decoding = "async";
    ud.src = "/assets/images/ud.png";
    ud.onerror = () => ud.remove();
    scene.appendChild(ud);

    const davul = document.createElement("img");
    davul.className = "bgInstrument bgInstrument--davul";
    davul.alt = "";
    davul.decoding = "async";
    davul.src = "/assets/images/davul.png";
    davul.onerror = () => davul.remove();
    scene.appendChild(davul);

    const canvas = document.createElement("canvas");
    canvas.id = "bgCanvas";
    scene.appendChild(canvas);

    document.body.appendChild(scene);

    const ctx = canvas.getContext("2d", { alpha: true });

    let w = 0, h = 0, dpr = 1;
    let raf = 0;
    let t = 0;
    let mx = 0.5, my = 0.45;

    const strings = [];
    const dust = [];

    const rand = (a,b) => a + Math.random()*(b-a);

    function resize(){
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);

      strings.length = 0;
      const sCount = Math.max(8, Math.min(14, Math.round(w/170)));
      for(let i=0;i<sCount;i++){
        strings.push({
          y: h*0.16 + i*(h*0.055) + rand(-12,12),
          amp: rand(14, 28),
          freq: rand(0.006, 0.012),
          spd: rand(0.7, 1.25),
          ph: rand(0, Math.PI*2),
          a: rand(0.12, 0.22)
        });
      }

      dust.length = 0;
      const pCount = Math.max(50, Math.min(110, Math.round((w*h)/36000)));
      for(let i=0;i<pCount;i++){
        dust.push({ x: rand(0,w), y: rand(0,h), r: rand(0.7, 2.2), vx: rand(-0.08,0.08), vy: rand(0.03,0.18), a: rand(0.05,0.14) });
      }
    }

    const staticMode = prefersReduced || staticBg;

    function draw(){
      t += 0.016;
      ctx.clearRect(0,0,w,h);

      // soft roj glow
      const gr = ctx.createRadialGradient(w*0.22, h*0.10, 0, w*0.22, h*0.10, Math.min(w,h)*0.60);
      gr.addColorStop(0, "rgba(201,123,32,0.22)");
      gr.addColorStop(1, "rgba(201,123,32,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(0,0,w,h);

      // tel çizgileri
      ctx.lineWidth = 1;
      for(const s of strings){
        const y0 = s.y + (my-0.5)*24;
        ctx.beginPath();
        const steps = 140;
        for(let i=0;i<=steps;i++){
          const x = (i/steps)*w;
          const wave = Math.sin(x*s.freq + (t*s.spd) + s.ph) * s.amp;
          const sway = (mx-0.5)*22;
          const yy = y0 + wave + sway*(i/steps - 0.5);
          if(i===0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = `rgba(18,21,33,${s.a})`;
        ctx.stroke();
      }

      // toz
      for(const p of dust){
        p.x += p.vx;
        p.y += p.vy;
        if(p.y > h + 24){ p.y = -24; p.x = rand(0,w); }
        if(p.x < -24) p.x = w+24;
        if(p.x > w+24) p.x = -24;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(18,21,33,${p.a})`;
        ctx.fill();
      }

      if(!staticMode){
        raf = requestAnimationFrame(draw);
      }
    }

    function onMove(e){
      const pt = e.touches ? e.touches[0] : e;
      mx = (pt.clientX || 0) / Math.max(1, w);
      my = (pt.clientY || 0) / Math.max(1, h);
      mx = Math.max(0, Math.min(1, mx));
      my = Math.max(0, Math.min(1, my));
      scene.style.setProperty("--px", (mx-0.5).toFixed(3));
      scene.style.setProperty("--py", (my-0.5).toFixed(3));
    }

    // parallax via css vars
    const style = document.createElement("style");
    style.textContent = `
      #bgScene .bgInstrument--ud{
        transform: translate3d(calc(var(--px,0)*22px), calc(var(--py,0)*16px), 0) rotate(-8deg);
      }
      #bgScene .bgInstrument--davul{
        transform: translate3d(calc(var(--px,0)*-18px), calc(var(--py,0)*-14px), 0) rotate(8deg);
      }
    `;
    document.head.appendChild(style);

    const onResize = () => {
      resize();
      if(staticMode){
        draw();
      }
    };
    window.addEventListener("resize", onResize, { passive:true });
    if(!staticMode){
      window.addEventListener("mousemove", onMove, { passive:true });
      window.addEventListener("touchmove", onMove, { passive:true });
      document.addEventListener("visibilitychange", () => {
        if(document.hidden){
          cancelAnimationFrame(raf);
          raf = 0;
        }else if(!raf){
          raf = requestAnimationFrame(draw);
        }
      });
    }

    resize();
    if(staticMode){
      draw();
      return;
    }
    raf = requestAnimationFrame(draw);
  }

  ensureProScene();

  // Nota seti: hem evrensel hem “müzik” hissi
  const notes = ["♪","♫","𝄞","♩","♬","♭","♯"];
  const count = Math.min(18, Math.max(12, Math.floor(window.innerWidth / 90)));

  for (let i=0; i<count; i++){
    const n = document.createElement("div");
    n.className = "bgNote";
    n.textContent = notes[Math.floor(Math.random()*notes.length)];

    // Konum ve davranış
    const x = Math.random()*100;                   // vw
    const drift = (Math.random()*10 - 5);          // vw
    const dur = 10 + Math.random()*10;             // s
    const delay = -Math.random()*dur;              // negatif = hemen farklı fazlarda başlar
    const r = (Math.random()*50 - 25);             // deg
    const size = 14 + Math.random()*16;            // px

    if(staticBg){
      n.style.left = `${x}vw`;
      n.style.top = `${Math.random()*100}vh`;
    } else {
      n.style.setProperty("--x", `${x}vw`);
      n.style.setProperty("--drift", `${drift}vw`);
      n.style.setProperty("--dur", `${dur}s`);
      n.style.setProperty("--r", `${r}deg`);
      n.style.animationDelay = `${delay}s`;
    }
    n.style.fontSize = `${size}px`;

    wrap.appendChild(n);
  }
})();

(function initAuthUI(){
  // Modal sistemi kaldırıldı - artık login.html sayfası kullanılıyor
  // Bu fonksiyon sadece butonları güncellemek için kullanılıyor
  const openBtn = document.getElementById("authOpen");
  const profileLink = document.getElementById("profileLink");
  const signOutBtn = document.getElementById("authSignOut");
  const adminLink = document.getElementById("adminLink");
  
  // Eğer hiçbir auth butonu yoksa, bu sayfada auth UI yok
  if(!openBtn && !profileLink && !signOutBtn && !adminLink) {
    return;
  }

  const fb = window.firebase;
  let auth = window.fbAuth;
  
  // Firebase henüz yüklenmemişse bekle
  if(!auth && fb && fb.apps && fb.apps.length > 0){
    auth = fb.auth ? fb.auth(fb.apps[0]) : null;
  }
  
  if(!auth){
    // Firebase yüklenmemiş, bekle
    let retryCount = 0;
    const maxRetries = 20; // 10 saniye max bekleme
    const waitForAuth = setInterval(() => {
      retryCount++;
      const checkFb = window.firebase;
      if(checkFb && checkFb.apps && checkFb.apps.length > 0){
        const checkAuth = window.fbAuth || (checkFb.auth ? checkFb.auth(checkFb.apps[0]) : null);
        if(checkAuth){
          clearInterval(waitForAuth);
          // Auth hazır, fonksiyonu tekrar çağır
          setTimeout(() => initAuthUI(), 100);
        }
      }
      if(retryCount >= maxRetries){
        clearInterval(waitForAuth);
        warn("⚠️ Firebase Auth not available after waiting");
      }
    }, 500);
    return;
  }

  // profileLink, adminLink, signOutBtn zaten yukarıda tanımlandı
  
  // Mevcut sayfanın URL'ini al (returnUrl için)
  const currentUrl = window.location.pathname + window.location.search + window.location.hash;

  const setProfileButton = (user) => {
    if(!profileLink) return;
    profileLink.style.display = "inline-flex";
    profileLink.classList.add("profileLink");
    profileLink.setAttribute("aria-label", "Profil");
    profileLink.setAttribute("title", "Profil");
    profileLink.innerHTML = "";
    if(user?.photoURL){
      const img = document.createElement("img");
      img.src = user.photoURL;
      img.alt = "";
      img.className = "profileAvatar";
      profileLink.appendChild(img);
    }else{
      const span = document.createElement("span");
      span.className = "profileAvatar profileAvatar--fallback";
      span.textContent = "👤";
      profileLink.appendChild(span);
    }
  };

  // Firebase hata mesajlarını Kürtçeye çevir
  const translateError = (error) => {
    if(!error) return "Çewtiyek çêbû.";
    
    const code = error.code || "";
    const message = error.message || "";
    
    // Firebase hata kodlarına göre Kürtçe mesajlar
    const errorMap = {
      "auth/unauthorized-domain": "Ev domain destûr nedaye. Firebase console'ê kontrol bike.",
      "auth/popup-blocked": "Popup hate astengkirin.",
      "auth/popup-closed-by-user": "Popup hate girtin.",
      "auth/network-request-failed": "Girêdana înternetê tune.",
      "auth/too-many-requests": "Gelek daxwaz. Pişt re bêje.",
      "auth/user-disabled": "Bikarhêner hate astengkirin.",
      "auth/user-not-found": "Bikarhêner nehate dîtin.",
      "auth/wrong-password": "Şîfre çewt e.",
      "auth/email-already-in-use": "E-name berê hat qeydkirin.",
      "auth/weak-password": "Şîfre zêde nerm e.",
      "auth/invalid-email": "E-name nederbasdar e.",
      "auth/operation-not-allowed": "Operasyon destûr nedaye.",
      "auth/requires-recent-login": "Dîsa têkeve.",
      "auth/credential-already-in-use": "Kredensiyal berê hat bikaranîn."
    };
    
    // Önce kod kontrolü
    if(errorMap[code]) return errorMap[code];
    
    // Sonra mesaj kontrolü (İngilizce mesajları çevir)
    if(message.includes("unauthorized-domain")) return "Ev domain destûr nedaye.";
    if(message.includes("popup-blocked")) return "Popup hate astengkirin.";
    if(message.includes("network")) return "Girêdana înternetê tune.";
    if(message.includes("too many requests")) return "Gelek daxwaz. Pişt re bêje.";
    if(message.includes("user not found")) return "Bikarhêner nehate dîtin.";
    if(message.includes("wrong password")) return "Şîfre çewt e.";
    if(message.includes("email already")) return "E-name berê hat qeydkirin.";
    if(message.includes("weak password")) return "Şîfre zêde nerm e.";
    if(message.includes("invalid email")) return "E-name nederbasdar e.";
    
    // Genel mesaj
    return "Çewtiyek çêbû.";
  };

  const setStatus = (msg, isError = false) => {
    if(!statusEl) return;
    // Eğer hata mesajı ise ve obje ise çevir
    let displayMsg = msg;
    if(isError && typeof msg === "object" && msg.code){
      displayMsg = translateError(msg);
    } else if(isError && typeof msg === "string" && msg.includes("Firebase:")){
      // Firebase mesajını parse et ve çevir
      const errorObj = { message: msg, code: msg.match(/\(([^)]+)\)/)?.[1] || "" };
      displayMsg = translateError(errorObj);
    }
    statusEl.textContent = displayMsg || "";
    statusEl.style.color = isError ? "#ef4444" : "";
  };

  // googleBtn artık login.html'de, burada gerek yok

  // Hero login butonunu güncelle
  const updateHeroLoginBtn = (user) => {
    const heroLoginBtn = document.getElementById("heroLoginBtn");
    if(heroLoginBtn){
      heroLoginBtn.style.display = user ? "none" : "inline-flex";
    }
  };
  
  // Têkev butonunu login sayfasına yönlendir (eğer link ise)
  if(openBtn && openBtn.tagName === "A") {
    // Mevcut href'i koru, eğer yoksa ekle
    if(!openBtn.href || openBtn.href.includes("#") || openBtn.href === window.location.origin + "/login.html") {
      openBtn.href = `/login.html?return=${encodeURIComponent(currentUrl)}`;
    }
  }
  
  // Zêdeke butonunu login sayfasına yönlendir (giriş yapmamışsa)
  const addSongBtn = document.getElementById("addSongMenuBtn");
  if(addSongBtn && addSongBtn.tagName === "A") {
    // Mevcut href'i kontrol et, eğer login sayfasına yönlendirmiyorsa güncelle
    if(!addSongBtn.href || addSongBtn.href.includes("#") || !addSongBtn.href.includes("/login.html")) {
      addSongBtn.href = `/login.html?return=${encodeURIComponent(currentUrl)}`;
    }
  }
  
  const setLoggedOut = () => {
    log("setLoggedOut called");
    // Giriş yapmamış - Têkev butonunu göster
    if(openBtn) {
      openBtn.style.display = "inline-flex";
      log("Shown authOpen button");
    }
    if(profileLink) {
      profileLink.style.display = "none";
      log("Hidden profileLink");
    }
    if(signOutBtn) {
      signOutBtn.style.display = "none";
      log("Hidden signOutBtn");
    }
    if(adminLink) adminLink.style.display = "none";
    // Zêdeke butonunu login sayfasına yönlendir
    if(addSongBtn && addSongBtn.tagName === "A") {
      addSongBtn.href = `/login.html?return=${encodeURIComponent(currentUrl)}`;
      addSongBtn.onclick = null;
    }
    updateHeroLoginBtn(null);
  };

  const setLoggedIn = (user) => {
    // Giriş yapmış - Têkev butonunu gizle, Profil'i göster, Derketin'i gizle
    if(openBtn) openBtn.style.display = "none";
    if(profileLink) profileLink.style.display = "inline-flex";
    if(signOutBtn) signOutBtn.style.display = "none"; // Derketin butonu topbarda görünmesin
    setProfileButton(user);
    if(adminLink){
      adminLink.style.display = window.isAdminUser?.(user) ? "inline-flex" : "none";
    }
    // Zêdeke butonunu şarkı ekleme paneline yönlendir (sadece index.html'de)
    if(addSongBtn && window.location.pathname === "/index.html" || window.location.pathname === "/") {
      if(addSongBtn.tagName === "A") {
        addSongBtn.href = "#add-song";
        addSongBtn.onclick = (e) => {
          e.preventDefault();
          if(typeof window.openAddSongPanel === "function") {
            window.openAddSongPanel();
          } else {
            const panel = document.getElementById("addSongPanel");
            if(panel) {
              panel.classList.remove("is-hidden");
              panel.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        };
      }
    }
    updateHeroLoginBtn(user);
  };
  
  // Derketin butonu
  if(signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      const ok = window.confirm("Tu dixwazî derkevî?");
      if(!ok) return;
      try{
        await auth.signOut();
        window.location.href = "/index.html";
      }catch(err){
        error("Çıkış hatası:", err);
      }
    });
  }

  // İlk yüklemede mevcut kullanıcıyı kontrol et
  const currentUser = auth.currentUser;
  log("initAuthUI - currentUser:", currentUser ? currentUser.uid : "null");
  if(currentUser){
    log("Setting logged in state for:", currentUser.uid);
    setLoggedIn(currentUser);
    ensureProfile(currentUser);
  } else {
    log("Setting logged out state");
    setLoggedOut();
  }
  
  // Auth state değişikliklerini dinle - sadece bir kez setup et
  if(!window.__authUIListenerSetup){
    window.__authUIListenerSetup = true;
    auth.onAuthStateChanged((user) => {
      log("Auth state changed:", user ? user.uid : "logged out");
      if(user){
        setLoggedIn(user);
        ensureProfile(user);
      }else{
        setLoggedOut();
      }
    });
  }

  // requireAuthAction - artık login sayfasına yönlendiriyor
  window.requireAuthAction = (fn, message) => {
    if(auth.currentUser){
      if(typeof fn === "function") fn();
      return true;
    }
    // Giriş yapmamış - login sayfasına yönlendir
    const returnUrl = currentUrl;
    window.location.href = `/login.html?return=${encodeURIComponent(returnUrl)}`;
    return false;
  };
})();

function updateFilterOptions(user) {
  const filterBy = document.getElementById("filterBy");
  if (!filterBy) return;

  const pendingOption = filterBy.querySelector('option[value="pending"]');

  if (user) {
    if (!pendingOption) {
      const newOption = document.createElement("option");
      newOption.value = "pending";
      newOption.textContent = "Li benda pejirandinê";
      filterBy.appendChild(newOption);
    }
  } else {
    if (pendingOption) {
      pendingOption.remove();
      // Ger "Li benda pejirandinê" hat hilbijartin, vegerîne "Hemû"
      if (filterBy.value === "pending") {
        filterBy.value = "all";
        filterBy.dispatchEvent(new Event("change"));
      }
    }
  }
}

window.updateFilterOptions = updateFilterOptions;

// Mobil Search Overlay - Tüm sayfalarda çalışır
(function initMobileSearch() {
  let isInitialized = false;
  
  // Overlay açıkken sayfadaki listelerin güncellenmesini engellemek için flag
  window.__mobileSearchOverlayOpen = false;
  
  // Overlay HTML'ini oluştur
  function createSearchOverlay() {
    // Zaten varsa oluşturma
    if (document.getElementById("searchOverlay")) return;
    
    const overlay = document.createElement("div");
    overlay.id = "searchOverlay";
    overlay.className = "search-overlay";
    overlay.innerHTML = `
      <div class="search-overlay__header">
        <svg class="search-overlay__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M16.8 16.8L21 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input 
          id="searchOverlayInput" 
          class="search-overlay__input" 
          type="search" 
          placeholder="Stran an hunermend bigere…" 
          autocomplete="off" 
        />
        <button id="searchOverlayClear" class="search-overlay__clear" type="button" aria-label="Paqij bike">✕</button>
        <button class="search-overlay__close" type="button" aria-label="Betal bike">✕</button>
      </div>
      <div id="searchOverlayResults" class="search-overlay__results"></div>
    `;
    document.body.appendChild(overlay);
  }
  
  // Arama sonuçlarını göster
  let searchTimeout = null;
  function renderSearchResults(query) {
    const resultsContainer = document.getElementById("searchOverlayResults");
    if (!resultsContainer) return;
    
    // Query boşsa önerileri göster
    if (!query || query.trim().length === 0) {
      renderSuggestions();
      return;
    }
    
    // SONGS global değişkeninden şarkıları al
    // Önce window.SONGS'u kontrol et, yoksa window.__songsCache'i dene
    let songs = window.SONGS || window.__songsCache || [];
    
    if (!songs || songs.length === 0) {
      warn("⚠️ renderSearchResults: SONGS not found");
      // Songs yoksa boş bırak, mesaj gösterme
      resultsContainer.innerHTML = "";
      return;
    }
    
    log("✅ renderSearchResults: Found", songs.length, "songs, query:", query);
    
    // Fuzzy search kullan
    const results = window.fuzzySearch ? window.fuzzySearch(query, songs) : songs.filter(s => {
      const searchText = window.norm ? window.norm(`${s.song || ""} ${window.artistText ? window.artistText(s.artist) : ""}`) : "";
      const q = window.norm ? window.norm(query) : query.toLowerCase();
      return searchText.includes(q);
    }).slice(0, 20);
    
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-overlay__empty">
          Encam nehate dîtin
        </div>
      `;
      return;
    }
    
    // Sonuçları render et
    const artistText = window.artistText || ((artist) => {
      if (!artist) return "";
      if (Array.isArray(artist)) return artist.join(", ");
      return artist.toString();
    });
    
    const songId = window.songId || ((s) => s._id || s.sourceId || "");
    
    resultsContainer.innerHTML = `
      <div class="search-overlay__section-title">Encamên lêgerînê (${results.length})</div>
      ${results.map(song => {
      const id = songId(song);
      const title = song.song || "Bê nav";
      const artist = artistText(song.artist) || "Bê hunermend";
      const url = id ? `/song.html?id=${encodeURIComponent(id)}` : "#";
      
        return `
          <a href="${url}" class="search-overlay__result-item">
            <div style="flex: 1;">
              <div class="search-overlay__result-title">${escapeHtml(title)}</div>
              <div class="search-overlay__result-artist">${escapeHtml(artist)}</div>
            </div>
          </a>
        `;
      }).join("")}
    `;
  }
  
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Overlay'i aç/kapat
  function toggleSearchOverlay(open) {
    const overlay = document.getElementById("searchOverlay");
    const input = document.getElementById("searchOverlayInput");
    const originalInput = document.querySelector(".search--header .search__input");
    
    if (!overlay || !input) {
      warn("❌ toggleSearchOverlay: overlay or input not found");
      return;
    }
    
    if (open) {
      log("🔍 Opening search overlay...");
      overlay.classList.add("active");
      document.body.classList.add("search-overlay-open");
      // FLAG: Overlay açık - sayfadaki listeler güncellenmesin
      window.__mobileSearchOverlayOpen = true;
      
      // SONGS ve homeSample'ı güncelle (eğer yoksa)
      if (!window.SONGS || window.SONGS.length === 0) {
        // window.__songsCache'i kontrol et
        if (window.__songsCache && window.__songsCache.length > 0) {
          window.SONGS = window.__songsCache;
          log("✅ Using __songsCache, found", window.SONGS.length, "songs");
        }
      }
      
      // homeSample'ı kontrol et ve güncelle
      if ((!window.homeSample || window.homeSample.length === 0) && window.SONGS && window.SONGS.length > 0) {
        if (window.pickRandom) {
          window.homeSample = window.pickRandom(window.SONGS, 7);
        } else {
          // Fallback
          const shuffled = [...window.SONGS].sort(() => 0.5 - Math.random());
          window.homeSample = shuffled.slice(0, 7);
        }
        log("✅ Created homeSample, found", window.homeSample.length, "suggestions");
      }
      
      log("🔍 Current state - SONGS:", window.SONGS?.length || 0, "homeSample:", window.homeSample?.length || 0);
      
      // Orijinal input'un değerini kopyala (sadece görüntü için)
      if (originalInput && originalInput.value) {
        input.value = originalInput.value;
        updateClearButton(input);
        renderSearchResults(input.value);
      } else {
        // Boş açıldığında önerileri göster
        log("🔍 Showing suggestions...");
        renderSuggestions();
      }
      // Focus
      setTimeout(() => {
        input.focus();
      }, 100);
    } else {
      overlay.classList.remove("active");
      document.body.classList.remove("search-overlay-open");
      // FLAG: Overlay kapalı - sayfadaki listeler normal çalışsın
      window.__mobileSearchOverlayOpen = false;
      
      // Overlay kapatıldığında orijinal input'u TEMİZLE
      // Böylece sayfadaki listeler eski haline döner (örneğin "Yên Berçav")
      if (originalInput) {
        originalInput.value = "";
        // Input event'ini tetikle - sayfadaki listeleri eski haline getir
        originalInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      input.value = "";
      updateClearButton(input);
      input.blur();
      // Sonuçları temizle
      const resultsContainer = document.getElementById("searchOverlayResults");
      if (resultsContainer) {
        resultsContainer.innerHTML = "";
      }
    }
  }
  
  // Clear butonunu güncelle
  function updateClearButton(input) {
    const clearBtn = document.getElementById("searchOverlayClear");
    const header = input?.closest(".search-overlay__header");
    if (!clearBtn || !header) return;
    
    if (input.value.trim()) {
      header.classList.add("has-value");
    } else {
      header.classList.remove("has-value");
    }
  }
  
  // Önerileri göster (yazmaya başlamadan önce)
  function renderSuggestions() {
    const resultsContainer = document.getElementById("searchOverlayResults");
    if (!resultsContainer) {
      warn("❌ searchOverlayResults container not found");
      return;
    }
    
    // SONGS global değişkeninden şarkıları al
    // Önce window.SONGS'u kontrol et, yoksa window.__songsCache'i dene
    let songs = window.SONGS || window.__songsCache || [];
    
    // Eğer hala boşsa, loadSongs fonksiyonunu çağır
    if (!songs || songs.length === 0) {
      warn("⚠️ SONGS not found, trying to load...");
      // loadSongs fonksiyonu varsa çağır
      if (window.loadSongs && typeof window.loadSongs === "function") {
        window.loadSongs().then(loadedSongs => {
          if (loadedSongs && loadedSongs.length > 0) {
            window.SONGS = loadedSongs;
            log("✅ Songs loaded, re-rendering suggestions...");
            renderSuggestions(); // Tekrar dene
          } else {
            warn("⚠️ No songs loaded");
            resultsContainer.innerHTML = "";
          }
        }).catch(err => {
          error("❌ Error loading songs:", err);
          resultsContainer.innerHTML = "";
        });
        return;
      }
      warn("⚠️ loadSongs function not available");
      resultsContainer.innerHTML = "";
      return;
    }
    
    log("✅ renderSuggestions: Found", songs.length, "songs");
    
    // homeSample varsa onu kullan, yoksa random seç
    let suggestions = [];
    if (window.homeSample && window.homeSample.length > 0) {
      suggestions = window.homeSample;
    } else {
      // Random 7 şarkı seç
      if (window.pickRandom) {
        suggestions = window.pickRandom(songs, 7);
      } else {
        // Fallback
        const shuffled = [...songs].sort(() => 0.5 - Math.random());
        suggestions = shuffled.slice(0, 7);
      }
    }
    
    if (suggestions.length === 0) {
      resultsContainer.innerHTML = "";
      return;
    }
    
    // Önerileri render et
    const artistText = window.artistText || ((artist) => {
      if (!artist) return "";
      if (Array.isArray(artist)) return artist.join(", ");
      return artist.toString();
    });
    
    const songId = window.songId || ((s) => s._id || s.sourceId || "");
    
    resultsContainer.innerHTML = `
      <div class="search-overlay__section-title">Yên Berçav</div>
      ${suggestions.map(song => {
        const id = songId(song);
        const title = song.song || "Bê nav";
        const artist = artistText(song.artist) || "Bê hunermend";
        const url = id ? `/song.html?id=${encodeURIComponent(id)}` : "#";
        
        return `
          <a href="${url}" class="search-overlay__result-item">
            <div style="flex: 1;">
              <div class="search-overlay__result-title">${escapeHtml(title)}</div>
              <div class="search-overlay__result-artist">${escapeHtml(artist)}</div>
            </div>
          </a>
        `;
      }).join("")}
    `;
  }
  
  // Overlay'i başlat
  function setupSearchOverlay() {
    log("🔍 setupSearchOverlay called");
    createSearchOverlay();
    
    const overlay = document.getElementById("searchOverlay");
    const input = document.getElementById("searchOverlayInput");
    const closeBtn = overlay?.querySelector(".search-overlay__close");
    const clearBtn = document.getElementById("searchOverlayClear");
    const searchIcon = document.querySelector(".search--header .search__icon");
    
    log("🔍 Overlay:", overlay);
    log("🔍 Input:", input);
    log("🔍 Search Icon:", searchIcon);
    
    if (!overlay || !input) {
      warn("❌ Search overlay elements not found");
      return;
    }
    
    if (!searchIcon) {
      warn("❌ Search icon not found, retrying...");
      // Biraz bekleyip tekrar dene
      setTimeout(() => {
        const retryIcon = document.querySelector(".search--header .search__icon");
        const retryHeader = document.querySelector(".topbar__actions .search--header");
        
        if (retryIcon) {
          log("✅ Search icon found on retry");
          retryIcon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            log("🔍 Search icon clicked, opening overlay");
            toggleSearchOverlay(true);
          });
        }
        
        // Search header'a da event ekle
        if (retryHeader && !retryHeader.dataset.searchListenerAdded) {
          retryHeader.addEventListener("click", (e) => {
            if (e.target.classList.contains("search__input") || 
                e.target.classList.contains("search__clear") ||
                e.target.closest(".search__clear")) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();
            log("🔍 Search header clicked, opening overlay");
            toggleSearchOverlay(true);
          });
          retryHeader.dataset.searchListenerAdded = "true";
        }
        
        if (!retryIcon && !retryHeader) {
          error("❌ Search icon and header still not found after retry");
        }
      }, 500);
      // return kaldırıldı - search header'a da event ekleyebilmek için devam et
    }
    
    // Search icon'a tıklayınca overlay'i aç
    if (searchIcon) {
      searchIcon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        log("🔍 Search icon clicked, opening overlay");
        toggleSearchOverlay(true);
      });
    }
    
    // Search header container'a da click event ekle (mobilde buton gibi davranıyor)
    const searchHeader = document.querySelector(".topbar__actions .search--header");
    if (searchHeader) {
      // Eğer zaten event listener varsa tekrar ekleme
      if (!searchHeader.dataset.searchListenerAdded) {
        searchHeader.addEventListener("click", (e) => {
          // Eğer input veya clear butonuna tıklandıysa işleme
          if (e.target.classList.contains("search__input") || 
              e.target.classList.contains("search__clear") ||
              e.target.closest(".search__clear")) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          console.log("🔍 Search header clicked, opening overlay");
          toggleSearchOverlay(true);
        });
        searchHeader.dataset.searchListenerAdded = "true";
      }
    }
    
    log("✅ Search overlay setup complete");
    
    // Close butonuna tıklayınca kapat
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toggleSearchOverlay(false);
      });
    }
    
    // Clear butonuna tıklayınca temizle
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        input.value = "";
        updateClearButton(input);
        renderSuggestions(); // Önerileri göster
        input.focus();
        // Orijinal input'u temizle ama event tetikleme - sayfadaki listeleri güncellemesin
        const originalInput = document.querySelector(".search--header .search__input");
        if (originalInput) {
          originalInput.value = "";
          // Event tetikleme - overlay açıkken sayfadaki listeler değişmesin
        }
      });
    }
    
    // Input değişikliklerini dinle - anlık arama
    input.addEventListener("input", (e) => {
      const query = e.target.value;
      updateClearButton(input);
      
      // Debounce ile arama yap
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderSearchResults(query);
      }, 150);
      
      // ÖNEMLİ: Mobil search overlay'de arama yapıldığında 
      // orijinal input'a değer KOPYALAMA - sayfadaki listeleri güncellemesin
      // Overlay açıkken sayfadaki listeler değişmesin, sadece overlay içinde sonuçlar görünsün
      // Orijinal input'a değer kopyalamayı tamamen kaldırdık
    });
    
    // ESC tuşu ile kapat
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        toggleSearchOverlay(false);
      }
    });
    
    // Overlay'e tıklayınca kapat (input wrapper ve results'a değil)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        toggleSearchOverlay(false);
      }
    });
  }
  
  function setupMobileSearch() {
    // Sadece mobilde çalışsın
    if (window.innerWidth > 639) {
      // Desktop'a geçildiyse overlay'i kapat ve temizle
      const overlay = document.getElementById("searchOverlay");
      if (overlay) {
        overlay.classList.remove("active");
        document.body.classList.remove("search-overlay-open");
      }
      isInitialized = false;
      return;
    }
    
    // Zaten initialize edilmişse tekrar etme
    if (isInitialized) return;
    isInitialized = true;
    
    // DOM hazır olana kadar bekle
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupSearchOverlay, 300);
      });
    } else {
      setTimeout(setupSearchOverlay, 300);
    }
  }
  
  // Resize'da kontrol et (mobilden desktop'a geçiş)
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 639) {
        const overlay = document.getElementById("searchOverlay");
        if (overlay && overlay.classList.contains("active")) {
          toggleSearchOverlay(false);
        }
        isInitialized = false; // Desktop'a geçildiğinde tekrar initialize edilebilir
      } else if (window.innerWidth <= 639 && !isInitialized) {
        // Mobil'e geri dönüldüğünde initialize et
        setupMobileSearch();
      }
    }, 100);
  });
  
  // İlk setup - DOM hazır olduğunda
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(setupMobileSearch, 200);
    });
  } else {
    // DOM zaten hazırsa hemen çalıştır
    setTimeout(setupMobileSearch, 200);
  }
})();
