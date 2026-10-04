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

Le formulaire `/devis-en-ligne` envoie les demandes via Resend. Configurer ces variables sur l’hébergeur :

```env
NUXT_RESEND_API_KEY=re_xxxxxxxxx
NUXT_QUOTE_TO_EMAIL=wefretafrica@gmail.com
NUXT_QUOTE_FROM_EMAIL=WefretAfrica <devis@votre-domaine.fr>
```

L’adresse d’expédition doit être validée dans Resend. Le site doit être déployé en mode serveur Nuxt pour que `/api/devis` fonctionne.
