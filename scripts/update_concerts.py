#!/usr/bin/env python3
"""Actualisation prudente du catalogue concerts HELLXBONE.
Sources: catalogue publié Supabase + Ticketmaster via l'Edge Function existante.
Sans clé privée, sans extraction de dates fictives à partir d'articles.
"""
import concurrent.futures
import datetime as dt
import json
import pathlib
import re
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEST = ROOT / "concerts.json"
PROJECT = "https://ldibykpitjutratyqqax.supabase.co"
PUBLIC_KEY = "sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv"
PARIS = ZoneInfo("Europe/Paris")
TODAY = dt.datetime.now(PARIS).date()
GENRES = re.compile(r"metal|métal|rock|punk|hardcore|goth|darkwave|new wave|industrial|grunge|alternative|indie|post-punk|hard rock", re.I)
REGIONS = [
    ("Paris", 48.8566, 2.3522), ("Nantes", 47.2184, -1.5536),
    ("Lyon", 45.7640, 4.8357), ("Marseille", 43.2965, 5.3698),
    ("Lille", 50.6292, 3.0573), ("Bordeaux", 44.8378, -0.5792),
    ("Toulouse", 43.6047, 1.4442), ("Strasbourg", 48.5734, 7.7521),
    ("Rennes", 48.1173, -1.6778), ("Clermont-Ferrand", 45.7772, 3.0870),
    ("Montpellier", 43.6108, 3.8767), ("Nice", 43.7102, 7.2620),
    ("Tours", 47.3941, 0.6848), ("Dijon", 47.3220, 5.0415),
    ("Brest", 48.3904, -4.4861), ("Grenoble", 45.1885, 5.7245),
    ("Saint-Denis Réunion", -20.8789, 55.4481),
    ("Fort-de-France", 14.6037, -61.0742),
    ("Pointe-à-Pitre", 16.2411, -61.5331),
    ("Cayenne", 4.9224, -52.3135),
]
def get(url, headers=None):
    request = urllib.request.Request(url, headers={"User-Agent":"HELLXBONE-concert-feed/1.0", **(headers or {})})
    with urllib.request.urlopen(request, timeout=19) as response:
        return json.load(response)

def parse_day(value):
    if not value:
        return None
    try:
        v = str(value)
        if len(v) == 10:
            return dt.date.fromisoformat(v)
        return dt.datetime.fromisoformat(v.replace("Z","+00:00")).astimezone(PARIS).date()
    except ValueError:
        return None

def normalize(event):
    try:
        day = parse_day(event.get("date"))
        if not day or day < TODAY: return None
        title = str(event.get("artist") or "").strip()[:150]
        city = str(event.get("city") or "").strip()[:90]
        if not title or not city: return None
        source = str(event.get("source") or "").strip()
        if source and not source.startswith("https://"): source = ""
        ticket = str(event.get("tickets") or "").strip()
        if ticket and not ticket.startswith("https://"): ticket = ""
        if not (source or ticket or event.get("verified")): return None
        result = {"date":day.isoformat(),"artist":title,"city":city,
          "department":str(event.get("department") or "")[:3],
          "venue":str(event.get("venue") or "")[:120],
          "genre":str(event.get("genre") or "")[:100],
          "source":source,"tickets":ticket}
        if event.get("verified"):result["verified"]=True
        if event.get("id"):result["id"]=event["id"]
        lat,lon = event.get("lat"),event.get("lon")
        if lat is not None and lon is not None and -90<=float(lat)<=90 and -180<=float(lon)<=180:
            result["lat"],result["lon"]=round(float(lat),5),round(float(lon),5)
        return result
    except (TypeError,ValueError): return None

def from_db():
    url = PROJECT + "/rest/v1/hellx_concerts?select=id,title,venue,city,department,event_date,genre,latitude,longitude,ticket_url,source_url&published=eq.true&order=event_date.asc&limit=1000"
    rows=get(url,{"apikey":PUBLIC_KEY})
    return [normalize({"id":r["id"],"date":r["event_date"],"artist":r["title"],
        "city":r["city"],"department":r.get("department"),"venue":r.get("venue"),
        "genre":r.get("genre"),"source":r.get("source_url"),"tickets":r.get("ticket_url"),
        "lat":r.get("latitude"),"lon":r.get("longitude"),"verified":True}) for r in rows]

def from_ticketmaster(region):
    name, lat, lon = region
    params=urllib.parse.urlencode({"lat":lat,"lon":lon})
    url=PROJECT+"/functions/v1/concerts-ticketmaster?"+params
    data=get(url)
    if not data.get("configured",False):
        return []
    result=[]
    for e in data.get("events",[]):
        text=" ".join([str(e.get("genre") or ""),str(e.get("title") or "")])
        if not GENRES.search(text):continue
        result.append(normalize({"date":e.get("event_date"),"artist":e.get("title"),"city":e.get("city"),
            "venue":e.get("venue"),"genre":e.get("genre"),"tickets":e.get("ticket_url"),
            "source":e.get("ticket_url"),"lat":e.get("latitude"),"lon":e.get("longitude")}))
    print(f"{name}: {len(result)} concerts filtrés")
    return result

def from_datatourisme(region):
    """Utilise l'API DATAtourisme déjà configurée côté Supabase.
    Ne retient que les fiches datées mentionnant explicitement les styles ciblés.
    """
    name, lat, lon = region
    url=PROJECT+"/functions/v1/concerts-datatourisme?"+urllib.parse.urlencode({"lat":lat,"lon":lon})
    data=get(url)
    accepted=[]
    for x in data.get("objects",[]):
        title=x.get("label") or {}
        title=title.get("@fr","") if isinstance(title,dict) else str(title)
        descriptions=x.get("hasDescription") or []
        description=" ".join(str((item.get("description") or {}).get("@fr",""))[:1500] for item in descriptions if isinstance(item,dict))
        match=GENRES.search(title+" "+description)
        if not match or not title.strip():continue
        dates=x.get("takesPlaceAt") or []
        places=x.get("isLocatedAt") or []
        place=places[0] if places else {}
        address=(place.get("address") or [{}])[0]
        city_object=address.get("hasAddressCity") or {}
        department=city_object.get("isPartOfDepartment") or {}
        city=(city_object.get("label") or {}).get("@fr") or address.get("addressLocality") or ""
        geo=place.get("geo") or place.get("geoPoint") or {}
        lat2=geo.get("latitude",geo.get("lat"))
        lon2=geo.get("longitude",geo.get("lon"))
        venue=((place.get("label") or {}).get("@fr","") if isinstance(place.get("label"),dict) else "") or ""
        for date in dates[:8]:
            start=date.get("startDate")
            if not start:continue
            d=parse_day(start)
            if not d or d<TODAY:continue
            accepted.append(normalize({"date":d.isoformat(),"artist":title,
              "city":city,"department":department.get("insee",""),"venue":venue,
              "genre":match.group(0),"source":x.get("uri",""),
              "lat":lat2,"lon":lon2}))
    print(f"{name}: {len(list(filter(None,accepted)))} concerts rock/metal DATAtourisme")
    return [x for x in accepted if x]

def main():
    old=json.loads(DEST.read_text(encoding="utf-8")) if DEST.exists() else {"events":[]}
    events=[normalize(e) for e in old.get("events",[])]
    try:events+=from_db()
    except Exception as ex:print("Catalogue Supabase indisponible:",str(ex)[:160])
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for future in concurrent.futures.as_completed([pool.submit(from_ticketmaster,r) for r in REGIONS]):
            try:events+=future.result()
            except Exception as ex: print("Ticketmaster indisponible:",str(ex)[:160])
    # Requête progressive sur 4 zones par jour : couverture des 20 zones en 5 jours.
    offset=((TODAY.toordinal()//5)*4)%len(REGIONS)
    selected=[REGIONS[(offset+i)%len(REGIONS)] for i in range(4)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        for future in concurrent.futures.as_completed([pool.submit(from_datatourisme,r) for r in selected]):
            try:events+=future.result()
            except Exception as ex: print("DATAtourisme indisponible:",str(ex)[:160])
    grouped={}
    for e in filter(None,events):
        key=(e["date"],e["artist"].casefold(),e["city"].casefold())
        existing=grouped.get(key)
        if not existing or (e.get("id") and not existing.get("id")) or (e.get("tickets") and not existing.get("tickets")):grouped[key]=e
    output={"updated":dt.datetime.now(dt.timezone.utc).isoformat(),"events":sorted(grouped.values(),key=lambda x:(x["date"],x["artist"]))[:1500]}
    # Do not commit a timestamp-only change when events are unchanged.
    previous=old.get("events",[])
    if sorted(previous,key=lambda x:(x["date"],x["artist"]))==output["events"]:
        print("Catalogue inchangé:",len(previous));return
    DEST.write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Catalogue actualisé:",len(output["events"]))

if __name__=="__main__":main()
