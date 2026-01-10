// artist.js — hunermend rûpel
(function(){
let SONGS = [];
let ARTIST = "";
let BASE = [];
const t = (key, fallback, vars) => window.t ? window.t(key, vars) : fallback;

function makeId(s){
  if(typeof songId === "function") return songId(s);
  return s?.id || "";
}
function openLink(s){ return `/song.html?id=${encodeURIComponent(makeId(s))}`; }

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
    const href = `/artist.html?name=${encodeURIComponent(name)}`;
    return `<a class="artistLink" href="${href}">${escapeHtml(name)}</a>`;
  }).join(" · ");
}

function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
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

function updateSearchState(){
  const input = $("#q");
  if(!input) return;
  const wrap = input.closest(".search");
  if(!wrap) return;
  wrap.classList.toggle("has-value", !!input.value);
}

function getArtistParam(){
  const p = new URLSearchParams(location.search);
  return p.get("name") || "";
}

function sameArtist(song){
  const wanted = norm(ARTIST);
  return artistArr(song.artist).some(a => norm(a) === wanted);
}

function normalSort(a, b){
  const sa = String(a.song || "");
  const sb = String(b.song || "");
  if(sa !== sb) return sa.localeCompare(sb, "ku");
  const aa = artistArr(a.artist)[0] || "";
  const bb = artistArr(b.artist)[0] || "";
  return aa.localeCompare(bb, "ku");
}

function render(){
  // Mobil search overlay açıkken sayfadaki listeleri güncelleme
  if (window.__mobileSearchOverlayOpen) {
    console.log("🚫 artist.js render() skipped - mobile search overlay is open");
    return;
  }
  
  const q = norm($("#q")?.value || "");
  const list = $("#list");
  const countEl = $("#count");
  const titleEl = $("#artistName");

  if(titleEl){
    const displayName = window.formatArtistName ? window.formatArtistName(ARTIST) : ARTIST;
    titleEl.textContent = displayName || t("label_artist", "Hunermend");
  }

  let items = BASE;
  if(q){
    items = items.filter(s => norm(`${s.song} ${artistText(s.artist)}`).includes(q));
  }

  items = [...items].sort(normalSort);

  if(countEl) countEl.textContent = items.length.toString();

  if(!items.length){
    list.innerHTML = `<div class="empty">${t("status_no_results", "Tınne")}</div>`;
    return;
  }

  list.innerHTML = items.map(s => {
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

async function renderArtistPhoto(){
  const wrap = document.getElementById("artistAvatar");
  const img = document.getElementById("artistAvatarImg");
  if(!wrap || !img) return;
  if(typeof window.getArtistPhoto !== "function") return;
  const photo = await window.getArtistPhoto(ARTIST);
  if(photo){
    const displayName = window.formatArtistName ? window.formatArtistName(ARTIST) : ARTIST;
    img.src = photo;
    img.alt = displayName || "Artist";
    wrap.classList.remove("is-hidden");
  } else {
    wrap.classList.add("is-hidden");
  }
}

function initBackButton(){
  const btn = document.getElementById("artistBackBtn");
  if(!btn) return;
  const fallback = "/all.html";
  let target = "";
  const ref = document.referrer;
  if(ref){
    try{
      const url = new URL(ref);
      if(url.origin === location.origin && url.href !== location.href){
        target = url.href;
      }
    }catch(_e){}
  }
  btn.addEventListener("click", () => {
    if(target){
      location.href = target;
      return;
    }
    location.href = fallback;
  });
}

async function init(){
  ARTIST = getArtistParam();
  SONGS = await loadSongs();

  BASE = ARTIST ? SONGS.filter(sameArtist) : SONGS;
  render();
  renderArtistPhoto();
  updateSearchState();
  initBackButton();

  const favBtn = $("#artistFavBtn");
  const favStatus = $("#artistFavStatus");
  const auth = window.fbAuth;
  const db = window.fbDb;
  const key = artistKey(ARTIST);
  let favActive = false;
  let favRef = null;

  const setFavStatus = (msg, isError = false) => {
    if(!favStatus) return;
    favStatus.textContent = msg || "";
    favStatus.style.color = isError ? "#ef4444" : "";
  };
  const updateFavBtn = () => {
    if(!favBtn) return;
    favBtn.classList.toggle("is-favorite", favActive);
  };
  updateFavBtn();

  const toggleFavorite = async () => {
    const user = auth?.currentUser;
    if(!user || !db){
      window.requireAuthAction?.(() => {
        toggleFavorite();
      }, t("status_requires_login_artist_favorite", "Ji bo favorîkirina hunermendê divê tu têkevî."));
      return;
    }
    if(!favRef){
      favRef = db.collection("artist_favorites").doc(`${user.uid}_${key}`);
    }
    try{
      if(favActive){
        await favRef.delete();
        favActive = false;
        updateFavBtn();
        setFavStatus(t("status_artist_unfavorited", "Sanatçı favorilerden çıkarıldı."));
      }else{
        const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
        await favRef.set({
          uid: user.uid,
          artist: ARTIST,
          artistKey: key,
          createdAt: stamp
        });
        favActive = true;
        updateFavBtn();
        setFavStatus(t("status_artist_favorited", "Sanatçı favorilere eklendi."));
      }
    }catch(err){
      setFavStatus(err?.message || t("status_artist_favorite_failed", "Sanatçı favorilenemedi."), true);
    }
  };

  if(favBtn){
    favBtn.addEventListener("click", toggleFavorite);
  }

  auth?.onAuthStateChanged?.((user) => {
    if(!user || !db || !key){
      favActive = false;
      favRef = null;
      updateFavBtn();
      setFavStatus("");
      return;
    }
    favRef = db.collection("artist_favorites").doc(`${user.uid}_${key}`);
    favRef.get().then(snap => {
      favActive = !!snap?.exists;
      updateFavBtn();
      setFavStatus("");
    }).catch(() => {
      favActive = false;
      updateFavBtn();
    });
  });

  $("#q")?.addEventListener("input", () => {
    // Mobil search overlay açıkken sayfadaki listeleri güncelleme
    if (window.__mobileSearchOverlayOpen) {
      console.log("🚫 artist.js search input event skipped - mobile search overlay is open");
      return;
    }
    
    updateSearchState();
    render();
  });
  $("#clear")?.addEventListener("click", () => {
    // Mobil search overlay açıkken sayfadaki listeleri güncelleme
    if (window.__mobileSearchOverlayOpen) {
      console.log("🚫 artist.js clear button event skipped - mobile search overlay is open");
      return;
    }
    
    $("#q").value = "";
    $("#q").focus();
    updateSearchState();
    render();
  });

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
}

init().catch(err => {
  console.error(err);
  const list = $("#list");
  if(list) list.innerHTML = `<div class="empty">${t("status_artist_load_failed", "Stran nehatin barkirin.")}</div>`;
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
