// firebase.js — Firebase init (compat)
(function(){
  // Production mode - console.log'ları minimize et
  const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const DEBUG = !IS_PRODUCTION || (window.location.search.includes('debug=true'));
  
  const log = (...args) => {
    if (DEBUG) console.log(...args);
  };
  const warn = (...args) => {
    if (DEBUG) console.warn(...args);
  };
  const error = (...args) => {
    console.error(...args);
  };
  
  // Firebase'in sadece bir kez initialize edilmesini sağla
  let isInitializing = false;
  let isInitialized = false;
  
  // Firebase script'lerinin yüklenmesini bekle
  function initFirebase() {
    // Zaten initialize edilmişse veya initialize ediliyorsa, tekrar etme
    if (isInitialized || isInitializing) {
      return;
    }
    
    isInitializing = true;
    
    try {
      const fb = window.firebase;
      if(!fb || !fb.initializeApp){
        warn("⚠️ Firebase SDK not loaded yet, will retry...");
        isInitializing = false;
        // Exponential backoff - her retry'da bekleme süresi artar
        const retryCount = window.__firebaseRetryCount || 0;
        window.__firebaseRetryCount = retryCount + 1;
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 saniye
        setTimeout(() => {
          window.__firebaseRetryCount = 0; // Reset after retry
          initFirebase();
        }, delay);
        return;
      }
      
      // Reset retry count on success
      window.__firebaseRetryCount = 0;
      
      // Auth modülünün yüklenmesini kontrol et
      if(typeof fb.auth !== "function"){
        warn("⚠️ Firebase Auth module not loaded yet, will retry...");
        isInitializing = false;
        const retryCount = window.__firebaseAuthRetryCount || 0;
        window.__firebaseAuthRetryCount = retryCount + 1;
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 saniye
        setTimeout(() => {
          window.__firebaseAuthRetryCount = 0;
          initFirebase();
        }, delay);
        return;
      }
      
      // Reset auth retry count on success
      window.__firebaseAuthRetryCount = 0;

      const firebaseConfig = {
        apiKey: "AIzaSyDD9zwgpdM-nzJCL9XwYCGoopvZvEVpfmM",
        authDomain: "repertuar-kurdi.firebaseapp.com",
        projectId: "repertuar-kurdi",
        storageBucket: "repertuar-kurdi.firebasestorage.app",
        messagingSenderId: "91873847078",
        appId: "1:91873847078:web:ce9a727ef78dd44a3fc3e7",
        measurementId: "G-CYMCWGHRYE"
      };

      let app;
      if(!fb.apps || !fb.apps.length){
        app = fb.initializeApp(firebaseConfig);
        log("✅ Firebase initialized");
      } else {
        app = fb.apps[0];
        log("✅ Firebase already initialized");
      }

      // Auth ve Firestore'u başlat
      if(typeof fb.auth === "function"){
        window.fbAuth = fb.auth(app);
      } else {
        warn("⚠️ Firebase Auth not available");
        window.fbAuth = null;
      }
      
      if(typeof fb.firestore === "function"){
        window.fbDb = fb.firestore(app);
      } else {
        warn("⚠️ Firebase Firestore not available");
        window.fbDb = null;
      }
      
      if(typeof fb.storage === "function"){
        window.fbStorage = fb.storage(app);
      } else {
        window.fbStorage = null;
      }

      // Bağlantıyı test et
      if(window.fbAuth && window.fbDb){
        log("✅ Firebase Auth connected");
        log("✅ Firebase Firestore connected");
        
        // enableNetwork() çağrısını kaldırdık - Firestore'un internal assertion hatasına neden oluyor
        // Firestore otomatik olarak network'ü yönetir, manuel enableNetwork() çağrısına gerek yok
        
        // Auth state listener ekle (sadece bir kez)
        if(window.fbAuth.onAuthStateChanged && !window.__authStateListenerAdded){
          window.__authStateListenerAdded = true;
          window.fbAuth.onAuthStateChanged((user) => {
            if(user){
              log("✅ User authenticated:", user.uid);
            } else {
              log("ℹ️ No user authenticated");
            }
          });
        }
        
        isInitialized = true;
        isInitializing = false;
      } else {
        warn("⚠️ Firebase Auth or Firestore not fully initialized");
        isInitializing = false;
      }
    } catch(err){
      error("❌ Firebase initialization error:", err);
      window.fbAuth = null;
      window.fbDb = null;
      window.fbStorage = null;
      isInitializing = false;
    }
  }
  
  // Sadece bir kez initialize et - DOM hazır olduğunda
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initFirebase, 500);
    });
  } else {
    setTimeout(initFirebase, 500);
  }
})();
