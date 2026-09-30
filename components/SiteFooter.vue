<script setup lang="ts">
useHead({ script: [{
  key: 'agencies-schema', type: 'application/ld+json',
  innerHTML: JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness', '@id': 'https://www.wefretafrica.com/#le-thillay',
        name: 'WefretAfrica — Le Thillay', url: 'https://www.wefretafrica.com/#agences',
        telephone: '+33676492528', image: 'https://www.wefretafrica.com/depot-le-thillay-exterieur.webp',
        address: { '@type': 'PostalAddress', streetAddress: '15 Rue des Écoles', postalCode: '95500', addressLocality: 'Le Thillay', addressCountry: 'FR' }
      },
      {
        '@type': 'LocalBusiness', '@id': 'https://www.wefretafrica.com/#lille',
        name: 'WefretAfrica — Lille–Wazemmes', url: 'https://www.wefretafrica.com/#agences',
        telephone: '+33676492528', email: 'lille.denamko@gmail.com', image: 'https://www.wefretafrica.com/bureau-lille.jpeg',
        address: { '@type': 'PostalAddress', streetAddress: '96 rue Jules Guesde', postalCode: '59000', addressLocality: 'Lille', addressCountry: 'FR' }
      }
    ]
  })
}] })
</script>
<template>
    <footer>
      <div class="footer-main">
        <div>
          <div class="brand"><img src="/logo.png" alt=""><b>WeFret<span>Africa</span></b></div>
          <p>Votre partenaire pour l’envoi de colis entre la France et de nombreuses destinations africaines.</p>
        </div>
        <div class="footer-contact"><b>Nos bureaux</b><a href="tel:+33676492528">Téléphone : 06 76 49 25 28</a><a
            href="https://www.google.com/maps/search/?api=1&query=15+Rue+des+Écoles+95500+Le+Thillay" target="_blank"
            rel="noopener">15 Rue des Écoles<br>95500 Le Thillay, France</a><a
            href="https://www.google.com/maps/search/?api=1&query=96+Rue+Jules+Guesde+59000+Lille" target="_blank"
            rel="noopener">96 rue Jules Guesde<br>59000 Lille–Wazemmes</a><a
            href="mailto:lille.denamko@gmail.com">lille.denamko@gmail.com</a></div>
        <div class="footer-contact"><b>Liens rapides</b><a href="/#calculateur">Calculer un tarif</a>
          <NuxtLink to="/devis-en-ligne">Demander un devis</NuxtLink><a href="/#departs">Prochains départs</a>
          <NuxtLink to="/blog">Blog</NuxtLink>
        </div>
        <div class="footer-contact footer-review"><b>Votre expérience compte</b>
          <p>Vous avez utilisé nos services ? Partagez votre expérience sur Google.</p>
          <a class="review-link" href="https://g.page/r/CZ9JT5M825kgEAE/review" target="_blank" rel="noopener">Donner un avis Google →</a>
        </div>
      </div><small>© 2026 WefretAfrica. Tous droits réservés.</small>
    </footer>
</template>
