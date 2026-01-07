# 🔍 Mobil Veri Sorunu - Debug Rehberi

## 📱 Sorun
Site WiFi ile açılıyor ama mobil veriyle açılmıyor.

## 🧪 Debug Adımları

### 1. Mobil Tarayıcıda Console'u Açın

**Chrome (Android):**
1. Chrome'u açın
2. Site URL'sini girin
3. Menu (3 nokta) > More tools > Developer tools
4. Console sekmesine gidin
5. Hata mesajlarını not edin

**Safari (iOS):**
1. Ayarlar > Safari > Gelişmiş > Web Inspector (Açık)
2. Mac'te Safari > Develop > [Cihazınız] > [Site]
3. Console'u açın

### 2. Network Sekmesini Kontrol Edin

**Hangi istekler başarısız oluyor?**
- Netlify domain'i (site URL'si)
- Firebase scripts (gstatic.com)
- Firebase API (firebaseapp.com)
- Diğer kaynaklar

**Kontrol edin:**
- Status code (200, 404, 403, timeout?)
- Request URL
- Response headers
- Timing (ne kadar sürüyor?)

### 3. DNS Test

**Mobil cihazda DNS değiştirin:**
- **Android:** Ayarlar > WiFi > Gelişmiş > DNS: `8.8.8.8` veya `1.1.1.1`
- **iOS:** Ayarlar > WiFi > DNS: `8.8.8.8` veya `1.1.1.1`

**Test edin:**
- DNS değiştirdikten sonra site açılıyor mu?
- Açılıyorsa → DNS sorunu
- Açılmıyorsa → Başka bir sorun

### 4. Farklı Mobil Operatörlerle Test

- Farklı bir SIM kartla test edin
- Farklı bir cihazla test edin
- VPN ile test edin

**VPN ile çalışıyorsa:**
→ Mobil operatör engellemesi olabilir

### 5. Firebase Domain Erişim Testi

Mobil tarayıcıda bu URL'leri açmayı deneyin:
- `https://www.gstatic.com` (açılıyor mu?)
- `https://repertuar-kurdi.firebaseapp.com` (açılıyor mu?)
- `https://repertuar-kurdi.firebasestorage.app` (açılıyor mu?)

**Açılmıyorsa:**
→ Firebase domain'leri engellenmiş olabilir

### 6. Netlify Domain Testi

Mobil tarayıcıda Netlify URL'nizi açmayı deneyin:
- `https://[site-adı].netlify.app` (açılıyor mu?)

**Açılmıyorsa:**
→ Netlify domain'i engellenmiş olabilir

## 🔧 Olası Çözümler

### Çözüm 1: DNS Değiştirme
```
Android: Ayarlar > WiFi > Gelişmiş > DNS: 8.8.8.8
iOS: Ayarlar > WiFi > DNS: 8.8.8.8
```

### Çözüm 2: VPN Kullanma
VPN açıkken mobil veriyle test edin.

### Çözüm 3: Mobil Operatörle İletişim
Operatörünüzü arayıp domain'lerin engellenmediğinden emin olun.

### Çözüm 4: Custom Domain
Netlify'da custom domain ekleyin (operatörler genellikle custom domain'leri engellemez).

### Çözüm 5: Firebase Domain Whitelist
Firebase Console'da domain'inizin whitelist'te olduğundan emin olun.

## 📊 Hata Mesajları ve Anlamları

### "Failed to fetch"
- Network bağlantı sorunu
- DNS sorunu
- Domain engellemesi

### "Timeout"
- Yavaş bağlantı
- Script yükleme sorunu
- Retry mekanizması çalışmıyor

### "CORS error"
- Cross-origin sorunu
- Header ayarları yanlış

### "SSL/TLS error"
- Sertifika sorunu
- HTTPS sorunu

## 🚨 Acil Çözüm

Eğer hiçbir şey işe yaramıyorsa:

1. **Netlify dashboard'da:**
   - Site settings > Build & deploy > Clear cache and deploy site

2. **Firebase Console'da:**
   - Authentication > Settings > Authorized domains
   - Netlify domain'inizin ekli olduğundan emin olun

3. **Mobil cihazda:**
   - Tarayıcı cache'ini temizleyin
   - Gizli modda test edin
   - Farklı bir tarayıcı deneyin (Chrome, Safari, Firefox)

## 📝 Debug Bilgilerini Toplama

Lütfen şu bilgileri toplayın:

1. **Console hataları:** (tam hata mesajları)
2. **Network istekleri:** (hangi istekler başarısız?)
3. **Mobil operatör:** (hangi operatör?)
4. **Cihaz:** (Android/iOS, model)
5. **Tarayıcı:** (Chrome, Safari, vs.)
6. **DNS değiştirdikten sonra:** (açılıyor mu?)

Bu bilgilerle daha spesifik çözümler önerebiliriz.
