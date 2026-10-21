import os, json, urllib.request, smtplib, ssl
from email.message import EmailMessage
from datetime import datetime, timezone

base=os.environ['SUPABASE_URL']
token=os.environ['SUPABASE_SERVICE_ROLE_KEY']
gmail=os.environ['GMAIL_ADDRESS']
password=os.environ['GMAIL_APP_PASSWORD']
headers={'apikey': token, 'Authorization': 'Bearer '+token}
path='/rest/v1/hellx_monthly_winner_contacts?select=month_start,player_name,score,full_name,address,postal_code,city,phone&email_sent_at=is.null'
req=urllib.request.Request(base+path, headers=headers)
with urllib.request.urlopen(req,timeout=20) as r:
    records=json.load(r)
for item in records:
    msg=EmailMessage()
    msg['Subject']='Gagnant du mois'
    msg['From']=gmail
    msg['To']=gmail
    msg.set_content(
        'MÉGA RIFF — mois : '+item['month_start']+'\n'
        +'Pseudo : '+item['player_name']+'\n'
        +'Score : '+str(item['score'])+'\n'
        +'Nom : '+item['full_name']+'\n'
        +'Adresse : '+item['address']+'\n'
        +'Ville : '+item['postal_code']+' '+item['city']+'\n'
        +'Téléphone : '+item['phone']+'\n'
    )
    with smtplib.SMTP_SSL('smtp.gmail.com',465,context=ssl.create_default_context(),timeout=30) as s:
        s.login(gmail,password)
        s.send_message(msg)
    data=json.dumps({'email_sent_at':datetime.now(timezone.utc).isoformat()}).encode()
    patch=urllib.request.Request(base+'/rest/v1/hellx_monthly_winner_contacts?month_start=eq.'+item['month_start'],headers={**headers,'Content-Type':'application/json'},data=data,method='PATCH')
    with urllib.request.urlopen(patch,timeout=20) as r:
        r.read()
print('Notification run complete')
