// Test songs loading directly
const fs = require('fs');
const path = require('path');

try {
  // Read songs.json
  const songsPath = path.join(__dirname, 'assets', 'songs.json');
  const songsData = fs.readFileSync(songsPath, 'utf-8');
  const songs = JSON.parse(songsData);
  
  console.log(`✓ songs.json yüklendi: ${songs.length} şarkı`);
  console.log('Örnek şarkılar:');
  songs.slice(0, 3).forEach((s, i) => {
    console.log(`  ${i + 1}. "${s.song}" by "${s.artist}"`);
  });
  
  // Check if text files exist
  console.log('\nMetin dosyaları kontrol ediliyor:');
  let missing = 0;
  songs.slice(0, 5).forEach(s => {
    const slug = (s.song || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    
    const textPath = path.join(__dirname, 'assets', 'text', `${slug}.txt`);
    if (fs.existsSync(textPath)) {
      console.log(`  ✓ ${slug}.txt`);
    } else {
      console.log(`  ✗ ${slug}.txt (MISSING!)`);
      missing++;
    }
  });
  
  if (missing === 0) {
    console.log('\n✓ Tüm metinler mevcut!');
  }
  
} catch(err) {
  console.error('✗ Hata:', err.message);
}
