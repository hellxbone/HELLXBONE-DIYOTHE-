#!/usr/bin/env python3
"""Build a small attributed news index from Metalorgie's official RSS feed."""
import datetime as dt
import email.utils
import json
import pathlib
import urllib.request
import xml.etree.ElementTree as ET
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urlparse

FEED = "https://www.metalorgie.com/feed/news"
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
    req = urllib.request.Request(FEED, headers={"User-Agent": "HELLXBONE-RSS-Reader/1.0 (+https://hellxbone.github.io/HELLXBONE-DIYOTHE-/)"})
    with urllib.request.urlopen(req, timeout=25) as response:
        root = ET.fromstring(response.read(2_000_000))
    items = []
    for item in root.findall("./channel/item"):
        title = clean(item.findtext("title"))
        link = (item.findtext("link") or "").strip()
        parsed = urlparse(link)
        if not title or parsed.scheme != "https" or parsed.hostname not in ("metalorgie.com", "www.metalorgie.com"):
            continue
        published = item.findtext("pubDate") or ""
        try:
            date = email.utils.parsedate_to_datetime(published).astimezone(dt.timezone.utc).isoformat()
        except (ValueError, TypeError):
            date = ""
        items.append({"title": title[:220], "url": link, "date": date,
                      "summary": clean(item.findtext("description"))[:260], "source": "Metalorgie"})
        if len(items) >= 16:
            break
    if not items:
        raise RuntimeError("Flux sans actualités : ancien fichier conservé")
    OUTPUT.write_text(json.dumps({"updated": dt.datetime.now(dt.timezone.utc).isoformat(),
                                  "items": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    build()
