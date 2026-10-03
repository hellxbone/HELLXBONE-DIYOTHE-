window.HELLXBONE = {
  facebook: 'https://facebook.com/DIYOTHE',
  sumupShop: 'https://hellxbone.sumupstore.com/',
  products: [
    {
      id: 'boutique-hellxbone',
      title: 'Mes créations HELLXBONE',
      price: 'Prix et tailles sur SumUp',
      description: 'Découvre mes tee-shirts et mes autres créations dans ma boutique en ligne.',
      image: '',
      sumupUrl: 'https://hellxbone.sumupstore.com/'
    }
  ],
  articles: [
    {
      id: 'bienvenue',
      category: 'Actualités',
      date: '2026-10-03',
      title: 'Bienvenue dans HELLXBONE',
      excerpt: 'Art, rock, metal et créations indépendantes : bienvenue dans mon univers.',
      body: [
        'Bienvenue dans HELLXBONE, mon univers artistique rock, metal et underground.',
        'À travers mon association DIYOTHE, je lutte contre la maladie et l’isolement social grâce à mes créations artistiques.',
        'Retrouve mes nouveautés sur Facebook : https://facebook.com/DIYOTHE',
        'Découvre mes créations dans ma boutique : https://hellxbone.sumupstore.com/'
      ]
    }
  ]
};

// Onglet Concert et proverbes HELLXBONE
(() => {
  const proverbes = [
    "Qui sème le riff récolte le torticolis.",
    "Même le plus long solo commence par un voisin mécontent.",
    "Quand le sage montre la scène, le métalleux regarde la buvette.",
    "Ne juge pas le moine à sa robe, mais à son tee-shirt de tournée.",
    "Celui qui cherche la paix intérieure doit éviter de dormir près du batteur.",
    "Un riff par jour éloigne la variété pour toujours.",
    "Qui veut voyager loin ménage ses cervicales.",
    "Le silence est d’or, mais la distorsion vaut le déplacement.",
    "L’homme patient attend la sagesse. Le métalleux attend la balance.",
    "Une corde cassée enseigne plus que mille tutos.",
    "Le bonheur tient parfois à trois accords et une prise électrique.",
    "Quand la vie te met à genoux, vérifie d’abord si tu as perdu ton médiator.",
    "Celui qui arrive en retard au concert médite derrière un grand chauve.",
    "Nul ne traverse un festival sans poussière dans les chaussures.",
    "Qui confond le pogo et la polka découvre vite la différence.",
    "La sagesse vient avec l’âge. Les acouphènes viennent avec le premier rang.",
    "Un ampli éteint ne nourrit aucun démon.",
    "Celui qui connaît toutes les paroles chante quand même yaourt sur le refrain.",
    "Mieux vaut un petit concert qui déboîte qu’un grand canapé qui endort.",
    "Le sage compte ses bénédictions. Le batteur compte jusqu’à quatre."
  ];

  let dernierePhrase = -1;
  try {
    dernierePhrase = Number(
      sessionStorage.getItem("hellxbone-proverbe") ?? -1
    );
  } catch {}

  const menu = document.querySelector(
    'nav[aria-label="Navigation principale"]'
  );
  if (!menu || menu.querySelector('[data-page="concert"]')) return;

  const onglet = document.createElement("button");
  onglet.dataset.page = "concert";
  onglet.textContent = "Concert";
  menu.insertBefore(
    onglet,
    menu.querySelector('[data-page="apropos"]')
  );

  function afficherProverbe() {
    const choix = proverbes
      .map((_, index) => index)
      .filter(index => index !== dernierePhrase);

    dernierePhrase = choix[Math.floor(Math.random() * choix.length)];

    try {
      sessionStorage.setItem(
        "hellxbone-proverbe",
        String(dernierePhrase)
      );
    } catch {}

    document.querySelectorAll("nav button").forEach(bouton => {
      bouton.setAttribute(
        "aria-current",
        bouton.dataset.page === "concert" ? "page" : "false"
      );
    });

    document.querySelector("#app").innerHTML = `
      <section class="hero">
        <span class="pill">🤘 La sagesse du riff</span>
        <h2>Concert</h2>
        <h3>La phrase du jour</h3>
        <p aria-live="polite"
           style="font-size:22px;line-height:1.6">
          « ${proverbes[dernierePhrase]} »
        </p>
        <button class="button" data-proverbe="nouveau">
          Encore une dose de sagesse 🤘
        </button>
      </section>
    `;
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", evenement => {
    const cible = evenement.target.closest(
      '[data-page="concert"], [data-proverbe="nouveau"]'
    );
    if (!cible) return;

    evenement.preventDefault();
    evenement.stopImmediatePropagation();
    afficherProverbe();
  }, true);
})();
