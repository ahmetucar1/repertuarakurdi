// app.js — serrûpel
(function(){

let SONGS = [];
let homeSample = [];
let lastQuery = "";
let userFavorites = [];
const HOME_SAMPLE_SIZE = 10;
const t = (key, fallback, vars) => window.t ? window.t(key, vars) : fallback;

function makeId(s){
  if(typeof songId === "function") return songId(s);
  return s?.id || "";
}
function openLink(s){
  if(typeof window.buildSongUrl === "function") return window.buildSongUrl(s);
  return `/song.html?id=${encodeURIComponent(makeId(s))}`;
}

function artistArr(a){
  if(Array.isArray(a)) return a.filter(Boolean).map(String);
  if(a == null) return [];
  return [String(a)].filter(Boolean);
}
function artistText(a){
  const fmt = window.formatArtistName;
  return artistArr(a).map(name => fmt ? fmt(name) : name).join(" ");
}
function artistLinks(a){
  const fmt = window.formatArtistName;
  const arr = artistArr(a).map(name => fmt ? fmt(name) : name);
  if(!arr.length) return "—";
  return arr.map(name => {
    const raw = `/artist.html?name=${encodeURIComponent(name)}`;
    const href = window.appendLangParam ? window.appendLangParam(raw) : raw;
    return `<a class="artistLink" href="${href}">${escapeHtml(name)}</a>`;
  }).join(" · ");
}

function renderStoryStripSkeleton(track, count = 10){
  if(!track || track.dataset.skeleton === "true") return;
  const items = Array.from({ length: count }).map(() => `
    <div class="storyBubble is-skeleton" role="listitem" aria-hidden="true">
      <span class="storyBubble__ring">
        <span class="storyBubble__img"></span>
      </span>
      <span class="storyBubble__name"></span>
    </div>
  `);
  track.innerHTML = items.join("");
  track.dataset.skeleton = "true";
}

function renderStoryStripItems(list){
  const track = document.getElementById("storyTrack");
  if(!track) return;
  const html = list.map((item) => {
    const name = (item?.artist || "").toString().trim();
    const label = (item?.label || name).toString().trim();
    const photo = (item?.photo || "").toString().trim();
    if(!name || !photo) return "";
    const display = window.formatArtistName ? window.formatArtistName(label) : label;
    const raw = `/artist.html?name=${encodeURIComponent(name)}`;
    const href = window.appendLangParam ? window.appendLangParam(raw) : raw;
    return `
      <a class="storyBubble" href="${href}" role="listitem" aria-label="${escapeHtml(display)}">
        <span class="storyBubble__ring">
          <img class="storyBubble__img" src="${photo}" alt="${escapeHtml(display)}" loading="lazy" decoding="async">
        </span>
        <span class="storyBubble__name">${escapeHtml(display)}</span>
      </a>
    `;
  }).join("");
  track.innerHTML = html;
  track.dataset.skeleton = "false";
}

async function renderStoryStrip(){
  const track = document.getElementById("storyTrack");
  if(!track || typeof window.loadArtistPhotos !== "function") return;

  const cached = window.getArtistPhotosCache?.() || [];
  if(cached.length){
    renderStoryStripItems(cached);
  } else {
    renderStoryStripSkeleton(track);
  }

  const list = await window.loadArtistPhotos();
  if(Array.isArray(list) && list.length){
    renderStoryStripItems(list);
  }
  initStoryStripControls();
}

function initStoryStripControls(){
  const track = document.getElementById("storyTrack");
  const leftBtn = document.getElementById("storyArrowLeft");
  const rightBtn = document.getElementById("storyArrowRight");
  if(!track || !leftBtn || !rightBtn) return;

  const update = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    if(maxScroll <= 2){
      leftBtn.classList.add("is-hidden");
      rightBtn.classList.add("is-hidden");
      return;
    }
    if(track.scrollLeft <= 2){
      leftBtn.classList.add("is-hidden");
    } else {
      leftBtn.classList.remove("is-hidden");
    }
    if(track.scrollLeft >= maxScroll - 2){
      rightBtn.classList.add("is-hidden");
    } else {
      rightBtn.classList.remove("is-hidden");
    }
  };

  if(track.dataset.arrows !== "true"){
    const scrollByAmount = () => Math.max(160, Math.round(track.clientWidth * 0.7));
    leftBtn.addEventListener("click", () => {
      track.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
    });
    rightBtn.addEventListener("click", () => {
      track.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
    });
    let raf = 0;
    const onScroll = () => {
      if(raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    track.dataset.arrows = "true";
  }

  update();
  setTimeout(update, 200);
}

function renderStats(){
  const songsN = SONGS.length;
  const artists = new Set(SONGS.flatMap(s => artistArr(s.artist)).map(a => norm(a))).size;
  const elSongs = $("#statSongs");
  const elArtists = $("#statArtists");
  if(elSongs) elSongs.textContent = songsN.toString();
  if(elArtists) elArtists.textContent = artists.toString();
}

function renderList(){
  // Mobil search overlay açıkken sayfadaki listeleri güncelleme
  if (window.__mobileSearchOverlayOpen) {
    log("🚫 renderList() skipped - mobile search overlay is open");
    return;
  }
  
  if((!SONGS || SONGS.length === 0) && window.__songsCache && window.__songsCache.length > 0){
    SONGS = window.__songsCache;
    window.SONGS = SONGS;
  }
  
  log("renderList() called");
  log("SONGS length:", SONGS ? SONGS.length : 0);
  const listEl = $("#list");
  const countEl = $("#count");
  const titleEl = $("#resultsTitle");
  const listWrap = document.querySelector(".homeListWrap");
  
  log("listEl:", listEl);
  log("listWrap:", listWrap);
  
  if(!listEl) {
    console.error("List element not found!");
    return;
  }

  const qTopbar = norm($("#q")?.value || "");
  const q = qTopbar; // Sadece topbar search'ü kullan
  const refreshBtn = document.getElementById("refreshRecs");
  
  let items = [];
  const intro = document.querySelector(".homeIntro");

  if(titleEl){
    titleEl.textContent = q ? t("home_results_search", "Encamên lêgerînê") : t("home_results_default", "Yên Berçav");
  }
  if(listWrap){
    listWrap.classList.toggle("is-searching", !!q);
    if(refreshBtn){
      refreshBtn.style.display = q ? "none" : "inline-flex";
    }
    // Mobilde arama yapıldığında body'ye class ekle
    const isMobile = window.innerWidth <= 639;
    if(isMobile && q) {
      document.body.classList.add("has-search-results");
      document.body.classList.remove("has-hero-search");
    } else if(!q) {
      document.body.classList.remove("has-search-results", "has-hero-search");
    }
  }
  if(intro){
    // Tenê dema ku bi rastî lêgerîn hate kirin veşêre
    if(q && q.length > 0){
      intro.classList.add("is-searching");
    } else {
      intro.classList.remove("is-searching");
    }
  }
  if(q && !lastQuery && listWrap){
    listWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  lastQuery = q;

  if(!q){
    // Ger lêgerîn tune be homeSample bikar bîne
    log("No search query, using homeSample");
    log("homeSample:", homeSample);
    log("SONGS length:", SONGS.length);
    
    if(homeSample && homeSample.length > 0){
      items = homeSample;
      log("Using existing homeSample, items count:", items.length);
    } else if(SONGS && SONGS.length > 0){
      // homeSample boşsa ama SONGS varsa, yeni sample oluştur
      log("homeSample is empty, creating new sample from SONGS");
      homeSample = pickRandom(SONGS, HOME_SAMPLE_SIZE);
      items = homeSample;
      log("New homeSample created, items count:", items.length);
    } else {
      warn("Both homeSample and SONGS are empty!");
      items = [];
    }
  }else{
    // Gelişmiş fuzzy search kullan
    items = window.fuzzySearch ? window.fuzzySearch(q, SONGS) : SONGS.filter(s => {
      const searchText = norm(`${s.song} ${artistText(s.artist)}`);
      return searchText.includes(q);
    });
  }

  if(countEl) countEl.textContent = items.length.toString();

  if(!items.length){
    if(!q && SONGS.length === 0){
      listEl.innerHTML = `<div class="empty">${t("status_loading_songs", "Stran tên barkirinê...")}</div>`;
    } else {
      listEl.innerHTML = `<div class="empty">${t("status_no_results", "Tınne")}</div>`;
    }
    return;
  }

  log("Rendering list with", items.length, "items");
  const sId = window.songId || ((s) => s._id || "");
  const html = items.map(s => {
    const pendingBadge = s.pending ? `<span class="badge badge--pending">${t("badge_pending_editor", "Li benda pejirandina edîtorê ye")}</span>` : "";
    const title = window.formatSongTitle ? window.formatSongTitle(s.song) : (s.song || "");
    const songId = sId(s);
    const isFav = window.isFavorite?.(songId, userFavorites) || false;
    return `
    <div class="item" data-song-id="${escapeHtml(songId)}">
      <div class="item__left">
        <div class="item__title">${escapeHtml(title)}</div>
        <div class="item__sub">${artistLinks(s.artist)}</div>
      </div>
      <div class="badges">
        ${pendingBadge}
        <button class="favoriteBtn ${isFav ? 'is-favorite' : ''}" type="button" aria-label="${t("action_favorite", "Favorî bike")}" data-song-id="${escapeHtml(songId)}">
          <svg class="favoriteIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <a class="open" href="${openLink(s)}">${t("action_open", "Veke")}</a>
      </div>
    </div>
  `;
  }).join("");
  
  listEl.innerHTML = html;
  log("List rendered, HTML length:", html.length);
  log("List element after render:", listEl);
  log("List innerHTML length:", listEl.innerHTML.length);
  
  // Favorileme butonlarına event listener ekle
  const favoriteBtns = listEl.querySelectorAll(".favoriteBtn");
  favoriteBtns.forEach(btn => {
    // Eski event listener'ları temizlemek için butonu clone et ve değiştir
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const songId = newBtn.getAttribute("data-song-id");
      if(!songId) {
        warn("No song ID found for favorite button");
        return;
      }
      
      // Stranê bibîne
      const song = items.find(s => {
        const sId = window.songId?.(s) || "";
        return sId === songId;
      });
      if(!song) {
        warn("Song not found for ID:", songId);
        return;
      }
      
      log("Toggling favorite for song:", songId);
      const result = await window.toggleFavoriteSong?.(song);
      log("Toggle result:", result);
      
      if(result === true){
        // Favorilere eklendi - hemen UI'ı güncelle
        newBtn.classList.add("is-favorite");
        log("Added is-favorite class to button");
        
        // Favorileri yeniden yükle ve tüm butonları güncelle
        const auth = window.fbAuth;
        if(auth?.currentUser) {
          userFavorites = await window.loadUserFavorites?.(auth.currentUser.uid) || [];
          log("Reloaded favorites:", userFavorites.length);
          
          // Tüm favori butonlarını güncelle
          const allFavBtns = listEl.querySelectorAll(".favoriteBtn");
          allFavBtns.forEach(b => {
            const id = b.getAttribute("data-song-id");
            if(id && userFavorites.includes(id)) {
              b.classList.add("is-favorite");
            } else {
              b.classList.remove("is-favorite");
            }
          });
        }
      } else if(result === false){
        // Favoriden çıkarıldı - hemen UI'ı güncelle
        newBtn.classList.remove("is-favorite");
        console.log("Removed is-favorite class from button");
        
        // Favorileri yeniden yükle ve tüm butonları güncelle
        const auth = window.fbAuth;
        if(auth?.currentUser) {
          userFavorites = await window.loadUserFavorites?.(auth.currentUser.uid) || [];
          log("Reloaded favorites:", userFavorites.length);
          
          // Tüm favori butonlarını güncelle
          const allFavBtns = listEl.querySelectorAll(".favoriteBtn");
          allFavBtns.forEach(b => {
            const id = b.getAttribute("data-song-id");
            if(id && userFavorites.includes(id)) {
              b.classList.add("is-favorite");
            } else {
              b.classList.remove("is-favorite");
            }
          });
        }
      } else {
        warn("Toggle favorite returned null, user may need to login");
      }
    });
  });
  
  // Liste görünürlüğünü zorla
  if(listWrap){
    listWrap.style.display = "block";
    listWrap.style.visibility = "visible";
    listWrap.style.opacity = "1";
    listWrap.style.height = "auto";
    listWrap.style.overflow = "visible";
    listWrap.style.position = "relative";
    listWrap.style.zIndex = "1";
    log("listWrap styles applied");
  }
  if(listEl){
    listEl.style.display = "grid";
    listEl.style.visibility = "visible";
    listEl.style.opacity = "1";
    listEl.style.height = "auto";
    listEl.style.overflow = "visible";
    log("listEl styles applied");
  }
  
  // Son kontrol
  setTimeout(() => {
    const finalCheck = $("#list");
    if(finalCheck && finalCheck.innerHTML.trim().length > 0){
      log("✓ List is rendered and visible");
    } else {
      error("✗ List is still empty after render!");
    }
  }, 50);
}

function refreshHomeSample(){
  if(!SONGS || SONGS.length === 0) return;
  homeSample = pickRandom(SONGS, HOME_SAMPLE_SIZE);
  window.homeSample = homeSample;
  renderList();
}

function updateSearchState(){
  const input = $("#q");
  if(input){
    const wrap = input.closest(".search");
    if(wrap) wrap.classList.toggle("has-value", !!input.value);
  }
}

function renderDiscover(){
  const el = $("#discover");
  if(!el) return;
  const picks = pickRandom(SONGS, 10);
  el.innerHTML = picks.map(s => `
    <a class="pick" href="${openLink(s)}">
      <div class="pick__title">${escapeHtml(window.formatSongTitle ? window.formatSongTitle(s.song) : (s.song || ""))}</div>
      <div class="pick__sub">${artistLinks(s.artist)}</div>
    </a>
  `).join("");
}

function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function initContactForm(){
  const form = $("#contactForm");
  if(!form) return;
  const nameEl = $("#contactName");
  const infoEl = $("#contactInfo");
  const msgEl = $("#contactMessage");
  const filesEl = $("#contactFiles");
  const statusEl = $("#contactStatus");
  const submitBtn = form.querySelector("button[type=\"submit\"]");
  const db = window.fbDb;
  const storage = window.fbStorage;

  const setStatus = (msg, isError = false) => {
    if(!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.style.color = isError ? "#ef4444" : "";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!db){
      setStatus(t("contact_status_db_unready", "Danegeh amade nîne."), true);
      return;
    }

    if(submitBtn) submitBtn.disabled = true;
    setStatus(t("contact_status_sending", "Tê şandin..."));

    const name = (nameEl?.value || "").trim();
    const contact = (infoEl?.value || "").trim();
    const message = (msgEl?.value || "").trim();
    const files = Array.from(filesEl?.files || []);

    if(!message && !files.length){
      setStatus(t("contact_status_empty", "Ji kerema xwe peyam binivîse an jî pel zêde bike."), true);
      if(submitBtn) submitBtn.disabled = false;
      return;
    }

    const maxSize = 12 * 1024 * 1024;
    for(const file of files){
      if(file.size > maxSize){
        setStatus(t("contact_status_file_too_large", "\"{name}\" pir mezin e. (Max 12MB)", { name: file.name }), true);
        if(submitBtn) submitBtn.disabled = false;
        return;
      }
    }

    const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
    const user = window.fbAuth?.currentUser;
    const createdBy = user?.uid || "";
    const createdByEmail = user?.email || "";
    const uploaded = [];

    try{
      if(files.length){
        if(!storage){
          setStatus(t("contact_status_upload_disabled", "Barkirina pelê çalak nîne."), true);
          if(submitBtn) submitBtn.disabled = false;
          return;
        }
        const baseId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const basePath = `contact_uploads/${createdBy || "anon"}/${baseId}`;
        for(const file of files){
          const safeName = file.name.replace(/[^\w.\-]+/g, "_");
          const ref = storage.ref(`${basePath}/${safeName}`);
          const snap = await ref.put(file);
          const url = await snap.ref.getDownloadURL();
          uploaded.push({
            name: file.name,
            url,
            size: file.size,
            type: file.type || ""
          });
        }
      }

      await db.collection("contact_messages").add({
        name,
        contact,
        message,
        files: uploaded,
        createdBy,
        createdByEmail,
        createdAt: stamp
      });

      form.reset();
      setStatus(t("contact_status_sent", "Hate şandin. Spas, em ê di demek nêzîk de vegerin."));
    }catch(err){
      setStatus(err?.message || t("contact_status_failed", "Peyam nehat şandin."), true);
    }finally{
      if(submitBtn) submitBtn.disabled = false;
    }
  });
}

async function init(){
  log("=== INIT STARTED ===");
  renderStoryStrip();
  try {
    log("Loading songs...");
    const shouldForceRefresh = window.location.search.includes("refresh=true");
    // Cache'i sadece istenirse temizle
    if(shouldForceRefresh){
      window.clearSongsCache?.();
    }
    SONGS = await loadSongs();
    // window objesine de ata - mobil search overlay için
    window.SONGS = SONGS;
    log("SONGS loaded:", SONGS ? SONGS.length : 0);
    if(SONGS && SONGS.length > 0) {
      log("First 3 songs:", SONGS.slice(0, 3));
    } else {
      warn("SONGS array is empty or null!");
      // Retry once
      log("Retrying loadSongs...");
      if(shouldForceRefresh){
        window.clearSongsCache?.();
      }
      SONGS = await loadSongs();
      window.SONGS = SONGS;
      log("SONGS after retry:", SONGS ? SONGS.length : 0);
    }

    if((!SONGS || SONGS.length === 0) && window.__songsCache && window.__songsCache.length > 0){
      SONGS = window.__songsCache;
      window.SONGS = SONGS;
    }

    if(!SONGS || SONGS.length === 0){
      error("SONGS is still empty after retry!");
      const listEl = $("#list");
      const listWrap = document.querySelector(".homeListWrap");
      if(listEl) {
        listEl.innerHTML = `<div class="empty">${t("status_loading_songs", "Stran tên barkirinê...")}</div>`;
        listEl.style.display = "grid";
      }
      if(listWrap) {
        listWrap.style.display = "block";
        listWrap.style.visibility = "visible";
        listWrap.style.opacity = "1";
      }
      return;
    }

    renderStats();
    renderStoryStrip();

    // her têketinê de 10 stranên cuda
    if(SONGS && SONGS.length > 0) {
      homeSample = pickRandom(SONGS, HOME_SAMPLE_SIZE);
      // window objesine de ata - mobil search overlay için
      window.homeSample = homeSample;
    } else {
      homeSample = [];
      window.homeSample = [];
      warn("SONGS is empty, homeSample will be empty");
    }
    log("homeSample created:", homeSample.length);
    if(homeSample.length > 0) {
      log("homeSample items:", homeSample);
    }
    
    renderDiscover();
    
    // Liste render etmeden önce görünürlüğü zorla
    const listEl = $("#list");
    const listWrap = document.querySelector(".homeListWrap");
    log("listEl:", listEl);
    log("listWrap:", listWrap);
    
    if(!listEl) {
      error("List element not found!");
      return;
    }
    
    if(listWrap) {
      listWrap.style.display = "block";
      listWrap.style.visibility = "visible";
      listWrap.style.opacity = "1";
      listWrap.style.height = "auto";
      listWrap.style.overflow = "visible";
      listWrap.style.position = "relative";
      listWrap.style.zIndex = "1";
    }
    if(listEl) {
      listEl.style.display = "grid";
      listEl.style.visibility = "visible";
      listEl.style.opacity = "1";
      listEl.style.height = "auto";
      listEl.style.overflow = "visible";
    }
    
    // Favorileri yükle
    const auth = window.fbAuth;
    if(auth){
      const loadFavorites = async (user) => {
        if(user){
          userFavorites = await window.loadUserFavorites?.(user.uid) || [];
          log("User favorites loaded:", userFavorites.length);
        } else {
          userFavorites = [];
        }
        renderList();
      };
      
      // Mevcut kullanıcı için yükle
      const currentUser = auth.currentUser;
      if(currentUser){
        await loadFavorites(currentUser);
      } else {
        renderList();
      }
      
      // Auth state değişikliklerini dinle - sadece favorileri güncelle
      if(!window.__appAuthListenerSetup){
        window.__appAuthListenerSetup = true;
        auth.onAuthStateChanged(async (user) => {
          // Sadece favorileri güncelle, loadSongs çağırma
          await loadFavorites(user);
          // Hero login butonunu güncelle
          const heroLoginBtn = document.getElementById("heroLoginBtn");
          if(heroLoginBtn){
            heroLoginBtn.style.display = user ? "none" : "inline-flex";
          }
        });
      }
    } else {
      log("Calling renderList() and renderHeroSearch()...");
      renderList();
      renderHeroSearch();
      log("renderList() and renderHeroSearch() completed");
    }
    
    // Son kontrol - eğer liste hala boşsa zorla render et
    setTimeout(() => {
      const finalListEl = $("#list");
      if(finalListEl && finalListEl.innerHTML.trim().length === 0 && homeSample.length > 0) {
        warn("List is still empty after renderList! Forcing render...");
        finalListEl.innerHTML = homeSample.map(s => {
          const title = s.song || t("label_song", "Stran");
          const artist = artistText(s.artist) || t("label_artist", "Hunermend");
          return `
            <div class="item">
              <div class="item__left">
                <div class="item__title">${escapeHtml(title)}</div>
                <div class="item__sub">${escapeHtml(artist)}</div>
              </div>
              <div class="badges">
                <a class="open" href="${openLink(s)}">${t("action_open", "Veke")}</a>
              </div>
            </div>
          `;
        }).join("");
        finalListEl.style.display = "grid";
        finalListEl.style.visibility = "visible";
        finalListEl.style.opacity = "1";
        log("Forced render completed");
      }
    }, 500);
    
    updateSearchState();
    
    // Son kontrol - eğer hala boşsa zorla render et
    setTimeout(() => {
      const checkListEl = $("#list");
      const checkWrap = document.querySelector(".homeListWrap");
      if(checkListEl && checkListEl.innerHTML.trim().length === 0){
        error("List is still empty after renderList! Forcing render...");
        if(homeSample && homeSample.length > 0){
          checkListEl.innerHTML = homeSample.map(s => `
            <div class="item">
              <div class="item__left">
                <div class="item__title">${escapeHtml(s.song || t("label_song", "Stran"))}</div>
                <div class="item__sub">${escapeHtml(artistText(s.artist) || t("label_artist", "Hunermend"))}</div>
              </div>
              <div class="badges">
                <a class="open" href="${openLink(s)}">${t("action_open", "Veke")}</a>
              </div>
            </div>
          `).join("");
          checkListEl.style.display = "grid";
          checkListEl.style.visibility = "visible";
          checkListEl.style.opacity = "1";
        }
      }
      if(checkWrap) {
        checkWrap.style.display = "block";
        checkWrap.style.visibility = "visible";
        checkWrap.style.opacity = "1";
      }
    }, 100);
  } catch(err) {
    error("Init error:", err);
    const listEl = $("#list");
    const listWrap = document.querySelector(".homeListWrap");
    if(listEl) {
      listEl.innerHTML = `<div class="empty">${t("status_error_prefix", "Çewtî")}: ${err.message}</div>`;
      listEl.style.display = "grid";
    }
    if(listWrap) {
      listWrap.style.display = "block";
      listWrap.style.visibility = "visible";
      listWrap.style.opacity = "1";
    }
  }

  // Topbar search - HeroCard search'ten bağımsız
  $("#q")?.addEventListener("input", () => {
    // HeroCard search ile senkronize etme - ayrı çalışsın
    updateSearchState();
    // Mobilde arama yapıldığında body'ye class ekle
    const isMobile = window.innerWidth <= 639;
    if(isMobile && $("#q").value) {
      document.body.classList.add("has-search-results");
      document.body.classList.remove("has-hero-search");
    } else if(!$("#q").value && !(document.getElementById("qHero")?.value)) {
      document.body.classList.remove("has-search-results", "has-hero-search");
    } else if(!$("#q").value) {
      document.body.classList.remove("has-search-results");
    }
    renderList();
  });

  $("#clear")?.addEventListener("click", () => {
    // Mobil search overlay açıkken sayfadaki listeleri güncelleme
    if (window.__mobileSearchOverlayOpen) {
      console.log("🚫 Clear button event skipped - mobile search overlay is open");
      return;
    }
    
    $("#q").value = "";
    // Arama temizlendiğinde class'ları kaldır
    document.body.classList.remove("has-search-results", "has-hero-search");
    homeSample = pickRandom(SONGS, HOME_SAMPLE_SIZE);
    renderDiscover();
    renderList();
    updateSearchState();
    $("#q").focus();
  });

  // HeroCard search kaldırıldı - artık welcome text var
  
  // HeroCard search için ayrı render fonksiyonu
  // HeroCard search kaldırıldı - artık welcome text var
  function renderHeroSearch() {
    // Boş fonksiyon - artık kullanılmıyor
  }

  // Responsive search - sadece tablet ve desktop için (mobil common.js'de handle ediliyor)
  function initResponsiveSearch() {
    // Sadece topbar search'ü dahil et (heroCard search her zaman tam input)
    const searchHeaders = document.querySelectorAll(".search--header");
    searchHeaders.forEach(searchEl => {
      const input = searchEl.querySelector(".search__input");
      const icon = searchEl.querySelector(".search__icon");
      if(!input || !icon) return;
      
      // Sadece tablet ve desktop için (mobil common.js'de handle ediliyor)
      if(window.innerWidth <= 639) {
        // Mobilde common.js'deki overlay kullanılacak, burada bir şey yapma
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

  $("#shuffleDiscover")?.addEventListener("click", () => renderDiscover());
  $("#refreshRecs")?.addEventListener("click", () => refreshHomeSample());

  // topbardaki "Rastgele"
  

  // sağdaki küçük rastgele kutusu
  

  // scrollTop butonu artık "Hemû" linki olarak all.html'e gidiyor, event listener'a gerek yok

  initAddSongPanel?.(async () => {
    SONGS = await loadSongs();
    renderStats();
    homeSample = pickRandom(SONGS, HOME_SAMPLE_SIZE);
    renderDiscover();
    renderList();
  });

  // Zêdeke butonu - kesin çalışacak şekilde event listener ekle
  const setupZedekeButton = () => {
    const btn = document.getElementById("addSongMenuBtn");
    if(!btn) {
      setTimeout(setupZedekeButton, 100);
      return;
    }
    
    // Tüm mevcut event listener'ları temizlemek için butonu clone et
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Kesin çalışacak event listener
    newBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Giriş kontrolü
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
          window.location.href = window.appendLangParam
            ? window.appendLangParam("/index.html#add-song")
            : "/index.html#add-song";
        }
      }
    };
    
    // Ayrıca addEventListener da ekle (çifte güvence)
    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const user = window.fbAuth?.currentUser;
      
      if(!user){
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
      
      if(typeof window.openAddSongPanel === "function"){
        window.openAddSongPanel();
      } else {
        const panel = document.getElementById("addSongPanel");
        if(panel){
          panel.classList.remove("is-hidden");
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.href = window.appendLangParam
            ? window.appendLangParam("/index.html#add-song")
            : "/index.html#add-song";
        }
      }
    }, true); // capture phase'de de dinle
  };
  
  // DOM hazır olduğunda ve initAddSongPanel tamamlandıktan sonra çalıştır
  setTimeout(() => {
    setupZedekeButton();
    // Çifte güvence için tekrar dene
    setTimeout(setupZedekeButton, 500);
    setTimeout(setupZedekeButton, 1000);
  }, 1000);

  initContactForm();
}

// Export functions for mobile search overlay
window.artistText = artistText;
window.makeId = makeId;
window.openLink = openLink;

log("=== APP.JS LOADED ===");
log("Calling init()...");

if(typeof window.loadArtistPhotos === "function"){
  window.loadArtistPhotos();
}

init().catch(err => {
  error("=== INIT ERROR ===", err);
  const list = $("#list");
  const listWrap = document.querySelector(".homeListWrap");
  if(list) {
    const fallback = err.message || t("status_save_failed", "Nehat tomarkirin.");
    list.innerHTML = `<div class="empty">${t("status_error_prefix", "Çewtî")}: ${fallback}</div>`;
    list.style.display = "grid";
    list.style.visibility = "visible";
    list.style.opacity = "1";
  }
  if(listWrap) {
    listWrap.style.display = "block";
    listWrap.style.visibility = "visible";
    listWrap.style.opacity = "1";
  }
});

// LIVE_BG_START
(function initLiveBackground(){
  // prevent duplicates (across pages)
  if (document.getElementById("bgNotes")) return;

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

  const notes = ["♪","♫","𝄞","♩","♬","♭","♯"];
  const count = Math.min(18, Math.max(12, Math.floor(window.innerWidth / 90)));

  for (let i = 0; i < count; i++){
    const n = document.createElement("div");
    n.className = "bgNote";
    n.textContent = notes[Math.floor(Math.random()*notes.length)];

    const x = Math.random()*100;              // vw
    const drift = (Math.random()*10 - 5);     // vw
    const dur = 10 + Math.random()*10;        // s
    const delay = -Math.random()*dur;         // start at random phase
    const r = (Math.random()*50 - 25);        // deg
    const size = 14 + Math.random()*16;       // px

    n.style.setProperty("--x", `${x}vw`);
    n.style.setProperty("--drift", `${drift}vw`);
    n.style.setProperty("--dur", `${dur}s`);
    n.style.setProperty("--r", `${r}deg`);
    n.style.animationDelay = `${delay}s`;
    n.style.fontSize = `${size}px`;

    wrap.appendChild(n);
  }
})();
// LIVE_BG_END
})();
