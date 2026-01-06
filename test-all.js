const fs = require('fs');
const path = require('path');

// Simulate loading songs.json
function loadSongsSync() {
  const songsPath = path.join(__dirname, 'assets', 'songs.json');
  const data = fs.readFileSync(songsPath, 'utf-8');
  const songs = JSON.parse(data);
  
  // Simulate mergeSongs (basic version)
  return songs.map(s => ({
    ...s,
    pending: false,
    approved: false,
    submissionId: ""
  }));
}

// Simulate render function
function testRender() {
  const SONGS = loadSongsSync();
  
  console.log(`\n=== ALL.JS RENDER TEST ===`);
  console.log(`✓ SONGS loaded: ${SONGS.length} items`);
  
  let items = SONGS;
  
  // Test with default filters (no search, no pending filter)
  const filterBy = "all";
  const sortBy = "title-asc";
  const qv = "";
  
  console.log(`\nFilter: ${filterBy}`);
  console.log(`Sort: ${sortBy}`);
  console.log(`Search: "${qv}"`);
  
  if (filterBy === "pending") {
    items = items.filter(s => s.pending);
    console.log(`  → After pending filter: ${items.length} items`);
  }
  
  if (items.length === 0) {
    console.log(`\n✗ ERROR: items.length === 0 -> "Tınne" would be shown!`);
    return false;
  }
  
  console.log(`\n✓ Would render ${items.length} items`);
  console.log(`\nFirst 5 songs that would be shown:`);
  items.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i+1}. "${s.song}" by "${s.artist}"`);
  });
  
  return true;
}

try {
  const success = testRender();
  if (success) {
    console.log(`\n✓ TEST PASSED: all.js should work correctly`);
  } else {
    console.log(`\n✗ TEST FAILED: Issue found above`);
  }
} catch(err) {
  console.error(`\n✗ ERROR: ${err.message}`);
  console.error(err.stack);
}
