// common.js — alîkarên piçûk + tema
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
        console.log("✅ Kullanıcının kendi pending değişikliği dahil ediliyor:", sub._id, sub.sourceId);
        // Kullanıcının kendi değişikliği, dahil et - devam et
      } else {
        console.log("⏭️ Başkasının pending değişikliği atlanıyor:", sub._id);
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
      console.log("📌 Edit kaydedildi:", sourceId, "status:", sub.status, "createdBy:", sub.createdBy, "type:", sub.type);
    }
  });

  console.log("🗺️ editsBySource map size:", editsBySource.size, "entries:", Array.from(editsBySource.entries()).map(([k, v]) => ({ sourceId: k, status: v.status, createdBy: v.createdBy })));

  const merged = base.map(song => {
    const sub = editsBySource.get(song.sourceId);
    if(!sub) return song;
    console.log("🔄 Şarkı merge ediliyor:", song.sourceId, "submission:", sub._id, "status:", sub.status);

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

async function loadSongs(options = {}){
  console.log("loadSongs() called");
  
  // Firebase auth state'in hazır olmasını bekle (eğer varsa)
  if(window.fbAuth && !window.fbAuth.currentUser){
    await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(), 2000); // Max 2 saniye bekle
      const unsubscribe = window.fbAuth.onAuthStateChanged((user) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      });
    });
  }
  
  const currentUser = window.fbAuth?.currentUser;
  const includePending = typeof options.includePending === "boolean"
    ? options.includePending
    : !!window.isAdminUser?.(currentUser);
  const currentUserId = currentUser?.uid || null;
  
  console.log("🔐 Auth state - currentUserId:", currentUserId, "includePending:", includePending);
  
  // Cache key'e currentUserId de ekle, böylece kullanıcı değişiklik yaptığında cache yenilensin
  const cacheKey = `${includePending}_${currentUserId || 'anonymous'}`;
  
  // Eğer cache varsa ama kullanıcı değişmişse cache'i temizle
  if(window.__songsCache && window.__songsCacheKey !== cacheKey){
    console.log("🔄 Cache key değişti, cache temizleniyor:", window.__songsCacheKey, "->", cacheKey);
    window.__songsCache = null;
    window.__songsCacheKey = null;
  }
  
  if(window.__songsCache && window.__songsCacheKey === cacheKey){
    console.log("✅ Using cached songs:", window.__songsCache.length);
    return window.__songsCache;
  }

  let base = [];
  try{
    console.log("Fetching songs.json...");
    const res = await fetch("/assets/songs.json", { cache: "no-store" });
    console.log("songs.json response status:", res.status);
    if(res.ok) {
      base = await res.json();
      console.log("songs.json loaded, count:", base.length);
    } else {
      console.warn("songs.json response not ok:", res.status);
    }
  }catch(err){
    console.warn("songs.json okunamadı:", err);
  }

  let subs = [];
  const db = window.fbDb;
  if(db){
    try{
      console.log("🔗 Fetching from Firebase...");
      
      // Firestore bağlantısını kontrol et
      if(!db._delegate){
        console.warn("⚠️ Firestore not properly initialized");
      }
      
      // Firebase timeout - 10 saniye içinde tamamlanmazsa devam et
      const firebasePromise = db
        .collection("song_submissions")
        .where("status", "in", ["pending","approved"])
        .get();
      
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.warn("⏱️ Firebase timeout - continuing without submissions");
          resolve({ docs: [] });
        }, 10000);
      });
      
      const snap = await Promise.race([firebasePromise, timeoutPromise]);
      subs = snap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      console.log("✅ Firebase submissions loaded, count:", subs.length);
      if(subs.length > 0){
        console.log("📋 Submissions:", subs.map(s => ({ 
          id: s._id, 
          type: s.type, 
          status: s.status, 
          sourceId: s.sourceId,
          createdBy: s.createdBy 
        })));
      }
    }catch(err){
      console.error("❌ song_submissions okunamadı:", err);
      console.error("Error details:", err.message, err.code);
    }
  } else {
    console.warn("⚠️ Firebase db not available - check firebase.js initialization");
    console.warn("window.fbDb:", window.fbDb);
    console.warn("window.fbAuth:", window.fbAuth);
  }

  console.log("Merging songs... base:", base.length, "subs:", subs.length, "currentUserId:", currentUserId, "includePending:", includePending);
  try {
    window.__songsCache = mergeSongs(base, subs, { includePending, currentUserId });
    console.log("✅ mergeSongs() completed, cache length:", window.__songsCache.length);
    // Kullanıcının kendi değişikliklerini kontrol et
    if(currentUserId){
      const userEdits = subs.filter(s => s.createdBy === currentUserId && s.status === "pending");
      console.log("👤 Kullanıcının pending değişiklikleri:", userEdits.length, userEdits.map(e => ({ id: e._id, sourceId: e.sourceId })));
    }
  } catch(err) {
    console.error("❌ mergeSongs() error:", err);
    window.__songsCache = base; // Fallback to just base songs
  }
  
  window.__songsCacheIncludePending = includePending;
  window.__songsCacheKey = cacheKey;
  
  try {
    updateGlobalStats(window.__songsCache);
    console.log("updateGlobalStats() completed");
  } catch(err) {
    console.warn("updateGlobalStats() error:", err);
  }
  
  console.log("loadSongs() completed, total songs:", window.__songsCache.length);
  return window.__songsCache;
}

function clearSongsCache(){
  window.__songsCache = null;
  window.__songsCacheIncludePending = null;
  window.__songsCacheKey = null;
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
    console.warn("Favoriler yüklenemedi:", err);
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
    console.error("Favori kaydedilemedi:", err);
    return null;
  }
}

window.songId = songId;
window.loadSongs = loadSongs;
window.clearSongsCache = clearSongsCache;
window.formatSongTitle = formatSongTitle;
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
  const db = window.fbDb;
  if(!db || !user) return;
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
  try{
    await ref.set(payload, { merge: true });
  }catch(err){
    console.warn("Profil kaydı oluşturulamadı:", err);
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
  
  // Topbar'daki Zêdeke butonunu yönet
  const setupButtons = () => {
    const btn = document.getElementById("addSongMenuBtn");
    const buttons = [btn].filter(Boolean);
    
    if(!buttons.length) {
      // Butonlar henüz yüklenmemiş, tekrar dene
      setTimeout(setupButtons, 200);
      return;
    }
    
    buttons.forEach(b => {
      // Mevcut event listener'ları temizlemek için clone et
      const newBtn = b.cloneNode(true);
      b.parentNode.replaceChild(newBtn, b);
      
      newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Giriş kontrolü
        const handleClick = () => {
          const auth = window.fbAuth;
          const user = auth?.currentUser;
          
          if(!user){
            // Giriş yapmamış kullanıcı için auth panelini aç
            if(typeof window.requireAuthAction === "function"){
              window.requireAuthAction(() => {
                // Giriş yapıldıktan sonra paneli aç
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
              // requireAuthAction yoksa auth panelini manuel aç
              const authOpen = document.getElementById("authOpen");
              if(authOpen) {
                authOpen.click();
              }
            }
            return;
          }
          
          // Giriş yapmış kullanıcı için paneli aç
          if(typeof window.openAddSongPanel === "function"){
            window.openAddSongPanel();
          } else {
            // Fallback: paneli direkt aç
            const panel = document.getElementById("addSongPanel");
            if(panel){
              panel.classList.remove("is-hidden");
              panel.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              // Panel yoksa hash ile aç
              window.location.href = "/index.html#add-song";
            }
          }
        };
        
        // Firebase auth'un yüklenmesini bekle (maksimum 2 saniye)
        if(!window.fbAuth){
          let attempts = 0;
          const maxAttempts = 20;
          const waitForAuth = setInterval(() => {
            attempts++;
            if(window.fbAuth || attempts >= maxAttempts){
              clearInterval(waitForAuth);
              handleClick();
            }
          }, 100);
        } else {
          handleClick();
        }
      });
    });
  };
  
  // DOM hazır olduğunda çalıştır
  const init = () => {
    if(document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupButtons, 500);
      });
    } else {
      // DOM zaten hazır, initAddSongPanel'in tamamlanması için bekle
      setTimeout(setupButtons, 800);
    }
  };
  
  init();
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
  const openBtn = document.getElementById("authOpen");
  const panel = document.getElementById("authPanel");
  if(!openBtn || !panel) return;

  const fb = window.firebase;
  const auth = window.fbAuth || (fb?.auth ? fb.auth() : null);
  if(!auth){
    openBtn.style.display = "none";
    return;
  }

  const emailEl = document.getElementById("authEmail");
  const passEl = document.getElementById("authPass");
  const signInBtn = document.getElementById("authSignIn");
  const signUpBtn = document.getElementById("authSignUp");
  const signOutBtn = document.getElementById("authSignOut");
  const googleBtn = document.getElementById("authGoogle");
  const resetBtn = document.getElementById("authReset");
  const statusEl = document.getElementById("authStatus");
  const profileLink = document.getElementById("profileLink");
  const adminLink = document.getElementById("adminLink");

  let overlay = document.getElementById("authOverlay");
  if(!overlay){
    overlay = document.createElement("div");
    overlay.id = "authOverlay";
    overlay.className = "authOverlay";
    document.body.appendChild(overlay);
  }
  if(panel.parentElement !== document.body){
    document.body.appendChild(panel);
  }

  const openPanel = () => {
    panel.classList.add("is-open");
    overlay.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("auth-open");
  };
  const closePanel = () => {
    panel.classList.remove("is-open");
    overlay.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("auth-open");
  };

  // Güvenli başlangıç: kapalı başlat
  closePanel();

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

  if(googleBtn){
    googleBtn.innerHTML = `<span class="googleIcon">G</span> Bi Google re têkeve`;
  }

  // Hero login butonunu güncelle
  const updateHeroLoginBtn = (user) => {
    const heroLoginBtn = document.getElementById("heroLoginBtn");
    if(heroLoginBtn){
      heroLoginBtn.style.display = user ? "none" : "inline-flex";
    }
  };
  
  const setLoggedOut = () => {
    openBtn.textContent = "Têkev";
    openBtn.style.display = "inline-flex";
    if(emailEl){ emailEl.value = ""; emailEl.disabled = false; }
    if(passEl){ passEl.value = ""; passEl.disabled = false; }
    if(signInBtn) signInBtn.style.display = "inline-flex";
    if(signUpBtn) signUpBtn.style.display = "inline-flex";
    if(signOutBtn) signOutBtn.style.display = "none";
    if(profileLink) profileLink.style.display = "none";
    if(adminLink) adminLink.style.display = "none";
    updateHeroLoginBtn(null); // Giriş yapmamış kullanıcı için butonu göster
    setStatus("Ji bo têketinê e-name û şîfre binivîse.");
  };

  const setLoggedIn = (user) => {
    openBtn.style.display = "none";
    if(emailEl){ emailEl.value = user?.email || ""; emailEl.disabled = true; }
    if(passEl){ passEl.value = "••••••••"; passEl.disabled = true; }
    if(signInBtn) signInBtn.style.display = "none";
    if(signUpBtn) signUpBtn.style.display = "none";
    if(signOutBtn) signOutBtn.style.display = "inline-flex";
    setProfileButton(user);
    if(adminLink){
      adminLink.style.display = window.isAdminUser?.(user) ? "inline-flex" : "none";
    }
    updateHeroLoginBtn(user); // Giriş yapmış kullanıcı için butonu gizle
    setStatus(`${user?.email || "Bikarhêner"} têket.`);
    closePanel();
    if(typeof window.__authContinue === "function"){
      const fn = window.__authContinue;
      window.__authContinue = null;
      try{ fn(); }catch(e){}
    }
  };

  openBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    if(panel.classList.contains("is-open")){
      closePanel();
    }else{
      openPanel();
    }
  });

  document.addEventListener("keydown", (ev) => {
    if(ev.key === "Escape") closePanel();
  });
  document.addEventListener("click", (ev) => {
    if(!panel.classList.contains("is-open")) return;
    if(panel.contains(ev.target) || openBtn.contains(ev.target)) return;
    closePanel();
  });

  signInBtn?.addEventListener("click", async () => {
    const email = (emailEl?.value || "").trim();
    const pass = passEl?.value || "";
    if(!email || !pass){
      setStatus("E-name û şîfre pêwîst in.", true);
      return;
    }
    try{
      await auth.signInWithEmailAndPassword(email, pass);
      setStatus("Têketin serkeftî.");
      closePanel();
    }catch(err){
      setStatus(translateError(err) || "Têketin bi ser neket.", true);
    }
  });

  signUpBtn?.addEventListener("click", async () => {
    const email = (emailEl?.value || "").trim();
    const pass = passEl?.value || "";
    if(!email || !pass){
      setStatus("E-name û şîfre pêwîst in.", true);
      return;
    }
    try{
      await auth.createUserWithEmailAndPassword(email, pass);
      setStatus("Qeyd serkeftî.");
      closePanel();
    }catch(err){
      setStatus(translateError(err) || "Qeyd bi ser neket.", true);
    }
  });

  signOutBtn?.addEventListener("click", async () => {
    const ok = window.confirm("Tu dixwazî derkevî?");
    if(!ok) return;
    try{
      await auth.signOut();
      setStatus("Derketin.");
      closePanel();
      window.location.href = "/index.html";
    }catch(err){
      setStatus(translateError(err) || "Derketin bi ser neket.", true);
    }
  });

  googleBtn?.addEventListener("click", async () => {
    try{
      const provider = fb?.auth ? new fb.auth.GoogleAuthProvider() : null;
      if(!provider){
        setStatus("Têketina bi Google re nayê bikar anîn.", true);
        return;
      }
      await auth.signInWithPopup(provider);
      setStatus("Bi Google re têketin serkeftî.");
      closePanel();
    }catch(err){
      if(err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user"){
        try{
          const redirectProvider = fb?.auth ? new fb.auth.GoogleAuthProvider() : null;
          if(!redirectProvider){
            setStatus("Têketina bi Google re nayê bikar anîn.", true);
            return;
          }
          await auth.signInWithRedirect(redirectProvider);
          return;
        }catch(e){
          setStatus(translateError(e) || "Têketina bi Google re bi ser neket.", true);
          return;
        }
      }
      setStatus(translateError(err) || "Têketina bi Google re bi ser neket.", true);
    }
  });

  resetBtn?.addEventListener("click", async () => {
    const email = (emailEl?.value || "").trim();
    if(!email){
      setStatus("Ji bo şîfreya nû kirinê e-name binivîse.", true);
      return;
    }
    try{
      await auth.sendPasswordResetEmail(email);
      setStatus("E-nameya şîfreya nû kirinê hate şandin.");
    }catch(err){
      setStatus(translateError(err) || "Şîfre nû nekir.", true);
    }
  });

  auth.onAuthStateChanged((user) => {
    if(user){
      setLoggedIn(user);
      ensureProfile(user);
    }else{
      setLoggedOut();
    }
  });

  window.requireAuthAction = (fn, message) => {
    if(auth.currentUser){
      if(typeof fn === "function") fn();
      return true;
    }
    window.__authContinue = typeof fn === "function" ? fn : null;
    if(message) setStatus(message, true);
    openPanel();
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
