#!/usr/bin/env python3
"""Read public ICY StreamTitle for HELLXBONE, no third-party paid API."""
import json, re, ssl, time, urllib.request
from pathlib import Path

STATIONS=[
 ("METAL INTERNATIONAL","https://streams.radiobob.de/bob-metal/mp3-128/streams.radiobob.de/"),
 ("METALCORE","https://streams.radiobob.de/metalcore/mp3-128/streams.radiobob.de/"),
 ("NEW METAL","https://stream.starfm.de/newmetal/mp3-128/stream.starfm.de/"),
 ("RAMMSTEIN LIVE","https://bestofrockfm.stream.vip/rammstein/mp3-192/bestofrock.fm/")
]
def read_song(url):
 req=urllib.request.Request(url,headers={"Icy-MetaData":"1","User-Agent":"HELLXBONE-Radio/1.0"})
 with urllib.request.urlopen(req, timeout=15) as response:
  metaint=int(response.headers.get("icy-metaint","0"))
  if metaint<1 or metaint>1000000:return ""
  # Consume only the first metadata interval; never download an entire stream.
  remain=metaint
  while remain>0:
   block=response.read(min(remain,65536))
   if not block:return ""
   remain-=len(block)
  byte=response.read(1)
  if not byte:return ""
  meta=response.read(byte[0]*16).decode("utf-8","replace")
  found=re.search(r"StreamTitle=['\"](.*?)['\"];",meta,re.S)
  if not found:return ""
  title=re.sub(r"\s+"," ",found.group(1)).strip()
  if len(title)<4 or title.lower() in ("unknown","live","no title","-"):return ""
  return title[:160]

path=Path("radio-nowplaying.json")
try: previous=json.loads(path.read_text("utf-8"))
except (ValueError,OSError):previous={}
now=int(time.time())
result={"updated_at":now,"stations":[]}
for name,url in STATIONS:
 try:
  track=read_song(url)
 except Exception as e:
  print(name,": stream metadata unavailable:",str(e)[:130])
  track=""
 result["stations"].append({"name":name,"title":track,"updated_at":now if track else 0})
 print(name,repr(track))
path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
