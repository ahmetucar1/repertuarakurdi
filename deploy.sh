#!/bin/bash

# Netlify Deploy Script
# Bu script projeyi Netlify'a deploy eder

echo "🚀 Netlify Deploy Başlatılıyor..."
echo ""

# Netlify CLI kontrolü
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI bulunamadı!"
    echo ""
    echo "Kurulum için:"
    echo "  npm install -g netlify-cli"
    echo ""
    echo "Veya web arayüzünden deploy edin:"
    echo "  1. https://app.netlify.com adresine gidin"
    echo "  2. 'Add new site' > 'Deploy manually' seçin"
    echo "  3. Bu klasörü sürükleyip bırakın"
    exit 1
fi

# Netlify login kontrolü
if ! netlify status &> /dev/null; then
    echo "🔐 Netlify'a giriş yapmanız gerekiyor..."
    netlify login
fi

# Deploy seçeneği
echo "Deploy seçeneği:"
echo "  1) Preview deploy (test için)"
echo "  2) Production deploy (canlı site)"
read -p "Seçiminiz (1/2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "📦 Preview deploy başlatılıyor..."
    netlify deploy
elif [ "$choice" == "2" ]; then
    echo ""
    echo "🌐 Production deploy başlatılıyor..."
    netlify deploy --prod
else
    echo "❌ Geçersiz seçim!"
    exit 1
fi

echo ""
echo "✅ Deploy tamamlandı!"
echo "📱 Site URL'inizi Netlify dashboard'dan görebilirsiniz."
