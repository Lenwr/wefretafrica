<script setup lang="ts">
// Remplacer « Date à confirmer » par les dates réelles dès qu'elles sont connues.
const departures = [
  { destination: 'Lomé', country: 'Togo · maritime : retrait au dépôt vers Adéwui', date: 'Date à confirmer', duration: 'Environ 1 mois', status: 'Inscriptions ouvertes' },
  { destination: 'Cotonou', country: 'Bénin', date: 'Date à confirmer', duration: 'Environ 1 mois et demi', status: 'Inscriptions ouvertes' }
]
</script>
<template>
  <section id="departs" class="departures-section">
    <div class="departures-copy"><p class="kicker">Calendrier maritime</p><h2>Prochains <em>départs</em></h2><p>Préparez vos cartons à temps. Les dates exactes seront publiées ici dès leur confirmation.</p><NuxtLink class="text-link" to="/devis-en-ligne?transport=Maritime">Préparer mon envoi →</NuxtLink></div>
    <div class="departure-list"><article v-for="departure in departures" :key="departure.destination"><div><span>{{departure.country}}</span><h3>France → {{departure.destination}}</h3></div><div><small>Prochain départ</small><strong>{{departure.date}}</strong></div><div><small>Délai estimé</small><strong>{{departure.duration}}</strong></div><b>{{departure.status}}</b></article></div>
  </section>
</template>
