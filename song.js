// song.js — rûpela stranê ya bi nivîsê
(function(){

// Yardımcılar
function makeId(s){
  if(typeof songId === "function") return songId(s);
  return s?.id || "";
}
function openLink(s){
  if(typeof window.buildSongUrl === "function") return window.buildSongUrl(s);
  return `/song.html?id=${encodeURIComponent(makeId(s))}`;
}
function isSongPath(){
  const path = window.location.pathname || "";
  return path === "/song.html" || path.startsWith("/song/");
}

function artistArr(a){
  const fmt = window.formatArtistName;
  if(Array.isArray(a)){
    return a.filter(Boolean).map(String).map(name => fmt ? fmt(name) : name);
  }
  if(a == null) return [];
  return [String(a)].filter(Boolean).map(name => fmt ? fmt(name) : name);
}
function artistKey(name){
  return (name || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
function artistLinks(a){
  const arr = artistArr(a);
  if(!arr.length) return "—";
  return arr.map(name => {
    const raw = `/artist.html?name=${encodeURIComponent(name)}`;
    const href = window.appendLangParam ? window.appendLangParam(raw) : raw;
    return `<a class="artistLink" href="${href}" title="${t("artist_link_title", "Ji bo dîtina stranên hunermendê bikeve")}">${escapeHtml(name)}</a>`;
  }).join(" · ");
}
function normalizeKey(s){
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}
function artistInputValue(a){
  if(window.formatArtistInputValue) return window.formatArtistInputValue(a);
  const arr = artistArr(a);
  return arr.join(", ");
}
function parseArtistInput(str){
  if(window.normalizeArtistInput) return window.normalizeArtistInput(str);
  const parts = (str || "").split(/[,;]/).map(s => s.trim()).filter(Boolean);
  if(!parts.length) return "";
  return parts.length === 1 ? parts[0] : parts;
}

function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function updateSongSeo(current, currentId){
  if(!current) return;
  const songTitle = window.formatSongTitle ? window.formatSongTitle(current.song) : (current.song || "");
  const artists = artistArr(current.artist);
  const artistName = artists.join(", ");
  const fallbackTitle = songTitle && artistName
    ? `${songTitle} — ${artistName}`
    : (songTitle || t("label_song", "Stran"));
  const seoTitle = t(
    "seo_song_title",
    fallbackTitle,
    { song: songTitle || t("label_song", "Stran"), artist: artistName || t("label_artist", "Hunermend") }
  );
  const fallbackDesc = songTitle
    ? `${songTitle} ${artistName || ""}`.trim()
    : t("seo_song_desc", "Stran");
  const seoDesc = t(
    "seo_song_desc",
    fallbackDesc,
    { song: songTitle || t("label_song", "Stran"), artist: artistName || t("label_artist", "Hunermend") }
  );
  const rel = typeof window.buildSongUrl === "function"
    ? window.buildSongUrl({ ...current, id: currentId })
    : `/song.html?id=${encodeURIComponent(currentId || "")}`;
  const canonical = window.toAbsoluteUrl ? window.toAbsoluteUrl(rel) : rel;
  const byArtist = artists.length
    ? (artists.length === 1
      ? { "@type": "MusicGroup", name: artistName }
      : artists.map(name => ({ "@type": "MusicGroup", name })))
    : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    name: songTitle || fallbackTitle,
    url: canonical,
    inLanguage: "ku",
    genre: "Kurdish music"
  };
  if(byArtist) jsonLd.byArtist = byArtist;
  if(current?.key) jsonLd.musicalKey = current.key;

  if(typeof window.setSeoData === "function"){
    window.setSeoData({
      title: seoTitle,
      description: seoDesc,
      canonical,
      ogType: "music.song",
      jsonLd
    });
  }
}

// Transpose helpers
// 🔴 YouTube API KEY (user provided)
const YT_API_KEY = "AIzaSyDC5vzDXhSwySsDaL_VsBxTpVSgGolphjw";
const t = (key, fallback, vars) => window.t ? window.t(key, vars) : fallback;

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
const NAMES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const NAMES_FLAT  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
function mod(n,m){ return ((n % m) + m) % m; }

function pickPrefer(symbol, fallback="sharp"){
  const s = symbol || "";
  if(s.includes("b") && !s.includes("#")) return "flat";
  if(s.includes("#") && !s.includes("b")) return "sharp";
  return fallback;
}

function transposeNote(note, semis, preferFlats){
  const i = NOTE_TO_I[note];
  if(i == null || !Number.isFinite(semis)) return note;
  const out = mod(i + semis, 12);
  return (preferFlats ? NAMES_FLAT : NAMES_SHARP)[out];
}

function splitSlash(body){
  let depth = 0;
  for(let i=0; i<body.length; i++){
    const ch = body[i];
    if(ch === "(") depth++;
    else if(ch === ")" && depth > 0) depth--;
    else if(ch === "/" && depth === 0){
      return [body.slice(0,i), body.slice(i+1)];
    }
  }
  return [body, ""];
}

function transposeSymbol(symbol, semis, opts = {}){
  const raw = (symbol || "").trim();
  if(!raw || !Number.isFinite(semis) || semis % 12 === 0) return raw;

  const m = raw.match(/^([A-G])([#b]?)(.*)$/);
  if(!m) return raw;

  const [, root, accidental, tail] = m;
  const [body, slashPart] = splitSlash(tail || "");

  const prefer = opts.prefer ?? pickPrefer(raw, opts.fallbackPrefer || "sharp");
  const preferFlats = prefer === "flat";

  const tRoot = transposeNote(root + (accidental || ""), semis, preferFlats);

  let bassOut = "";
  if(slashPart){
    const bm = slashPart.match(/^([A-G])([#b]?)(.*)$/);
    if(bm){
      const bRoot = bm[1] + (bm[2] || "");
      const tBass = transposeNote(bRoot, semis, preferFlats);
      bassOut = "/" + tBass + (bm[3] || "");
    } else {
      bassOut = "/" + slashPart;
    }
  }

  return tRoot + body + bassOut;
}

const SONG_CHORD_PATTERN = /(^|[^0-9\p{L}_])([A-G](?:#|b)?(?:maj|min|dim|aug|sus|add|m|M|\d+|[#b]\d+|[+\-]\d+|[+\-])*(?:\/[A-G](?:#|b)?)?(?:\([^\s)]+\))?)(?=$|[^0-9\p{L}_])/gu;

function transposePlainText(text, semis){
  const tokRe = new RegExp(SONG_CHORD_PATTERN);
  return text.replace(tokRe, (match, prefix, chord) => {
    const transposed = transposeSymbol(chord, semis, { prefer: pickPrefer(chord) });
    return `${prefix}${transposed}`;
  });
}

function highlightChords(text){
  const tokRe = new RegExp(SONG_CHORD_PATTERN);
  const escaped = escapeHtml(text);
  return escaped.replace(tokRe, (match, prefix, chord) => `${prefix}<strong class="chordTok">${chord}</strong>`);
}

function renderText(preEl, baseText, semis){
  if(!preEl || baseText == null) return;
  const cleaned = baseText.toString().replace(/_/g, " ");
  const transposed = transposePlainText(cleaned, semis);
  preEl.innerHTML = highlightChords(transposed);
}

// YouTube video yükleyici (API)
function loadYoutubeVideo(song, artist){
  if(!song || !artist) return;

  const card = document.getElementById("youtubeCard");
  const iframe = document.getElementById("youtubeFrame");
  if(!card || !iframe) return;

  card.style.display = "block";
  iframe.style.display = "block";
  const q = encodeURIComponent(`${artist} ${song}`);
  const searchUrl =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet&type=video&maxResults=10&order=relevance&q=${q}&key=${YT_API_KEY}`;

  fetch(searchUrl)
    .then(r => r.json())
    .then(async d => {
      if(d.error){
        console.warn("YouTube API error:", d.error);
        return;
      }

      const ids = (d.items || [])
        .map(it => it?.id?.videoId)
        .filter(Boolean);

      if(!ids.length) return;

      const listUrl =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?part=status&id=${ids.join(",")}&key=${YT_API_KEY}`;

      const lr = await fetch(listUrl);
      const list = await lr.json();
      if(list.error){
        console.warn("YouTube videos.list error:", list.error);
        return;
      }

      const ok = (list.items || []).find(v =>
        v?.status?.embeddable === true &&
        (v?.status?.privacyStatus === "public" || v?.status?.privacyStatus === "unlisted")
      );

      if(!ok?.id) return;

      iframe.src = `https://www.youtube.com/embed/${ok.id}`;
    })
    .catch(err => {
      console.warn("YouTube hata:", err);
      const wrap = card.querySelector(".youtubeWrap");
      if(wrap){
        wrap.innerHTML = `<a href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px;text-align:center;color:#fff;text-decoration:none;background:#111;border-radius:12px;">${t("youtube_search", "YouTube'da ara")}</a>`;
      }
    });
}

function renderRecList(el, recs){
  el.innerHTML = recs.map(s => {
    const pendingBadge = s.pending ? `<span class="badge badge--pending">${t("badge_pending_editor", "Li benda pejirandina edîtorê ye")}</span>` : "";
    const title = window.formatSongTitle ? window.formatSongTitle(s.song) : (s.song || "");
    return `
    <div class="item">
      <div class="item__left">
        <div class="item__title">${escapeHtml(title)}</div>
        <div class="item__sub">${artistLinks(s.artist)}</div>
      </div>
      <div class="badges">
        ${pendingBadge}
        <a class="open" href="${openLink(s)}">${t("action_open", "Veke")}</a>
      </div>
    </div>
  `;
  }).join("");
}

function getIdParam(){
  const p = new URLSearchParams(location.search);
  return p.get("id") || "";
}
function getSlugFromPath(){
  const rawPath = window.location.pathname || "";
  const path = rawPath.startsWith("/tr/") ? rawPath.slice(3) : rawPath;
  if(!path.startsWith("/song/")) return "";
  const parts = path.split("/").filter(Boolean);
  return parts.length > 1 ? parts[1] : "";
}

const TEXT_SLUG_OVERRIDES = {
  "pdf2.pdf|68": "beritan-koma-amara",
  "pdf3.pdf|15": "rewend-aynur-dogan",
  "pdf3.pdf|17": "diyarbekir-bajar",
  "pdf3.pdf|19": "newroz-bajar",
  "pdf3.pdf|57": "keca-peri-kerem-gerdenzeri",
  "pdf3.pdf|94": "beje-sidar",
  "pdf3.pdf|109": "azadi-yunis-das"
};

function slugifySongTitle(title){
  return (title || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getTextSlug(song){
  const id = song?.id || makeId(song);
  if(id && TEXT_SLUG_OVERRIDES[id]) return TEXT_SLUG_OVERRIDES[id];
  return slugifySongTitle(song?.song);
}

async function loadSongText(slug){
  const res = await fetch(`/assets/text/${slug}.txt`, { cache: "no-store" });
  if(!res.ok) throw new Error(`Metin yok: ${slug}`);
  return res.text();
}

async function init(){
  // Firebase auth state'in hazır olmasını bekle
  if(window.fbAuth){
    await new Promise((resolve) => {
      const unsubscribe = window.fbAuth.onAuthStateChanged((user) => {
        unsubscribe(); // İlk state değişikliğinden sonra unsubscribe
        resolve();
      });
      // Eğer zaten bir kullanıcı varsa hemen resolve et
      if(window.fbAuth.currentUser !== null){
        setTimeout(() => resolve(), 100);
      }
    });
  }
  
  const SONGS = await loadSongs();
  
  if(!SONGS || SONGS.length === 0){
    const songText = document.getElementById("songText");
    if(songText) songText.textContent = t("status_song_unavailable", "Stran nehat barkirin. Ji kerema xwe rûpelê nû bike.");
    return;
  }

  const id = getIdParam();
  const slugFromPath = getSlugFromPath();
  const slugifyForUrl = typeof window.slugifySongTitle === "function"
    ? window.slugifySongTitle
    : slugifySongTitle;
  const buildSlug = typeof window.buildSongSlug === "function"
    ? window.buildSongSlug
    : (song) => {
      const base = slugifyForUrl(song?.song || "");
      const artist = slugifyForUrl(song?.artist || "");
      return [base, artist].filter(Boolean).join("-");
    };
  const legacySlug = (song) => slugifyForUrl(song?.song || "");
  const legacyArtistSlug = (song) => {
    const base = slugifyForUrl(song?.song || "");
    const artist = slugifyForUrl(song?.artist || "");
    return [base, artist].filter(Boolean).join("-");
  };
  const current = (id ? SONGS.find(s => makeId(s) === id) : null)
    || (slugFromPath ? SONGS.find(s => (
      buildSlug(s) === slugFromPath ||
      legacySlug(s) === slugFromPath ||
      legacyArtistSlug(s) === slugFromPath
    )) : null)
    || SONGS[0];
  const nextWrap = document.getElementById("nextSong");
  const nextBtn = document.getElementById("nextSongBtn");
  const nextTitle = document.getElementById("nextSongTitle");
  const nextArtist = document.getElementById("nextSongArtist");
  const prevBtn = document.getElementById("prevSongBtn");
  const currentId = current ? makeId(current) : "";
  const currentIndex = Math.max(0, SONGS.findIndex(s => makeId(s) === currentId));
  const nextSong = SONGS.length ? SONGS[(currentIndex + 1) % SONGS.length] : null;
  const prevSong = SONGS.length ? SONGS[(currentIndex - 1 + SONGS.length) % SONGS.length] : null;
  const statSongsInline = document.getElementById("statSongsInline");
  const statArtistsInline = document.getElementById("statArtistsInline");

  if(currentId && typeof window.buildSongUrl === "function"){
    const prettyUrl = window.buildSongUrl({ ...current, id: currentId });
    if(prettyUrl){
      const target = `${prettyUrl}${window.location.hash || ""}`;
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      if(currentUrl !== target){
        window.history.replaceState(null, "", target);
      }
    }
  }

  if(statSongsInline) statSongsInline.textContent = SONGS.length.toString();
  if(statArtistsInline){
    const uniqueArtists = new Set();
    SONGS.forEach(s => {
      artistArr(s.artist).forEach(a => uniqueArtists.add(normalizeKey(a)));
    });
    statArtistsInline.textContent = uniqueArtists.size.toString();
  }

  updateSongSeo(current, currentId);
  window.__applySeoOverrides = () => updateSongSeo(current, currentId);

  const songNameEl = document.getElementById("songName");
  const songArtistEl = document.getElementById("songArtist");
  const rhythmEl = document.getElementById("songRhythm");
  const rhythmVideoBtn = document.getElementById("ritimVideoBtn");
  
  if(songNameEl){
    songNameEl.textContent = window.formatSongTitle ? window.formatSongTitle(current?.song) : (current?.song || "—");
    songNameEl.style.display = "block";
    songNameEl.style.visibility = "visible";
  }
  if(songArtistEl){
    songArtistEl.innerHTML = artistLinks(current?.artist);
    songArtistEl.style.display = "block";
    songArtistEl.style.visibility = "visible";
  }
  const rhythmValue = (current?.ritim || "").toString().trim();
  if(rhythmEl){
    rhythmEl.textContent = rhythmValue || "-";
  }
  if(rhythmVideoBtn){
    const url = (current?.ritimVideo || "").toString().trim();
    if(url){
      rhythmVideoBtn.href = url;
      rhythmVideoBtn.classList.add("is-visible");
    } else {
      rhythmVideoBtn.classList.remove("is-visible");
      rhythmVideoBtn.remove();
    }
  }
  const pendingBadge = document.getElementById("songPending");
  if(pendingBadge){
    pendingBadge.style.display = current?.pending ? "inline-flex" : "none";
  }
  if(nextSong && nextBtn && nextTitle && nextArtist){
    nextTitle.textContent = window.formatSongTitle ? window.formatSongTitle(nextSong.song) : (nextSong.song || "—");
    nextArtist.innerHTML = artistLinks(nextSong.artist);
    const nextSongClickHandler = () => {
      location.href = openLink(nextSong);
    };
    nextBtn.addEventListener("click", nextSongClickHandler);
    
    // nextSongMeta'ya da aynı işlevi ekle
    const nextSongMeta = document.querySelector(".nextSongMeta");
    if(nextSongMeta){
      nextSongMeta.style.cursor = "pointer";
      nextSongMeta.addEventListener("click", nextSongClickHandler);
    }
  } else if(nextWrap) {
    nextWrap.style.display = "none";
  }
  if(prevSong && prevBtn){
    prevBtn.addEventListener("click", () => {
      location.href = openLink(prevSong);
    });
  } else if(prevBtn) {
    prevBtn.style.display = "none";
  }

  const bar = document.getElementById("transposeBar");
  const origKeyEl = document.getElementById("origKey");
  const curKeyEl = document.getElementById("curKey");
  const keyGrid = document.getElementById("keyGrid");
  const textPre = document.getElementById("songText");
  if(textPre){
    const currentId = (current?.id || "").toString();
    textPre.dataset.songId = currentId;
    const isPdf3 = currentId.includes("pdf3");
    textPre.classList.toggle("songText--pdf3", isPdf3);
    const chordSheet = document.querySelector(".chordSheet");
    if(chordSheet){
      chordSheet.classList.toggle("chordSheet--pdf3", isPdf3);
    }
  }
  const favBtn = document.getElementById("favBtn");
  const favoriteBtn = document.getElementById("favoriteBtn");
  const favoriteBtn2 = document.getElementById("favoriteBtn2");
  const favStatus = document.getElementById("favStatus");
  const editToggleRow = document.getElementById("editToggleRow");
  const editToggle = document.getElementById("editToggle");
  const editPanel = document.getElementById("editPanel");
  const editClose = document.getElementById("editClose");
  const editSave = document.getElementById("editSave");
  const editNotice = document.getElementById("editNotice");
  const editSong = document.getElementById("editSong");
  const editArtist = document.getElementById("editArtist");
  const editArtistSuggest = document.getElementById("editArtistSuggest");
  const editKey = document.getElementById("editKey");
  const editText = document.getElementById("editText");
  const editSongRhythm = document.getElementById("editSongRhythm");

  if(editArtist && editArtistSuggest && window.initArtistSuggest){
    window.initArtistSuggest(editArtist, editArtistSuggest);
  }

  const showText = () => {
    if(textPre) textPre.style.display = "block";
  };
  showText();

  let originalKey = (current?.key || "").trim();
  let semitones = 0;
  let preferForKey = pickPrefer(originalKey, "sharp");

  function getRootNote(keyStr){
    const raw = (keyStr || "").trim();
    const m = raw.match(/^([A-G])([#b]?)/);
    return m ? (m[1] + (m[2] || "")) : "";
  }
  let originalRoot = getRootNote(originalKey);

  function updateKeyLabels(){
    if(origKeyEl) origKeyEl.textContent = originalKey || "—";
    if(curKeyEl) curKeyEl.textContent = originalKey ? transposeSymbol(originalKey, semitones, { prefer: preferForKey }) : "—";

    if(keyGrid){
      const cur = originalKey ? transposeSymbol(originalKey, semitones, { prefer: preferForKey }) : "";
      const curRoot = getRootNote(cur);
      keyGrid.querySelectorAll(".keyBtn").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.key === curRoot);
      });
    }
  }

  function setSemis(n, baseText, opts = {}){
    semitones = n;
    updateKeyLabels();
    renderText(textPre, baseText, semitones);
    showText();
  }

  const showBar = !!originalKey || (!!rhythmValue && rhythmValue !== "-");
  if(bar) bar.style.display = showBar ? "flex" : "none";
  if(keyGrid) keyGrid.style.display = originalKey ? "" : "none";
  updateKeyLabels();

  if(keyGrid && originalRoot && NOTE_TO_I[originalRoot] != null){
    keyGrid.addEventListener("click", (ev) => {
      const btn = ev.target?.closest?.(".keyBtn");
      if(!btn) return;
      const target = btn.dataset.key;
      if(!target) return;
      const oi = NOTE_TO_I[originalRoot];
      const ti = NOTE_TO_I[target];
      if(oi == null || ti == null) return;
      const diff = ((ti - oi) % 12 + 12) % 12;
      setSemis(diff, textPre?.dataset.baseText || "", { revealText: true });
    });
  }

  let favRef = null;
  let favActive = false;
  const setFavStatus = (msg, isError = false) => {
    if(!favStatus) return;
    favStatus.textContent = msg || "";
    // Favori mesajları için kırmızı renk
    if(msg && (msg.includes("zêdekirin") || msg.includes("derxistin"))){
      favStatus.style.color = "#e11d48";
    } else if(isError){
      favStatus.style.color = "#ef4444";
    } else {
      favStatus.style.color = "";
    }
  };
  const updateFavUI = (animate = false) => {
    // favoriteBtn güncelle - classList.add/remove kullanarak daha güvenilir
    if(favoriteBtn){
      if(favActive){
        favoriteBtn.classList.add("is-favorite");
      } else {
        favoriteBtn.classList.remove("is-favorite");
      }
      favoriteBtn.setAttribute("aria-pressed", favActive ? "true" : "false");
    }
    // favoriteBtn2 güncelle (transposeBar içindeki)
    if(favoriteBtn2){
      if(favActive){
        favoriteBtn2.classList.add("is-favorite");
      } else {
        favoriteBtn2.classList.remove("is-favorite");
      }
      favoriteBtn2.setAttribute("aria-pressed", favActive ? "true" : "false");
    }
    // Tüm favori butonlarını güncelle (eğer sayfada başka favori butonları varsa)
    const allFavBtns = document.querySelectorAll(".favoriteBtn");
    allFavBtns.forEach(btn => {
      if(btn !== favoriteBtn && btn !== favoriteBtn2){
        if(favActive){
          btn.classList.add("is-favorite");
        } else {
          btn.classList.remove("is-favorite");
        }
        btn.setAttribute("aria-pressed", favActive ? "true" : "false");
      }
    });
  };
  updateFavUI();

  const toggleFavorite = async (e) => {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Giriş kontrolü
    const currentUser = window.fbAuth?.currentUser;
    const db = window.fbDb;
    
    if(!currentUser || !db){
      // Giriş yapmamış - login sayfasına yönlendir
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      window.location.href = `/login.html?return=${encodeURIComponent(currentUrl)}`;
      return;
    }
    if(!favRef){
      const favId = `${currentUser.uid}_${currentId}`;
      favRef = db.collection("favorites").doc(favId);
    }
    try{
      if(favActive){
        await favRef.delete();
        favActive = false;
        // Cache'i temizle
        if(window.clearFavoritesCache){
          window.clearFavoritesCache();
        }
        updateFavUI(true);
        // Mesaj gösterme - sadece renk değişimi yeterli
        setFavStatus("", false);
      }else{
        const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
        await favRef.set({
          uid: currentUser.uid,
          songId: currentId,
          song: current?.song || "",
          artist: current?.artist || "",
          createdAt: stamp
        });
        favActive = true;
        // Cache'i temizle
        if(window.clearFavoritesCache){
          window.clearFavoritesCache();
        }
        updateFavUI(true);
        // Mesaj gösterme - sadece renk değişimi yeterli
        setFavStatus("", false);
      }
    }catch(err){
      setFavStatus(err?.message || t("status_favorite_failed", "Favorî nehat tomarkirin."), true);
    }
  };

  // Tüm favori butonlarına event listener ekle - önceki listener'ları temizle
  const favButtons = document.querySelectorAll(".favoriteBtn");
  if(favButtons.length > 0){
    favButtons.forEach(btn => {
      // Önceki listener'ları temizle
      const newBtn = btn.cloneNode(true);
      btn.parentNode?.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", toggleFavorite);
    });
  }
  if(favoriteBtn){
    // Önceki listener'ları temizle
    const newFavoriteBtn = favoriteBtn.cloneNode(true);
    favoriteBtn.parentNode?.replaceChild(newFavoriteBtn, favoriteBtn);
    newFavoriteBtn.addEventListener("click", toggleFavorite);
  }
  // favoriteBtn2'yi de güncelle
  const favoriteBtn2Updated = document.getElementById("favoriteBtn2");
  if(favoriteBtn2Updated) {
    const newFavoriteBtn2 = favoriteBtn2Updated.cloneNode(true);
    favoriteBtn2Updated.parentNode?.replaceChild(newFavoriteBtn2, favoriteBtn2Updated);
    newFavoriteBtn2.addEventListener("click", toggleFavorite);
  }

  const auth = window.fbAuth;
  // Düzenleme butonu her zaman görünür - giriş kontrolü tıklamada yapılacak
  if(editToggleRow) {
    editToggleRow.style.display = "flex";
  }
  
  // Favori durumunu kontrol et
  const checkFavoriteStatus = async (user) => {
    if(!user || !window.fbDb || !currentId) {
      favActive = false;
      updateFavUI();
      setFavStatus("");
      favRef = null;
      return;
    }
    
    try {
      // Önce cache'den kontrol et (daha hızlı)
      if(window.loadUserFavorites && typeof window.loadUserFavorites === "function") {
        const favorites = await window.loadUserFavorites(user.uid);
        const isFav = favorites && favorites.includes(currentId);
        if(isFav !== favActive) {
          favActive = isFav;
          updateFavUI();
          setFavStatus("");
          // favRef'i de ayarla
          const favId = `${user.uid}_${currentId}`;
          favRef = window.fbDb.collection("favorites").doc(favId);
          return;
        }
      }
      
      // Cache'de yoksa veya cache'den farklıysa Firestore'dan kontrol et
      const favId = `${user.uid}_${currentId}`;
      favRef = window.fbDb.collection("favorites").doc(favId);
      const snap = await favRef.get();
      const newFavActive = !!snap?.exists;
      if(newFavActive !== favActive) {
        favActive = newFavActive;
        updateFavUI();
        setFavStatus("");
      }
    } catch(err) {
      console.warn("Favori durumu kontrol edilemedi:", err);
      favActive = false;
      updateFavUI();
    }
  };
  
  if(auth){
    const currentUser = auth.currentUser;
    
    // İlk yüklemede favori durumunu kontrol et (eğer kullanıcı giriş yapmışsa)
    if(currentUser) {
      checkFavoriteStatus(currentUser);
    }
    
    auth.onAuthStateChanged((user) => {
      if(!user && editPanel){
        editPanel.classList.add("is-hidden");
      }
      // Favori durumunu kontrol et
      checkFavoriteStatus(user);
    });
  }

  // Textarea yüksekliğini içeriğe göre ayarla
  const adjustTextareaHeight = (textarea) => {
    if(!textarea) return;
    textarea.style.height = 'auto'; // Önce sıfırla
    textarea.style.height = textarea.scrollHeight + 'px'; // İçeriğe göre ayarla
  };

  const fillEditForm = () => {
    if(editSong) editSong.value = current?.song || "";
    if(editArtist) editArtist.value = artistInputValue(current?.artist);
    if(editKey){
      const rawKey = (current?.key || "").toString().trim();
      if(rawKey){
        const exists = Array.from(editKey.options || []).some(opt => opt.value === rawKey);
        if(!exists){
          const opt = document.createElement("option");
          opt.value = rawKey;
          opt.textContent = rawKey;
          editKey.insertBefore(opt, editKey.firstChild);
        }
      }
      editKey.value = rawKey;
    }
    if(editText) {
      editText.value = (textPre?.dataset?.baseText || "").toString();
      // Textarea yüksekliğini ayarla
      setTimeout(() => adjustTextareaHeight(editText), 0);
    }
    if(editSongRhythm){
      editSongRhythm.value = (current?.ritim || "").trim();
    }
    if(editNotice) editNotice.textContent = "";
  };

  const closeEditPanel = () => {
    const imgWrap = document.querySelector(".imgWrap");
    if(editPanel) editPanel.classList.add("is-hidden");
    if(imgWrap) imgWrap.style.display = "";
  };

  editToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if(!editPanel) return;
    const user = window.fbAuth?.currentUser;
    
    if(!user){
      // Giriş yapmamış - login sayfasına yönlendir
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      window.location.href = `/login.html?return=${encodeURIComponent(currentUrl)}`;
      return;
    }
    
    // Giriş yapmış kullanıcılar için düzenleme panelini aç/kapat
    const imgWrap = document.querySelector(".imgWrap");
    const willOpen = editPanel.classList.contains("is-hidden");
    
    if(willOpen){
      fillEditForm();
      // Şarkı içeriğini gizle, düzenleme panelini göster
      if(imgWrap) imgWrap.style.display = "none";
      editPanel.classList.remove("is-hidden");
      // Panel açıldıktan sonra textarea yüksekliğini ayarla
      setTimeout(() => {
        if(editText) adjustTextareaHeight(editText);
      }, 100);
    } else {
      // Şarkı içeriğini göster, düzenleme panelini gizle
      if(imgWrap) imgWrap.style.display = "";
      editPanel.classList.add("is-hidden");
    }
  });
  editClose?.addEventListener("click", closeEditPanel);

  // Şarkı ekle butonu
  const addSongBtn = document.getElementById("addSongBtn");
  if(addSongBtn){
    addSongBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const user = window.fbAuth?.currentUser;
      if(!user){
        // Giriş yapmamış - login sayfasına yönlendir
        const currentUrl = window.location.pathname + window.location.search + window.location.hash;
        window.location.href = `/login.html?return=${encodeURIComponent(currentUrl)}`;
        return;
      }
      
      // Giriş yapmış - şarkı ekleme panelini şarkı sayfasında aç
      const addPanel = document.getElementById("addSongPanel");
      if(addPanel){
        // Panel bu sayfada var, aç
        addPanel.classList.remove("is-hidden");
        addPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        // İlk input'a focus ver
        const addSongName = document.getElementById("addSongName");
        if(addSongName){
          setTimeout(() => {
            addSongName.focus();
          }, 300);
        }
      } else {
        // Panel bu sayfada yok, song.html'e yönlendir (mobilde de burada açılmalı)
        if(!isSongPath()){
          // Başka bir sayfadaysak, song.html'e yönlendir
          window.location.href = window.appendLangParam
            ? window.appendLangParam("/song.html#add-song")
            : "/song.html#add-song";
        } else if(typeof window.openAddSongPanel === "function"){
          // Panel yok ama global fonksiyon var, onu kullan
          window.openAddSongPanel();
        } else {
          // Hiçbiri yok, anasayfaya yönlendir
          location.href = window.appendLangParam
            ? window.appendLangParam("/index.html#add-song")
            : "/index.html#add-song";
        }
      }
    });
  }

  // Çakışan işlemleri önlemek için flag
  let isSaving = false;

  editSave?.addEventListener("click", async () => {
    if(!editNotice) return;
    
    // Eğer zaten kaydediliyorsa, tekrar tıklamayı engelle
    if(isSaving){
      console.log("⏳ Zaten kaydediliyor, bekleniyor...");
      return;
    }

    // Firebase'in hazır olmasını bekle (global fonksiyon kullan)
    // waitForFirebaseInit common.js'de tanımlı - eğer yoksa fallback kullan
    let db = null;
    try {
      // Önce global waitForFirebaseInit'i dene
      if (typeof window.waitForFirebaseInit === "function") {
        await window.waitForFirebaseInit();
      } else {
        // Fallback: Firebase'in hazır olmasını bekle
        let retries = 0;
        const maxRetries = 15;
        while (retries < maxRetries && (!window.fbDb || !window.fbDb._delegate)) {
          await new Promise(resolve => setTimeout(resolve, 400));
          retries++;
        }
      }
      
      // Firestore'un hazır olduğundan emin ol
      if (!window.fbDb || !window.fbDb._delegate) {
        throw new Error(t("status_firestore_unready", "Firestore ne amade ye. Ji kerema xwe rûpelê nû bike û dîsa biceribîne."));
      }
      
      // Biraz daha bekle - Firestore'un tamamen hazır olması için
      await new Promise(resolve => setTimeout(resolve, 300));
      
      db = window.fbDb;
    } catch(err) {
      editNotice.textContent = err.message || t("status_firestore_unready", "Firestore ne amade ye. Ji kerema xwe rûpelê nû bike û dîsa biceribîne.");
      editNotice.style.color = "#ef4444";
      editNotice.style.background = "rgba(239, 68, 68, 0.1)";
      editNotice.style.border = "1px solid rgba(239, 68, 68, 0.2)";
      editNotice.style.padding = "12px 16px";
      editNotice.style.borderRadius = "8px";
      editNotice.style.marginTop = "16px";
      isSaving = false;
      editSave.disabled = false;
      return;
    }

    if(!db) return;

    const user = window.fbAuth?.currentUser;
    if(!user){
      if(typeof window.requireAuthAction === "function"){
        window.requireAuthAction(() => {
          // Giriş yapıldıktan sonra kaydetmeyi tekrar dene
          editSave?.click();
        }, t("status_requires_login_edit"));
      } else {
        editNotice.textContent = t("status_requires_login_edit", "Ji bo guhertinê divê tu têkevî.");
        editNotice.style.color = "#ef4444";
      }
      return;
    }

    const nextSong = (editSong?.value || "").trim();
    const nextArtist = parseArtistInput(editArtist?.value || "");
    const nextKey = (editKey?.value || "").trim();
    const nextRhythm = (editSongRhythm?.value || "").trim();
    const nextText = (editText?.value || "").toString();

    if(!nextSong || !nextText){
      editNotice.textContent = t("status_edit_required_fields", "Navê stranê û nivîs pêwîst in.");
      editNotice.style.color = "#ef4444";
      return;
    }

    isSaving = true;
    editSave.disabled = true;
    editNotice.textContent = t("status_saving", "Tomar tê kirin...");
    editNotice.style.color = "#3b82f6";

    try{
      const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
      
      // Retry mekanizması ile kaydet
      let docRef = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while(!docRef && retryCount < maxRetries){
        try {
          const ref = db.collection("song_submissions");
          
          // Veritabanına kaydet
          docRef = await ref.add({
            type: "edit",
            status: "pending",
            sourceId: currentId,
            song: nextSong,
            artist: nextArtist,
            key: nextKey,
            ritim: nextRhythm,
            text: nextText,
            createdBy: user.uid,
            createdByEmail: user.email || "",
            updatedAt: stamp,
            createdAt: stamp
          });
          
          console.log("✅ Şarkı düzenlemesi veritabanına kaydedildi:", docRef.id);
          console.log("📝 Kaydedilen veri:", {
            type: "edit",
            sourceId: currentId,
            song: nextSong,
            artist: nextArtist,
            createdBy: user.uid
          });
          break; // Başarılı, döngüden çık
        } catch(addErr){
          retryCount++;
          console.error(`❌ Kayıt hatası (deneme ${retryCount}/${maxRetries}):`, addErr);
          
          // Eğer "INTERNAL ASSERTION FAILED" hatası ise, biraz bekle ve tekrar dene
          if(addErr?.message?.includes("INTERNAL ASSERTION") || addErr?.code === "internal"){
            if(retryCount < maxRetries){
              console.log(`⏳ Firestore internal hatası, ${retryCount * 500}ms bekleniyor...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 500));
              continue;
            }
          }
          
          // Son deneme de başarısız olduysa hatayı fırlat
          if(retryCount >= maxRetries){
            throw addErr;
          }
        }
      }

      if(!docRef){
        throw new Error(t("status_save_failed", "Nehat tomarkirin."));
      }

      // Cache'i temizle - sayfa yenilendiğinde yeni veriler yüklensin
      window.clearSongsCache?.();
      
      // Şarkı verilerini güncelle (hemen görünsün)
      if(textPre){
        textPre.dataset.baseText = nextText;
        renderText(textPre, nextText, semitones);
      }
      if(pendingBadge) pendingBadge.style.display = "inline-flex";
      const songNameEl = document.getElementById("songName");
      const songArtistEl = document.getElementById("songArtist");
      if(songNameEl) songNameEl.textContent = window.formatSongTitle ? window.formatSongTitle(nextSong) : nextSong;
      if(songArtistEl) songArtistEl.innerHTML = artistLinks(nextArtist);
      if(nextKey){
        originalKey = nextKey;
        preferForKey = pickPrefer(originalKey, "sharp");
        originalRoot = getRootNote(originalKey);
        semitones = 0;
        updateKeyLabels();
        renderText(textPre, nextText, semitones);
      }else if(origKeyEl){
        origKeyEl.textContent = "—";
      }
      current.ritim = nextRhythm;
      if(rhythmEl){
        rhythmEl.textContent = nextRhythm || "-";
      }
      
      // Başarı mesajını göster
      editNotice.textContent = t("status_edit_saved", "Niha tomar kir. Guhertinên te ji bo pejirandina edîtorê li benda ne. Piştî pejirandinê guhertinên te dê xuya bibin.");
      editNotice.style.color = "#059669";
      editNotice.style.background = "rgba(5, 150, 105, 0.1)";
      editNotice.style.border = "1px solid rgba(5, 150, 105, 0.2)";
      editNotice.style.padding = "12px 16px";
      editNotice.style.borderRadius = "8px";
      editNotice.style.marginTop = "16px";
      
      // Mesajı 2 saniye göster, sonra panel'i kapat
      // location.reload() yerine daha yumuşak bir yenileme
      setTimeout(() => {
        const imgWrap = document.querySelector(".imgWrap");
        editPanel.classList.add("is-hidden");
        if(imgWrap) imgWrap.style.display = "";
        
        // Cache'i temizle
        window.clearSongsCache?.();
        
        // Sayfayı yeniden yükle (gerekirse)
        // Ancak önce bir süre bekle ki Firestore listener'ları güncellensin
        setTimeout(() => {
          location.reload();
        }, 500);
      }, 2000);
    }catch(err){
      console.error("❌ Şarkı düzenleme hatası:", err);
      let errorMsg = t("status_save_failed", "Nehat tomarkirin.");
      
      if(err?.message?.includes("INTERNAL ASSERTION")){
        errorMsg = t("status_firestore_error", "Firestore hatası. Ji kerema xwe rûpelê nû bike û dîsa biceribîne.");
      } else if(err?.message){
        errorMsg = err.message;
      } else if(err?.code){
        errorMsg = `Firestore: ${err.code}`;
      }
      
      editNotice.textContent = errorMsg;
      editNotice.style.color = "#ef4444";
      editNotice.style.background = "rgba(239, 68, 68, 0.1)";
      editNotice.style.border = "1px solid rgba(239, 68, 68, 0.2)";
      editNotice.style.padding = "12px 16px";
      editNotice.style.borderRadius = "8px";
      editNotice.style.marginTop = "16px";
    } finally {
      isSaving = false;
      editSave.disabled = false;
    }
  });

  // Nivîsê bar bike (slug = navê stranê slugify)
  const slug = getTextSlug(current);
  
  try{
    const rawText = current?.text ? current.text : await loadSongText(slug);
    const cleanedText = rawText.toString().replace(/_/g, " ");
    if(textPre){
      textPre.dataset.baseText = cleanedText;
      renderText(textPre, cleanedText, semitones);
    }
  }catch(err){
    console.error("Metin yükleme hatası:", err, "slug:", slug);
    if(textPre){
      textPre.textContent = t("status_text_missing", "Metin bulunamadı.");
      textPre.dataset.baseText = "";
    }
  }

  // YouTube çağrısı (ilk sanatçı)
  const firstArtist = artistArr(current.artist)[0];
  loadYoutubeVideo(current.song, firstArtist);

  // Öneriler
  const pool = SONGS.filter(s => makeId(s) !== makeId(current));
  const recEl = document.getElementById("recs");
  
  // Helper functions (from common.js)
  const $ = (s) => document.querySelector(s);
  const norm = (s) => (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
  const pickRandom = (arr, n) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };
  
  const renderRecs = () => {
    if(!recEl) return;
    const curArtists = new Set(artistArr(current.artist).map(a => norm(a)));
    const preferred = pool.filter(s =>
      artistArr(s.artist).some(a => curArtists.has(norm(a)))
    );
    const first = pickRandom(preferred, 10);
    const need = Math.max(0, 10 - first.length);
    const restPool = pool.filter(s => !first.some(x => makeId(x) === makeId(s)));
    const recs = first.concat(pickRandom(restPool, need));
    renderRecList(recEl, recs);
  };
  renderRecs();
  const shuffleBtn = document.getElementById("shuffleRec");
  if(shuffleBtn) shuffleBtn.addEventListener("click", renderRecs);
  
  // Responsive search - sadece tablet ve desktop için (mobil common.js'de handle ediliyor)
  function initResponsiveSearch() {
    const searchHeaders = document.querySelectorAll(".search--header");
    searchHeaders.forEach(searchEl => {
      const input = searchEl.querySelector(".search__input");
      const icon = searchEl.querySelector(".search__icon");
      if(!input || !icon) return;
      
      // Sadece tablet ve desktop için (mobil common.js'de handle ediliyor)
      if(window.innerWidth <= 639) {
        return;
      }
      
      // Küçük ekranlarda icon-only modunu aktif et (tablet için)
      function checkScreenSize() {
        if(window.innerWidth <= 768 && window.innerWidth > 639) {
          searchEl.classList.add("search--icon-only");
        } else {
          searchEl.classList.remove("search--icon-only", "search--open");
        }
      }
      
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      
      // Icon'a tıklayınca aç/kapat (sadece tablet için)
      icon.addEventListener("click", (e) => {
        if(window.innerWidth <= 768 && window.innerWidth > 639) {
          e.preventDefault();
          e.stopPropagation();
          if(searchEl.classList.contains("search--open")) {
            searchEl.classList.remove("search--open");
            input.blur();
            document.body.classList.remove("search-open");
          } else {
            searchEl.classList.add("search--open");
            document.body.classList.add("search-open");
            setTimeout(() => input.focus(), 100);
          }
        }
      });
      
      // Input'tan çıkınca kapat (sadece tablet için)
      input.addEventListener("blur", () => {
        if(window.innerWidth <= 768 && window.innerWidth > 639 && !input.value) {
          setTimeout(() => {
            if(document.activeElement !== input) {
              searchEl.classList.remove("search--open");
              document.body.classList.remove("search-open");
            }
          }, 200);
        }
      });
      
      // Sayfa kaydırılınca search input'u kapat (sadece tablet için)
      let scrollTimeout;
      function handleScroll() {
        if(window.innerWidth <= 768 && window.innerWidth > 639 && searchEl.classList.contains("search--open")) {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            searchEl.classList.remove("search--open");
            document.body.classList.remove("search-open");
            input.blur();
          }, 150);
        }
      }
      
      window.addEventListener("scroll", handleScroll, { passive: true });
    });
  }
  
  initResponsiveSearch();
  
  // Şarkı ekleme panelini başlat
  if(typeof window.initAddSongPanel === "function"){
    window.initAddSongPanel();
  }
}

init().catch(console.error);
})();
