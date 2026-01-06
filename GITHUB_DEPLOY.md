# 📦 GitHub'a Push ve Netlify Deploy Rehberi

## Adım 1: Git Repository Hazırlama

### Eğer Git Repository Yoksa:

```bash
cd /Users/ahmetucar/Downloads/kurtce-akorlar-main-2-3

# Git repository başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Responsive design and Netlify config"
```

### Eğer Zaten Git Repository Varsa:

```bash
cd /Users/ahmetucar/Downloads/kurtce-akorlar-main-2-3

# Değişiklikleri kontrol et
git status

# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "Add responsive design and Netlify deployment config"
```

---

## Adım 2: GitHub Repository'ye Bağlama

### Mevcut Repository'ye Bağlama:

```bash
# Remote repository URL'ini ekle (GitHub repository URL'inizi kullanın)
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git

# Veya SSH kullanıyorsanız:
# git remote add origin git@github.com:KULLANICI_ADI/REPO_ADI.git

# Remote'u kontrol et
git remote -v
```

### Eğer Remote Zaten Varsa:

```bash
# Remote URL'ini kontrol et
git remote -v

# Eğer yanlışsa, düzelt:
git remote set-url origin https://github.com/KULLANICI_ADI/REPO_ADI.git
```

---

## Adım 3: GitHub'a Push

```bash
# Ana branch'i main olarak ayarla (eğer master kullanıyorsanız master yazın)
git branch -M main

# GitHub'a push et
git push -u origin main

# Eğer master branch kullanıyorsanız:
# git push -u origin master
```

### Eğer GitHub'da Zaten Dosyalar Varsa:

```bash
# Önce GitHub'daki değişiklikleri çek
git pull origin main --allow-unrelated-histories

# Çakışmaları çöz (eğer varsa)
# Sonra push et
git push -u origin main
```

---

## Adım 4: Netlify'da GitHub Bağlantısı

### 1. Netlify'a Giriş
- https://app.netlify.com adresine gidin
- Giriş yapın

### 2. GitHub Repository'yi Bağla
1. **"Add new site"** > **"Import an existing project"**
2. **"Deploy with GitHub"** butonuna tıklayın
3. GitHub hesabınızı bağlayın (izin verin)
4. Repository'nizi seçin (`kurtce-akorlar-main-2-3` veya proje adınız)

### 3. Build Ayarları
- **Build command:** (boş bırakın - static site)
- **Publish directory:** `.` (nokta)
- **Branch to deploy:** `main` (veya `master`)

### 4. Deploy!
- **"Deploy site"** butonuna tıklayın
- Birkaç saniye sonra siteniz canlı olacak!

---

## Otomatik Deploy (CI/CD)

### Her Push'ta Otomatik Deploy:
- Netlify otomatik olarak her `git push` işleminde siteyi yeniden deploy eder
- Pull request'ler için preview deploy'lar oluşturulur
- Production branch (main/master) için otomatik deploy

### Deploy Ayarları:
1. Netlify dashboard'da sitenize gidin
2. **"Site settings"** > **"Build & deploy"**
3. **"Continuous Deployment"** bölümünden ayarları yapın

---

## Hızlı Komutlar (Kopyala-Yapıştır)

```bash
# 1. Git durumunu kontrol et
git status

# 2. Değişiklikleri ekle
git add .

# 3. Commit yap
git commit -m "Add responsive design and Netlify config"

# 4. GitHub'a push et
git push origin main
```

---

## Sorun Giderme

### "fatal: not a git repository"
```bash
git init
```

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
```

### "Updates were rejected"
```bash
# Önce pull yap
git pull origin main --rebase

# Sonra push et
git push origin main
```

### "Authentication failed"
- GitHub'da Personal Access Token kullanın
- Veya SSH key ekleyin

---

## GitHub Repository URL'ini Bulma

1. GitHub'da repository'nize gidin
2. **"Code"** butonuna tıklayın
3. URL'yi kopyalayın:
   - HTTPS: `https://github.com/KULLANICI_ADI/REPO_ADI.git`
   - SSH: `git@github.com:KULLANICI_ADI/REPO_ADI.git`

---

## Sonraki Adımlar

1. ✅ GitHub'a push yaptınız
2. ✅ Netlify'da GitHub repository'yi bağladınız
3. ✅ Site canlı!
4. 🎉 Her `git push` işleminde otomatik deploy!

---

**Başarılar! 🚀**
