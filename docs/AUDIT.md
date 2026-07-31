# Audit d'implémentation

## État initial constaté

- Le dossier réellement utilisé est `/Users/user/Documents/suivi`, et non
  l'ancien chemin `.../VueJs/...` fourni dans le contexte.
- `tracking` était sur `main` avec des modifications locales dans l'interface,
  le routeur, la configuration Firebase et les dépendances. Elles ont été
  conservées.
- Aaron Travel était sur `main` avec des modifications locales dans
  `signature.vue`, `DeliveryScanView.vue` et `signaturePad.vue`. Elles n'ont pas
  été touchées.
- Le tracker lisait directement
  `publicTrackings/{companySlug}_{trackingNumber}` mais utilisait encore
  l'ancien format Aaron.
- Aaron Travel possédait déjà des Cloud Functions Node 20, mais aucun
  déclencheur de synchronisation sur `enlevements`.
- Le fichier `.env` Aaron était suivi par Git et contenait des variables
  `VITE_TWILIO_*`. Il a été retiré de l'index sans supprimer la copie locale,
  puis ajouté au `.gitignore`. Ces identifiants doivent être régénérés : les
  variables `VITE_*` sont publiques dans un bundle web et l'historique Git peut
  déjà les contenir.

## Contrôles exécutés avec Node 20.19.0

- Installation des dépendances frontend et Functions des deux projets :
  réussie. Le premier `npm ci` Aaron a rencontré une erreur interne npm après
  avoir supprimé `node_modules`; une installation `npm install` propre a réussi.
- Tests du schéma/API centrale : 4 réussis.
- Tests de l'adaptateur Aaron : 3 réussis.
- Tests Vue existants du tracker : 1 réussi.
- Chargement Node des deux points d'entrée Functions : réussi.
- Build Vite `tracking` : réussi.
- Build Vite Aaron Travel : réussi.
- Aucun script lint n'existe dans les deux `package.json`; aucun lint n'a donc
  pu être exécuté.

## Avertissements non bloquants

- Les deux builds signalent une base Browserslist ancienne.
- Les bundles sont volumineux : environ 613 kB pour le chunk principal du
  tracker et 3,6 MB pour celui d'Aaron Travel.
- Plusieurs dépendances historiques Aaron sont dépréciées, notamment une
  ancienne version transitive de `uuid`.
- Avant tout déploiement des règles du projet `rdsgestion-b3ec6`, comparer les
  règles distantes avec `firestore.rules`. Un déploiement Firebase remplace le
  ruleset entier et pourrait affecter d'autres collections du même projet.

## État du déploiement du 30 juillet 2026

- `trackingApi` est déployée dans `rdsgestion-b3ec6` en `europe-west1`.
- `TRACKING_API_KEY_PEPPER` est stocké dans Firebase Secrets. Une première
  version, apparue dans les journaux de CLI, a immédiatement été remplacée et
  détruite avant toute utilisation.
- L'identité privée `aaron-travel-app` est créée dans
  `tenantIntegrations`.
- `CENTRAL_TRACKING_API_URL` et `CENTRAL_TRACKING_API_KEY` sont stockés dans
  Firebase Secrets du projet Aaron.
- `syncEnlevementToCentralTracking` est déployée et active.
- Un test réel création → synchronisation → suppression → archivage a réussi.
- Les règles Firestore existantes n'ont pas été remplacées : elles contiennent
  des règles utilisées par d'autres services RDS. L'audit distant confirme que
  `publicTrackings` n'accepte aucune écriture anonyme.
- Le frontend a été rebuildé avec l'URL de production, mais il n'a pas été
  publié sur Firebase Hosting ou Vercel.
- Aucun backfill des anciens enlèvements n'a été exécuté.
