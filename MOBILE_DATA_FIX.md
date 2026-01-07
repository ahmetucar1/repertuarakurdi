# 📱 Mobil Veriyle Açılmama Sorunu - Çözüm Rehberi

## 🔍 Sorun
Site WiFi ile açılıyor ama mobil veriyle açılmıyor.

## ✅ Yapılan Düzeltmeler

1. **Netlify.toml güncellendi:**
   - `X-Frame-Options: DENY` → `SAMEORIGIN` (daha esnek)
   - CORS header'ları eklendi
   - Mobil uyumluluk iyileştirildi

## 🔧 Kontrol Edilmesi Gerekenler

### 1. DNS Sorunları
Mobil operatörün DNS'i siteyi çözümleyemiyor olabilir.

**Çözüm:**
- Mobil cihazda DNS ayarlarını değiştirin:
  - **Android:** Ayarlar > WiFi > Gelişmiş > DNS: `8.8.8.8` (Google DNS)
  - **iOS:** Ayarlar > WiFi > DNS: `8.8.8.8` veya `1.1.1.1` (Cloudflare DNS)

### 2. Mobil Operatör Engellemesi
Bazı operatörler belirli domain'leri engelleyebilir.

**Çözüm:**
- Farklı bir mobil operatörle test edin
- VPN kullanarak test edin
- Netlify domain'inin engellenmediğinden emin olun

### 3. HTTPS/SSL Sorunları
Mobil operatör SSL sertifikasını doğrulayamıyor olabilir.

**Kontrol:**
- Netlify dashboard'da SSL sertifikasının aktif olduğundan emin olun
- Site URL'sinin `https://` ile başladığından emin olun

### 4. Firebase Domain Erişimi
Firebase domain'leri mobil veriyle erişilemiyor olabilir.

**Kontrol:**
- Mobil tarayıcıda Console'u açın (Chrome: Menu > More tools > Developer tools)
- Hata mesajlarını kontrol edin
- Firebase domain'lerinin engellenmediğinden emin olun:
  - `www.gstatic.com`
  - `firebaseapp.com`
  - `firebasestorage.app`

### 5. Netlify Ayarları
Netlify dashboard'da bazı ayarlar kontrol edilmeli.

**Kontrol:**
1. Netlify dashboard'a gidin: https://app.netlify.com
2. Sitenize tıklayın
3. **Site settings** > **Build & deploy** kontrol edin:
   - Build command boş olmalı
   - Publish directory: `.` (nokta)
4. **Domain settings** kontrol edin:
   - HTTPS aktif olmalı
   - Custom domain varsa DNS ayarları doğru olmalı

### 6. Cache Sorunları
Mobil tarayıcı eski cache'i kullanıyor olabilir.

**Çözüm:**
- Mobil tarayıcıda cache'i temizleyin
- Gizli modda (incognito) test edin
- Tarayıcıyı yeniden başlatın

## 🧪 Test Adımları

1. **Mobil tarayıcıda Console'u açın:**
   - Chrome: Menu > More tools > Developer tools
   - Safari: Settings > Advanced > Web Inspector

2. **Hata mesajlarını kontrol edin:**
   - Network sekmesinde hangi isteklerin başarısız olduğunu görün
   - Console sekmesinde JavaScript hatalarını kontrol edin

3. **Farklı mobil operatörlerle test edin:**
   - Farklı bir SIM kartla test edin
   - Farklı bir cihazla test edin

4. **VPN ile test edin:**
   - VPN açıkken mobil veriyle test edin
   - VPN ile çalışıyorsa operatör engellemesi olabilir

## 📋 Netlify Dashboard Kontrol Listesi

- [ ] Site deploy edilmiş ve aktif
- [ ] HTTPS sertifikası aktif
- [ ] Build ayarları doğru
- [ ] Domain ayarları doğru
- [ ] Environment variables doğru (varsa)

## 🔗 Yararlı Linkler

- Netlify Status: https://www.netlifystatus.com
- Firebase Status: https://status.firebase.google.com
- DNS Test: https://dnschecker.org

## 💡 Hızlı Çözüm

Eğer sorun devam ediyorsa:

1. **Netlify dashboard'da "Clear cache and deploy site" yapın**
2. **Mobil cihazda DNS'i değiştirin (8.8.8.8)**
3. **Mobil tarayıcıda cache'i temizleyin**
4. **Gizli modda test edin**

---

**Not:** Bu değişiklikler commit edildi. GitHub'a push yaptıktan sonra Netlify otomatik olarak yeniden deploy edecek.
