// profile.js — kullanıcı profili

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
  return `song.html?id=${encodeURIComponent(id)}`;
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
  const label = s === "approved" ? "Pejirandî"
    : s === "rejected" ? "Redkirî"
    : "Li benda pejirandinê";
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
    list.innerHTML = `<div class="empty">Henûz favori yok.</div>`;
    return;
  }
  list.innerHTML = items.map(f => `
    <div class="item">
      <div class="item__left">
        <div class="item__title">${escapeHtml(window.formatSongTitle ? window.formatSongTitle(f.song) : (f.song || "—"))}</div>
        <div class="item__sub">${escapeHtml(artistText(f.artist) || "—")}</div>
      </div>
      <div class="badges">
        <a class="open" href="${openSong(f.songId || "")}">Veke</a>
      </div>
    </div>
  `).join("");
}

function renderArtistFavorites(list, items){
  const count = $("#favArtistCount");
  if(count) count.textContent = items.length.toString();
  if(!list) return;
  if(!items.length){
    list.innerHTML = `<div class="empty">Henûz favori sanatçı yok.</div>`;
    return;
  }
  list.innerHTML = items.map(a => `
    <div class="item">
      <div class="item__left">
        <div class="item__title">${escapeHtml(window.formatArtistName ? window.formatArtistName(a.artist) : (a.artist || "—"))}</div>
      </div>
    </div>
  `).join("");
}

function renderSubmissions(list, items, emptyLabel){
  if(!list) return;
  if(!items.length){
    list.innerHTML = `<div class="empty">${emptyLabel}</div>`;
    return;
  }
  list.innerHTML = items.map(s => {
    const id = s.type === "new" ? `new:${s._id}` : (s.sourceId || "");
    return `
      <div class="item">
        <div class="item__left">
          <div class="item__title">${escapeHtml(window.formatSongTitle ? window.formatSongTitle(s.song) : (s.song || "—"))}</div>
          <div class="item__sub">${escapeHtml(artistText(s.artist) || "—")}</div>
        </div>
        <div class="badges">
          ${statusBadge(s.status)}
          <a class="open" href="${openSong(id)}">Veke</a>
        </div>
      </div>
    `;
  }).join("");
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
    if(profileStatus) profileStatus.textContent = "Sîstema têketinê nehate dîtin.";
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
    renderSubmissions(newList, filteredNew, "Hêj stran nehat zêdekirin.");
    renderSubmissions(editList, filteredEdit, "Hêj guhartin tune.");
  };

  newFilter?.addEventListener("change", renderFiltered);
  editFilter?.addEventListener("change", renderFiltered);

  profileSignOut?.addEventListener("click", async () => {
    const ok = window.confirm("Tu dixwazî derkevî?");
    if(!ok) return;
    try{
      await auth.signOut();
      window.location.href = "index.html";
    }catch(err){
      if(profilePhotoStatus){
        profilePhotoStatus.textContent = err?.message || "Derketin bi ser neket.";
        profilePhotoStatus.style.color = "#ef4444";
      }
    }
  });

  profilePhotoSave?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if(!user){
      if(profilePhotoStatus) profilePhotoStatus.textContent = "Divê tu têkevî.";
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
        profilePhotoStatus.textContent = "Wêne hate nûkirin.";
        profilePhotoStatus.style.color = "";
      }
    }catch(err){
      if(profilePhotoStatus){
        profilePhotoStatus.textContent = err?.message || "Nehat nûkirin.";
        profilePhotoStatus.style.color = "#ef4444";
      }
    }
  });

  auth.onAuthStateChanged(async (user) => {
    if(!user){
      if(profileName) profileName.textContent = "Divê tu têkevî";
      if(profileEmail) profileEmail.textContent = "—";
      if(profileStatus) profileStatus.textContent = "Têketin tune";
      if(profileSubtitle) profileSubtitle.textContent = "Ji bo profîlê têkeve.";
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

    if(profileName) profileName.textContent = user.displayName || "Kullanıcı";
    if(profileEmail) profileEmail.textContent = user.email || "—";
    if(profileStatus) profileStatus.textContent = "Aktif";
    if(profileSubtitle) profileSubtitle.textContent = "Hesabın ve içeriklerin";
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
}

init();
