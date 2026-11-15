function returnToRiff(){if(window.parent!==window){window.parent.postMessage({type:'hellxbone:color-rock:close'},location.origin)}else location.href='../?game=mega-riff'}
document.querySelectorAll('.back-to-riff').forEach(b=>b.addEventListener('click',returnToRiff));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();returnToRiff()}});
