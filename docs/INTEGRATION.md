# Service central de suivi

## Contrat public version 1

Le service stocke uniquement le document public normalisé dans
`publicTrackings/{companySlug}_{trackingNumber}`. Les prix, paiements, soldes,
numéros de téléphone, adresses exactes et images internes sont volontairement
ignorés par les normaliseurs.

Les statuts acceptés sont exclusivement :

`PENDING`, `RECEIVED`, `LOADED`, `IN_TRANSIT`, `READY_FOR_PICKUP`,
`DELIVERED`, `CANCELLED`.

## Statuts des colis

Les codes sont en anglais, en majuscules, sans accent. Ils ne doivent jamais
être remplacés par des libellés comme `Livré`, `Expédié` ou `En attente` dans
les requêtes API.

| Code API | Libellé affiché | Quand l'utiliser |
|---|---|---|
| `PENDING` | En attente | Dossier créé, mais colis pas encore physiquement reçu |
| `RECEIVED` | Réceptionné | Colis physiquement reçu par l'agence ou au dépôt |
| `LOADED` | Chargé | Colis affecté et chargé dans un avion, camion ou conteneur |
| `IN_TRANSIT` | En transit | Transport vers la destination en cours |
| `READY_FOR_PICKUP` | Disponible pour retrait | Colis arrivé et disponible à l'agence de destination |
| `DELIVERED` | Livré | Colis remis au destinataire |
| `CANCELLED` | Annulé | Expédition annulée ou invalidée |

Parcours standard recommandé :

```text
PENDING → RECEIVED → LOADED → IN_TRANSIT → READY_FOR_PICKUP → DELIVERED
```

`CANCELLED` peut intervenir avant la livraison. Une correction vers un statut
précédent est techniquement acceptée, mais doit rester exceptionnelle et être
accompagnée d'un nouvel événement explicatif.

Deux niveaux de statut existent :

- `shipment.status` représente l'état global du dossier ;
- `packages[].status` représente l'état de chaque type ou groupe de colis.

Pour un seul colis, utilisez le même statut aux deux endroits. Pour plusieurs
colis, le statut global doit normalement correspondre au colis le moins avancé.
Exemple : si un colis est `IN_TRANSIT` et un autre `RECEIVED`, le dossier reste
`RECEIVED`.

Lorsqu'un colis est créé parce que l'agence vient de le recevoir physiquement,
utilisez directement `RECEIVED`. Utilisez `PENDING` uniquement pour une demande
ou un dossier créé avant la réception physique.

Le payload version 1 contient `schemaVersion`, `tenantId` (injecté par le
serveur), `trackingNumber`, `company`, `shipment`, `sender`, `recipient`,
`packages`, `events`, `createdAt`, `updatedAt`, `archived` et `revoked`.

### Champs du payload

| Champ | Type | Obligatoire | Description |
|---|---|---:|---|
| `schemaVersion` | nombre | recommandé | Version actuelle : `1` |
| `trackingNumber` | chaîne | oui | 3 à 80 caractères : lettres, chiffres, `_` ou `-` |
| `company.name` | chaîne | non | Nom public de l'entreprise source |
| `shipment.status` | statut | oui | Un des sept codes autorisés |
| `shipment.origin` | chaîne | non | Ville ou pays d'origine, sans adresse précise |
| `shipment.destination` | chaîne | non | Ville ou pays de destination |
| `shipment.service` | chaîne | non | Par exemple `Aérien` ou `Maritime` |
| `shipment.estimatedDeliveryAt` | date ISO 8601 | non | Date de livraison estimée |
| `sender` | objet | non | Uniquement `name`, `city`, `country` |
| `recipient` | objet | non | Uniquement `name`, `city`, `country` |
| `packages` | tableau | non | Maximum 100 entrées |
| `events` | tableau | non | Historique public, maximum 200 entrées |
| `createdAt` | date ISO 8601 | non | Date source ; le serveur utilise l'heure courante si absente |
| `archived` | booléen | non | Rend le suivi public inaccessible si `true` |
| `revoked` | booléen | non | Révoque explicitement l'accès public si `true` |

Le serveur injecte `tenantId`, impose `company.slug` depuis l'identité de
l'application et recalcule `updatedAt`. Les champs inconnus ou privés ne sont
pas conservés.

### Format d'un colis

```json
{
  "id": "carton-1",
  "label": "Carton de vêtements",
  "quantity": 2,
  "weightKg": 18.5,
  "status": "RECEIVED"
}
```

`quantity` doit être un entier supérieur ou égal à 1. `weightKg` doit être
positif ou nul.

### Format d'un événement

```json
{
  "id": "reception-20260730",
  "status": "RECEIVED",
  "occurredAt": "2026-07-30T10:00:00.000Z",
  "location": "Paris",
  "label": "Colis réceptionné",
  "note": "Contrôle terminé"
}
```

Ajoutez un événement lorsqu'un statut change. Conservez les anciens
événements afin que TRACKSEND puisse afficher l'historique complet.

## URL et authentification

URL actuellement déployée :

```text
https://europe-west1-rdsgestion-b3ec6.cloudfunctions.net/trackingApi
```

Les opérations d'écriture exigent deux en-têtes :

```http
X-Tenant-Id: identite-de-l-application
X-Api-Key: cle-secrete-de-l-application
```

La clé doit rester dans Firebase Secrets ou dans le gestionnaire de secrets du
backend. Elle ne doit jamais être placée dans Vue, `localStorage`, un fichier
`VITE_*`, une requête navigateur ou le dépôt Git.

## Authentification d'une application

Chaque application reçoit un `tenantId` et une clé aléatoire distincte. La clé
brute n'est enregistrée ni dans Firestore ni dans Git. Le service central
compare son hash SHA-256 avec un pepper stocké dans Firebase Secrets.

1. Créer une clé aléatoire d'au moins 32 octets et la transmettre une seule fois
   au responsable de l'application.
2. Calculer son hash avec le même pepper :

   ```bash
   node -e 'const c=require("node:crypto"); console.log(c.createHash("sha256").update(`${process.env.PEPPER}:${process.env.API_KEY}`).digest("hex"))'
   ```

3. Créer, depuis un environnement administrateur, le document privé
   `tenantIntegrations/aaron-travel-app` :

   ```json
   {
     "active": true,
     "companySlug": "aaron-travel",
     "companyName": "Aaron Travel",
     "keyHash": "<HASH_SHA256>"
   }
   ```

Les règles Firestore interdisent tout accès client à cette collection. Pour
désactiver un accès, passer `active` à `false`. Pour le régénérer, créer une
nouvelle clé puis remplacer `keyHash`; l'ancienne cesse immédiatement de
fonctionner. Pendant une rotation sans interruption, le code accepte aussi un
tableau `keyHashes` si cette option est activée dans le document.

## Requêtes

### Créer ou synchroniser

Créer ou remplacer un colis (opération idempotente sur
`companySlug + trackingNumber`) :

```bash
curl -X POST "$TRACKING_API_URL/v1/shipments" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: future-app" \
  -H "X-Api-Key: $TRACKING_API_KEY" \
  --data '{
    "schemaVersion": 1,
    "trackingNumber": "COLIS-260730-142530-123",
    "company": {"name": "Future App"},
    "shipment": {
      "status": "IN_TRANSIT",
      "origin": "Paris",
      "destination": "Lomé",
      "service": "Maritime"
    },
    "sender": {"name": "Client"},
    "recipient": {"name": "Destinataire", "city": "Lomé"},
    "packages": [
      {"id": "1", "label": "Carton", "quantity": 2, "status": "IN_TRANSIT"}
    ],
    "events": [
      {
        "status": "RECEIVED",
        "occurredAt": "2026-07-30T10:00:00Z",
        "label": "Colis réceptionné"
      }
    ]
  }'
```

La même route accepte `PUT`.

`POST` et `PUT` remplacent le document public complet. Ils sont idempotents :
renvoyer le même `trackingNumber` pour le même tenant met à jour le colis au
lieu d'en créer un deuxième.

Réponses :

- `201 Created` : premier enregistrement ;
- `200 OK` : colis existant remplacé ;
- `400 Bad Request` : payload, statut, date ou numéro invalide ;
- `401 Unauthorized` : tenant ou clé incorrects/désactivés ;
- `409 Conflict` : numéro déjà rattaché à un autre tenant ;
- `413 Payload Too Large` : requête supérieure à 256 Kio.

### Mettre à jour un statut

Renvoyez le payload complet avec le nouveau statut et ajoutez l'événement
correspondant. Exemple pour passer en transit :

```bash
curl -X PUT "$TRACKING_API_URL/v1/shipments" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: future-app" \
  -H "X-Api-Key: $TRACKING_API_KEY" \
  --data '{
    "schemaVersion": 1,
    "trackingNumber": "COLIS-260730-142530-123",
    "company": {"name": "Future App"},
    "shipment": {
      "status": "IN_TRANSIT",
      "origin": "Paris",
      "destination": "Lomé",
      "service": "Aérien"
    },
    "packages": [
      {
        "id": "carton-1",
        "label": "Carton",
        "quantity": 1,
        "status": "IN_TRANSIT"
      }
    ],
    "events": [
      {
        "id": "reception",
        "status": "RECEIVED",
        "occurredAt": "2026-07-30T10:00:00.000Z",
        "location": "Paris",
        "label": "Colis réceptionné"
      },
      {
        "id": "depart",
        "status": "IN_TRANSIT",
        "occurredAt": "2026-07-31T08:30:00.000Z",
        "location": "Paris",
        "label": "Départ vers Lomé"
      }
    ]
  }'
```

### Archiver ou révoquer

```bash
curl -X DELETE "$TRACKING_API_URL/v1/shipments/COLIS-260730-142530-123" \
  -H "X-Tenant-Id: future-app" \
  -H "X-Api-Key: $TRACKING_API_KEY"
```

La suppression API ne détruit pas définitivement le document : elle le marque
`archived` et `revoked`, puis la lecture publique retourne `404`.

### Lire un suivi public

```bash
curl "$TRACKING_API_URL/v1/public/aaron-travel/COLIS-260730-142530-123"
```

La lecture publique n'exige pas de clé API. Elle retourne uniquement le schéma
public filtré. Réponses principales :

- `200 OK` : colis trouvé ;
- `404 TRACKING_NOT_FOUND` : inconnu, archivé ou révoqué ;
- `429 TOO_MANY_REQUESTS` : limite temporaire atteinte.

Lien correspondant dans TRACKSEND :

```text
/suivi/aaron-travel?code=COLIS-260730-142530-123
```

## Données interdites dans le document public

Ne publiez jamais :

- clé API, token, mot de passe ou credential Firebase ;
- prix, solde, paiement ou mode de paiement ;
- numéro de téléphone ou adresse postale précise ;
- pièce d'identité, signature ou document contractuel ;
- photo interne, preuve sensible ou commentaire administratif ;
- identifiant technique permettant d'accéder à une autre ressource privée.

Les noms, villes et pays ne doivent être envoyés que s'ils sont nécessaires à
l'expérience publique et autorisés par la politique de l'entreprise.

## Connecter une future application

L'intégration doit partir d'une Cloud Function ou d'un backend de confiance,
jamais de Vue. Ajouter un déclencheur sur la collection métier, construire
uniquement les champs publics, puis appeler l'upsert. En cas de suppression,
d'archivage ou de désactivation côté source, appeler `DELETE` ou envoyer
`archived: true`. Configurer les relances automatiques et surveiller les logs :
une erreur distante doit faire échouer le déclencheur afin qu'il soit rejoué.

Le GET public est limité à 60 requêtes par minute et par IP sur chaque instance.
Pour une exposition à fort trafic, activer en plus Cloud Armor/API Gateway et
Firebase App Check selon le client.
