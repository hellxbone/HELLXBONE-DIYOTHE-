(() => {
  'use strict';
  const RIFF_URL = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Double_tracked_distorted_electric_guitar_playing_chords.ogg';
  let idleTimer = null;
  let clip = null;
  function gameOpen() {
    const game = document.getElementById('hellx-riff-crush');
    return game && !game.hidden && Number(document.getElementById('riff-moves')?.textContent || 0) > 0;
  }
  function stopTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = null;
  }
  function resetTimer() {
    stopTimer();
    if (!gameOpen() || document.hidden) return;
    idleTimer = setTimeout(() => {
      idleTimer = null;
      if (!gameOpen() || document.hidden || document.querySelector('.riff-sound')?.textContent.includes('OFF')) return;
      try {
        if (clip) { clip.pause(); clip.currentTime = 0; }
        clip = new Audio(RIFF_URL);
        clip.volume = 0.50;
        clip.play().catch(() => {});
      } catch (_) {}
    }, 10000);
  }
  document.addEventListener('pointerdown', resetTimer, true);
  document.addEventListener('keydown', resetTimer, true);
  document.addEventListener('visibilitychange', resetTimer);
  document.addEventListener('click', (event) => {
    if (event.target.closest('.riff-close') && clip) clip.pause();
    setTimeout(resetTimer, 0);
  }, true);
  const observer = new MutationObserver(resetTimer);
  const observeGame = () => {
    const game = document.getElementById('hellx-riff-crush');
    if (!game) { setTimeout(observeGame, 500); return; }
    observer.observe(game, {attributes:true, attributeFilter:['hidden']});
    resetTimer();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeGame);
  else observeGame();
})();
