// song.js — rûpela stranê ya bi nivîsê

// Yardımcılar
function makeId(s){
  if(typeof songId === "function") return songId(s);
  return `${s.pdf}|${s.page_original}`;
}
function openLink(s){ return `song.html?id=${encodeURIComponent(makeId(s))}`; }

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
    const href = `artist.html?name=${encodeURIComponent(name)}`;
    return `<a class="artistLink" href="${href}" title="Ji bo dîtina stranên hunermendê bikeve">${escapeHtml(name)}</a>`;
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

// Transpose helpers
// 🔴 YouTube API KEY (user provided)
const YT_API_KEY = "AIzaSyDC5vzDXhSwySsDaL_VsBxTpVSgGolphjw";

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

function transposePlainText(text, semis){
  const tokRe = /\b([A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?)\b/g;
  return text.replace(tokRe, (m) => transposeSymbol(m, semis, { prefer: pickPrefer(m) }));
}

function highlightChords(text){
  const tokRe = /\b([A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?)\b/g;
  const escaped = escapeHtml(text);
  return escaped.replace(tokRe, "<strong class=\"chordTok\">$1</strong>");
}

function renderText(preEl, baseText, semis){
  if(!preEl || baseText == null) return;
  const transposed = transposePlainText(baseText, semis);
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
        wrap.innerHTML = `<a href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px;text-align:center;color:#fff;text-decoration:none;background:#111;border-radius:12px;">YouTube'da ara</a>`;
      }
    });
}

function renderRecList(el, recs){
  el.innerHTML = recs.map(s => {
    const pendingBadge = s.pending ? `<span class="badge badge--pending">Li benda pejirandina edîtorê ye</span>` : "";
    const title = window.formatSongTitle ? window.formatSongTitle(s.song) : (s.song || "");
    return `
    <div class="item">
      <div class="item__left">
        <div class="item__title">${escapeHtml(title)}</div>
        <div class="item__sub">${artistLinks(s.artist)}</div>
      </div>
      <div class="badges">
        ${pendingBadge}
        <a class="open" href="${openLink(s)}">Veke</a>
      </div>
    </div>
  `;
  }).join("");
}

function getIdParam(){
  const p = new URLSearchParams(location.search);
  return p.get("id") || "";
}

async function loadSongText(slug){
  const res = await fetch(`assets/text/${slug}.txt`, { cache: "no-store" });
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
    if(songText) songText.textContent = "Stran nehat barkirin. Ji kerema xwe rûpelê nû bike.";
    return;
  }

  const id = getIdParam();
  const current = SONGS.find(s => makeId(s) === id) || SONGS[0];
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

  if(statSongsInline) statSongsInline.textContent = SONGS.length.toString();
  if(statArtistsInline){
    const uniqueArtists = new Set();
    SONGS.forEach(s => {
      artistArr(s.artist).forEach(a => uniqueArtists.add(normalizeKey(a)));
    });
    statArtistsInline.textContent = uniqueArtists.size.toString();
  }

  const songNameEl = document.getElementById("songName");
  const songArtistEl = document.getElementById("songArtist");
  
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

  if(bar && originalKey){
    bar.style.display = "flex";
    updateKeyLabels();
  } else {
    updateKeyLabels();
  }

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
    // favoriteBtn güncelle
    if(favoriteBtn){
      favoriteBtn.classList.toggle("is-favorite", favActive);
      favoriteBtn.setAttribute("aria-pressed", favActive ? "true" : "false");
    }
    // favoriteBtn2 güncelle (transposeBar içindeki)
    if(favoriteBtn2){
      favoriteBtn2.classList.toggle("is-favorite", favActive);
      favoriteBtn2.setAttribute("aria-pressed", favActive ? "true" : "false");
    }
  };
  updateFavUI();

  const toggleFavorite = async (e) => {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const user = window.fbAuth?.currentUser;
    const db = window.fbDb;
    
    if(!user || !db){
      // Giriş yapmamış kullanıcılar için requireAuthAction kullan
      if(typeof window.requireAuthAction === "function"){
        window.requireAuthAction(() => {
          toggleFavorite(e);
        }, "Ji bo favorîkirinê divê tu têkevî.");
      } else {
        // Fallback: Manuel olarak auth panelini aç
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
        authPanel.setAttribute("aria-hidden", "false");
        document.body.classList.add("auth-open");
      }
      if(authOverlay){
        authOverlay.classList.add("is-open");
      }
      const authStatus = document.getElementById("authStatus");
      if(authStatus){
        authStatus.textContent = "Ji bo favorîkirinê divê tu têkevî.";
        authStatus.style.color = "#ef4444";
      }
      }
      return;
    }
    if(!favRef){
      const favId = `${user.uid}_${currentId}`;
      favRef = db.collection("favorites").doc(favId);
    }
    try{
      if(favActive){
        await favRef.delete();
        favActive = false;
        updateFavUI(true);
        setFavStatus("Ji favoriyan hate derxistin.", false);
      }else{
        const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
        await favRef.set({
          uid: user.uid,
          songId: currentId,
          song: current?.song || "",
          artist: current?.artist || "",
          createdAt: stamp
        });
        favActive = true;
        updateFavUI(true);
        setFavStatus("Favoriya Te", false);
      }
    }catch(err){
      setFavStatus(err?.message || "Favorî nehat tomarkirin.", true);
    }
  };

  // Tüm favori butonlarına event listener ekle
  const favButtons = document.querySelectorAll(".favoriteBtn");
  if(favButtons.length > 0){
    favButtons.forEach(btn => {
      btn.addEventListener("click", toggleFavorite);
    });
  } else if(favoriteBtn){
    favoriteBtn.addEventListener("click", toggleFavorite);
  }

  const auth = window.fbAuth;
  // Düzenleme butonu her zaman görünür - giriş kontrolü tıklamada yapılacak
  if(editToggleRow) {
    editToggleRow.style.display = "flex";
  }
  
  if(auth){
    const currentUser = auth.currentUser;
    
    auth.onAuthStateChanged((user) => {
      if(!user && editPanel){
        editPanel.classList.add("is-hidden");
      }
      if(!user){
        favActive = false;
        updateFavUI();
        setFavStatus("");
        favRef = null;
        return;
      }
      if(window.fbDb){
        const favId = `${user.uid}_${currentId}`;
        favRef = window.fbDb.collection("favorites").doc(favId);
        favRef.get().then(snap => {
          favActive = !!snap?.exists;
          updateFavUI();
          setFavStatus("");
        }).catch(() => {
          favActive = false;
          updateFavUI();
        });
      }
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
      // Giriş yapmamış kullanıcılar için requireAuthAction kullan
      if(typeof window.requireAuthAction === "function"){
        window.requireAuthAction(() => {
          // Giriş yapıldıktan sonra paneli aç
          const imgWrap = document.querySelector(".imgWrap");
          fillEditForm();
          if(imgWrap) imgWrap.style.display = "none";
          editPanel.classList.remove("is-hidden");
          // Panel açıldıktan sonra textarea yüksekliğini ayarla
          setTimeout(() => {
            if(editText) adjustTextareaHeight(editText);
          }, 100);
        }, "Ji bo guhertinê divê tu têkevî.");
      } else {
        // Fallback: Manuel olarak auth panelini aç
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
        authPanel.setAttribute("aria-hidden", "false");
        document.body.classList.add("auth-open");
      }
        if(authOverlay){
          authOverlay.classList.add("is-open");
      }
        const authStatus = document.getElementById("authStatus");
      if(authStatus){
        authStatus.textContent = "Ji bo guhertinê divê tu têkevî.";
        authStatus.style.color = "#ef4444";
      }
      }
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
      if(typeof window.openAddSongPanel === "function"){
        window.openAddSongPanel();
      } else {
        // Fallback: index.html'e yönlendir
        location.href = "index.html#add-song";
      }
    });
  }

  editSave?.addEventListener("click", async () => {
    if(!editNotice) return;
    const db = window.fbDb;
    const user = window.fbAuth?.currentUser;
    if(!db || !user){
      if(typeof window.requireAuthAction === "function"){
        window.requireAuthAction(() => {
          // Giriş yapıldıktan sonra kaydetmeyi tekrar dene
          editSave?.click();
        }, "Ji bo guhertinê divê tu têkevî.");
      } else {
      editNotice.textContent = "Ji bo guhertinê divê tu têkevî.";
      editNotice.style.color = "#ef4444";
      }
      return;
    }

    const nextSong = (editSong?.value || "").trim();
    const nextArtist = parseArtistInput(editArtist?.value || "");
    const nextKey = (editKey?.value || "").trim();
    const nextText = (editText?.value || "").toString();

    if(!nextSong || !nextText){
      editNotice.textContent = "Navê stranê û nivîs pêwîst in.";
      editNotice.style.color = "#ef4444";
      return;
    }

    try{
      const ref = db.collection("song_submissions");
      const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
      
      // Veritabanına kaydet
      const docRef = await ref.add({
        type: "edit",
        status: "pending",
        sourceId: currentId,
        song: nextSong,
        artist: nextArtist,
        key: nextKey,
        text: nextText,
        pdf: current?.pdf || "",
        volume: current?.volume || "",
        page_original: current?.page_original || "",
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
      
      // Başarı mesajını göster
      editNotice.textContent = "Niha tomar kir. Guhertinên te ji bo pejirandina edîtorê li benda ne. Piştî pejirandinê guhertinên te dê xuya bibin.";
      editNotice.style.color = "#059669";
      editNotice.style.background = "rgba(5, 150, 105, 0.1)";
      editNotice.style.border = "1px solid rgba(5, 150, 105, 0.2)";
      editNotice.style.padding = "12px 16px";
      editNotice.style.borderRadius = "8px";
      editNotice.style.marginTop = "16px";
      
      // Mesajı 2 saniye göster, sonra panel'i kapat ve sayfayı yeniden yükle
      setTimeout(() => {
        const imgWrap = document.querySelector(".imgWrap");
        editPanel.classList.add("is-hidden");
        if(imgWrap) imgWrap.style.display = "";
        
        // Cache'i temizle ve sayfayı yeniden yükle
        window.clearSongsCache?.();
        // Sayfayı yeniden yükle ki Firebase'den yeni veriler gelsin
        location.reload();
      }, 2000);
    }catch(err){
      editNotice.textContent = err?.message || "Nehat tomarkirin.";
      editNotice.style.color = "#ef4444";
    }
  });

  // Nivîsê bar bike (niha slug = navê stranê slugify, mînak: ava-suse)
  const slug = (current.song || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  
  try{
    const rawText = current?.text ? current.text : await loadSongText(slug);
    if(textPre){
      textPre.dataset.baseText = rawText;
      renderText(textPre, rawText, semitones);
    }
  }catch(err){
    console.error("Metin yükleme hatası:", err, "slug:", slug);
    if(textPre){
      textPre.textContent = "Metin bulunamadı.";
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
    const first = pickRandom(preferred, 6);
    const need = Math.max(0, 6 - first.length);
    const restPool = pool.filter(s => !first.some(x => makeId(x) === makeId(s)));
    const recs = first.concat(pickRandom(restPool, need));
    renderRecList(recEl, recs);
  };
  renderRecs();
  const shuffleBtn = document.getElementById("shuffleRec");
  if(shuffleBtn) shuffleBtn.addEventListener("click", renderRecs);
  
  // Responsive search - icon'a tıklayınca açılması
  function initResponsiveSearch() {
    const searchHeaders = document.querySelectorAll(".search--header");
    searchHeaders.forEach(searchEl => {
      const input = searchEl.querySelector(".search__input");
      const icon = searchEl.querySelector(".search__icon");
      if(!input || !icon) return;
      
      // Küçük ekranlarda icon-only modunu aktif et
      function checkScreenSize() {
        if(window.innerWidth <= 639) {
          searchEl.classList.add("search--icon-only");
        } else {
          searchEl.classList.remove("search--icon-only", "search--open");
          document.body.classList.remove("search-open");
        }
      }
      
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      
      icon.addEventListener("click", (e) => {
        if(window.innerWidth <= 639) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const isOpen = searchEl.classList.contains("search--open");
          if(isOpen) {
            searchEl.classList.remove("search--open");
            input.blur();
            document.body.classList.remove("search-open");
          } else {
            searchEl.classList.add("search--open");
            document.body.classList.add("search-open");
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                input.focus();
              });
            });
          }
        }
      });
      
      input.addEventListener("click", (e) => {
        if(window.innerWidth <= 639) {
          e.stopPropagation();
          if(!searchEl.classList.contains("search--open")) {
            searchEl.classList.add("search--open");
            document.body.classList.add("search-open");
          }
        }
      });
      
      input.addEventListener("blur", (e) => {
        if(window.innerWidth <= 639 && !input.value) {
          const relatedTarget = e.relatedTarget;
          if(relatedTarget && relatedTarget.closest(".search")) {
            return;
          }
          setTimeout(() => {
            if(document.activeElement !== input && !input.value) {
              searchEl.classList.remove("search--open");
              document.body.classList.remove("search-open");
            }
          }, 300);
        }
      });
      
      let scrollTimeout;
      function handleScroll() {
        if(window.innerWidth <= 639 && searchEl.classList.contains("search--open") && !input.value) {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            if(!input.value) {
              searchEl.classList.remove("search--open");
              document.body.classList.remove("search-open");
              input.blur();
            }
          }, 150);
        }
      }
      
      window.addEventListener("scroll", handleScroll, { passive: true });
    });
  }
  
  initResponsiveSearch();
}

init().catch(console.error);
