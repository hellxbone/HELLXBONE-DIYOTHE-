/* HELLXBONE — durée des visites, sans identifiant ni donnée personnelle.
   Les événements sont envoyés à GoatCounter, déjà présent sur le site.
   Comptabilise le temps réellement visible, en excluant l'écoute en arrière-plan. */
(function () {
  'use strict';
  var visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
  var visibleMs = 0, sent = false;
  var startedAt = Date.now();
  function seconds() {
    return Math.floor((visibleMs + (visibleSince ? Date.now() - visibleSince : 0)) / 1000);
  }
  function send() {
    var sec = seconds();
    if (sec < 3 || sent) return;
    if (!window.goatcounter || typeof window.goatcounter.count !== 'function') return;
    var bucket = sec < 60 ? 'moins-de-1-min' : sec < 300 ? '1-a-5-min' :
      sec < 900 ? '5-a-15-min' : sec < 1800 ? '15-a-30-min' : 'plus-de-30-min';
    // Une seule mesure par ouverture; chaque catégorie regroupe une durée de visite.
    window.goatcounter.count({path:'duree-visite/'+bucket, title:'Durée de visite — '+bucket, event:true});
    sent = true;
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      if (visibleSince) visibleMs += Date.now() - visibleSince;
      visibleSince = 0;
      send();
    } else {
      visibleSince = Date.now();
    }
  });
  window.addEventListener('pagehide', send);
  // Fallback si la page reste ouverte très longtemps, ou fermeture sans pagehide.
  window.setInterval(function () { if (seconds() >= 1800) send(); }, 60000);
})();
