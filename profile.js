// profile.js — kullanıcı profili
(function(){
const t = (key, fallback, vars) => window.t ? window.t(key, vars) : fallback;

function artistArr(a){
  if(Array.isArray(a)) return a.filter(Boolean).map(String);
  if(a == null) return [];
  return [String(a)].filter(Boolean);
}
function artistText(a){
  const fmt = window.formatArtistName;
  return artistArr(a).map(name => fmt ? fmt(name) : name).join(" ");
}
function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function openSong(id){
  return `/song.html?id=${encodeURIComponent(id)}`;
}

function toMs(ts){
  if(!ts) return 0;
  if(typeof ts.toMillis === "function") return ts.toMillis();
  if(typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

function statusBadge(status){
  const s = (status || "pending").toString();
  const cls = s === "approved" ? "badge badge--approved"
    : s === "rejected" ? "badge badge--rejected"
    : "badge badge--pending";
  const label = s === "approved" ? t("badge_approved", "Pejirandî")
    : s === "rejected" ? t("badge_rejected", "Redkirî")
    : t("badge_pending", "Li benda pejirandinê");
  return `<span class="${cls}">${label}</span>`;
}

function filterByStatus(items, status){
  if(status === "all") return items;
  return items.filter(item => (item?.status || "pending") === status);
}

async function loadFavorites(uid){
  const db = window.fbDb;
  if(!db || !uid) return [];
  const snap = await db.collection("favorites").where("uid","==", uid).get();
  const items = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  items.sort((a,b) => toMs(b.createdAt) - toMs(a.createdAt));
  return items;
}

async function loadArtistFavorites(uid){
  const db = window.fbDb;
  if(!db || !uid) return [];
  const snap = await db.collection("artist_favorites").where("uid","==", uid).get();
  const items = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  items.sort((a,b) => toMs(b.createdAt) - toMs(a.createdAt));
  return items;
}

async function loadSubmissions(uid){
  const db = window.fbDb;
  if(!db || !uid) return [];
  const snap = await db.collection("song_submissions").where("createdBy","==", uid).get();
  const items = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  items.sort((a,b) => toMs(b.createdAt) - toMs(a.createdAt));
  return items;
}

function renderFavorites(list, items){
  const count = $("#favCount");
  if(count) count.textContent = items.length.toString();
  if(!list) return;
  if(!items.length){
    list.innerHTML = `<div class="empty">${t("profile_no_favorites", "Hêj favorî tune.")}</div>`;
    return;
  }
  list.innerHTML = items.map(f => `
    <div class="item">
      <div class="item__left">
        <div class="item__title">${escapeHtml(window.formatSongTitle ? window.formatSongTitle(f.song) : (f.song || "—"))}</div>
        <div class="item__sub">${escapeHtml(artistText(f.artist) || "—")}</div>
      </div>
      <div class="badges">
        <a class="open" href="${openSong(f.songId || "")}">${t("action_open", "Veke")}</a>
      </div>
    </div>
  `).join("");
}

function renderArtistFavorites(list, items){
  const count = $("#favArtistCount");
  if(count) count.textContent = items.length.toString();
  if(!list) return;
  if(!items.length){
    list.innerHTML = `<div class="empty">${t("profile_no_artist_favorites", "Hêj hunermendê favorî tune.")}</div>`;
    return;
  }
  
  // artistKey fonksiyonunu tanımla (song.js'teki gibi)
  const artistKey = (name) => {
    return (name || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };
  
  list.innerHTML = items.map(a => {
    const artistName = a.artist || "";
    const artistKeyValue = artistKey(artistName);
    const artistLink = `/artist.html?name=${encodeURIComponent(artistName)}`;
    return `
    <div class="item" data-artist-key="${escapeHtml(artistKeyValue)}">
      <div class="item__left">
        <div class="item__title">${escapeHtml(window.formatArtistName ? window.formatArtistName(artistName) : artistName || "—")}</div>
      </div>
      <div class="badges">
        <button class="favoriteBtn is-favorite" type="button" aria-label="${t("action_remove_favorite", "Ji favoriyan derxe")}" data-artist-key="${escapeHtml(artistKeyValue)}" data-artist-name="${escapeHtml(artistName)}">
          <svg class="favoriteIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <a class="open" href="${artistLink}">${t("action_open", "Veke")}</a>
      </div>
    </div>
  `;
  }).join("");
  
  // Favori butonlarına event listener ekle
  const favoriteBtns = list.querySelectorAll(".favoriteBtn");
  favoriteBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const artistKeyValue = newBtn.getAttribute("data-artist-key");
      const artistName = newBtn.getAttribute("data-artist-name");
      if(!artistKeyValue || !artistName) return;
      
      const auth = window.fbAuth;
      const db = window.fbDb;
      const user = auth?.currentUser;
      
      if(!user || !db){
        window.requireAuthAction?.(() => {
          // Giriş yapıldıktan sonra tekrar dene
          newBtn.click();
        }, t("status_requires_login_artist_favorite", "Ji bo favorîkirina hunermendê divê tu têkevî."));
        return;
      }
      
      const favRef = db.collection("artist_favorites").doc(`${user.uid}_${artistKeyValue}`);
      
      try{
        const doc = await favRef.get();
        if(doc.exists){
          await favRef.delete();
          // UI'dan kaldır
          const item = newBtn.closest(".item");
          if(item) item.remove();
          // Sayacı güncelle
          const count = $("#favArtistCount");
          if(count) {
            const currentCount = parseInt(count.textContent) || 0;
            count.textContent = Math.max(0, currentCount - 1).toString();
          }
        }
      }catch(err){
        console.error("Favorî nehat derxistin:", err);
      }
    });
  });
}

function renderSubmissions(list, items, emptyLabel, onDelete){
  if(!list) return;
  if(!items.length){
    list.innerHTML = `<div class="empty">${emptyLabel}</div>`;
    return;
  }
  list.innerHTML = items.map(s => {
    const id = s.type === "new" ? `new:${s._id}` : (s.sourceId || "");
    // Sadece pending veya rejected olanları silebilir (approved olanlar silinemez)
    const canDelete = s.status === "pending" || s.status === "rejected";
    return `
      <div class="item" data-submission-id="${s._id}">
        <div class="item__left">
          <div class="item__title">${escapeHtml(window.formatSongTitle ? window.formatSongTitle(s.song) : (s.song || "—"))}</div>
          <div class="item__sub">${escapeHtml(artistText(s.artist) || "—")}</div>
        </div>
        <div class="badges">
          ${statusBadge(s.status)}
          <a class="open" href="${openSong(id)}">${t("action_open", "Veke")}</a>
          ${canDelete ? `<button class="btn btn--danger btn--small" data-action="delete" data-id="${s._id}" type="button">${t("action_delete", "Jê bibe")}</button>` : ""}
        </div>
      </div>
    `;
  }).join("");
  
  // Silme butonlarına event listener ekle
  const deleteButtons = list.querySelectorAll('button[data-action="delete"]');
  deleteButtons.forEach(btn => {
    // Eski event listener'ı kaldır (eğer varsa)
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const submissionId = newBtn.dataset.id;
      if(!submissionId) return;
      
      // items array'inden submission'ı bul
      const submission = items.find(s => s._id === submissionId);
      if(!submission) {
        console.warn("Şandî nehate dîtin:", submissionId);
        return;
      }
      
      const submissionType = submission.type === "new"
        ? t("profile_delete_type_song", "stran")
        : t("profile_delete_type_edit", "guhartin");
      const confirmMessage = t(
        "profile_confirm_delete",
        "Tu dixwazî vê {type} jê bibî? Ev kar bêpaş nabe.",
        { type: submissionType }
      );
      
      if(!confirm(confirmMessage)) return;
      
      const db = window.fbDb;
      const auth = window.fbAuth;
      const user = auth?.currentUser;
      
      if(!db) {
        alert(t("status_firestore_unready", "Firestore nehate barkirin."));
        return;
      }
      
      if(!user) {
        alert(t("status_requires_login_edit", "Divê tu têkevî."));
        return;
      }
      
      if(submission.createdBy !== user.uid) {
        alert(t("profile_not_authorized", "Yetkîn tune an jî ev naverok ji te re nîne."));
        return;
      }
      
      try {
        newBtn.disabled = true;
        newBtn.textContent = t("action_deleting", "Jêbirin…");
        
        console.log("🗑️ Submission siliniyor:", submissionId);
        await db.collection("song_submissions").doc(submissionId).delete();
        console.log("✅ Submission silindi:", submissionId);
        
        // Cache'i temizle
        window.clearSongsCache?.();
        
        // UI'dan kaldır
        const item = newBtn.closest(".item");
        if(item) {
          item.style.opacity = "0.5";
          item.style.transition = "opacity 0.3s";
          setTimeout(() => {
            item.remove();
            // Listeleri yeniden yükle
            if(typeof renderFiltered === "function") {
              renderFiltered();
            }
          }, 300);
        }
        
        // Sayacı güncelle
        const isNew = submission.type === "new";
        const countEl = isNew ? $("#newCount") : $("#editCount");
        if(countEl) {
          const currentCount = parseInt(countEl.textContent) || 0;
          countEl.textContent = Math.max(0, currentCount - 1).toString();
        }
        
        // Listeleri güncelle - closure'dan erişmek yerine yeniden yükle
        // currentNew ve currentEdit'e erişim için renderFiltered kullanılacak
        
      } catch(err) {
        console.error("❌ Şandî jêbirin çewtiyek:", err);
        console.error("❌ Hata detayları:", {
          code: err.code,
          message: err.message,
          stack: err.stack
        });
        
        let errorMessage = t("auth_error_generic", "Çewtiyek çêbû.");
        if(err.code === "permission-denied") {
          errorMessage = t("profile_delete_permission_denied", "Yetkîn tune. Tenê guhartinên te yên li benda pejirandinê an jî redkirî dikarî jê bibî.");
        } else if(err.code === "unavailable") {
          errorMessage = t("profile_firestore_unavailable", "Firestore nehate gihîştin. Ji kerema xwe dîsa biceribîne.");
        } else if(err.message) {
          errorMessage = `${t("auth_error_generic", "Çewtiyek çêbû.")}: ${err.message}`;
        }
        
        alert(errorMessage);
        newBtn.disabled = false;
        newBtn.textContent = t("action_delete", "Jê bibe");
      }
    });
  });
}

function updateProfileLink(photoUrl){
  const link = document.getElementById("profileLink");
  if(!link) return;
  link.innerHTML = "";
  if(photoUrl){
    const img = document.createElement("img");
    img.src = photoUrl;
    img.alt = "";
    img.className = "profileAvatar";
    link.appendChild(img);
  }else{
    const span = document.createElement("span");
    span.className = "profileAvatar profileAvatar--fallback";
    span.textContent = "👤";
    link.appendChild(span);
  }
}

function init(){
  const auth = window.fbAuth;
  const db = window.fbDb;
  const profileName = $("#profileName");
  const profileEmail = $("#profileEmail");
  const profileStatus = $("#profileStatus");
  const profileSubtitle = $("#profileSubtitle");
  const profileAvatar = $("#profileAvatar");
  const profileAvatarFallback = $("#profileAvatarFallback");
  const profilePhotoUrl = $("#profilePhotoUrl");
  const profilePhotoSave = $("#profilePhotoSave");
  const profilePhotoStatus = $("#profilePhotoStatus");
  const profileSignOut = $("#profileSignOut");

  const favList = $("#favList");
  const favArtistList = $("#favArtistList");
  const newList = $("#newList");
  const editList = $("#editList");
  const newFilter = $("#newFilter");
  const editFilter = $("#editFilter");
  const newCount = $("#newCount");
  const editCount = $("#editCount");

  if(!auth){
    // Firebase henüz yüklenmemiş, bekle
    let retryCount = 0;
    const maxRetries = 20;
    const waitForAuth = setInterval(() => {
      retryCount++;
      const checkAuth = window.fbAuth;
      if(checkAuth){
        clearInterval(waitForAuth);
        // Auth hazır, fonksiyonu tekrar çağır
        setTimeout(() => init(), 100);
      } else if(retryCount >= maxRetries){
        clearInterval(waitForAuth);
        if(profileStatus) profileStatus.textContent = t("profile_auth_unavailable", "Sîstema têketinê nehate dîtin.");
      }
    }, 500);
    return;
  }

  const setAvatar = (url) => {
    if(profileAvatar){
      profileAvatar.src = url || "";
      profileAvatar.style.display = url ? "block" : "none";
    }
    if(profileAvatarFallback){
      profileAvatarFallback.style.display = url ? "none" : "inline-flex";
    }
    updateProfileLink(url || "");
  };

  let currentNew = [];
  let currentEdit = [];
  const renderFiltered = () => {
    const nf = newFilter?.value || "all";
    const ef = editFilter?.value || "all";
    const filteredNew = filterByStatus(currentNew, nf);
    const filteredEdit = filterByStatus(currentEdit, ef);
    
    // Silme callback'i
    const onDelete = (submissionId, isNew) => {
      if(isNew) {
        currentNew = currentNew.filter(s => s._id !== submissionId);
      } else {
        currentEdit = currentEdit.filter(s => s._id !== submissionId);
      }
      renderFiltered();
    };
    
    renderSubmissions(newList, filteredNew, t("profile_no_submissions_new", "Hêj stran nehat zêdekirin."), onDelete);
    renderSubmissions(editList, filteredEdit, t("profile_no_submissions_edit", "Hêj guhartin tune."), onDelete);
  };

  newFilter?.addEventListener("change", renderFiltered);
  editFilter?.addEventListener("change", renderFiltered);

  if(profileSignOut){
    profileSignOut.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ok = window.confirm(t("confirm_sign_out", "Tu dixwazî derkevî?"));
      if(!ok) return;
      try{
        if(!auth){
          console.error("Auth not available");
          return;
        }
        await auth.signOut();
        window.location.href = "/index.html";
      }catch(err){
        console.error("Derketin çewtiyek:", err);
        if(profilePhotoStatus){
          profilePhotoStatus.textContent = err?.message || t("status_sign_out_failed", "Derketin bi ser neket.");
          profilePhotoStatus.style.color = "#ef4444";
        }
      }
    });
  }

  profilePhotoSave?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if(!user){
      if(profilePhotoStatus) profilePhotoStatus.textContent = t("status_requires_login_profile", "Divê tu têkevî.");
      return;
    }
    const url = (profilePhotoUrl?.value || "").trim();
    try{
      await user.updateProfile({ photoURL: url || "" });
      if(db){
        await db.collection("profiles").doc(user.uid).set({
          photoURL: url || ""
        }, { merge: true });
      }
      setAvatar(url || "");
      if(profilePhotoStatus){
        profilePhotoStatus.textContent = t("profile_photo_updated", "Wêne hate nûkirin.");
        profilePhotoStatus.style.color = "";
      }
    }catch(err){
      if(profilePhotoStatus){
        profilePhotoStatus.textContent = err?.message || t("profile_photo_update_failed", "Nehat nûkirin.");
        profilePhotoStatus.style.color = "#ef4444";
      }
    }
  });

  auth.onAuthStateChanged(async (user) => {
    if(!user){
      if(profileName) profileName.textContent = t("profile_name_requires_login", "Divê tu têkevî");
      if(profileEmail) profileEmail.textContent = "—";
      if(profileStatus) profileStatus.textContent = t("profile_status_logged_out", "Têketin tune");
      if(profileSubtitle) profileSubtitle.textContent = t("profile_subtitle_logged_out", "Ji bo profîlê têkeve.");
      if(profilePhotoUrl) profilePhotoUrl.value = "";
      setAvatar("");
      renderFavorites(favList, []);
      renderArtistFavorites(favArtistList, []);
      currentNew = [];
      currentEdit = [];
      renderFiltered();
      if(newCount) newCount.textContent = "0";
      if(editCount) editCount.textContent = "0";
      return;
    }

    if(profileName) profileName.textContent = user.displayName || t("profile_name_fallback", "Bikarhêner");
    if(profileEmail) profileEmail.textContent = user.email || "—";
    if(profileStatus) profileStatus.textContent = "";
    if(profileSubtitle) profileSubtitle.textContent = t("profile_subtitle_logged_in", "Hesabın ve içeriklerin");
    if(profilePhotoUrl) profilePhotoUrl.value = user.photoURL || "";
    setAvatar(user.photoURL || "");

    const [favItems, favArtistItems, subItems] = await Promise.all([
      loadFavorites(user.uid),
      loadArtistFavorites(user.uid),
      loadSubmissions(user.uid)
    ]);

    currentNew = subItems.filter(s => (s.type || "") === "new");
    currentEdit = subItems.filter(s => (s.type || "") !== "new");

    if(newCount) newCount.textContent = currentNew.length.toString();
    if(editCount) editCount.textContent = currentEdit.length.toString();
    renderFavorites(favList, favItems);
    renderArtistFavorites(favArtistList, favArtistItems);
    renderFiltered();
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

init();
})();
