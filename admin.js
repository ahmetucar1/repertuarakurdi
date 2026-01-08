// admin.js — moderasyon paneli

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
function formatTime(ts){
  if(!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}
function toMs(ts){
  if(!ts) return 0;
  if(typeof ts.toMillis === "function") return ts.toMillis();
  if(typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

function dedupeEdits(items){
  const map = new Map();
  (items || []).forEach((item) => {
    const sourceId = (item?.sourceId || "").toString();
    const userId = (item?.createdBy || "").toString();
    if(!sourceId || !userId){
      const key = `${userId}|${sourceId}|${item?._id || ""}`;
      map.set(key, item);
      return;
    }
    const key = `${userId}|${sourceId}`;
    const prev = map.get(key);
    if(!prev || toMs(item.updatedAt || item.createdAt) >= toMs(prev.updatedAt || prev.createdAt)){
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}

function renderList(listEl, items, typeLabel){
  console.log(`🔍 renderList called: typeLabel=${typeLabel}, items.length=${items?.length || 0}, listEl=${!!listEl}`);
  if(!listEl) {
    console.warn("❌ renderList: listEl is null");
    return;
  }
  if(!items || !items.length){
    console.log(`📭 renderList: No items for ${typeLabel}`);
    listEl.innerHTML = `<div class="empty">Bekleyen gönderi yok.</div>`;
    return;
  }

  console.log(`✅ renderList: Rendering ${items.length} items for ${typeLabel}`);
  listEl.innerHTML = items.map(s => {
    const preview = (s.text || "").toString().split("\n").slice(0,4).join("\n");
    const title = window.formatSongTitle ? window.formatSongTitle(s.song) : (s.song || "—");
    return `
      <div class="item adminItem">
        <label class="adminSelectWrap">
          <input class="adminSelect" type="checkbox" data-id="${s._id}" />
        </label>
        <div class="item__left">
          <div class="item__title">${escapeHtml(title)}</div>
          <div class="item__sub">${escapeHtml(artistText(s.artist) || "—")} · ${typeLabel}</div>
          <div class="muted" style="margin-top:6px; font-size:12px;">${escapeHtml(s.createdByEmail || "—")} · ${escapeHtml(formatTime(s.createdAt))}</div>
          <pre class="adminPreview">${escapeHtml(preview)}</pre>
        </div>
        <div class="badges adminActions">
          <button class="btn btn--ok" data-action="approve" data-id="${s._id}">Pejirîne</button>
          <button class="btn btn--danger" data-action="reject" data-id="${s._id}">Reddet</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderContactList(listEl, items){
  console.log(`🔍 renderContactList called: items.length=${items?.length || 0}, listEl=${!!listEl}`);
  if(!listEl) {
    console.warn("❌ renderContactList: listEl is null");
    return;
  }
  if(!items || !items.length){
    console.log("📭 renderContactList: No items");
    listEl.innerHTML = `<div class="empty">Henüz mesaj yok.</div>`;
    return;
  }

  console.log(`✅ renderContactList: Rendering ${items.length} messages`);
  listEl.innerHTML = items.map((m) => {
    const name = m.name || "Adsız";
    const contact = m.contact || "—";
    const createdAt = formatTime(m.createdAt);
    const message = (m.message || "").toString();
    const files = Array.isArray(m.files) ? m.files : [];
    const filesHtml = files.length
      ? `<div class="contactFiles">${
          files.map((f) => {
            const label = escapeHtml(f?.name || "dosya");
            const url = f?.url ? escapeHtml(f.url) : "";
            return url
              ? `<a class="contactFile" href="${url}" target="_blank" rel="noreferrer">${label}</a>`
              : `<span class="contactFile contactFile--disabled">${label}</span>`;
          }).join("")
        }</div>`
      : "";

    return `
      <div class="item adminItem contactItem">
        <label class="adminSelectWrap">
          <input class="adminSelect contactSelect" type="checkbox" data-id="${m._id}" />
        </label>
        <div class="item__left">
          <div class="item__title">${escapeHtml(name)}</div>
          <div class="item__sub">${escapeHtml(contact)}</div>
          <div class="muted" style="margin-top:6px; font-size:12px;">${escapeHtml(createdAt)}</div>
          <pre class="adminPreview contactPreview">${escapeHtml(message)}</pre>
          ${filesHtml}
        </div>
        <div class="badges adminActions">
          <button class="btn btn--danger" data-action="delete" data-id="${m._id}">Jê bibe</button>
        </div>
      </div>
    `;
  }).join("");
}

function collectSelected(listEl){
  if(!listEl) return [];
  return Array.from(listEl.querySelectorAll(".adminSelect:checked"))
    .map((el) => el.dataset.id)
    .filter(Boolean);
}

function init(){
  console.log("🚀 Admin init() called");
  const statusEl = $("#adminStatus");
  const pendingCountEl = $("#pendingCount");

  const newListEl = $("#adminNewList");
  const editListEl = $("#adminEditList");
  const newCountEl = $("#pendingNewCount");
  const editCountEl = $("#pendingEditCount");
  const contactListEl = $("#adminContactList");
  const contactCountEl = $("#contactCount");

  console.log("🔍 Admin elements:", {
    statusEl: !!statusEl,
    newListEl: !!newListEl,
    editListEl: !!editListEl,
    contactListEl: !!contactListEl
  });

  const approveAllNew = $("#approveAllNew");
  const approveSelectedNew = $("#approveSelectedNew");
  const rejectSelectedNew = $("#rejectSelectedNew");
  const approveAllEdit = $("#approveAllEdit");
  const approveSelectedEdit = $("#approveSelectedEdit");
  const rejectSelectedEdit = $("#rejectSelectedEdit");
  const selectAllNew = $("#selectAllNew");
  const selectAllEdit = $("#selectAllEdit");

  const auth = window.fbAuth;
  const db = window.fbDb;

  console.log("🔍 Admin Firebase:", {
    auth: !!auth,
    db: !!db,
    isAdminUser: typeof window.isAdminUser
  });

  if(!auth || !db){
    console.error("❌ Admin: Firebase not ready");
    if(statusEl) statusEl.textContent = "Firebase hazır değil.";
    return;
  }

  let unsub = null;
  let contactUnsub = null;
  let currentNew = [];
  let currentEdits = [];
  let currentContacts = [];

  const setCounts = () => {
    if(pendingCountEl) pendingCountEl.textContent = (currentNew.length + currentEdits.length).toString();
    if(newCountEl) newCountEl.textContent = currentNew.length.toString();
    if(editCountEl) editCountEl.textContent = currentEdits.length.toString();
    if(contactCountEl) contactCountEl.textContent = currentContacts.length.toString();
  };

  const updateStatusBulk = async (ids, action) => {
    const user = auth.currentUser;
    if(!user || !window.isAdminUser?.(user)) {
      if(statusEl) statusEl.textContent = "Yetkin yok.";
      return;
    }
    if(!ids.length) {
      if(statusEl) statusEl.textContent = "Tiştek nehate hilbijartin.";
      return;
    }
    
    try {
      if(statusEl) statusEl.textContent = action === "approve" ? "Pejirandin…" : "Redkirin…";
      const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
      const batch = db.batch();
      ids.forEach((id) => {
        const ref = db.collection("song_submissions").doc(id);
        if(action === "approve"){
          batch.set(ref, {
            status: "approved",
            approvedAt: stamp,
            approvedBy: user.uid,
            approvedByEmail: user.email || ""
          }, { merge: true });
        }
        if(action === "reject"){
          batch.set(ref, {
            status: "rejected",
            rejectedAt: stamp,
            rejectedBy: user.uid,
            rejectedByEmail: user.email || ""
          }, { merge: true });
        }
      });
      await batch.commit();
      
      // Cache'i temizle ve sayfayı yenile
      window.clearSongsCache?.();
      
      // Başarı mesajı göster
      if(statusEl) statusEl.textContent = action === "approve" 
        ? `${ids.length} şandî pejirandî. Cache tê paqijkirin…` 
        : `${ids.length} şandî redkirî.`;
      
      // Onaylanan şarkılar için cache'i temizle ve kısa bir süre sonra sayfayı yenile
      if(action === "approve") {
        // Tüm sayfalarda cache'i temizle
        if(typeof window.loadSongs === "function") {
          setTimeout(async () => {
            try {
              await window.loadSongs();
              console.log("✅ Cache yenilendi");
            } catch(err) {
              console.error("❌ Cache yenileme hatası:", err);
            }
          }, 500);
        }
      }
      
      setTimeout(() => {
        if(statusEl) statusEl.textContent = "Şandiyên li bendê";
        // Listeleri yeniden yükle
        if(unsub) {
          // Listener'lar otomatik güncellenecek
        }
      }, 2000);
    } catch(err) {
      console.error("Admin işlemi başarısız:", err);
      if(statusEl) statusEl.textContent = `Çewtiyek çêbû: ${err?.message || "Nenas"}`;
      setTimeout(() => {
        if(statusEl) statusEl.textContent = "Şandiyên li bendê";
      }, 3000);
    }
  };

  const deleteContactMessages = async (ids) => {
    const user = auth.currentUser;
    if(!user || !window.isAdminUser?.(user)) {
      if(statusEl) statusEl.textContent = "Yetkin yok.";
      return;
    }
    if(!ids.length) {
      if(statusEl) statusEl.textContent = "Tiştek nehate hilbijartin.";
      return;
    }
    
    if(!confirm(`${ids.length} mesaj silinecek. Emin misiniz?`)) {
      return;
    }
    
    try {
      if(statusEl) statusEl.textContent = "Jêbirin…";
      const batch = db.batch();
      ids.forEach((id) => {
        const ref = db.collection("contact_messages").doc(id);
        batch.delete(ref);
      });
      await batch.commit();
      
      // Başarı mesajı göster
      if(statusEl) statusEl.textContent = `${ids.length} mesaj jêbirî.`;
      
      // Listeleri otomatik güncellenecek (listener'lar sayesinde)
      
      setTimeout(() => {
        if(statusEl) statusEl.textContent = "Şandiyên li bendê";
      }, 2000);
    } catch(err) {
      console.error("Mesaj silme başarısız:", err);
      if(statusEl) statusEl.textContent = `Çewtiyek çêbû: ${err?.message || "Nenas"}`;
      setTimeout(() => {
        if(statusEl) statusEl.textContent = "Şandiyên li bendê";
      }, 3000);
    }
  };

  console.log("🔍 Admin: Setting up auth state listener...");
  auth.onAuthStateChanged((user) => {
    console.log("🔍 Admin: Auth state changed, user:", user ? user.uid : "null");
    if(unsub){ unsub(); unsub = null; }
    if(contactUnsub){ contactUnsub(); contactUnsub = null; }
    if(!user){
      console.log("❌ Admin: No user");
      if(statusEl) statusEl.textContent = "Têketin pêwîst e.";
      currentNew = [];
      currentEdits = [];
      currentContacts = [];
      renderList(newListEl, [], "Strana nû");
      renderList(editListEl, [], "Guhartin");
      renderContactList(contactListEl, []);
      setCounts();
      return;
    }
    
    const isAdmin = window.isAdminUser?.(user);
    console.log("🔍 Admin: isAdminUser check:", {
      userEmail: user.email,
      isAdmin: isAdmin,
      adminEmails: window.ADMIN_EMAILS || []
    });
    
    if(!isAdmin){
      console.warn("❌ Admin: User is not admin");
      if(statusEl) statusEl.textContent = "Yetkin yok.";
      currentNew = [];
      currentEdits = [];
      currentContacts = [];
      renderList(newListEl, [], "Strana nû");
      renderList(editListEl, [], "Guhartin");
      renderContactList(contactListEl, []);
      setCounts();
      return;
    }
    
    console.log("✅ Admin: User is admin, setting up listeners...");

    if(statusEl) statusEl.textContent = "Şandiyên li bendê";
    
    // Önce get() ile tek seferlik veri çek (onSnapshot çalışmazsa yedek)
    const loadPendingSubmissions = async () => {
      try {
        console.log("🔍 Admin: Loading pending submissions with get()...");
        console.log("🔍 Admin: db object:", db);
        console.log("🔍 Admin: db.collection:", typeof db.collection);
        
        if (!db || typeof db.collection !== 'function') {
          throw new Error("Firestore db is not available");
        }
        
        const snap = await db.collection("song_submissions")
          .where("status", "==", "pending")
          .get();
        
        console.log("✅ Admin: get() returned, docs:", snap.docs.length);
        console.log("✅ Admin: snap.empty:", snap.empty);
        
        if (snap.empty) {
          console.log("📭 Admin: No pending submissions found");
          currentNew = [];
          currentEdits = [];
          setCounts();
          renderList(newListEl, [], "Yeni şarkı");
          renderList(editListEl, [], "Düzenleme");
          if(statusEl) statusEl.textContent = "Ti şandiyên li bendê tune.";
          return;
        }
        
        const items = snap.docs.map(d => {
          const data = d.data();
          console.log("📄 Admin: Doc:", d.id, "data:", { type: data.type, status: data.status, song: data.song });
          return { _id: d.id, ...data };
        }).sort((a,b) => toMs(b.createdAt) - toMs(a.createdAt));
        
        const newItems = items.filter(s => (s.type || "") === "new");
        const editItems = items.filter(s => (s.type || "") !== "new");

        console.log("📊 Admin: Total items:", items.length, "New items:", newItems.length, "Edit items:", editItems.length);

        currentNew = newItems;
        currentEdits = dedupeEdits(editItems);
        setCounts();
        renderList(newListEl, currentNew, "Yeni şarkı");
        renderList(editListEl, currentEdits, "Düzenleme");
        
        if(statusEl) statusEl.textContent = "Şandiyên li bendê";
      } catch(err) {
        console.error("❌ Admin: get() error:", err);
        console.error("❌ Admin: Error details:", {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        if(statusEl) statusEl.textContent = `Lîste nehat barkirin: ${err?.message || "Nenas"}`;
        currentNew = [];
        currentEdits = [];
        renderList(newListEl, [], "Yeni şarkı");
        renderList(editListEl, [], "Düzenleme");
        setCounts();
      }
    };

    // Önce get() ile yükle
    loadPendingSubmissions();

    // Sonra onSnapshot ile dinle (güncellemeler için)
    console.log("🔍 Admin: Setting up song_submissions listener...");
    try {
      unsub = db.collection("song_submissions")
        .where("status", "==", "pending")
        .onSnapshot((snap) => {
          console.log("✅ Admin: song_submissions snapshot received, docs:", snap.docs.length);
          try {
            const items = snap.docs.map(d => ({ _id: d.id, ...d.data() }))
              .sort((a,b) => toMs(b.createdAt) - toMs(a.createdAt));
            const newItems = items.filter(s => (s.type || "") === "new");
            const editItems = items.filter(s => (s.type || "") !== "new");

            console.log("📊 Admin: New items:", newItems.length, "Edit items:", editItems.length);

            currentNew = newItems;
            currentEdits = dedupeEdits(editItems);
            setCounts();
            renderList(newListEl, currentNew, "Yeni şarkı");
            renderList(editListEl, currentEdits, "Düzenleme");
            
            if(statusEl) statusEl.textContent = "Şandiyên li bendê";
          } catch(renderErr) {
            console.error("❌ Admin: Render error:", renderErr);
            if(statusEl) statusEl.textContent = `Render çewtiyek: ${renderErr?.message || "Nenas"}`;
          }
        }, (err) => {
          console.error("❌ Admin: song_submissions listener error:", err);
          // Listener hata verirse get() ile tekrar dene
          console.log("🔄 Admin: Retrying with get()...");
          loadPendingSubmissions();
        });
    } catch(setupErr) {
      console.error("❌ Admin: Failed to setup song_submissions listener:", setupErr);
      // Setup başarısız olursa get() ile yükle
      loadPendingSubmissions();
    }

    // Önce get() ile tek seferlik veri çek (onSnapshot çalışmazsa yedek)
    const loadContactMessages = async () => {
      try {
        console.log("🔍 Admin: Loading contact messages with get()...");
        const snap = await db.collection("contact_messages")
          .orderBy("createdAt", "desc")
          .limit(50)
          .get();
        
        console.log("✅ Admin: contact_messages get() returned, docs:", snap.docs.length);
        console.log("✅ Admin: snap.empty:", snap.empty);
        
        if (snap.empty) {
          console.log("📭 Admin: No contact messages found");
          currentContacts = [];
          setCounts();
          renderContactList(contactListEl, []);
          return;
        }
        
        currentContacts = snap.docs.map(d => {
          const data = d.data();
          console.log("📄 Admin: Contact message:", d.id, "name:", data.name);
          return { _id: d.id, ...data };
        });
        console.log("📊 Admin: Contact messages:", currentContacts.length);
        setCounts();
        renderContactList(contactListEl, currentContacts);
      } catch(err) {
        console.error("❌ Admin: contact_messages get() error:", err);
        console.error("❌ Admin: Error details:", {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        if(contactListEl) contactListEl.innerHTML = `<div class="empty">Mesajlar yüklenemedi: ${err?.message || "Nenas"}</div>`;
        currentContacts = [];
        setCounts();
      }
    };

    // Önce get() ile yükle
    loadContactMessages();

    // Sonra onSnapshot ile dinle (güncellemeler için)
    console.log("🔍 Admin: Setting up contact_messages listener...");
    try {
      contactUnsub = db.collection("contact_messages")
        .orderBy("createdAt", "desc")
        .limit(50)
        .onSnapshot((snap) => {
          console.log("✅ Admin: contact_messages snapshot received, docs:", snap.docs.length);
          try {
            currentContacts = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
            console.log("📊 Admin: Contact messages:", currentContacts.length);
            setCounts();
            renderContactList(contactListEl, currentContacts);
          } catch(renderErr) {
            console.error("❌ Admin: Contact render error:", renderErr);
            if(contactListEl) contactListEl.innerHTML = `<div class="empty">Render çewtiyek: ${renderErr?.message || "Nenas"}</div>`;
          }
        }, (err) => {
          console.error("❌ Admin: contact_messages listener error:", err);
          // Listener hata verirse get() ile tekrar dene
          console.log("🔄 Admin: Retrying contact messages with get()...");
          loadContactMessages();
        });
    } catch(setupErr) {
      console.error("❌ Admin: Failed to setup contact_messages listener:", setupErr);
      // Setup başarısız olursa get() ile yükle
      loadContactMessages();
    }
  });

  const handleListClick = async (ev) => {
    const btn = ev.target?.closest?.("button[data-action]");
    if(!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if(!action || !id) return;
    
    // Mesaj silme işlemi
    if(action === "delete" && btn.closest(".contactItem")) {
      await deleteContactMessages([id]);
      return;
    }
    
    // Diğer işlemler (approve/reject)
    await updateStatusBulk([id], action);
  };

  newListEl?.addEventListener("click", handleListClick);
  editListEl?.addEventListener("click", handleListClick);
  contactListEl?.addEventListener("click", handleListClick);

  const toggleAll = (listEl) => {
    if(!listEl) return;
    const boxes = Array.from(listEl.querySelectorAll(".adminSelect"));
    if(!boxes.length) return;
    const allChecked = boxes.every((b) => b.checked);
    boxes.forEach((b) => { b.checked = !allChecked; });
  };

  selectAllNew?.addEventListener("click", () => toggleAll(newListEl));
  selectAllEdit?.addEventListener("click", () => toggleAll(editListEl));

  approveAllNew?.addEventListener("click", () => updateStatusBulk(currentNew.map(s => s._id), "approve"));
  approveAllEdit?.addEventListener("click", () => updateStatusBulk(currentEdits.map(s => s._id), "approve"));

  approveSelectedNew?.addEventListener("click", () => updateStatusBulk(collectSelected(newListEl), "approve"));
  rejectSelectedNew?.addEventListener("click", () => updateStatusBulk(collectSelected(newListEl), "reject"));

  approveSelectedEdit?.addEventListener("click", () => updateStatusBulk(collectSelected(editListEl), "approve"));
  rejectSelectedEdit?.addEventListener("click", () => updateStatusBulk(collectSelected(editListEl), "reject"));
  
  // Mesajlar için butonlar
  const selectAllContact = $("#selectAllContact");
  const deleteAllContact = $("#deleteAllContact");
  const deleteSelectedContact = $("#deleteSelectedContact");
  
  selectAllContact?.addEventListener("click", () => toggleAll(contactListEl));
  deleteAllContact?.addEventListener("click", () => deleteContactMessages(currentContacts.map(m => m._id)));
  deleteSelectedContact?.addEventListener("click", () => deleteContactMessages(collectSelected(contactListEl)));
  
  // Responsive search - icon'a tıklayınca açılması
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

// Firebase ve DOM hazır olana kadar bekle
function waitForFirebase() {
  return new Promise((resolve) => {
    if (window.fbAuth && window.fbDb && document.readyState === 'complete') {
      console.log("✅ Admin: Firebase ready, initializing...");
      resolve();
      return;
    }
    
    let checkCount = 0;
    const maxChecks = 50; // 5 saniye
    
    const checkInterval = setInterval(() => {
      checkCount++;
      if (window.fbAuth && window.fbDb && document.readyState === 'complete') {
        console.log("✅ Admin: Firebase ready after", checkCount * 100, "ms, initializing...");
        clearInterval(checkInterval);
        resolve();
      } else if (checkCount >= maxChecks) {
        console.warn("⚠️ Admin: Firebase not ready after", maxChecks * 100, "ms, initializing anyway...");
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
}

// DOM ve Firebase hazır olunca başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    waitForFirebase().then(() => {
      console.log("🚀 Admin: Starting init()...");
      init();
    });
  });
} else {
  waitForFirebase().then(() => {
    console.log("🚀 Admin: Starting init()...");
    init();
  });
}
