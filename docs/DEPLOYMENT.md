# Installation et déploiement

Prérequis : Node `20.19.0` ou plus récent, Firebase CLI connecté aux deux
projets et facturation Cloud Functions activée.

## Service central (`rdsgestion-b3ec6`)

```bash
cd tracking
fnm use 20.19.0
npm ci
npm --prefix functions ci
npm --prefix functions test
npm run build
firebase functions:secrets:set TRACKING_API_KEY_PEPPER
firebase deploy --only firestore:rules,firestore:indexes,functions:tracking-central
```

Après le premier déploiement, copier l'URL de `trackingApi` dans un fichier
`.env.local` non versionné :

```dotenv
VITE_TRACKING_API_URL=https://europe-west1-rdsgestion-b3ec6.cloudfunctions.net/trackingApi
```

Rebuilder ensuite le frontend. Aucun déploiement n'est effectué
automatiquement par cette implémentation.

## Aaron Travel (`aarontravelgestion`)

Créer l'intégration privée `aaron-travel-app` selon
[INTEGRATION.md](./INTEGRATION.md), puis :

```bash
cd aaronTravelGestion/aaronTravelGestion
fnm use 20.19.0
npm ci
npm --prefix functions ci
npm --prefix functions test
npm run build
firebase functions:secrets:set CENTRAL_TRACKING_API_URL
firebase functions:secrets:set CENTRAL_TRACKING_API_KEY
firebase deploy --only functions:syncEnlevementToCentralTracking
```

Déployer d'abord le service central, puis le déclencheur Aaron. Pour publier les
anciens enlèvements, effectuer ensuite un backfill contrôlé (réécriture
administrative ou script Admin SDK) ; ne pas faire ce backfill depuis Vue.

## Rotation et incident

Une clé compromise doit être remplacée dans `tenantIntegrations`, puis dans
Firebase Secrets côté application source, et la fonction doit être redéployée.
Une clé présente auparavant dans un fichier `VITE_*` ou dans l'historique Git
est considérée compromise et doit être révoquée chez son fournisseur.
