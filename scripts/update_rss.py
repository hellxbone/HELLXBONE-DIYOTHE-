#!/usr/bin/env python3
"""Build an attributed combined rock and metal news index."""
import datetime as dt
import email.utils
import json
import pathlib
import urllib.request
import xml.etree.ElementTree as ET
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urlparse

FEEDS = [("Metalorgie", "https://www.metalorgie.com/feed/news", ("metalorgie.com", "www.metalorgie.com")), ("MetalZone", "https://www.metalzone.fr/feed/", ("metalzone.fr", "www.metalzone.fr")), ("InfoLux", "https://www.info-lux.com/category/themes/musique/rock-metal/feed/", ("info-lux.com", "www.info-lux.com"))]
OUTPUT = pathlib.Path("metal-news.json")

class StripHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        self.parts.append(data)

def clean(value):
    parser = StripHTML()
    parser.feed(value or "")
    return " ".join(unescape(" ".join(parser.parts)).split())

def build():
    items = []
    errors = []
    for source, feed_url, allowed_hosts in FEEDS:
        try:
            req = urllib.request.Request(feed_url, headers={"User-Agent": "HELLXBONE-RSS-Reader/1.0 (+https://hellxbone.github.io/HELLXBONE-DIYOTHE-/)"})
            with urllib.request.urlopen(req, timeout=25) as response:
                root = ET.fromstring(response.read(2_000_000))
            source_items = []
            for item in root.findall("./channel/item"):
                title = clean(item.findtext("title"))
                link = (item.findtext("link") or "").strip()
                parsed = urlparse(link)
                if not title or parsed.scheme != "https" or parsed.hostname not in allowed_hosts:
                    continue
                published = item.findtext("pubDate") or ""
                try:
                    date = email.utils.parsedate_to_datetime(published).astimezone(dt.timezone.utc).isoformat()
                except (ValueError, TypeError):
                    date = ""
                source_items.append({"title": title[:220], "url": link, "date": date,
                                     "summary": clean(item.findtext("description"))[:260], "source": source})
                if len(source_items) >= 16:
                    break
            if not source_items:
                raise RuntimeError("Flux sans actualités")
            items.extend(source_items)
        except Exception as exc:
            errors.append(f"{source}: {exc}")
            # Preserve cached entries from the source if its feed temporarily fails.
            if OUTPUT.exists():
                try:
                    cached = json.loads(OUTPUT.read_text(encoding="utf-8"))
                    items.extend(x for x in cached.get("items", []) if x.get("source") == source)
                except (ValueError, OSError):
                    pass
    if not items:
        raise RuntimeError("Aucun flux disponible : " + "; ".join(errors))
    items = sorted({item["url"]: item for item in items}.values(), key=lambda x: x["date"], reverse=True)
    OUTPUT.write_text(json.dumps({"updated": dt.datetime.now(dt.timezone.utc).isoformat(),
                                  "items": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    build()
