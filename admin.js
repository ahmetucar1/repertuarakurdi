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
  if(!listEl) return;
  if(!items.length){
    listEl.innerHTML = `<div class="empty">Bekleyen gönderi yok.</div>`;
    return;
  }

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
  if(!listEl) return;
  if(!items.length){
    listEl.innerHTML = `<div class="empty">Henüz mesaj yok.</div>`;
    return;
  }

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
        <div class="item__left">
          <div class="item__title">${escapeHtml(name)}</div>
          <div class="item__sub">${escapeHtml(contact)}</div>
          <div class="muted" style="margin-top:6px; font-size:12px;">${escapeHtml(createdAt)}</div>
          <pre class="adminPreview contactPreview">${escapeHtml(message)}</pre>
          ${filesHtml}
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
  const statusEl = $("#adminStatus");
  const pendingCountEl = $("#pendingCount");

  const newListEl = $("#adminNewList");
  const editListEl = $("#adminEditList");
  const newCountEl = $("#pendingNewCount");
  const editCountEl = $("#pendingEditCount");
  const contactListEl = $("#adminContactList");
  const contactCountEl = $("#contactCount");

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

  if(!auth || !db){
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
    if(!user || !window.isAdminUser?.(user)) return;
    if(!ids.length) return;
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
    clearSongsCache?.();
  };

  auth.onAuthStateChanged((user) => {
    if(unsub){ unsub(); unsub = null; }
    if(contactUnsub){ contactUnsub(); contactUnsub = null; }
    if(!user){
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
    if(!window.isAdminUser?.(user)){
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

    if(statusEl) statusEl.textContent = "Şandiyên li bendê";
    unsub = db.collection("song_submissions")
      .where("status", "==", "pending")
      .onSnapshot((snap) => {
        const items = snap.docs.map(d => ({ _id: d.id, ...d.data() }))
          .sort((a,b) => toMs(b.createdAt) - toMs(a.createdAt));
        const newItems = items.filter(s => (s.type || "") === "new");
        const editItems = items.filter(s => (s.type || "") !== "new");

        currentNew = newItems;
        currentEdits = dedupeEdits(editItems);
        setCounts();
        renderList(newListEl, currentNew, "Yeni şarkı");
        renderList(editListEl, currentEdits, "Düzenleme");
      }, (err) => {
        console.error(err);
        if(statusEl) statusEl.textContent = "Lîste nehat barkirin.";
      });

    contactUnsub = db.collection("contact_messages")
      .orderBy("createdAt", "desc")
      .limit(50)
      .onSnapshot((snap) => {
        currentContacts = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
        setCounts();
        renderContactList(contactListEl, currentContacts);
      }, (err) => {
        console.error(err);
        if(contactListEl) contactListEl.innerHTML = `<div class="empty">Mesajlar yüklenemedi.</div>`;
      });
  });

  const handleListClick = async (ev) => {
    const btn = ev.target?.closest?.("button[data-action]");
    if(!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if(!action || !id) return;
    await updateStatusBulk([id], action);
  };

  newListEl?.addEventListener("click", handleListClick);
  editListEl?.addEventListener("click", handleListClick);

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
}

init();
