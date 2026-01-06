# Netlify Deploy Rehberi

Bu projeyi Netlify'da yayına almak için aşağıdaki adımları izleyin.

## Yöntem 1: Netlify CLI ile Deploy (Önerilen)

### 1. Netlify CLI Kurulumu
```bash
npm install -g netlify-cli
```

### 2. Netlify'a Giriş Yapın
```bash
netlify login
```
Bu komut tarayıcınızı açacak ve Netlify hesabınıza giriş yapmanızı isteyecek.

### 3. Projeyi Deploy Edin
```bash
# Proje klasörüne gidin
cd /Users/ahmetucar/Downloads/kurtce-akorlar-main-2-3

# İlk deploy
netlify deploy

# Production'a deploy (canlı site)
netlify deploy --prod
```

### 4. Site URL'ini Alın
Deploy işlemi tamamlandıktan sonra size bir URL verilecek. Bu URL'yi kullanarak sitenizi görebilirsiniz.

---

## Yöntem 2: Netlify Web Arayüzünden Deploy

### 1. Netlify'a Giriş Yapın
- https://app.netlify.com adresine gidin
- Hesabınızla giriş yapın (yoksa ücretsiz hesap oluşturun)

### 2. Drag & Drop Deploy
1. Netlify dashboard'da "Add new site" > "Deploy manually" seçin
2. Proje klasörünüzü (kurtce-akorlar-main-2-3) sürükleyip bırakın
3. Deploy işlemi otomatik başlayacak
4. Birkaç saniye sonra siteniz canlı olacak!

### 3. Site Ayarları
- Site adını değiştirebilirsiniz
- Custom domain ekleyebilirsiniz
- Environment variables ekleyebilirsiniz

---

## Yöntem 3: Git Repository'den Otomatik Deploy

### 1. Projeyi GitHub'a Yükleyin
```bash
# Git repository oluşturun (eğer yoksa)
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repository oluşturun, sonra:
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git branch -M main
git push -u origin main
```

### 2. Netlify'da Git Bağlantısı
1. Netlify dashboard'da "Add new site" > "Import an existing project"
2. GitHub'ı seçin ve repository'nizi seçin
3. Build settings:
   - Build command: (boş bırakın - static site)
   - Publish directory: `.` (nokta)
4. "Deploy site" butonuna tıklayın

### 3. Otomatik Deploy
- Her `git push` işleminde site otomatik olarak yeniden deploy edilecek
- Pull request'ler için preview deploy'lar oluşturulacak

---

## Önemli Notlar

### Firebase Yapılandırması
- Firebase config zaten `firebase.js` dosyasında mevcut
- Ekstra environment variable gerekmez
- Ancak eğer farklı bir Firebase projesi kullanmak isterseniz, Netlify dashboard'dan environment variable ekleyebilirsiniz

### Custom Domain
1. Netlify dashboard'da sitenize gidin
2. "Domain settings" > "Add custom domain"
3. Domain'inizi ekleyin ve DNS ayarlarını yapın

### HTTPS
- Netlify otomatik olarak HTTPS sağlar
- Let's Encrypt sertifikası otomatik olarak verilir

### Performance
- Netlify CDN kullanır, siteniz dünya çapında hızlı yüklenir
- `netlify.toml` dosyasında cache ayarları yapılandırılmıştır

---

## Sorun Giderme

### Deploy Hatası
- `netlify.toml` dosyasının doğru olduğundan emin olun
- Console'da hata mesajlarını kontrol edin
- Netlify build logs'u kontrol edin

### Firebase Bağlantı Sorunu
- Firebase config'in doğru olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin
- Firebase Console'da domain'inizin izinli olduğundan emin olun

### 404 Hatası
- `netlify.toml` dosyasındaki redirect kurallarını kontrol edin
- Sayfa yollarının doğru olduğundan emin olun

---

## Hızlı Başlangıç (En Kolay Yol)

1. **Netlify CLI kurun:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Giriş yapın:**
   ```bash
   netlify login
   ```

3. **Deploy edin:**
   ```bash
   cd /Users/ahmetucar/Downloads/kurtce-akorlar-main-2-3
   netlify deploy --prod
   ```

4. **URL'yi kopyalayın ve tarayıcıda açın!**

---

## İletişim ve Destek

- Netlify Dokümantasyonu: https://docs.netlify.com
- Netlify Community: https://community.netlify.com
- Netlify Support: https://www.netlify.com/support
