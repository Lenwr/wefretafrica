<script setup lang="ts">
useSeoMeta({ title: 'Envoi de colis vers l’Afrique | WefretAfrica', description: 'Fret aérien et maritime depuis la France vers le Togo, le Bénin et de nombreuses destinations africaines.', ogTitle: 'WefretAfrica — La France vers l’Afrique', ogDescription: 'Envoyez vos colis vers de nombreuses destinations africaines.', ogType: 'website', ogLocale: 'fr_FR' })
useHead({ link: [{ rel: 'canonical', href: 'https://www.wefretafrica.com/' }, { rel: 'preload', as: 'image', href: '/hero-premium.webp', type: 'image/webp', fetchpriority: 'high' }], script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'WefretAfrica', url: 'https://www.wefretafrica.com/', logo: 'https://www.wefretafrica.com/logo.png', telephone: '+33676492528', description: 'Service de fret aérien et maritime depuis la France vers le Togo, le Bénin et l’Afrique de l’Ouest.', location: [{ '@type': 'Place', name: 'Bureau WefretAfrica Le Thillay', address: { '@type': 'PostalAddress', streetAddress: '15 Rue des Écoles', postalCode: '95500', addressLocality: 'Le Thillay', addressCountry: 'FR' } }, { '@type': 'Place', name: 'Agence de Lille-Wazemmes', telephone: '+33676492528', email: 'lille.denamko@gmail.com', address: { '@type': 'PostalAddress', streetAddress: '96 rue Jules Guesde', postalCode: '59000', addressLocality: 'Lille', addressCountry: 'FR' } }], areaServed: ['Île-de-France', 'Lille', 'Métropole Européenne de Lille', 'Lyon', 'Métropole de Lyon', 'Togo', 'Bénin', 'Afrique de l’Ouest'] }) }] })
const services = [['✈', 'Fret aérien', 'Une solution rapide pour vos colis urgents vers Lomé, Cotonou et nos autres destinations.', '/fret-aerien'], ['▰', 'Fret maritime', 'Expédiez vos colis et effets personnels à prix maîtrisé, avec un suivi clair à chaque étape.', '/fret-maritime'], ['⌂', 'Enlèvement à domicile', 'Nous récupérons vos colis en Île-de-France, à Lille et à Lyon, sur rendez-vous.', '/devis-en-ligne']]
const faqs = [['Quels types de colis puis-je envoyer ?', 'Effets personnels, vêtements, électroménager et marchandises autorisées.'], ['Comment suivre mon colis ?', 'Un numéro de suivi vous permet de consulter l’avancement de votre envoi.'], ['Fret aérien ou maritime : que choisir ?', 'L’aérien privilégie la rapidité. Le maritime est plus économique pour les volumes importants.']]
const destinations = [
  { country: 'Togo', city: 'Lomé', image: '/lome-premium.webp', to: '/envois-colis-paris-lome' },
  { country: 'Bénin', city: 'Cotonou', image: '/cotonou-premium.webp', to: '/envois-colis-paris-cotonou' },
  { country: 'Congo-Brazzaville', city: 'Brazzaville', image: '/destination-congo-brazzaville.webp' },
  { country: 'Sénégal', city: 'Dakar', image: '/destination-senegal.webp' },
  { country: 'Guinée', city: 'Conakry', image: '/destination-guinee.webp' },
  { country: 'Comores', city: 'Comores', image: '/destination-comores.webp' },
  { country: 'Autres destinations', city: '', image: '/destination-autres.webp' }
]
const destinationLink = (destination: typeof destinations[number]) => destination.to || `/devis-en-ligne?destination=${encodeURIComponent(destination.country)}`
</script>
<template>
  <main>
    <SiteHeader />
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">France → Afrique</p>
        <h1>Envoyez vos colis en Afrique, <em>sans complication.</em></h1>
        <p>Des solutions aériennes et maritimes vers le Togo, le Bénin et de nombreuses autres destinations. Enlèvement
          disponible en Île-de-France, à Lille et à Lyon.</p>
        <div class="actions"><a class="btn" href="#calculateur">Calculer mon tarif</a>
          <NuxtLink class="btn ghost" to="/devis-en-ligne">Demander un devis</NuxtLink>
        </div>
        <div class="trust">✓ Tarifs immédiats　 ✓ Délais annoncés　 ✓ Accompagnement humain</div>
      </div>
    </section>
    <section id="infos-pratiques" class="proof quick-proof">
      <article><small>✈ Aérien Togo</small><strong>12 €/kg</strong><span>5 jours · dépôt 48 h avant</span></article>
      <article><small>✈ Aérien Bénin</small><strong>15 €/kg</strong><span>5 jours · dépôt 48 h avant</span></article>
      <article><small>▰ Maritime Togo</small><strong>100 €/carton</strong><span>Environ 1 mois</span></article>
      <article><small>▰ Maritime Bénin</small><strong>150 €/carton</strong><span>Environ 1 mois et demi</span></article>
    </section>
    <section class="packaging-guide">
      <div>
        <p class="kicker">Formats maritimes</p>
        <h2>Choisissez le contenant <em>adapté</em></h2>
        <p>Notre carton de 67 × 54 × 54 cm coûte 100 € vers le Togo et 150 € vers le Bénin. Pour un volume plus
          important, le fût coûte 150 € vers le Togo et 180 € vers le Bénin.</p>
        <NuxtLink class="text-link" to="/devis-en-ligne?transport=Maritime&type=Carton%20%2F%20barrique">Demander un
          devis maritime →</NuxtLink>
      </div><img src="/carton-fut-tarifs.webp"
        alt="Tarifs maritimes : carton de 67 par 54 par 54 centimètres à 100 euros vers le Togo ou 150 euros vers le Bénin, et fût à 150 euros vers le Togo ou 180 euros vers le Bénin"
        loading="lazy" decoding="async">
    </section>
    <section class="essential-banner" aria-label="Nos zones de collecte">
      <div><b>Île-de-France · Le Thillay</b><span>Enlèvement sur rendez-vous ou dépôt au 15 rue des Écoles.</span></div>
      <div><b>Lille · Métropole lilloise</b><span>Enlèvement sur rendez-vous ou dépôt à Lille–Wazemmes.</span></div>
      <div><b>Lyon · Métropole lyonnaise</b><span>Enlèvement de vos colis sur rendez-vous.</span></div>
      <NuxtLink to="/devis-en-ligne?city=Lyon">Organiser une collecte →</NuxtLink>
    </section>
    <section class="ai-pickup-banner">
      <div><span>€</span>
        <div><small>Réponse immédiate</small>
          <h2>Estimez votre envoi en quelques secondes</h2>
          <p>Choisissez la destination, le transport et le type de colis pour afficher un premier tarif avant de
            demander votre devis.</p>
        </div>
      </div><a href="#calculateur">Calculer mon tarif →</a>
    </section>
    <section id="services" class="section">
      <div class="heading">
        <div>
          <p class="kicker">Nos solutions</p>
          <h2>Le transport adapté à <em>chaque envoi</em></h2>
        </div>
        <p>De la collecte en France à la remise à destination, nous simplifions toutes les étapes.</p>
      </div>
      <div class="cards">
        <article v-for="(s, i) in services" :key="s[1]"><small>0{{ i + 1 }}</small><i>{{ s[0] }}</i>
          <h3>{{ s[1] }}</h3>
          <p>{{ s[2] }}</p>
          <NuxtLink :to="s[3]">En savoir plus →</NuxtLink>
        </article>
      </div>
    </section>
    <section id="calculateur" class="calculator">
      <div>
        <p class="kicker">Estimation express</p>
        <h2>Combien coûte votre <em>expédition ?</em></h2>
        <p>Obtenez une première estimation en quelques secondes. Le tarif final est confirmé après vérification du
          colis.</p>
        <ul>
          <li>✓ Sans engagement</li>
          <li>✓ Résultat immédiat</li>
          <li>✓ Devis personnalisé</li>
        </ul>
      </div>
      <PriceCalculator />
    </section>
    <section id="destinations" class="section destinations">
      <div class="heading">
        <div>
          <p class="kicker">Nos destinations</p>
          <h2>Le Togo, le Bénin et <em>bien plus encore</em></h2>
        </div>
        <p>Nous organisons vos expéditions vers plusieurs pays d’Afrique de l’Ouest, d’Afrique centrale et de l’océan
          Indien.</p>
      </div>
      <div class="destination-grid">
        <NuxtLink v-for="destination in destinations" :key="destination.country" :to="destinationLink(destination)"><img
            :src="destination.image" :alt="`Envoi de colis vers ${destination.country}`" loading="lazy"
            decoding="async">
          <div><span>{{ destination.country }}</span>
            <h3>{{ destination.city ? `France → ${destination.city}` : 'Demander une destination' }}</h3>
          </div>
        </NuxtLink>
      </div>
    </section>
    <section class="service-facts">
      <article><span>✈</span>
        <div><small>Fret aérien</small>
          <h3>Livraison en 5 jours</h3>
          <p>Votre colis doit nous parvenir au plus tard 48 h avant le départ.</p>
        </div>
      </article>
      <article><span>▰</span>
        <div><small>Fret maritime</small>
          <h3>Carton vide à 10 €</h3>
          <p>En Île-de-France, nous apportons gratuitement le carton puis venons le récupérer une fois rempli.</p>
        </div>
      </article>
      <article><span>⌛</span>
        <div><small>Délais maritimes</small>
          <h3>Togo : 1 mois</h3>
          <p>Bénin : environ 1 mois et demi après le départ.</p>
        </div>
      </article>
    </section>
    <DepartureSchedule />
    <section id="process" class="process"><img src="/fret-maritime-premium.webp" alt="Cliente préparant un envoi"
        loading="lazy" decoding="async">
      <div>
        <p class="kicker">Comment ça marche ?</p>
        <h2>Votre colis avance,<br><em>vous restez informé.</em></h2>
        <ol>
          <li><b>01</b>
            <p><strong>Demandez votre devis</strong><br>Renseignez la destination et les caractéristiques du colis.</p>
          </li>
          <li><b>02</b>
            <p><strong>Planifiez l’enlèvement</strong><br>Choisissez un créneau en Île-de-France, à Lille ou à Lyon.</p>
          </li>
          <li><b>03</b>
            <p><strong>Suivez l’expédition</strong><br>Consultez chaque étape grâce à votre numéro de suivi.</p>
          </li>
        </ol>
      </div>
    </section>
    <div id="agences" class="locations-heading">
      <p class="kicker">Nos points de collecte</p>
      <h2>Trouvez l’agence <em>la plus proche</em></h2>
      <p>Déposez votre colis ou contactez-nous pour organiser un enlèvement.</p>
    </div>
    <section class="thillay-office">
      <div class="thillay-gallery"><img src="/depot-le-thillay-exterieur.webp"
          alt="Accès au dépôt WefretAfrica du Thillay" loading="lazy" decoding="async"><img
          src="/depot-le-thillay-interieur.webp" alt="Espace de réception des colis au dépôt du Thillay" loading="lazy"
          decoding="async"></div>
      <div class="thillay-copy">
        <p class="kicker">Dépôt en Île-de-France</p>
        <h2>Préparez votre envoi au <em>Thillay</em></h2>
        <p>Notre espace accueille vos colis et vos marchandises avant leur expédition par voie aérienne ou maritime.</p>
        <address>15 rue des Écoles<br>95500 Le Thillay</address><a class="location-phone" href="tel:+33676492528">06 76
          49 25 28</a>
        <div class="actions"><a class="btn"
            href="https://www.google.com/maps/search/?api=1&query=15+Rue+des+Écoles+95500+Le+Thillay" target="_blank"
            rel="noopener">Voir sur la carte</a>
          <NuxtLink class="text-link" to="/devis-en-ligne?city=Le%20Thillay">Préparer mon envoi →</NuxtLink>
        </div>
      </div>
    </section>
    <section class="lille-office"><img src="/bureau-lille.jpeg" alt="Agence de collecte WefretAfrica à Lille-Wazemmes"
        loading="lazy" decoding="async">
      <div>
        <p class="kicker">Collecte dans le Nord</p>
        <h2>Votre agence à <em>Lille–Wazemmes</em></h2>
        <p>Déposez votre colis à l’agence ou demandez un enlèvement à Lille et dans la métropole lilloise.</p>
        <address>96 rue Jules Guesde<br>59000 Lille–Wazemmes</address>
        <div class="lille-contacts"><a href="tel:+33676492528">06 76 49 25 28</a><a
            href="mailto:lille.denamko@gmail.com">lille.denamko@gmail.com</a></div>
        <div class="actions"><a class="btn"
            href="https://www.google.com/maps/search/?api=1&query=96+Rue+Jules+Guesde+59000+Lille" target="_blank"
            rel="noopener">Voir sur la carte</a>
          <NuxtLink class="text-link" to="/devis-en-ligne?city=Lille">Demander une collecte →</NuxtLink>
        </div>
      </div>
    </section>
    <section id="faq" class="section faq">
      <div>
        <p class="kicker">Questions fréquentes</p>
        <h2>Tout savoir avant <em>d’envoyer</em></h2>
      </div>
      <div>
        <details v-for="(f, i) in faqs" :key="f[0]" :open="i === 0">
          <summary>{{ f[0] }} <span>+</span></summary>
          <p>{{ f[1] }}</p>
        </details>
      </div>
    </section>
    <section class="cta">
      <h2>Votre colis mérite un trajet <em>bien accompagné.</em></h2><a class="btn white" href="#calculateur">Estimer
        mon envoi →</a>
    </section>
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
        <div class="footer-contact"><b>Liens rapides</b><a href="#calculateur">Calculer un tarif</a>
          <NuxtLink to="/devis-en-ligne">Demander un devis</NuxtLink><a href="#departs">Prochains départs</a>
          <NuxtLink to="/blog">Blog</NuxtLink>
        </div>
      </div><small>© 2026 WefretAfrica. Tous droits réservés.</small>
    </footer>
    <NuxtLink class="mobile-quote" to="/devis-en-ligne">Demander un devis</NuxtLink>
  </main>
</template>
