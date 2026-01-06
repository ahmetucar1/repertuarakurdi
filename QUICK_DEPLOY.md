# 🚀 Hızlı Netlify Deploy Rehberi

## En Kolay Yöntem: Web Arayüzünden (2 Dakika)

### Adım 1: Netlify'a Giriş
1. https://app.netlify.com adresine gidin
2. Ücretsiz hesap oluşturun veya giriş yapın (GitHub, Google, Email ile)

### Adım 2: Drag & Drop Deploy
1. Netlify dashboard'da **"Add new site"** butonuna tıklayın
2. **"Deploy manually"** seçeneğini seçin
3. **Proje klasörünüzü** (kurtce-akorlar-main-2-3) sürükleyip bırakın
4. Birkaç saniye bekleyin...

### Adım 3: Site Hazır! 🎉
- Deploy tamamlandığında size bir URL verilecek
- Örnek: `https://random-name-123.netlify.app`
- Bu URL'yi kopyalayıp tarayıcıda açın!

---

## Alternatif: Netlify CLI ile (Terminal)

### 1. Netlify CLI Kur
```bash
npm install -g netlify-cli
```

### 2. Giriş Yap
```bash
netlify login
```
(Tarayıcı açılacak, giriş yapın)

### 3. Deploy Et
```bash
cd /Users/ahmetucar/Downloads/kurtce-akorlar-main-2-3
netlify deploy --prod
```

### 4. Site URL'ini Al
Deploy sonunda size URL verilecek!

---

## Site Ayarları (Opsiyonel)

### Custom Domain Ekleme
1. Netlify dashboard'da sitenize gidin
2. **"Domain settings"** > **"Add custom domain"**
3. Domain'inizi ekleyin ve DNS ayarlarını yapın

### Site Adını Değiştirme
1. **"Site settings"** > **"Change site name"**
2. İstediğiniz adı yazın
3. Yeni URL: `https://yeni-ad.netlify.app`

---

## Önemli Notlar

✅ **Firebase:** Zaten yapılandırılmış, ekstra ayar gerekmez  
✅ **HTTPS:** Otomatik olarak aktif  
✅ **CDN:** Dünya çapında hızlı yükleme  
✅ **Ücretsiz:** Netlify free plan yeterli  

---

## Sorun mu Yaşıyorsunuz?

### Deploy Hatası
- `netlify.toml` dosyasının doğru olduğundan emin olun
- Netlify build logs'u kontrol edin

### Firebase Bağlantı Sorunu
- Browser console'da hata mesajlarını kontrol edin
- Firebase Console'da domain'inizin izinli olduğundan emin olun

### 404 Hatası
- Sayfa yollarının doğru olduğundan emin olun
- `netlify.toml` dosyasındaki redirect kurallarını kontrol edin

---

## Hızlı Başlangıç (Tek Komut)

```bash
npm install -g netlify-cli && netlify login && netlify deploy --prod
```

Bu komut:
1. Netlify CLI'yi kurar
2. Giriş yapmanızı sağlar
3. Projeyi deploy eder

---

**Başarılar! 🎉**
