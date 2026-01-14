#!/usr/bin/env python3
import json
import re
import unicodedata
import html
from urllib.parse import quote
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

ROOT = Path(__file__).resolve().parents[1]
SONGS_PATH = ROOT / "assets" / "songs.json"
TEXT_DIR = ROOT / "assets" / "text"
TEMPLATE_PATH = ROOT / "song.html"
SONG_OUT_DIR = ROOT / "song"
SITEMAP_PATH = ROOT / "sitemap.xml"

SEO_DOMAIN = "https://repertuarakurdi.com"
SEO_IMAGE = f"{SEO_DOMAIN}/assets/og/og-image.png"

TEXT_SLUG_OVERRIDES = {
  "pdf2.pdf|68": "beritan-koma-amara",
  "pdf3.pdf|15": "rewend-aynur-dogan",
  "pdf3.pdf|17": "diyarbekir-bajar",
  "pdf3.pdf|19": "newroz-bajar",
  "pdf3.pdf|57": "keca-peri-kerem-gerdenzeri",
  "pdf3.pdf|94": "beje-sidar",
  "pdf3.pdf|109": "azadi-yunis-das",
}


def slugify_common(text):
  if text is None:
    return ""
  value = str(text).lower()
  value = unicodedata.normalize("NFD", value)
  value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
  value = value.replace("ı", "i")
  value = re.sub(r"\s+", "-", value)
  value = re.sub(r"[^a-z0-9-]", "", value)
  value = re.sub(r"-+", "-", value)
  value = re.sub(r"^-|-+$", "", value)
  return value


def slugify_text(text):
  if text is None:
    return ""
  value = str(text).lower()
  value = unicodedata.normalize("NFD", value)
  value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
  value = re.sub(r"\s+", "-", value)
  value = re.sub(r"[^a-z0-9-]", "", value)
  return value


def song_id_to_slug(value):
  return (
    str(value or "")
    .lower()
    .replace(".pdf", "")
    .replace("|", "-")
  )


def build_song_slug(song):
  base = slugify_common(song.get("song", ""))
  artist = slugify_common(song.get("artist", ""))
  id_slug = slugify_common(song_id_to_slug(song.get("id", "")))
  parts = [p for p in [base, artist, id_slug] if p]
  return "-".join(parts) or "song"


def get_text_slug(song):
  song_id = song.get("id", "")
  if song_id in TEXT_SLUG_OVERRIDES:
    return TEXT_SLUG_OVERRIDES[song_id]
  return slugify_text(song.get("song", ""))


def replace_by_id(html_text, element_id, new_text):
  pattern = re.compile(rf"(<[^>]*\bid=\"{re.escape(element_id)}\"[^>]*>)(.*?)(</[^>]+>)", re.S)
  def repl(match):
    return f"{match.group(1)}{new_text}{match.group(3)}"
  return pattern.sub(repl, html_text, count=1)


def inject_head_meta(html_text, title, description, canonical, canonical_tr):
  escaped_title = html.escape(title)
  escaped_desc = html.escape(description)
  meta = "\n".join([
    f"  <meta name=\"description\" content=\"{escaped_desc}\" />",
    f"  <meta property=\"og:title\" content=\"{escaped_title}\" />",
    f"  <meta property=\"og:description\" content=\"{escaped_desc}\" />",
    f"  <meta property=\"og:type\" content=\"music.song\" />",
    f"  <meta property=\"og:url\" content=\"{canonical}\" />",
    f"  <meta property=\"og:image\" content=\"{SEO_IMAGE}\" />",
    f"  <meta property=\"og:image:secure_url\" content=\"{SEO_IMAGE}\" />",
    "  <meta property=\"og:image:type\" content=\"image/png\" />",
    "  <meta property=\"og:image:width\" content=\"1200\" />",
    "  <meta property=\"og:image:height\" content=\"630\" />",
    "  <meta name=\"twitter:card\" content=\"summary_large_image\" />",
    f"  <meta name=\"twitter:title\" content=\"{escaped_title}\" />",
    f"  <meta name=\"twitter:description\" content=\"{escaped_desc}\" />",
    f"  <meta name=\"twitter:image\" content=\"{SEO_IMAGE}\" />",
    f"  <link rel=\"canonical\" href=\"{canonical}\" />",
    f"  <link rel=\"alternate\" hreflang=\"ku\" href=\"{canonical}\" />",
    f"  <link rel=\"alternate\" hreflang=\"tr\" href=\"{canonical_tr}\" />",
    f"  <link rel=\"alternate\" hreflang=\"x-default\" href=\"{canonical}\" />",
  ])
  def repl(match):
    return f"{match.group(1)}{escaped_title}{match.group(3)}\n{meta}"
  return re.sub(r"(<title>)(.*?)(</title>)", repl, html_text, count=1, flags=re.S)


def build_song_page(template, song):
  song_title = (song.get("song") or "").strip()
  artist = (song.get("artist") or "").strip()
  key = (song.get("key") or "-").strip()
  rhythm = (song.get("ritim") or "-").strip()
  text_slug = get_text_slug(song)
  text_path = TEXT_DIR / f"{text_slug}.txt"
  song_text = text_path.read_text() if text_path.exists() else ""

  slug = build_song_slug(song)
  canonical = f"{SEO_DOMAIN}/song/{slug}"
  canonical_tr = f"{SEO_DOMAIN}/tr/song/{slug}"

  title = f"{song_title} — {artist} | Repertûara Kurdî".strip()
  description = f"{song_title} ji {artist}. Gotin, akor, tonê orîjînal û govend.".strip()

  page = template
  page = inject_head_meta(page, title, description, canonical, canonical_tr)
  page = replace_by_id(page, "songName", html.escape(song_title or "—"))
  page = replace_by_id(page, "songArtist", html.escape(artist or "—"))
  page = replace_by_id(page, "origKey", html.escape(key or "—"))
  page = replace_by_id(page, "songRhythm", html.escape(rhythm or "-"))
  page = replace_by_id(page, "songText", html.escape(song_text))

  if song.get("ritimVideo"):
    page = page.replace('id="ritimVideoBtn" class="btn btn--ghost btn--sm rhythmBtn" href="#"',
                        f'id="ritimVideoBtn" class="btn btn--ghost btn--sm rhythmBtn is-visible" href="{html.escape(song.get("ritimVideo"))}"')

  return slug, page


def build_sitemap(songs):
  lastmod = datetime.utcnow().strftime("%Y-%m-%d")
  urls = []

  def add(url):
    urls.append(f"  <url>\n    <loc>{xml_escape(url)}</loc>\n    <lastmod>{lastmod}</lastmod>\n  </url>")

  add(f"{SEO_DOMAIN}/")
  add(f"{SEO_DOMAIN}/tr/")
  add(f"{SEO_DOMAIN}/all.html")
  add(f"{SEO_DOMAIN}/tr/all.html")

  artists = sorted({(s.get("artist") or "").strip() for s in songs if s.get("artist")})
  for artist in artists:
    encoded = quote(artist, safe="")
    add(f"{SEO_DOMAIN}/artist.html?name={encoded}")
    add(f"{SEO_DOMAIN}/tr/artist.html?name={encoded}")

  for song in songs:
    slug = build_song_slug(song)
    add(f"{SEO_DOMAIN}/song/{slug}")
    add(f"{SEO_DOMAIN}/tr/song/{slug}")

  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" + "\n".join(urls) + "\n</urlset>\n"


def main():
  template = TEMPLATE_PATH.read_text()
  songs = json.loads(SONGS_PATH.read_text())

  SONG_OUT_DIR.mkdir(exist_ok=True)
  for song in songs:
    slug, page = build_song_page(template, song)
    out_dir = SONG_OUT_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(page)

  sitemap = build_sitemap(songs)
  SITEMAP_PATH.write_text(sitemap)


if __name__ == "__main__":
  main()
