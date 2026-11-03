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
NON_CONCERT = re.compile(r"appel aux dons|exposition|portes ouvertes|marché artisanal|brocante|vide.grenier|atelier|conférence|visite guidée|repas|loto|soirée dansante|karaoké|théâtre|cinéma|projection|collecte|randonnée",re.I)
MUSIC_EVENT = re.compile(r"concert|festival|live|musique|music|groupe|band|rock|metal|métal|punk|hardcore|blues|grunge|darkwave|goth",re.I)
REGIONS = [
    ("Paris", 48.8566, 2.3522), ("Nantes", 47.2184, -1.5536),
    ("Lyon", 45.7640, 4.8357), ("Marseille", 43.2965, 5.3698),
    ("Lille", 50.6292, 3.0573), ("Bordeaux", 44.8378, -0.5792),
    ("Toulouse", 43.6047, 1.4442), ("Strasbourg", 48.5734, 7.7521),
    ("Rennes", 48.1173, -1.6778), ("Clermont-Ferrand", 45.7772, 3.0870),
    ("Montpellier", 43.6108, 3.8767), ("Nice", 43.7102, 7.2620),
    ("Tours", 47.3941, 0.6848), ("Dijon", 47.3220, 5.0415),
    ("Brest", 48.3904, -4.4861), ("Grenoble", 45.1885, 5.7245),
    ("Angers",47.4784,-0.5632), ("Cholet",47.0600,-0.8783),
    ("Clisson",47.0870,-1.2830), ("La Roche-sur-Yon",46.6705,-1.4260),
    ("Saint-Nazaire",47.2735,-2.2137), ("Le Mans",48.0061,0.1996),
    ("Vannes",47.6582,-2.7608), ("Lorient",47.7483,-3.3702),
    ("Quimper",47.9960,-4.1025), ("Saint-Brieuc",48.5142,-2.7658),
    ("Caen",49.1829,-0.3707), ("Rouen",49.4431,1.0993),
    ("Reims",49.2583,4.0317), ("Nancy",48.6921,6.1844),
    ("Metz",49.1193,6.1757), ("Orléans",47.9029,1.9093),
    ("Poitiers",46.5802,0.3404), ("Limoges",45.8336,1.2611),
    ("La Rochelle",46.1603,-1.1511), ("Pau",43.2951,-0.3708),
    ("Bayonne",43.4929,-1.4748), ("Perpignan",42.6887,2.8948),
    ("Avignon",43.9493,4.8055), ("Nîmes",43.8367,4.3601),
    ("Saint-Étienne",45.4397,4.3872), ("Annecy",45.8992,6.1294),
    ("Chambéry",45.5646,5.9178), ("Besançon",47.2378,6.0241),
    ("Belfort",47.6397,6.8638), ("Mulhouse",47.7508,7.3359),
    ("Troyes",48.2973,4.0744), ("Amiens",49.8941,2.2958),
    ("Arras",50.2910,2.7775), ("Valenciennes",50.3571,3.5233),
    ("Ajaccio",41.9192,8.7386), ("Bastia",42.6973,9.4509),
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
        if not title or not city or NON_CONCERT.search(title): return None
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
        if not match or not title.strip() or NON_CONCERT.search(title):continue
        if not MUSIC_EVENT.search(title) and not re.search(r'concert|sur scène|performance musicale|musique live|live music',description,re.I):continue
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
    # Couverture tournante de 12 zones par jour, petites villes incluses.
    offset=(TODAY.toordinal()*12)%len(REGIONS)
    selected=[REGIONS[(offset+i)%len(REGIONS)] for i in range(12)]
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
