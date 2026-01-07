// firebase.js — Firebase init (compat)
(function(){
  try {
  const fb = window.firebase;
  if(!fb || !fb.initializeApp){
      console.error("❌ Firebase SDK not loaded. Make sure Firebase scripts are included before this file.");
      window.fbAuth = null;
      window.fbDb = null;
    return;
  }

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
      console.log("✅ Firebase initialized");
    } else {
      app = fb.apps[0];
      console.log("✅ Firebase already initialized");
  }

    // Auth ve Firestore'u başlat
    window.fbAuth = fb.auth(app);
    window.fbDb = fb.firestore(app);
    
  if(typeof fb.storage === "function"){
      window.fbStorage = fb.storage(app);
    }

    // Bağlantıyı test et
    if(window.fbAuth && window.fbDb){
      console.log("✅ Firebase Auth connected");
      console.log("✅ Firebase Firestore connected");
      
      // Firestore bağlantısını test et
      window.fbDb.enableNetwork().then(() => {
        console.log("✅ Firestore network enabled");
      }).catch((err) => {
        console.warn("⚠️ Firestore network warning:", err);
      });
      
      // Auth state listener ekle
      window.fbAuth.onAuthStateChanged((user) => {
        if(user){
          console.log("✅ User authenticated:", user.uid);
        } else {
          console.log("ℹ️ No user authenticated");
        }
      });
    } else {
      console.error("❌ Firebase Auth or Firestore failed to initialize");
    }
  } catch(err){
    console.error("❌ Firebase initialization error:", err);
    window.fbAuth = null;
    window.fbDb = null;
  }
})();
