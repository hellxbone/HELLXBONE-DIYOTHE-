(()=>{
let dialog,frame,opener;
function close(){if(!dialog?.open)return;window.HellxTelemetry?.gameEnd('Coloriages');dialog.close();opener?.focus()}
function open(){
window.HellxTelemetry?.gameStart('Coloriages');
opener=document.activeElement;
if(!dialog){
dialog=document.createElement('dialog');dialog.className='hellx-color-rock-dialog';dialog.setAttribute('aria-label','Color Rock — coloriages HELLXBONE');
frame=document.createElement('iframe');frame.title='Color Rock — coloriages par numéros';frame.src='./color-rock/';dialog.append(frame);document.body.append(dialog);
dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='hellxbone:color-rock:close')close()});
}
if(!dialog.open)dialog.showModal();
}
window.HellxColorRock={open,close};
})();
