# HELLXBONE — Agenda, rencontres, alertes et RIFF DU JOUR

Version du 3 novembre 2026.

## Fonctionnalités

- L'agenda apparaît dans la section **ON SE CAPTE / RENCONTRES** et préserve le bandeau des dates réservé à la radio.
- Les concerts proviennent du catalogue GitHub et du catalogue publié Supabase. Le flux GitHub est renouvelé chaque jour par `concerts-update.yml`, avec les résultats disponibles de Ticketmaster. Les lieux sans coordonnées ne sont pas montrés lorsque le filtre GPS est actif.
- **J'Y VAIS** enregistre un choix volontaire dans Supabase et affiche le nombre de participants, pas les identités ni les coordonnées.
- **RASSEMBLER LA HORDE** préremplit la création d'un rendez-vous avec le lieu et le jour. L'heure suggérée est modifiable et doit être vérifiée par le membre, car la fiche peut ne pas fournir d'heure.
- Les notifications concerts sont enregistrées pour chaque abonnement push via `hellx-concert-alerts`. L'utilisateur doit enregistrer ses choix depuis l'agenda et accepter les notifications. Dispatch à la minute 13 de chaque heure via pg_cron, jusqu'à 45 jours en avance pour les concerts ajoutés dans les trois derniers jours. Un même concert n'est envoyé qu'une fois à un abonnement. Le filtrage porte sur département et style.
- **RIFF DU JOUR** est un jeu distinct à 25 coups dont le score est **recalculé côté Supabase** à partir de la liste des mouvements. Même grille initiale par date Europe/Paris. Une tentative terminée par membre et par jour. Le jeu MEGA RIFF classique et le classement mensuel ne sont pas remplacés.

## Modules

- `hellx-concerts.js` : affichage agenda, GPS volontaire, interactions, alertes.
- `hellx-daily-engine.js` : règles déterministes utilisées par navigateur et serveur.
- `hellx-daily-riff.js` : interface défi et palmarès.
- `supabase/functions/hellx-daily-riff/` et `supabase/functions/hellx-concert-alerts/` : sources déployées sur Supabase.
- `scripts/update_concerts.py` + `.github/workflows/concerts-update.yml` : actualisation automatique.
- Tables privées (RLS sans accès direct anonyme) : `hellx_daily_riff_scores`, `hellx_concert_rsvps`, `hellx_concert_alert_preferences`, `hellx_concert_alert_deliveries`.

## Limites à connaître

L'identité de club repose encore sur un UUID local et non sur une vraie connexion authentifiée. Le serveur vérifie les coups et le score, mais quelqu'un ayant accès à l'identifiant de membre pourrait usurper sa participation. Aucune récompense de valeur ne devrait dépendre exclusivement de ce classement avant ajout d'une authentification forte.

Les fournisseurs de concerts ne garantissent pas une couverture exhaustive de la France et des DOM-TOM. L'agenda exclut les événements passés, privilégie les dates sourcées et vérifiées, et conserve une recherche ville/département sans GPS.

Les notifications push sont tributaires de l'autorisation du navigateur et de l'abonnement actif ; la PWA et le navigateur peuvent limiter leur disponibilité.

## Vérifications fonctionnelles conseillées

1. Ouvrir RENCONTRES depuis l'accueil, filtrer ville, département et GPS.
2. Choisir un concert, tester J'Y VAIS, puis annuler la participation.
3. Ouvrir la création d'un rendez-vous ; vérifier lieu et heure avant validation.
4. Enregistrer une alerte concerts, puis la désactiver.
5. Jouer un RIFF DU JOUR, vérifier le score serveur et le TOP 10 ; une deuxième tentative doit être refusée.
6. Quitter et rouvrir la radio et le jeu standard pour détecter les régressions.
