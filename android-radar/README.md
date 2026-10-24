# HELLXBONE — Android radar (gratuit, prototype)
Cette version Android charge la PWA HELLXBONE et ajoute **un service de localisation au premier plan**, capable de poursuivre les mises à jour lorsque l'écran est éteint. Aucune localisation native n'est transmise avant l'activation volontaire.

## Installer
Sur GitHub : **Actions → Build HELLXBONE Android radar APK → dernier run réussi → Artifacts → HELLXBONE-radar-Android-APK**. Télécharger le ZIP et installer `app-debug.apk` sur Android (autoriser l'installation d'apps depuis cette source). Cette APK de test utilise une signature debug : elle ne constitue pas une publication définitive. Installer d'abord la PWA dans le navigateur est inutile pour la version native ; les pseudonymes de la PWA et ceux de la WebView peuvent demander une nouvelle inscription car leurs stockages diffèrent.

## Utilisation
Ouvrir l'application Android, s'inscrire dans HELLXBONE puis presser **ACTIVER MA PRÉSENCE RADAR** en haut. Accepter la localisation. Android affiche une notification permanente avec **Devenir invisible**. Le bouton d'arrêt dans l'appli coupe également le service. Ne pas confondre ce bouton natif avec celui du radar web : seul le bouton natif maintient la présence écran éteint.

## Limitations et sécurité
- Les téléphones doivent autoriser la localisation. Sur Android, les fabricants et les économiseurs de batterie peuvent interrompre le service. Une force-stop et un redémarrage ne relancent pas le service.
- Il s'agit d'un service au premier plan (notification visible), **pas** d'un suivi furtif.
- Le serveur conserve une coordonnée arrondie; les autres membres ne voient que la distance approximative.
- L'API actuelle reconnaît les membres par UUID de navigateur sans authentification forte. Avant une diffusion large, sécuriser les RPC radar pour empêcher l'usurpation d'identifiants, ajouter limitation de débit et politique de consentement/RGPD; ce prototype est destiné aux tests volontaires.
- Les mises à jour GPS dépendent des mouvements et ne sont pas garanties à intervalle fixe. Les autres membres ne sont visibles que si un signal date de moins de 2 minutes.
- Coût du code et de la compilation via GitHub Actions sur dépôt public : normalement gratuit dans les limites du quota. Supabase peut imposer des plafonds gratuits selon l'usage.
