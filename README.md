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
