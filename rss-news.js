/* HELLXBONE: external RSS headlines, distinct from original editorial content. */
window.HellxRSS = {
  async mount(id) {
    const node = document.getElementById(id);
    if (!node) return;
    try {
      const res = await fetch('./metal-news.json?ts=' + Date.now(), {cache:'no-store'});
      if (!res.ok) throw new Error('Flux indisponible');
      const feed = await res.json();
      const parisDay = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'});
      const today = parisDay.format(new Date());
      const items = Array.isArray(feed.items) ? feed.items.filter(item => {
        if (!item.date) return false;
        const published = new Date(item.date);
        return !Number.isNaN(published.getTime()) && parisDay.format(published) === today;
      }).slice(0,12) : [];
      if (!items.length) { node.innerHTML = '<p>Aucun nouvel article Metalorgie publié aujourd’hui.</p>'; return; }
      const escapeHTML = (s) => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      node.replaceChildren();
      for (const item of items) {
        if (!/^https:\/\/(www\.)?metalorgie\.com\//.test(item.url || '')) continue;
        const article = document.createElement('article');
        article.className = 'card hellx-rss-entry';
        const h = document.createElement('h3');
        const a = document.createElement('a');
        a.href = item.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = item.title;
        h.append(a);
        const meta = document.createElement('p');
        meta.className = 'hellx-rss-meta';
        const date = item.date ? new Date(item.date) : null;
        meta.textContent = 'Metalorgie' + (date && !isNaN(date.valueOf()) ? ' · ' + date.toLocaleDateString('fr-FR') : '');
        article.append(h,meta);
        if (item.summary) {
          const p = document.createElement('p');
          p.textContent = item.summary;
          article.append(p);
        }
        // Use the same share controls and event delegation as HELLXBONE articles.
        const share = document.createElement('div');
        share.className = 'share-row';
        const label = document.createElement('span');
        label.className = 'share-label';
        label.textContent = '📣 Partager cette actualité';
        share.append(label);
        for (const [platform, title, css] of [
          ['facebook','Facebook','facebook'],
          ['sms','💬 SMS','sms'],
          ['messenger','💙 Messenger','messenger'],
          ['whatsapp','🟢 WhatsApp','whatsapp']
        ]) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'share-btn ' + css;
          button.dataset.share = platform;
          button.dataset.shareTitle = item.title || 'Actualité rock & metal';
          button.dataset.shareUrl = platform === 'facebook' ? (item.shareUrl || item.url) : item.url;
          button.dataset.shareExcerpt = item.summary || '';
          button.textContent = title;
          share.append(button);
        }
        article.append(share);
        node.append(article);
      }
    } catch (err) {
      node.innerHTML = '<p>Les dernières news ne sont pas disponibles pour le moment. <a href="https://www.metalorgie.com/" target="_blank" rel="noopener noreferrer">Voir les actualités sur Metalorgie ↗</a></p>';
    }
  },
  async mountMixed(feedId, gridId) {
    await this.mount(feedId);
    const source = document.getElementById(feedId);
    const grid = document.getElementById(gridId);
    if (!source || !grid) return;
    const external = [...source.querySelectorAll('.hellx-rss-entry')];
    if (!external.length) return;
    const own = [...grid.children];
    // Prioritize the original HELLXBONE stories, then weave in Metalorgie updates.
    let lastInserted = null;
    for (let n=0; n<external.length; n++) {
      const item = external[n];
      item.setAttribute('aria-label','Actualité externe Metalorgie');
      const meta = item.querySelector('.hellx-rss-meta');
      if (meta) meta.textContent = 'SOURCE : METALORGIE · ' + meta.textContent.replace(/^Metalorgie\s*·?\s*/, '');
      const anchor = own[Math.min(own.length - 1, Math.floor(n / 2))];
      if (n % 2 === 1 && lastInserted) lastInserted.after(item);
      else if (anchor) anchor.after(item);
      else grid.append(item);
      lastInserted = item;
    }
  }
};
