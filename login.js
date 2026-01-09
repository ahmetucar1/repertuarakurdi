// login.js — Giriş sayfası mantığı
(function() {
  const $ = (s) => document.querySelector(s);
  const t = (key, fallback, vars) => window.t ? window.t(key, vars) : fallback;
  
  const emailEl = $("#loginEmail");
  const passEl = $("#loginPass");
  const signInBtn = $("#loginSignIn");
  const signUpBtn = $("#loginSignUp");
  const googleBtn = $("#loginGoogle");
  const resetBtn = $("#loginReset");
  const statusEl = $("#loginStatus");
  const loginForm = $("#loginForm");
  
  // Return URL'i al (giriş sonrası nereye dönülecek)
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get("return") || "/index.html";
  
  // Giriş yapmış kullanıcıyı yönlendir
  function checkAuthState() {
    const auth = window.fbAuth;
    if(!auth) {
      // Firebase henüz yüklenmemiş, bekle
      setTimeout(checkAuthState, 500);
      return;
    }
    
    // İlk yüklemede mevcut kullanıcıyı kontrol et
    const currentUser = auth.currentUser;
    if(currentUser) {
      // Zaten giriş yapmış, returnUrl'e yönlendir
      window.location.href = returnUrl;
      return;
    }
    
    // Auth state değişikliklerini dinle
    auth.onAuthStateChanged((user) => {
      if(user) {
        // Giriş yapıldı, returnUrl'e yönlendir
        window.location.href = returnUrl;
      }
    });
  }
  
  // Status mesajı göster
  function showStatus(message, type = "info") {
    if(!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = `login-status login-status--${type}`;
    statusEl.style.display = "block";
    
    if(type === "success") {
      setTimeout(() => {
        statusEl.style.display = "none";
      }, 3000);
    }
  }
  
  // Giriş yap
  async function handleSignIn(e) {
    if(e) e.preventDefault();
    
    const email = emailEl.value.trim();
    const password = passEl.value;
    
    if(!email || !password) {
      showStatus(t("login_error_missing_fields", "Ji kerema xwe e-name û şîfre binivîse."), "error");
      return;
    }
    
    const auth = window.fbAuth;
    if(!auth) {
      showStatus(t("login_error_firebase_unready", "Firebase hêj nehate barkirin, ji kerema xwe li benda bimîne..."), "error");
      setTimeout(() => handleSignIn(), 1000);
      return;
    }
    
    try {
      showStatus(t("login_status_signing_in", "Têketin tê kirin..."), "info");
      if(signInBtn) signInBtn.disabled = true;
      
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      showStatus(t("login_status_sign_in_success", "Bi serkeftî têketin! Tê guhertin..."), "success");
      
      // Auth state'in güncellenmesini bekle
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if(user && user.uid === userCredential.user.uid){
            unsubscribe();
            resolve();
          }
        });
        // Max 3 saniye bekle
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 3000);
      });
      
      // Başarılı giriş sonrası returnUrl'e yönlendir
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 500);
      
    } catch(err) {
      console.error("Giriş hatası:", err);
      console.error("Hata kodu:", err.code);
      console.error("Hata mesajı:", err.message);
      if(signInBtn) signInBtn.disabled = false;
      
      let errorMsg = t("login_error_sign_in_failed", "Têketin bi ser neket. Ji kerema xwe dîsa biceribîne.");
      if(err.code === "auth/user-not-found") {
        errorMsg = t("login_error_user_not_found", "Ev e-name qeyd nebûye. Ji kerema xwe pêşî tomar bibe.");
      } else if(err.code === "auth/wrong-password") {
        errorMsg = t("login_error_wrong_password", "Şîfre çewt e. Ji kerema xwe dîsa biceribîne.");
      } else if(err.code === "auth/invalid-credential") {
        errorMsg = t("login_error_invalid_credential", "E-name an jî şîfre çewt e. Ger tu qeyd nebûyî, pêşî tomar bibe.");
      } else if(err.code === "auth/invalid-email") {
        errorMsg = t("login_error_invalid_email", "E-name nederbasdar e. Ji kerema xwe e-nameyek derbasdar binivîse.");
      } else if(err.code === "auth/too-many-requests") {
        errorMsg = t("login_error_too_many_requests", "Zêde hewl hat kirin. Piştî demekê dîsa biceribîne.");
      } else if(err.code === "auth/network-request-failed") {
        errorMsg = t("login_error_network", "Girêdana înternetê tune. Ji kerema xwe kontrol bike.");
      } else if(err.code === "auth/user-disabled") {
        errorMsg = t("login_error_user_disabled", "Ev hesab hate astengkirin. Ji kerema xwe bi rêveberiyê re têkilî daynin.");
      } else if(err.code === "auth/operation-not-allowed") {
        errorMsg = t("login_error_operation_not_allowed", "Ev awayê têketinê destûr nedaye. Ji kerema xwe bi rêveberiyê re têkilî daynin.");
      } else if(err.message) {
        errorMsg = `${t("login_error_generic", "Çewtiyek çêbû.")}: ${err.message}`;
      }
      
      showStatus(errorMsg, "error");
    }
  }
  
  // Kayıt ol
  async function handleSignUp(e) {
    if(e) e.preventDefault();
    
    const email = emailEl.value.trim();
    const password = passEl.value;
    
    if(!email || !password) {
      showStatus(t("login_error_missing_fields", "Ji kerema xwe e-name û şîfre binivîse."), "error");
      return;
    }
    
    if(password.length < 6) {
      showStatus(t("login_error_password_length", "Şîfre divê herî kêm 6 karakter be."), "error");
      return;
    }
    
    const auth = window.fbAuth;
    if(!auth) {
      showStatus(t("login_error_firebase_unready", "Firebase hêj nehate barkirin, ji kerema xwe li benda bimîne..."), "error");
      setTimeout(() => handleSignUp(), 1000);
      return;
    }
    
    try {
      showStatus(t("login_status_signing_up", "Tomar tê kirin..."), "info");
      if(signUpBtn) signUpBtn.disabled = true;
      
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      showStatus(t("login_status_sign_up_success", "Bi serkeftî tomar bû! Tê guhertin..."), "success");
      
      // Auth state'in güncellenmesini bekle
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if(user && user.uid === userCredential.user.uid){
            unsubscribe();
            resolve();
          }
        });
        // Max 3 saniye bekle
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 3000);
      });
      
      // Başarılı kayıt sonrası returnUrl'e yönlendir
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 500);
      
    } catch(err) {
      console.error("Kayıt hatası:", err);
      if(signUpBtn) signUpBtn.disabled = false;
      
      let errorMsg = t("login_error_sign_up_failed", "Tomar bi ser neket. Ji kerema xwe dîsa biceribîne.");
      if(err.code === "auth/email-already-in-use") {
        errorMsg = t("login_error_email_in_use", "Ev e-name jixwe qeyd bûye. Ger ev e-nameya te ye, têkev.");
      } else if(err.code === "auth/invalid-email") {
        errorMsg = t("login_error_invalid_email", "E-name nederbasdar e. Ji kerema xwe e-nameyek derbasdar binivîse.");
      } else if(err.code === "auth/weak-password") {
        errorMsg = t("login_error_weak_password", "Şîfre pir hêsan e. Divê herî kêm 6 karakter be.");
      } else if(err.code === "auth/invalid-credential") {
        errorMsg = t("login_error_invalid_credential", "E-name an jî şîfre çewt e. Ji kerema xwe kontrol bike.");
      } else if(err.code === "auth/network-request-failed") {
        errorMsg = t("login_error_network", "Girêdana înternetê tune. Ji kerema xwe kontrol bike.");
      } else if(err.code === "auth/operation-not-allowed") {
        errorMsg = t("login_error_operation_not_allowed", "Ev awayê tomarê destûr nedaye. Ji kerema xwe bi rêveberiyê re têkilî daynin.");
      } else if(err.message) {
        errorMsg = `${t("login_error_generic", "Çewtiyek çêbû.")}: ${err.message}`;
      }
      
      showStatus(errorMsg, "error");
    }
  }
  
  // Google ile giriş
  async function handleGoogleSignIn(e) {
    if(e) e.preventDefault();
    
    const auth = window.fbAuth;
    const fb = window.firebase;
    
    if(!auth || !fb || !fb.auth) {
      showStatus(t("login_error_firebase_unready", "Firebase hêj nehate barkirin, ji kerema xwe li benda bimîne..."), "error");
      setTimeout(() => handleGoogleSignIn(e), 1000);
      return;
    }
    
    try {
      showStatus(t("login_status_google_signing_in", "Bi Google re têketin tê kirin..."), "info");
      if(googleBtn) googleBtn.disabled = true;
      
      const provider = new fb.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      
      showStatus(t("login_status_google_success", "Bi serkeftî têketin! Tê guhertin..."), "success");
      
      // Auth state'in güncellenmesini bekle
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if(user && user.uid === result.user.uid){
            unsubscribe();
            resolve();
          }
        });
        // Max 3 saniye bekle
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 3000);
      });
      
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 500);
      
    } catch(err) {
      console.error("Google giriş hatası:", err);
      if(googleBtn) googleBtn.disabled = false;
      
      let errorMsg = t("login_error_google_failed", "Bi Google re têketin bi ser neket. Ji kerema xwe dîsa biceribîne.");
      if(err.code === "auth/popup-closed-by-user") {
        errorMsg = t("login_error_popup_closed", "Giriş vekirî bû.");
      } else if(err.code === "auth/popup-blocked") {
        errorMsg = t("login_error_popup_blocked", "Popup hate astengkirin. Ji kerema xwe popup destûrê bide.");
      } else if(err.code === "auth/unauthorized-domain") {
        errorMsg = t("login_error_unauthorized_domain", "Ev domain destûr nedaye. Firebase console'ê kontrol bike.");
      } else if(err.code === "auth/invalid-credential") {
        errorMsg = t("login_error_google_failed", "Google girişi bi ser neket. Ji kerema xwe dîsa biceribîne.");
      } else if(err.message) {
        errorMsg = `${t("login_error_generic", "Çewtiyek çêbû.")}: ${err.message}`;
      }
      
      showStatus(errorMsg, "error");
    }
  }
  
  // Şifre sıfırlama
  async function handleReset(e) {
    if(e) e.preventDefault();
    
    const email = emailEl.value.trim();
    
    if(!email) {
      showStatus(t("login_error_reset_missing_email", "Ji kerema xwe e-nameyê binivîse."), "error");
      emailEl.focus();
      return;
    }
    
    const auth = window.fbAuth;
    if(!auth) {
      showStatus(t("login_error_firebase_unready", "Firebase hêj nehate barkirin, ji kerema xwe li benda bimîne..."), "error");
      setTimeout(() => handleReset(), 1000);
      return;
    }
    
    try {
      showStatus(t("login_status_reset_sending", "E-nameyê tê şandin..."), "info");
      resetBtn.disabled = true;
      
      await auth.sendPasswordResetEmail(email);
      
      showStatus(t("login_status_reset_sent", "E-nameyê şand! Posta quteya xwe kontrol bike."), "success");
      resetBtn.disabled = false;
      
    } catch(err) {
      console.error("Şifre sıfırlama hatası:", err);
      resetBtn.disabled = false;
      
      let errorMsg = t("login_error_reset_failed", "E-name şandina bi ser neket. Ji kerema xwe dîsa biceribîne.");
      if(err.code === "auth/user-not-found") {
        errorMsg = t("login_error_reset_user_not_found", "Ev e-name qeyd nebûye.");
      } else if(err.code === "auth/invalid-email") {
        errorMsg = t("login_error_reset_invalid_email", "E-name nederbasdar e.");
      } else if(err.code === "auth/invalid-credential") {
        errorMsg = t("login_error_reset_invalid_credential", "E-name nederbasdar e. Ji kerema xwe kontrol bike.");
      }
      
      showStatus(errorMsg, "error");
    }
  }
  
  // Event listener'ları ekle
  function init() {
    // Firebase'in tamamen yüklenmesini bekle
    let retryCount = 0;
    const maxRetries = 20; // 10 saniye max bekleme
    
    function waitForFirebase() {
      const auth = window.fbAuth;
      const fb = window.firebase;
      
      if(!auth || !fb || !fb.auth) {
        retryCount++;
        if(retryCount < maxRetries) {
          setTimeout(waitForFirebase, 500);
        } else {
          showStatus(t("login_error_firebase_load_failed", "Firebase nehate barkirin. Ji kerema xwe rûpelê nû bike."), "error");
        }
        return;
      }
      
      console.log("✅ Firebase ready, initializing login...");
      
      // Giriş yapmış kullanıcıyı kontrol et
      checkAuthState();
      
      // Form submit
      if(loginForm) {
        loginForm.addEventListener("submit", handleSignIn);
      }
      
      // Butonlar
      if(signInBtn) {
        signInBtn.addEventListener("click", handleSignIn);
      }
      
      if(signUpBtn) {
        signUpBtn.addEventListener("click", handleSignUp);
      }
      
      if(googleBtn) {
        googleBtn.addEventListener("click", handleGoogleSignIn);
      }
      
      if(resetBtn) {
        resetBtn.addEventListener("click", handleReset);
      }
    }
    
    waitForFirebase();
  }
  
  // DOM hazır olduğunda başlat
  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
