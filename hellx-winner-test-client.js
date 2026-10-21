(()=>{
const base='https://ldibykpitjutratyqqax.supabase.co';
const key='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
const $=id=>document.getElementById(id);
let accessToken='';
const note=s=>$('status').textContent=s;
async function auth(path,body){
 const r=await fetch(base+'/auth/v1/'+path,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const result=await r.json();
 if(!r.ok)throw Error(result.msg||result.error_description||result.message||'Opération impossible');
 return result;
}
$('request').onclick=async()=>{
 try{await auth('otp',{email:'diyothe@gmail.com',create_user:true});note('Vérifie ta boîte Gmail pour le code.')}
 catch(e){note(e.message)}
};
$('verify').onclick=async()=>{
 try{
  const result=await auth('verify',{email:'diyothe@gmail.com',token:$('code').value.trim(),type:'email'});
  if(!result.access_token)throw Error('Code invalide');
  accessToken=result.access_token;$('login').hidden=true;$('details').hidden=false;note('Accès validé.');
 }catch(e){note(e.message)}
};
$('details').onsubmit=async e=>{
 e.preventDefault();if(!accessToken)return;
 const data=Object.fromEntries(new FormData($('details')).entries());data.consent=$('consent').checked;
 try{
  const r=await fetch(base+'/functions/v1/hellx-winner-admin-test',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify(data)});
  const result=await r.json();
  if(!r.ok)throw Error(result.error||'Enregistrement refusé');
  note('TEST ENREGISTRÉ. Consulte la table hellx_winner_test_contacts dans Supabase.');
  $('details').hidden=true;
 }catch(e){note(e.message)}
};
})();