#!/bin/bash

# GitHub'a Push Script
# Bu script projeyi GitHub'a push eder

echo "📦 GitHub'a Push Başlatılıyor..."
echo ""

# Git repository kontrolü
if [ ! -d ".git" ]; then
    echo "❌ Git repository bulunamadı!"
    echo ""
    read -p "Git repository başlatılsın mı? (y/n): " init_choice
    if [ "$init_choice" == "y" ]; then
        git init
        echo "✅ Git repository başlatıldı"
    else
        echo "❌ İşlem iptal edildi"
        exit 1
    fi
fi

# Remote kontrolü
if ! git remote | grep -q "origin"; then
    echo "🔗 GitHub repository URL'i gerekiyor"
    echo ""
    echo "Örnek: https://github.com/KULLANICI_ADI/REPO_ADI.git"
    read -p "GitHub repository URL'inizi girin: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ URL girilmedi, işlem iptal edildi"
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ Remote repository eklendi: $repo_url"
else
    echo "✅ Remote repository mevcut:"
    git remote -v
    echo ""
    read -p "Farklı bir repository kullanmak ister misiniz? (y/n): " change_remote
    if [ "$change_remote" == "y" ]; then
        read -p "Yeni repository URL'i: " new_url
        git remote set-url origin "$new_url"
        echo "✅ Remote URL güncellendi"
    fi
fi

# Değişiklikleri kontrol et
echo ""
echo "📋 Değişiklikler kontrol ediliyor..."
git status

echo ""
read -p "Tüm değişiklikleri eklemek istiyor musunuz? (y/n): " add_choice
if [ "$add_choice" == "y" ]; then
    git add .
    echo "✅ Dosyalar eklendi"
fi

# Commit mesajı
echo ""
read -p "Commit mesajı (Enter = varsayılan): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update: Add responsive design and Netlify config"
fi

git commit -m "$commit_msg"
echo "✅ Commit yapıldı: $commit_msg"

# Branch kontrolü
current_branch=$(git branch --show-current 2>/dev/null || echo "main")
echo ""
echo "📍 Mevcut branch: $current_branch"

# Push
echo ""
read -p "GitHub'a push edilsin mi? (y/n): " push_choice
if [ "$push_choice" == "y" ]; then
    echo ""
    echo "🚀 GitHub'a push ediliyor..."
    
    # İlk push ise -u flag'i ekle
    if ! git ls-remote --heads origin "$current_branch" | grep -q "$current_branch"; then
        git push -u origin "$current_branch"
    else
        git push origin "$current_branch"
    fi
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Başarıyla push edildi!"
        echo ""
        echo "📝 Sonraki adımlar:"
        echo "   1. Netlify'da GitHub repository'yi bağlayın"
        echo "   2. Otomatik deploy aktif olacak!"
    else
        echo ""
        echo "❌ Push başarısız oldu"
        echo "   Hata mesajını kontrol edin"
    fi
else
    echo "ℹ️  Push iptal edildi"
    echo "   Manuel olarak push etmek için: git push origin $current_branch"
fi

echo ""
echo "✨ İşlem tamamlandı!"
