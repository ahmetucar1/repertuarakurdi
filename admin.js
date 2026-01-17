// admin.js — moderasyon paneli
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
    listEl.innerHTML = `<div class="empty">${t("admin_no_pending", "Bekleyen gönderi yok.")}</div>`;
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
          <button class="btn btn--ok" data-action="approve" data-id="${s._id}">${t("action_approve", "Pejirîne")}</button>
          <button class="btn btn--danger" data-action="reject" data-id="${s._id}">${t("action_reject", "Red bike")}</button>
        </div>
      </div>
    `;
  }).join("");
}

function buildSubmissionDetail(data){
  const userEmail = data?.createdByEmail || data?.createdBy || "Anonim";
  const song = data?.song || "—";
  const artist = data?.artist || data?.artistName || "—";
  const snippet = `${song}${artist ? " (" + artist + ")" : ""}`;
  if((data?.type || "").toLowerCase() === "new"){
    return `${userEmail} yeni şarkı ekledi: ${snippet}`;
  }
  return `${userEmail} ${snippet} için düzenleme istedi.`;
}

function renderContactList(listEl, items){
  console.log(`🔍 renderContactList called: items.length=${items?.length || 0}, listEl=${!!listEl}`);
  if(!listEl) {
    console.warn("❌ renderContactList: listEl is null");
    return;
  }
  if(!items || !items.length){
    console.log("📭 renderContactList: No items");
    listEl.innerHTML = `<div class="empty">${t("admin_no_messages", "Henüz mesaj yok.")}</div>`;
    return;
  }

  console.log(`✅ renderContactList: Rendering ${items.length} messages`);
  listEl.innerHTML = items.map((m) => {
    const name = m.name || t("label_anonymous", "Adsız");
    const contact = m.contact || "—";
    const createdAt = formatTime(m.createdAt);
    const message = (m.message || "").toString();
    const files = Array.isArray(m.files) ? m.files : [];
    const filesHtml = files.length
      ? `<div class="contactFiles">${
          files.map((f) => {
            const label = escapeHtml(f?.name || t("label_file", "dosya"));
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
          <button class="btn btn--danger" data-action="delete" data-id="${m._id}">${t("action_delete", "Jê bibe")}</button>
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
    if(statusEl) statusEl.textContent = t("status_firebase_unready", "Firebase hazır değil.");
    return;
  }

  let unsub = null;
  let contactUnsub = null;
  let currentNew = [];
  let currentEdits = [];
  let currentContacts = [];
  let profilesUnsub = null;
  let notificationsUnsub = null;
  let notifSeeded = false;

  const setCounts = () => {
    if(pendingCountEl) pendingCountEl.textContent = (currentNew.length + currentEdits.length).toString();
    if(newCountEl) newCountEl.textContent = currentNew.length.toString();
    if(editCountEl) editCountEl.textContent = currentEdits.length.toString();
    if(contactCountEl) contactCountEl.textContent = currentContacts.length.toString();
  };

  notificationListEl?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if(!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;
    if(!id || !action) return;
    if(action === "approve" || action === "dismiss"){
      const db = window.fbDb;
      if(!db) return;
      db.collection("admin_notifications").doc(id).delete().catch(err => console.error("❌ Bildirim silinemedi", err));
    }
  });


  const updateStatusBulk = async (ids, action) => {
    const user = auth.currentUser;
    if(!user || !window.isAdminUser?.(user)) {
      if(statusEl) statusEl.textContent = t("admin_not_authorized", "Yetkin yok.");
      return;
    }
    if(!ids.length) {
      if(statusEl) statusEl.textContent = t("status_nothing_selected", "Tiştek nehate hilbijartin.");
      return;
    }
    
    try {
      if(statusEl) statusEl.textContent = action === "approve"
        ? t("admin_status_approving", "Pejirandin…")
        : t("admin_status_rejecting", "Redkirin…");
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
        ? t("admin_status_approved_count", "{count} şandî pejirandî. Cache tê paqijkirin…", { count: ids.length })
        : t("admin_status_rejected_count", "{count} şandî redkirî.", { count: ids.length });
      
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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const REAL_NOTIFICATION_TTL = ONE_DAY_MS * 60;
const notificationMeta = {
  edit: {
    title: "Düzenleme isteği",
    actions: ["view","approve"],
    messages: [
      "dicleyaman@gmail.com AWA SUSE şarkısında yeni bir düzenleme önerdi.",
      "hunerci79 gitar sözlerini güncelledi ve bir düzeltme istedi.",
      "stranalover34 sözleri tekrar yazdı, yeni düzenleme isteği gönderildi."
    ],
    fakeMessages: [
      "dicleyaman@gmail AWA SUSE şarkısını düzenledi.",
      "agirzaman@hotmail.com yeni riff ekledi, onay bekleniyor."
    ]
  },
  add: {
    title: "Yeni şarkı",
    actions: ["view","approve"],
    messages: [
      "Leyla Özgür güncel repertuara Taybetî adlı şarkıyı ekledi.",
      "Sinem Heci yeni şarkı önerisinde bulundu: Hevalên Şevê.",
      "Rehber Studio 'Va cîran' parçasını paylaştı."
    ],
    fakeMessages: [
      "gokhanbey@rise.com AWA SUSE kaydını ekledi.",
      "kevinhunermend59 yeni şarkı önerisi gönderdi."
    ]
  },
  signup: {
    title: "Yeni kullanıcı",
    actions: ["view"],
    messages: [
      "Zeynep Akay kayıt oldu. Profil onayı gerekli.",
      "Murat Kalkan topluluğa katıldı.",
      "Dîlan Demir yeni bir hesap açtı."
    ],
    fakeMessages: [
      "serifkurdi52 yeni kayıt oluşturdu.",
      "sevdaya@music.com sisteme kaydoldu."
    ]
  },
  favorite: {
    title: "Favorileme",
    actions: ["view"],
    messages: [
      "Hozan Şerif 'Denge Dile Min' şarkısını favoriledi.",
      "Gulistan M. 'Li Ber Deri' parçasına yıldız verdi."
    ],
    fakeMessages: [
      "rozhin_29 favorilere yeni bir şarkı ekledi.",
      "dilsuz_insan koleksiyona yeni bir favori ekledi."
    ]
  }
};

// 50 sahte bildirim üretimi için genişletilmiş havuz
const fakePool = [
  "dicleyaman@gmail AWA SUSE şarkısını düzenledi.",
  "hunerci79 gitar akorlarını güncelledi, onay bekliyor.",
  "gokhanbey@rise.com AWA SUSE kaydını ekledi.",
  "kevinhunermend59 yeni şarkı önerisi gönderdi.",
  "serifkurdi52 yeni kayıt oluşturdu.",
  "sevdaya@music.com sisteme kaydoldu.",
  "rozhin_29 favorilere yeni bir şarkı ekledi.",
  "dilsuz_insan koleksiyona yeni bir favori ekledi.",
  "klavyeci_arda 'Denge Dile Min' için düzenleme yaptı.",
  "studio_raman 'Hevalên Şevê' parçasını ekledi.",
  "Nalin A. topluluğa katıldı.",
  "ciwanmüzik 'Li Ber Deri'yi favoriledi.",
  "diyar_music Miraz için düzenleme yaptı.",
  "bera_sound yeni kayıt ekledi.",
  "stran_delal yeni şarkı önerdi.",
  "heba_1984 profil oluşturdu.",
  "koma-serhad yeni favori ekledi.",
  "arjinmüzik 'Azadî'yi favoriledi.",
  "ruken_tunes düzenleme gönderdi.",
  "rojkan kayıt oldu.",
  "dilawer gitar akorlarını güncelledi.",
  "avesta kayıt ekledi.",
  "sipan_ses yeni şarkı önerdi.",
  "bera_nakarot favori ekledi.",
  "sehriban kayıt oldu.",
  "bahoz_music düzenleme gönderdi.",
  "xezal profil açtı.",
  "sidar_ses yeni şarkı önerisi gönderdi.",
  "piran_tune favori güncelledi.",
  "hekîm_akustik akor düzenledi.",
  "berfin14 kayıt oldu.",
  "cihanrock yeni parça ekledi.",
  "koma_rojava düzenleme gönderdi.",
  "avjin profil açtı.",
  "zinar müzik ekledi.",
  "sterk favori ekledi.",
  "bera_narin kayıt oldu.",
  "miran-edit akor düzenledi.",
  "seda-ses yeni şarkı önerdi.",
  "rojhat kayıt oluşturdu.",
  "kardelen müzik paylaştı.",
  "cembey düzenleme yaptı.",
  "tahir17 favori ekledi.",
  "dilan_akapella yeni şarkı önerisi gönderdi.",
  "ronahi kayıt oldu.",
  "serxwebun ses düzenleme yaptı.",
  "barannew profil açtı.",
  "aylin-music yeni şarkı ekledi.",
  "ciwan_weli favori ekledi.",
  "nudem düzenleme gönderdi."
];

function formatNotificationTime(ts){
  if(!ts) return "";
  return new Date(ts).toLocaleString();
}

function renderNotifications(listEl, notifications){
  if(!listEl) return;
  if(!notifications.length){
    listEl.innerHTML = `<div class="empty">Şu anda bildirim yok.</div>`;
    return;
  }
  listEl.innerHTML = notifications.map((item) => {
    const meta = notificationMeta[item.type] || {};
    const actions = meta.actions || ["view"];
    return `
      <div class="notificationCard ${item.fake ? "notificationCard--fake" : ""}">
        <div class="notificationCard__header">
          <div>
            <div class="notificationCard__title">${escapeHtml(item.title || meta.title || "Bildirim")}</div>
            <div class="muted notificationCard__meta">${escapeHtml(item.detail)} · ${escapeHtml(formatNotificationTime(item.createdAt))}</div>
          </div>
          ${item.fake ? '<span class="badge badge--pending">Sahte</span>' : '<span class="badge badge--approved">Gerçek</span>'}
        </div>
        <div class="notificationCard__actions">
          ${actions.map((action) => {
            const label = action === "approve" ? "Onayla" : "İncele";
            const btnClass = action === "approve" ? "btn--ok" : "btn--ghost";
            return `<button class="btn ${btnClass}" data-action="${action}" data-id="${item.id}">${label}</button>`;
          }).join("")}
          <button class="btn btn--danger" data-action="dismiss" data-id="${item.id}">Kapat</button>
        </div>
      </div>
    `;
  }).join("");
}

function addNotification(type, { fake = false, detailOverride } = {}){
  const meta = notificationMeta[type];
  const db = window.fbDb;
  if(!meta || !db) return;
  const now = Date.now();
  const baseMessages = fake ? meta.fakeMessages : meta.messages;
  const autoMessage = (baseMessages && baseMessages.length)
    ? baseMessages[Math.floor(Math.random() * baseMessages.length)]
    : meta.title;
  const message = detailOverride || autoMessage;
  db.collection("admin_notifications").add({
    type,
    title: meta.title,
    detail: message,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    expiresAt: new Date(now + (fake ? ONE_DAY_MS : REAL_NOTIFICATION_TTL)),
    fake
  }).catch(err => console.error("❌ addNotification Firestore error", err));
}

function updateNotificationViews(notifications){
  renderNotifications($("#adminNotificationList"), notifications);
  const totalEl = $("#notificationTotal");
  if(totalEl) totalEl.textContent = notifications.length.toString();
  const badgeEl = $("#adminNotificationBadge");
  if(badgeEl) badgeEl.textContent = notifications.length.toString();
}

let notifications = [];
let submissionListenerReady = false;
let profilesListenerReady = false;
let notificationsUnsub = null;

async function seedFakeNotifications(db){
  try{
    const existing = await db.collection("admin_notifications").where("fake","==",true).limit(1).get();
    if(!existing.empty) return;
    const batch = db.batch();
    const types = ["edit","add","signup","favorite"];
    const now = Date.now();
    fakePool.forEach((detail, idx) => {
      const type = types[idx % types.length];
      const meta = notificationMeta[type];
      const ref = db.collection("admin_notifications").doc(`fake-${idx}`);
      batch.set(ref, {
        type,
        title: meta?.title || "Bildirim",
        detail,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(now + ONE_DAY_MS),
        fake: true
      }, { merge: true });
    });
    await batch.commit();
    console.log("✅ Fake notifications seeded to Firestore");
  } catch(err){
    console.error("❌ Failed to seed fake notifications", err);
  }
}

function setupNotifications(db){
  if(!db){
    console.warn("⚠️ admin_notifications: Firestore yok, local sahte bildirimler gösterilecek.");
    seedLocalFakeNotifications();
    return;
  }
  if(notificationsUnsub){
    notificationsUnsub();
    notificationsUnsub = null;
  }
  seedFakeNotifications(db);
  notificationsUnsub = db.collection("admin_notifications")
    .orderBy("createdAt","desc")
    .limit(200)
    .onSnapshot((snap) => {
      const now = Date.now();
      const items = snap.docs.map(d => {
        const data = d.data() || {};
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate().getTime() : (data.expiresAt || 0);
        return { _id: d.id, ...data, expiresAt };
      }).filter(item => !item.expiresAt || item.expiresAt > now);
      notifications = items;
      updateNotificationViews(notifications);
    }, (err) => {
      console.error("❌ admin_notifications listener error", err);
      seedLocalFakeNotifications();
    });
}

function seedLocalFakeNotifications(){
  const types = ["edit","add","signup","favorite"];
  const now = Date.now();
  notifications = fakePool.slice(0,50).map((detail, idx) => {
    const type = types[idx % types.length];
    const meta = notificationMeta[type];
    return {
      _id: `fake-local-${idx}`,
      type,
      title: meta?.title || "Bildirim",
      detail,
      createdAt: now,
      expiresAt: now + ONE_DAY_MS,
      fake: true
    };
  });
  updateNotificationViews(notifications);
}
function handleSubmissionDocChanges(changes){
  if(!submissionListenerReady){
    submissionListenerReady = true;
    return;
  }
  (changes || []).forEach((change) => {
    if(change.type === "added"){
      const data = change.doc?.data();
      const payloadType = ((data?.type || "").toLowerCase() === "new") ? "add" : "edit";
      addNotification(payloadType, {
        detailOverride: buildSubmissionDetail(data),
        fake: false
      });
    }
  });
}
function handleProfileDocChanges(changes){
  if(!profilesListenerReady){
    profilesListenerReady = true;
    return;
  }
  (changes || []).forEach((change) => {
    if(change.type === "added"){
      const data = change.doc?.data();
      const name = data?.displayName || data?.name || data?.email || "Yeni kayıt";
      addNotification("signup", {
        detailOverride: `${name} kayıt oldu.`,
        fake: false
      });
    }
  });
}
      
      setTimeout(() => {
        if(statusEl) statusEl.textContent = t("admin_status_pending", "Şandiyên li bendê");
        // Listeleri yeniden yükle
        if(unsub) {
          // Listener'lar otomatik güncellenecek
        }
      }, 2000);
    } catch(err) {
      console.error("Admin işlemi başarısız:", err);
      if(statusEl) statusEl.textContent = `${t("status_error_prefix", "Çewtî")}: ${err?.message || t("auth_error_generic", "Çewtiyek çêbû.")}`;
      setTimeout(() => {
        if(statusEl) statusEl.textContent = t("admin_status_pending", "Şandiyên li bendê");
      }, 3000);
    }
  };

  const deleteContactMessages = async (ids) => {
    const user = auth.currentUser;
    if(!user || !window.isAdminUser?.(user)) {
      if(statusEl) statusEl.textContent = t("admin_not_authorized", "Yetkin yok.");
      return;
    }
    if(!ids.length) {
      if(statusEl) statusEl.textContent = t("status_nothing_selected", "Tiştek nehate hilbijartin.");
      return;
    }
    
    if(!confirm(t("admin_confirm_delete_messages", "{count} mesaj silinecek. Emin misiniz?", { count: ids.length }))) {
      return;
    }
    
    try {
      if(statusEl) statusEl.textContent = t("admin_status_deleting", "Jêbirin…");
      const batch = db.batch();
      ids.forEach((id) => {
        const ref = db.collection("contact_messages").doc(id);
        batch.delete(ref);
      });
      await batch.commit();
      
      // Başarı mesajı göster
      if(statusEl) statusEl.textContent = t("admin_status_deleted_count", "{count} mesaj jêbirî.", { count: ids.length });
      
      // Listeleri otomatik güncellenecek (listener'lar sayesinde)
      
      setTimeout(() => {
        if(statusEl) statusEl.textContent = t("admin_status_pending", "Şandiyên li bendê");
      }, 2000);
    } catch(err) {
      console.error("Mesaj silme başarısız:", err);
      if(statusEl) statusEl.textContent = `${t("status_error_prefix", "Çewtî")}: ${err?.message || t("auth_error_generic", "Çewtiyek çêbû.")}`;
      setTimeout(() => {
        if(statusEl) statusEl.textContent = t("admin_status_pending", "Şandiyên li bendê");
      }, 3000);
    }
  };

  console.log("🔍 Admin: Setting up auth state listener...");
  auth.onAuthStateChanged((user) => {
    console.log("🔍 Admin: Auth state changed, user:", user ? user.uid : "null");
    if(unsub){ unsub(); unsub = null; }
    if(contactUnsub){ contactUnsub(); contactUnsub = null; }
    if(profilesUnsub){ profilesUnsub(); profilesUnsub = null; }
    if(notificationsUnsub){ notificationsUnsub(); notificationsUnsub = null; }
    if(!user){
      console.log("❌ Admin: No user");
      if(statusEl) statusEl.textContent = t("status_requires_login", "Têketin pêwîst e.");
      currentNew = [];
      currentEdits = [];
      currentContacts = [];
      renderList(newListEl, [], t("admin_type_new_song", "Strana nû"));
      renderList(editListEl, [], t("admin_type_edit", "Guhartin"));
      renderContactList(contactListEl, []);
      setCounts();
      seedLocalFakeNotifications();
      return;
    }
    
    const isAdmin = window.isAdminUser?.(user);
    console.log("🔍 Admin: isAdminUser check:", {
      userEmail: user.email,
      isAdmin: isAdmin,
      adminEmails: window.ADMIN_EMAILS || []
    });
    
    submissionListenerReady = false;
    profilesListenerReady = false;
    if(!isAdmin){
      console.warn("❌ Admin: User is not admin");
      if(statusEl) statusEl.textContent = t("admin_not_authorized", "Yetkin yok.");
      currentNew = [];
      currentEdits = [];
      currentContacts = [];
      renderList(newListEl, [], t("admin_type_new_song", "Strana nû"));
      renderList(editListEl, [], t("admin_type_edit", "Guhartin"));
      renderContactList(contactListEl, []);
      setCounts();
      return;
    }
    
    console.log("✅ Admin: User is admin, setting up listeners...");
    submissionListenerReady = false;
    profilesListenerReady = false;

    // Hemen sahte bildirimleri göster ( canlı / local fark etmez, ilk ekranda boş kalmasın)
    seedLocalFakeNotifications();

    if(statusEl) statusEl.textContent = t("admin_status_pending", "Şandiyên li bendê");
    
    // Bildirimleri Firestore'dan çek ve sahte tohumları ekle
    setupNotifications(db);
    setTimeout(() => {
      if(!notifications.length){
        console.warn("⚠️ admin_notifications: herhangi bir bildirim yok, local sahte seed gösteriliyor.");
        seedLocalFakeNotifications();
      }
    }, 1200);

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
          renderList(newListEl, [], t("admin_type_new_song", "Strana nû"));
          renderList(editListEl, [], t("admin_type_edit", "Guhartin"));
          if(statusEl) statusEl.textContent = t("admin_status_no_pending", "Ti şandiyên li bendê tune.");
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
        renderList(newListEl, currentNew, t("admin_type_new_song", "Strana nû"));
        renderList(editListEl, currentEdits, t("admin_type_edit", "Guhartin"));
        
        if(statusEl) statusEl.textContent = t("admin_status_pending", "Şandiyên li bendê");
      } catch(err) {
        console.error("❌ Admin: get() error:", err);
        console.error("❌ Admin: Error details:", {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        if(statusEl) statusEl.textContent = t("admin_status_load_failed", "Lîste nehat barkirin: {message}", {
          message: err?.message || t("auth_error_generic", "Çewtiyek çêbû.")
        });
        currentNew = [];
        currentEdits = [];
        renderList(newListEl, [], t("admin_type_new_song", "Strana nû"));
        renderList(editListEl, [], t("admin_type_edit", "Guhartin"));
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
          handleSubmissionDocChanges(snap.docChanges());
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
            renderList(newListEl, currentNew, t("admin_type_new_song", "Strana nû"));
            renderList(editListEl, currentEdits, t("admin_type_edit", "Guhartin"));
            
            if(statusEl) statusEl.textContent = t("admin_status_pending", "Şandiyên li bendê");
          } catch(renderErr) {
            console.error("❌ Admin: Render error:", renderErr);
            if(statusEl) statusEl.textContent = t("admin_status_render_error", "Render çewtiyek: {message}", {
              message: renderErr?.message || t("auth_error_generic", "Çewtiyek çêbû.")
            });
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

    // profiller için dinleyici
    const loadProfiles = async () => {
      try {
        await db.collection("profiles").limit(1).get();
      } catch(err){
        console.warn("⚠️ Admin: profiles load err", err);
      }
    };

    try {
      profilesUnsub = db.collection("profiles")
        .orderBy("createdAt","desc")
        .limit(20)
        .onSnapshot((snap) => {
          handleProfileDocChanges(snap.docChanges());
        }, (err) => {
          console.error("❌ Admin: profiles listener error:", err);
        });
    } catch(err){
      console.error("❌ Admin: Failed to set profiles listener:", err);
    }
    loadProfiles();

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
        if(contactListEl) contactListEl.innerHTML = `<div class="empty">${t("admin_messages_load_failed", "Mesajlar yüklenemedi: {message}", {
          message: err?.message || t("auth_error_generic", "Çewtiyek çêbû.")
        })}</div>`;
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
            if(contactListEl) contactListEl.innerHTML = `<div class="empty">${t("admin_status_render_error", "Render çewtiyek: {message}", {
              message: renderErr?.message || t("auth_error_generic", "Çewtiyek çêbû.")
            })}</div>`;
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
})();
  const notificationListEl = $("#adminNotificationList");
