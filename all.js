// all.js — rûpela hemû stranan
let SONGS = [];
let currentPage = 1;
window.__currentPage = 1; // Closure sorununu önlemek için
const itemsPerPage = 20;

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

function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function normalizeSort(value){
  const LOCALE = window.LOCALE || "ku";
  return (value || "").toString().toLocaleLowerCase(LOCALE);
}

function render(){
  // currentPage'i window'dan geri yükle (closure sorununu önlemek için)
  if(window.__currentPage !== undefined){
    currentPage = window.__currentPage;
  }
  console.log("render() called, currentPage:", currentPage);
  const norm = window.norm || ((s) => (s || "").toString().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const LOCALE = window.LOCALE || "ku";
  const qv = norm($("#q")?.value || "");
  const list = $("#list");
  const count = $("#count");
  const filterBy = $("#filterBy")?.value || "all";
  const sortBy = $("#sortBy")?.value || "title-asc";
  if(!list) return;
  
  if(!SONGS || SONGS.length === 0) {
    list.innerHTML = `<div class="empty">Stran tên barkirinê...</div>`;
    return;
  }

  let items = SONGS;
  if(qv){
    items = SONGS.filter(s => norm(`${s.song} ${artistText(s.artist)}`).includes(qv));
  }
  if(filterBy === "pending"){
    items = items.filter(s => s.pending);
  }

  const getTitleKey = (s) => normalizeSort(s?.song);
  const getArtistKey = (s) => normalizeSort(artistArr(s?.artist)[0] || "");

  if(sortBy === "title-asc"){
    items = [...items].sort((a,b) => getTitleKey(a).localeCompare(getTitleKey(b), LOCALE || "ku"));
  }else if(sortBy === "title-desc"){
    items = [...items].sort((a,b) => getTitleKey(b).localeCompare(getTitleKey(a), LOCALE || "ku"));
  }else if(sortBy === "artist-asc"){
    items = [...items].sort((a,b) => getArtistKey(a).localeCompare(getArtistKey(b), LOCALE || "ku"));
  }

  if(count) count.textContent = items.length.toString();

  if(!items.length){
    list.innerHTML = `<div class="empty">Tınne</div>`;
    // Pagination'ı temizle
    const pagination = document.getElementById("pagination");
    if(pagination) pagination.innerHTML = "";
    return;
  }

  // Sayfalandırma
  const totalPages = Math.ceil(items.length / itemsPerPage);
  // currentPage'i geçerli aralıkta tut
  if(currentPage > totalPages && totalPages > 0){
    currentPage = totalPages;
  }
  if(currentPage < 1){
    currentPage = 1;
  }
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  console.log("Pagination slice:", {
    totalItems: items.length,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    paginatedItemsCount: paginatedItems.length,
    firstItem: paginatedItems[0]?.song || "none"
  });

  // Favorileri yükle (eğer yüklenmemişse)
  let userFavorites = window.__allPageFavorites || [];
  const sId = window.songId || ((s) => s._id || "");
  
  list.innerHTML = paginatedItems.map(s => {
    const pendingBadge = s.pending ? `<span class="badge badge--pending">Li benda pejirandinê</span>` : "";
    const title = window.formatSongTitle ? window.formatSongTitle(s.song) : (s.song || "");
    const songId = sId(s);
    const isFav = window.isFavorite?.(songId, userFavorites) || false;
    return `
    <div class="item" data-song-id="${escapeHtml(songId)}">
      <div class="item__left">
        <div class="item__title">${escapeHtml(title)}</div>
        <div class="item__sub">${artistLinks(s.artist)} </div>
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
  
  // Favorileme butonlarına event listener ekle
  const favoriteBtns = list.querySelectorAll(".favoriteBtn");
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
        console.warn("No song ID found for favorite button");
        return;
      }
      
      // Stranê bibîne
      const song = paginatedItems.find(s => {
        const sId = window.songId?.(s) || "";
        return sId === songId;
      });
      if(!song) {
        console.warn("Song not found for ID:", songId);
        return;
      }
      
      console.log("Toggling favorite for song:", songId);
      const result = await window.toggleFavoriteSong?.(song);
      console.log("Toggle result:", result);
      
      if(result === true){
        // Favorilere eklendi - hemen UI'ı güncelle
        newBtn.classList.add("is-favorite");
        console.log("Added is-favorite class to button");
        
        // Favorileri yeniden yükle
        const auth = window.fbAuth;
        if(auth?.currentUser) {
          userFavorites = await window.loadUserFavorites?.(auth.currentUser.uid) || [];
          window.__allPageFavorites = userFavorites;
          console.log("Reloaded favorites:", userFavorites.length);
          
          // Tüm favori butonlarını güncelle
          const allFavBtns = list.querySelectorAll(".favoriteBtn");
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
        
        // Favorileri yeniden yükle
        const auth = window.fbAuth;
        if(auth?.currentUser) {
          userFavorites = await window.loadUserFavorites?.(auth.currentUser.uid) || [];
          window.__allPageFavorites = userFavorites;
          console.log("Reloaded favorites:", userFavorites.length);
          
          // Tüm favori butonlarını güncelle
          const allFavBtns = list.querySelectorAll(".favoriteBtn");
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
        console.warn("Toggle favorite returned null, user may need to login");
      }
    });
  });
  
  // Pagination render
  renderPagination(totalPages, currentPage);
}

function renderPagination(totalPages, currentPage){
  let pagination = document.getElementById("pagination");
  if(!pagination){
    pagination = document.createElement("div");
    pagination.id = "pagination";
    pagination.className = "pagination";
    const list = $("#list");
    if(list && list.parentNode){
      list.parentNode.insertBefore(pagination, list.nextSibling);
    }
  }
  
  if(totalPages <= 1){
    pagination.innerHTML = "";
    return;
  }
  
  let html = '<div class="pagination__inner">';
  
  // Önceki sayfa
  if(currentPage > 1){
    html += `<button class="pagination__btn" data-page="${currentPage - 1}" type="button">← Berê</button>`;
  } else {
    html += `<button class="pagination__btn pagination__btn--disabled" disabled type="button">← Berê</button>`;
  }
  
  // Sayfa numaraları
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if(endPage - startPage < maxVisible - 1){
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  if(startPage > 1){
    html += `<button class="pagination__btn" data-page="1" type="button">1</button>`;
    if(startPage > 2){
      html += `<span class="pagination__ellipsis">...</span>`;
    }
  }
  
  for(let i = startPage; i <= endPage; i++){
    if(i === currentPage){
      html += `<button class="pagination__btn pagination__btn--active" disabled type="button">${i}</button>`;
    } else {
      html += `<button class="pagination__btn" data-page="${i}" type="button">${i}</button>`;
    }
  }
  
  if(endPage < totalPages){
    if(endPage < totalPages - 1){
      html += `<span class="pagination__ellipsis">...</span>`;
    }
    html += `<button class="pagination__btn" data-page="${totalPages}" type="button">${totalPages}</button>`;
  }
  
  // Sonraki sayfa
  if(currentPage < totalPages){
    html += `<button class="pagination__btn" data-page="${currentPage + 1}" type="button">Pêş →</button>`;
  } else {
    html += `<button class="pagination__btn pagination__btn--disabled" disabled type="button">Pêş →</button>`;
  }
  
  html += '</div>';
  pagination.innerHTML = html;
  
  // Event listener'ları direkt butonlara ekle
  const buttons = pagination.querySelectorAll(".pagination__btn[data-page]");
  buttons.forEach(btn => {
    // Önceki listener'ı kaldır (eğer varsa)
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const page = parseInt(newBtn.getAttribute("data-page"));
      console.log("Pagination button clicked, page:", page, "currentPage before:", currentPage);
      
      if(page && !isNaN(page) && page !== currentPage && page > 0){
        console.log("Changing to page:", page, "currentPage before assignment:", currentPage);
        currentPage = page;
        window.__currentPage = page; // li window'ê jî tomar bike
        console.log("currentPage after assignment:", currentPage, "window.__currentPage:", window.__currentPage);
        render();
        console.log("After render(), currentPage:", currentPage);
        // Sayfanın üstüne kaydır
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        console.log("Page change rejected:", { page, currentPage, condition: page && !isNaN(page) && page !== currentPage && page > 0 });
      }
    });
  });
}

function handlePaginationClick(e){
  const btn = e.target.closest(".pagination__btn");
  if(!btn) return;
  
  // Disabled veya active butonlara tıklama engelle
  if(btn.disabled || btn.classList.contains("pagination__btn--active") || btn.classList.contains("pagination__btn--disabled")) {
    return;
  }
  
  const pageAttr = btn.getAttribute("data-page");
  if(!pageAttr) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const page = parseInt(pageAttr);
  console.log("Pagination clicked, page:", page, "currentPage:", currentPage, "btn:", btn);
  
  if(page && !isNaN(page) && page !== currentPage && page > 0){
    console.log("Changing to page:", page);
    currentPage = page;
    render();
    // Sayfanın üstüne kaydır
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  } else {
    console.log("Page change rejected:", { page, currentPage, isValid: page && !isNaN(page) && page > 0 });
  }
}

function updateSearchState(){
  const input = $("#q");
  if(!input) return;
  const wrap = input.closest(".search");
  if(!wrap) return;
  wrap.classList.toggle("has-value", !!input.value);
}

async function init(){
  try{
    SONGS = await loadSongs();
    
    if(!SONGS || SONGS.length === 0){
      const list = $("#list");
      if(list) list.innerHTML = `<div class="empty">Stran nehatin barkirin.</div>`;
      return;
    }
  }catch(err){
    console.error("loadSongs hatası:", err);
    return;
  }
  
  // Favorileri yükle
  const auth = window.fbAuth;
  if(auth){
    const loadFavorites = async (user) => {
      if(user){
        window.__allPageFavorites = await window.loadUserFavorites?.(user.uid) || [];
      } else {
        window.__allPageFavorites = [];
      }
      // currentPage'i koru
      if(window.__currentPage !== undefined){
        currentPage = window.__currentPage;
      }
      render();
    };
    
    // Mevcut kullanıcı için yükle
    const currentUser = auth.currentUser;
    if(currentUser){
      await loadFavorites(currentUser);
    } else {
      render();
    }
    
    // Auth state değişikliklerini dinle
    auth.onAuthStateChanged(async (user) => {
      await loadFavorites(user);
    });
  } else {
    render();
  }
  
  updateSearchState();

  $("#q")?.addEventListener("input", () => {
    currentPage = 1; // Dema ku lêgerîn hate kirin vegerîne rûpela yekem
    window.__currentPage = 1;
    updateSearchState();
    render();
  });
  $("#clear")?.addEventListener("click", () => {
    $("#q").value = "";
    currentPage = 1;
    window.__currentPage = 1;
    $("#q").focus();
    updateSearchState();
    render();
  });

  // Responsive search - icon'a tıklayınca açılması
  function initResponsiveSearch() {
    const searchHeaders = document.querySelectorAll(".search--header");
    searchHeaders.forEach(searchEl => {
      const input = searchEl.querySelector(".search__input");
      const icon = searchEl.querySelector(".search__icon");
      if(!input || !icon) return;
      
      // Küçük ekranlarda icon-only modunu aktif et
      function checkScreenSize() {
        if(window.innerWidth <= 768) {
          searchEl.classList.add("search--icon-only");
        } else {
          searchEl.classList.remove("search--icon-only", "search--open");
        }
      }
      
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      
      // Icon'a tıklayınca aç/kapat
      icon.addEventListener("click", (e) => {
        if(window.innerWidth <= 768) {
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
      
      // Input'tan çıkınca kapat (sadece küçük ekranlarda)
      input.addEventListener("blur", () => {
        if(window.innerWidth <= 768 && !input.value) {
          setTimeout(() => {
            if(document.activeElement !== input) {
              searchEl.classList.remove("search--open");
              document.body.classList.remove("search-open");
            }
          }, 200);
        }
      });
      
      // Sayfa kaydırılınca search input'u kapat
      let scrollTimeout;
      function handleScroll() {
        if(window.innerWidth <= 768 && searchEl.classList.contains("search--open")) {
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
  $("#filterBy")?.addEventListener("change", () => {
    currentPage = 1; // Filtre değiştiğinde ilk sayfaya dön
    window.__currentPage = 1;
    render();
  });
  $("#sortBy")?.addEventListener("change", () => {
    currentPage = 1; // Sıralama değiştiğinde ilk sayfaya dön
    window.__currentPage = 1;
    render();
  });
  
  // Vebijarkên parzûnê nû bike (ji bo bikarhênerê têketî "li benda pejirandinê" zêde bike)
  if(auth){
    const updateFilterOptions = () => {
      const filterBy = document.getElementById("filterBy");
      if (!filterBy) return;
      
      const user = auth.currentUser;
      const isAdmin = user && window.isAdminUser?.(user);
      const pendingOption = filterBy.querySelector('option[value="pending"]');
      
      if (user && isAdmin) {
        // Ji bo bikarhênerê admin vebijarka "li benda pejirandinê" zêde bike
        if (!pendingOption) {
          const newOption = document.createElement("option");
          newOption.value = "pending";
          newOption.textContent = "Li benda pejirandinê";
          filterBy.appendChild(newOption);
        }
      } else {
        // Ji bo bikarhênerê netêketî an ne-admin jê bibe
        if (pendingOption) {
          pendingOption.remove();
          // Ger "li benda pejirandinê" hat hilbijartin vegerîne "Hemû"
          if (filterBy.value === "pending") {
            filterBy.value = "all";
            filterBy.dispatchEvent(new Event("change"));
          }
        }
      }
    };
    
    // İlk yükleme
    updateFilterOptions();
    
    // Auth state değişikliklerini dinle
    auth.onAuthStateChanged(() => {
      updateFilterOptions();
      currentPage = 1;
      render();
    });
  }

  initAddSongPanel?.(async () => {
    SONGS = await loadSongs();
    render();
  });
  
  // Üstteki "Stran Zêde Bike" butonuna event listener ekle
  // DOMContentLoaded'da çalıştırılması için setTimeout kullan
  setTimeout(() => {
    const addSongBtnTop = document.getElementById("addSongMenuBtnTop");
    const addPanel = document.getElementById("addSongPanel");
    
    if(!addSongBtnTop){
      console.error("addSongMenuBtnTop button not found!");
      return;
    }
    
    // Mevcut event listener'ları temizle
    const newBtn = addSongBtnTop.cloneNode(true);
    addSongBtnTop.parentNode.replaceChild(newBtn, addSongBtnTop);
    
    newBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const user = window.fbAuth?.currentUser;
      
      if(!user){
        // Bikarhênerê netêketî - panelê têketinê veke
        // Piştî têketinê ji bo vekirina panelê callback'ê tomar bike
        window.__authContinue = () => {
          const panel = document.getElementById("addSongPanel");
          if(panel){
            panel.classList.remove("is-hidden");
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        };
        
        // requireAuthAction varsa kullan
        if(typeof window.requireAuthAction === "function"){
          window.requireAuthAction(() => {
            const panel = document.getElementById("addSongPanel");
            if(panel){
              panel.classList.remove("is-hidden");
              panel.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, "Ji bo stran zêde kirinê divê tu têkevî.");
          return;
        }
        
        // requireAuthAction yoksa direkt auth panelini aç
        const authPanel = document.getElementById("authPanel");
        let authOverlay = document.getElementById("authOverlay");
        
        if(!authOverlay){
          authOverlay = document.createElement("div");
          authOverlay.id = "authOverlay";
          authOverlay.className = "authOverlay";
          document.body.appendChild(authOverlay);
        }
        
        if(authPanel){
          authPanel.classList.add("is-open");
          authOverlay.classList.add("is-open");
          authPanel.setAttribute("aria-hidden", "false");
          document.body.classList.add("auth-open");
          
          const authStatus = document.getElementById("authStatus");
          if(authStatus){
            authStatus.textContent = "Ji bo stran zêde kirinê divê tu têkevî.";
            authStatus.style.color = "#ef4444";
          }
        } else {
          // Panel bulunamazsa authOpen butonunu tıkla
          const authOpen = document.getElementById("authOpen");
          if(authOpen) authOpen.click();
        }
      } else {
        // Bikarhênerê têketî - rasterast panelê "Stran zêde bike" veke
        const panel = document.getElementById("addSongPanel");
        if(panel){
          panel.classList.remove("is-hidden");
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, true); // capture phase'de çalıştır
  }, 100);
}

init().catch(err => {
  console.error("init() error in all.js:", err);
  const list = $("#list");
  if(list) list.innerHTML = `<div class="empty">Başlatma hatası: ${err.message}</div>`;
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
