// app.js — serrûpel
let SONGS = [];
let homeSample = [];
let lastQuery = "";
let userFavorites = [];

function makeId(s){
  if(typeof songId === "function") return songId(s);
  return `${s.pdf}|${s.page_original}`;
}
function openLink(s){ return `song.html?id=${encodeURIComponent(makeId(s))}`; }

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
    const href = `artist.html?name=${encodeURIComponent(name)}`;
    return `<a class="artistLink" href="${href}">${escapeHtml(name)}</a>`;
  }).join(" · ");
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
  console.log("renderList() called");
  const listEl = $("#list");
  const countEl = $("#count");
  const titleEl = $("#resultsTitle");
  const listWrap = document.querySelector(".homeListWrap");
  
  console.log("listEl in renderList:", listEl);
  
  if(!listEl) {
    console.error("List element not found in renderList!");
    return;
  }

  const q = norm($("#q")?.value || "");
  let items = [];
  const intro = document.querySelector(".homeIntro");

  if(titleEl){
    titleEl.textContent = q ? "Encamên lêgerînê" : "Yên Berçav";
  }
  if(listWrap){
    listWrap.classList.toggle("is-searching", !!q);
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
    console.log("No search query, using homeSample");
    console.log("homeSample:", homeSample);
    console.log("SONGS length:", SONGS.length);
    
    if(homeSample && homeSample.length > 0){
      items = homeSample;
      console.log("Using existing homeSample, items count:", items.length);
    } else if(SONGS && SONGS.length > 0){
      // homeSample boşsa ama SONGS varsa, yeni sample oluştur
      console.log("homeSample is empty, creating new sample from SONGS");
      homeSample = pickRandom(SONGS, 7);
      items = homeSample;
      console.log("New homeSample created, items count:", items.length);
    } else {
      console.warn("Both homeSample and SONGS are empty!");
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
      listEl.innerHTML = `<div class="empty">Stran tên barkirinê...</div>`;
    } else {
      listEl.innerHTML = `<div class="empty">Tınne</div>`;
    }
    return;
  }

  console.log("Rendering list with", items.length, "items");
  const sId = window.songId || ((s) => s._id || "");
  const html = items.map(s => {
    const pendingBadge = s.pending ? `<span class="badge badge--pending">Li benda pejirandina edîtorê ye</span>` : "";
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
        <button class="favoriteBtn ${isFav ? 'is-favorite' : ''}" type="button" aria-label="Favorile" data-song-id="${escapeHtml(songId)}">
          <svg class="favoriteIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <a class="open" href="${openLink(s)}">Veke</a>
      </div>
    </div>
  `;
  }).join("");
  
  listEl.innerHTML = html;
  console.log("List rendered, HTML length:", html.length);
  console.log("List element after render:", listEl);
  console.log("List innerHTML length:", listEl.innerHTML.length);
  
  // Favorileme butonlarına event listener ekle
  const favoriteBtns = listEl.querySelectorAll(".favoriteBtn");
  favoriteBtns.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const songId = btn.getAttribute("data-song-id");
      if(!songId) return;
      
      // Stranê bibîne
      const song = items.find(s => {
        const sId = window.songId?.(s) || "";
        return sId === songId;
      });
      if(!song) return;
      
      const wasFavorite = btn.classList.contains("is-favorite");
      const result = await window.toggleFavoriteSong?.(song);
      
      if(result === true){
        // Favorilere eklendi
        btn.classList.add("is-favorite");
        userFavorites.push(songId);
      } else if(result === false){
        // Favoriden çıkarıldı
        btn.classList.remove("is-favorite");
        userFavorites = userFavorites.filter(id => id !== songId);
      }
      // result === null ise hata, değişiklik yapma
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
    console.log("listWrap styles applied");
  }
  if(listEl){
    listEl.style.display = "grid";
    listEl.style.visibility = "visible";
    listEl.style.opacity = "1";
    listEl.style.height = "auto";
    listEl.style.overflow = "visible";
    console.log("listEl styles applied");
  }
  
  // Son kontrol
  setTimeout(() => {
    const finalCheck = $("#list");
    if(finalCheck && finalCheck.innerHTML.trim().length > 0){
      console.log("✓ List is rendered and visible");
    } else {
      console.error("✗ List is still empty after render!");
    }
  }, 50);
}

function updateSearchState(){
  const input = $("#q");
  if(!input) return;
  const wrap = input.closest(".search");
  if(!wrap) return;
  wrap.classList.toggle("has-value", !!input.value);
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
      setStatus("Danegeh amade nîne.", true);
      return;
    }

    if(submitBtn) submitBtn.disabled = true;
    setStatus("Tê şandin...");

    const name = (nameEl?.value || "").trim();
    const contact = (infoEl?.value || "").trim();
    const message = (msgEl?.value || "").trim();
    const files = Array.from(filesEl?.files || []);

    if(!message && !files.length){
      setStatus("Ji kerema xwe peyam binivîse an jî pel zêde bike.", true);
      if(submitBtn) submitBtn.disabled = false;
      return;
    }

    const maxSize = 12 * 1024 * 1024;
    for(const file of files){
      if(file.size > maxSize){
        setStatus(`"${file.name}" pir mezin e. (Max 12MB)`, true);
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
          setStatus("Barkirina pelê çalak nîne.", true);
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
      setStatus("Hate şandin. Spas, em ê di demek nêzîk de vegerin.");
    }catch(err){
      setStatus(err?.message || "Peyam nehat şandin.", true);
    }finally{
      if(submitBtn) submitBtn.disabled = false;
    }
  });
}

async function init(){
  console.log("=== INIT STARTED ===");
  try {
    console.log("Loading songs...");
    SONGS = await loadSongs();
    console.log("SONGS loaded:", SONGS.length);
    if(SONGS.length > 0) {
      console.log("First 3 songs:", SONGS.slice(0, 3));
    } else {
      console.warn("SONGS array is empty!");
    }

    if(!SONGS || SONGS.length === 0){
      console.error("SONGS is empty!");
      const listEl = $("#list");
      const listWrap = document.querySelector(".homeListWrap");
      if(listEl) {
        listEl.innerHTML = `<div class="empty">Stran tên barkirinê...</div>`;
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

    // her têketinê de 7 stranên cuda
    if(SONGS && SONGS.length > 0) {
      homeSample = pickRandom(SONGS, 7);
    } else {
      homeSample = [];
      console.warn("SONGS is empty, homeSample will be empty");
    }
    console.log("homeSample created:", homeSample.length);
    if(homeSample.length > 0) {
      console.log("homeSample items:", homeSample);
    }
    
    renderDiscover();
    
    // Liste render etmeden önce görünürlüğü zorla
    const listEl = $("#list");
    const listWrap = document.querySelector(".homeListWrap");
    console.log("listEl:", listEl);
    console.log("listWrap:", listWrap);
    
    if(!listEl) {
      console.error("List element not found!");
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
          console.log("User favorites loaded:", userFavorites.length);
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
      
      // Auth state değişikliklerini dinle
      auth.onAuthStateChanged(async (user) => {
        await loadFavorites(user);
      });
    } else {
      console.log("Calling renderList()...");
      renderList();
      console.log("renderList() completed");
    }
    
    // Son kontrol - eğer liste hala boşsa zorla render et
    setTimeout(() => {
      const finalListEl = $("#list");
      if(finalListEl && finalListEl.innerHTML.trim().length === 0 && homeSample.length > 0) {
        console.warn("List is still empty after renderList! Forcing render...");
        finalListEl.innerHTML = homeSample.map(s => {
          const title = s.song || "Stran";
          const artist = artistText(s.artist) || "Hunermend";
          return `
            <div class="item">
              <div class="item__left">
                <div class="item__title">${escapeHtml(title)}</div>
                <div class="item__sub">${escapeHtml(artist)}</div>
              </div>
              <div class="badges">
                <a class="open" href="${openLink(s)}">Veke</a>
              </div>
            </div>
          `;
        }).join("");
        finalListEl.style.display = "grid";
        finalListEl.style.visibility = "visible";
        finalListEl.style.opacity = "1";
        console.log("Forced render completed");
      }
    }, 500);
    
    updateSearchState();
    
    // Son kontrol - eğer hala boşsa zorla render et
    setTimeout(() => {
      const checkListEl = $("#list");
      const checkWrap = document.querySelector(".homeListWrap");
      if(checkListEl && checkListEl.innerHTML.trim().length === 0){
        console.error("List is still empty after renderList! Forcing render...");
        if(homeSample && homeSample.length > 0){
          checkListEl.innerHTML = homeSample.map(s => `
            <div class="item">
              <div class="item__left">
                <div class="item__title">${escapeHtml(s.song || "Test")}</div>
                <div class="item__sub">${escapeHtml(artistText(s.artist) || "Test Artist")}</div>
              </div>
              <div class="badges">
                <a class="open" href="${openLink(s)}">Veke</a>
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
    console.error("Init error:", err);
    const listEl = $("#list");
    const listWrap = document.querySelector(".homeListWrap");
    if(listEl) {
      listEl.innerHTML = `<div class="empty">Çewtî: ${err.message}</div>`;
      listEl.style.display = "grid";
    }
    if(listWrap) {
      listWrap.style.display = "block";
      listWrap.style.visibility = "visible";
      listWrap.style.opacity = "1";
    }
  }

  $("#q")?.addEventListener("input", () => {
    updateSearchState();
    renderList();
  });

  $("#clear")?.addEventListener("click", () => {
    $("#q").value = "";
    homeSample = pickRandom(SONGS, 10);
    renderDiscover();
    renderList();
    updateSearchState();
    $("#q").focus();
  });

  $("#shuffleDiscover")?.addEventListener("click", () => renderDiscover());

  // topbardaki "Rastgele"
  

  // sağdaki küçük rastgele kutusu
  

  $("#scrollTop")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  initAddSongPanel?.(async () => {
    SONGS = await loadSongs();
    renderStats();
    homeSample = pickRandom(SONGS, 7);
    renderDiscover();
    renderList();
  });

  initContactForm();
}

console.log("=== APP.JS LOADED ===");
console.log("Calling init()...");

init().catch(err => {
  console.error("=== INIT ERROR ===", err);
  const list = $("#list");
  const listWrap = document.querySelector(".homeListWrap");
  if(list) {
    list.innerHTML = `<div class="empty">Çewtî: ${err.message || "Nexşe nehat barkirin"}</div>`;
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
