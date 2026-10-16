# WefretAfrica Nuxt Starter

Starter Nuxt 4 inspiré de la structure commerciale de Transport Fomek, avec l'identité et les contenus publics de WefretAfrica.

## Installation

```bash
npm install
npm run dev
```

Le calculateur reprend la grille tarifaire 2026 publiée dans `/tarifs-delais`. Toute modification de prix doit être reportée dans la page et dans `components/PriceCalculator.vue`.

## SEO à compléter

- conserver les URL Softr existantes ou ajouter des redirections 301 ;
- remplacer les coordonnées et mentions légales ;
- connecter Google Search Console ;
- ajouter les contenus détaillés par destination ;
- remplacer les avis de démonstration par des avis authentiques.
# Réception des demandes de devis

Le formulaire `/devis-en-ligne` enregistre les demandes dans Firestore côté serveur. Les variables `NUXT_FIREBASE_PROJECT_ID`, `NUXT_FIREBASE_CLIENT_EMAIL` et `NUXT_FIREBASE_PRIVATE_KEY` doivent être configurées sur l’hébergeur. Le site doit être déployé en mode serveur Nuxt pour que `/api/devis` fonctionne.

L'envoi SMS des devis est assuré uniquement par la fonction Firebase `onWefretAfricaQuoteCreate`, déclenchée sur `wefretafrica_demandes_devis/{requestId}` dans le projet `aarontravelgestion`. Son code est dans le projet voisin `../aaronTravelGestion/aaronTravelGestion/functions/` : `index.js` et `wefretQuoteSms.js`. Déployer cette fonction avec `firebase deploy --only functions:onWefretAfricaQuoteCreate --project aarontravelgestion` après une modification du modèle SMS. Un déploiement Vercel ne met pas à jour cette fonction.

L'API confirme l'enregistrement du devis ; la notification est asynchrone. Les champs `smsStatus`, `smsTemplateVersion` et `smsNotificationSids` permettent de suivre son envoi. Les variables Twilio de Vercel servent encore à `/api/enlevement`, mais pas aux devis. Ne pas ajouter un second envoi SMS à `/api/devis`.
