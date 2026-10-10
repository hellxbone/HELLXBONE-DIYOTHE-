#!/usr/bin/env python3
"""Generate social cards and accessible share pages for Metalorgie news."""
import json, re, html, textwrap
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parent.parent
FEED=ROOT/"metal-news.json"
OUT=ROOT/"rss-share"
OUT.mkdir(exist_ok=True)
BASE="https://hellxbone.github.io/HELLXBONE-DIYOTHE-/"
items=json.loads(FEED.read_text(encoding="utf-8"))
font_path="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
bold=lambda n: ImageFont.truetype(font_path,n)
for item in items.get("items",[]):
    url=item.get("url","")
    if urlparse(url).netloc not in ("metalorgie.com","www.metalorgie.com"):
        continue
    m=re.search(r"/news/(\d+)",url)
    if not m: continue
    slug="actu-"+m.group(1)
    title=item.get("title","Actualité rock metal").strip()
    hook=("POWER TRIP FRAPPE FORT : 2 NOUVEAUX TITRES !" if re.search(r"power trip",title,re.I)
          else "ROCK & METAL : "+title.rstrip(" !.").upper()+" !")
    summary=item.get("summary","Toute l'actualité metal à découvrir.")
    image_name=slug+".png"
    page_name=slug+".html"
    img=Image.new("RGB",(1200,630),(8,10,9))
    d=ImageDraw.Draw(img)
    for y in range(630):
        d.line((0,y,1200,y),fill=(8, 10+int(y/60), 8))
    d.rectangle((0,0,1200,16),fill=(138,255,67))
    d.rectangle((54,65,1146,565),outline=(138,255,67),width=3)
    d.text((80,91),"HELLXBONE  /  ACTU ROCK & METAL",font=bold(39),fill=(143,255,72))
    d.line((80,160,1120,160),fill=(95,132,65),width=3)
    size=67
    while size>32:
        font=bold(size)
        lines=[]
        words=hook.split()
        line=""
        for word in words:
            trial=(line+" "+word).strip()
            if d.textbbox((0,0),trial,font=font)[2]>1020 and line:
                lines.append(line);line=word
            else:line=trial
        if line:lines.append(line)
        if len(lines)<=4:break
        size-=4
    y=190
    for line in lines[:4]:
        d.text((80,y),line,font=font,fill="white")
        y+=size+19
    d.text((80,521),"UNE ACTU À DÉCOUVRIR • SOURCE : METALORGIE",font=bold(23),fill=(143,255,72))
    img.save(OUT/image_name,optimize=True)
    page_url=BASE+"rss-share/"+page_name
    image_url=BASE+"rss-share/"+image_name
    def attr(v):return html.escape(str(v),quote=True)
    page=f"""<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{attr(hook)} | HELLXBONE</title><meta name="description" content="{attr(summary[:230])}">
<meta property="og:type" content="article"><meta property="og:site_name" content="HELLXBONE"><meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{attr(hook)}"><meta property="og:description" content="{attr(summary[:230])}">
<meta property="og:url" content="{attr(page_url)}"><meta property="og:image" content="{attr(image_url)}">
<meta property="og:image:secure_url" content="{attr(image_url)}"><meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{attr(image_url)}">
<link rel="canonical" href="{attr(page_url)}">
<style>body{{background:#080a08;color:#fff;font-family:system-ui,sans-serif;max-width:800px;margin:30px auto;padding:20px}}img{{width:100%;height:auto}}a{{color:#a7ff69}}.cta{{display:inline-block;padding:16px;background:#8fff46;color:#080808;font-weight:bold;border-radius:9px}}p{{line-height:1.6}}</style></head><body>
<a href="{attr(BASE)}">← HELLXBONE</a><h1>{html.escape(hook)}</h1><img src="{attr(image_name)}" alt="{attr(hook)}">
<p>{html.escape(summary[:600])}</p><p>Source : Metalorgie. Article publié par un média indépendant de HELLXBONE.</p>
<a class="cta" href="{attr(url)}" rel="noopener noreferrer">Lire l'article original sur Metalorgie →</a>
</body></html>"""
    (OUT/page_name).write_text(page,encoding="utf-8")
    item["shareUrl"]=page_url
    item["shareImage"]=image_url
    item["shareTitle"]=hook
FEED.write_text(json.dumps(items,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Generated",len(list(OUT.glob("*.html"))),"share pages")
