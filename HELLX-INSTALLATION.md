HELLX - MISE EN SERVICE

1. Creer gratuitement un compte Cloudflare.
2. Deployer hellx-worker.js avec wrangler.jsonc (liaison AI).
3. Copier l'adresse https://...workers.dev.
4. Dans index.html AVANT hellx-chat.js, ajouter : <script>window.HELLX_CHAT_ENDPOINT='https://ADRESSE-REELLE.workers.dev';</script>
5. Tester le chat et suivre le quota Workers AI gratuit.

Important : prevoir une limitation de debit et une protection anti-abus avant une large ouverture. CORS seul n'est pas une protection contre les appels automatises. Aucune cle secrete dans GitHub Pages.
