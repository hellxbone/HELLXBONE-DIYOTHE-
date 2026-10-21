# HELLXBONE — champion mensuel MÉGA RIFF

## Statut
Le formulaire et le workflow sont présents, mais **l'envoi automatique n'est pas encore opérationnel**. La fonction Supabase de réception des coordonnées doit être adaptée à la file d'attente (elle utilise actuellement Resend). L'identité du gagnant est actuellement déduite d'un identifiant enregistré dans le navigateur, insuffisant comme preuve : sécuriser la réclamation côté serveur avant toute collecte réelle.

## Configuration Gmail (secrets GitHub)
Dans `Settings > Secrets and variables > Actions > New repository secret` :

- `SUPABASE_SERVICE_ROLE_KEY` : clé serveur Supabase, à conserver uniquement dans les secrets GitHub
- `GMAIL_APP_PASSWORD` : mot de passe d'application Google du compte diyothe@gmail.com (jamais le mot de passe Gmail standard)

Ne jamais mettre de secret dans le code source, dans un message ou dans une capture d'écran. L'utilisation d'un mot de passe d'application nécessite que les conditions de sécurité du compte Google soient remplies.

## Exécution
Fichier : `.github/workflows/monthly-winner-email.yml`.
Le workflow s'exécute quotidiennement et peut être déclenché manuellement par `Actions > HELLXBONE monthly winner email > Run workflow`.
Le script `scripts/monthly_winner_email.py` ne traite que les gagnants dont `email_sent_at` est vide, expédie l'e-mail « Gagnant du mois » puis enregistre la date d'envoi.

## Contrôles obligatoires avant activation
- Authentifier le joueur et attester côté serveur que le score appartient bien à ce compte (un `player_id` saisi côté navigateur ne suffit pas).
- Arrêter les soumissions de scores non authentifiées et appliquer les contrôles anti-triche.
- Remplacer l'ancien envoi Resend dans l'Edge Function par la simple sauvegarde privée des coordonnées, sans retour de données personnelles.
- Tester un gagnant fictif sans coordonnées réelles, l'enregistrement sécurisé, le traitement Gmail et le blocage d'un deuxième envoi.
- Définir une durée de conservation limitée pour les coordonnées et publier l'information de confidentialité correspondante.

Les changements GitHub seuls ne configurent pas automatiquement Gmail ni les secrets Supabase.
