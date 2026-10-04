<script setup lang="ts">
usePageSeo(
  'Tarifs et délais 2026 | WefretAfrica',
  'Consultez les tarifs indicatifs du transport maritime depuis la France vers Lomé, Abidjan, Cotonou, Dakar et le Cameroun.'
)
useHead({ link: [{ rel: 'canonical', href: 'https://www.wefretafrica.com/tarifs-delais' }] })

const standardRates = [
  { destination: 'Lomé', volume: '500 €', large: '100 €', small: '60 €', delay: '25–30 jours' },
  { destination: 'Abidjan', volume: '500 €', large: '100 €', small: '60 €', delay: '30–35 jours' },
  { destination: 'Cotonou', volume: '750 €', large: '150 €', small: '90 €', delay: '1,5 à 2 mois' },
  { destination: 'Dakar', volume: '500 €', large: '100 €', small: '60 €', delay: 'Environ 45 jours' },
  { destination: 'Cameroun · Douala / Yaoundé', volume: '850 €', large: 'Au volume', small: 'Au volume', delay: 'Environ 45 jours' }
]

const depotRates = [
  { destination: 'Lomé', volume: '500 €', large: '100 €', small: '60 €' },
  { destination: 'Abidjan', volume: '500 €', large: '100 €', small: '60 €' },
  { destination: 'Cotonou', volume: '750 €', large: '140 €', small: '85 €' },
  { destination: 'Dakar', volume: '500 €', large: '100 €', small: '60 €' },
  { destination: 'Cameroun · Douala / Yaoundé', volume: '850 €', large: 'Au volume', small: 'Au volume' }
]

const bulkyRates = [
  { item: 'Réfrigérateur 1 porte', home: ['180 €', '220 €', '220 €'], depot: null },
  { item: 'Réfrigérateur américain', home: ['250 €', '300 €', '300 €'], depot: null },
  { item: 'Machine à laver', home: ['180 €', '220 €', '220 €'], depot: null },
  { item: 'Cuisinière', home: ['160 €', '200 €', '200 €'], depot: null },
  { item: 'Canapés et fauteuils', home: ['100 €', '120 €', '150 €'], depot: ['90 €', '110 €', '140 €'] },
  { item: 'Matelas 2 places', home: ['120 €', '150 €', '150 €'], depot: ['110 €', '130 €', '130 €'] }
]
</script>

<template>
  <main>
    <SiteHeader />

    <section class="rates-hero">
      <div>
        <p class="eyebrow">Transport maritime France → Afrique de l’Ouest</p>
        <h1>Tarifs & <em>délais</em></h1>
        <p>Retrouvez nos tarifs indicatifs 2026 vers Lomé, Abidjan, Cotonou, Dakar et le Cameroun, avec collecte à domicile ou dépôt à l’entrepôt.</p>
        <div class="actions">
          <NuxtLink class="btn" to="/devis-en-ligne?transport=Maritime&cta=hero&from=tarifs">Demander mon devis</NuxtLink>
          <a class="btn ghost" href="#tarifs-standard">Voir les tarifs</a>
        </div>
      </div>
      <div class="rates-hero-summary">
        <span>À partir de</span><strong>60 €</strong><small>pour un petit carton déposé à l’entrepôt</small>
      </div>
    </section>

    <nav class="rates-nav" aria-label="Sommaire des tarifs">
      <a href="#tarifs-standard">Cartons & volume</a><a href="#calculateur-tarifs">Calculateur</a><a href="#articles-speciaux">Articles spéciaux</a><a href="#services">Services</a><a href="#conditions">Conditions</a>
    </nav>

    <section id="tarifs-standard" class="rates-section">
      <div class="rates-heading">
        <div><p class="kicker">01 · Tarifs standards</p><h2>Avec collecte <em>à domicile</em></h2></div>
        <p>Le ramassage à domicile est inclus dans ces tarifs et reste possible sur demande.</p>
      </div>
      <div class="rate-table-wrap">
        <table class="rate-table mobile-standard-table">
          <thead><tr><th>Destination</th><th>m³</th><th>Grand carton<small>67 × 54 × 54 cm</small></th><th>Petit carton<small>60 × 40 × 40 cm</small></th><th>Délai estimé</th></tr></thead>
          <tbody><tr v-for="rate in standardRates" :key="rate.destination"><th>{{ rate.destination }}</th><td>{{ rate.volume }}</td><td>{{ rate.large }}</td><td>{{ rate.small }}</td><td>{{ rate.delay }}</td></tr></tbody>
        </table>
      </div>
      <p class="rates-inline-note"><strong>Dakar :</strong> le fût ou la barrique est facturé 120 €. Les départs maritimes ont lieu chaque semaine.</p>
    </section>

    <section class="rates-section rates-soft">
      <div class="rates-heading">
        <div><p class="kicker">02 · Dépôt à l’entrepôt</p><h2>Tarifs pour un <em>dépôt à l’entrepôt</em></h2></div>
        <p>Ces tarifs s’appliquent uniquement aux colis déjà emballés et prêts à être expédiés.</p>
      </div>
      <div class="rate-table-wrap">
        <table class="rate-table mobile-standard-table">
          <thead><tr><th>Destination</th><th>m³</th><th>Grand carton<small>67 × 54 × 54 cm</small></th><th>Petit carton<small>60 × 40 × 40 cm</small></th></tr></thead>
          <tbody><tr v-for="rate in depotRates" :key="rate.destination"><th>{{ rate.destination }}</th><td>{{ rate.volume }}</td><td>{{ rate.large }}</td><td>{{ rate.small }}</td></tr></tbody>
        </table>
      </div>
    </section>

    <section id="calculateur-tarifs" class="calculator rates-calculator">
      <div><p class="kicker">Estimation personnalisée</p><h2>Calculez le tarif de <em>votre envoi</em></h2><p>Sélectionnez la destination et le format du colis. Le montant final est confirmé après contrôle.</p><ul><li>✓ Résultat immédiat</li><li>✓ Sans engagement</li><li>✓ Devis prérempli</li></ul></div>
      <PriceCalculator initial-mode="sea" source="tarifs" />
    </section>

    <section id="articles-speciaux" class="rates-section">
      <div class="rates-heading"><div><p class="kicker">03 · Articles spécifiques</p><h2>Des tarifs adaptés à <em>chaque envoi</em></h2></div><p>Les prix « collecte » incluent la collecte à domicile. Les prix « dépôt » concernent les articles déposés à l’entrepôt.</p></div>

      <div class="rate-card-grid">
        <article class="rate-card">
          <span class="rate-icon">□</span><h3>Cartons vides</h3>
          <dl><div><dt>Grand carton <small>67 × 54 × 54 cm</small></dt><dd>10 €</dd></div><div><dt>Petit carton <small>60 × 40 × 40 cm</small></dt><dd>5 €</dd></div><div><dt>Ruban adhésif professionnel</dt><dd>3 €</dd></div></dl>
        </article>
        <article class="rate-card">
          <span class="rate-icon">◉</span><h3>Télévisions</h3>
          <dl><div><dt>Lomé</dt><dd>5 € / pouce</dd></div><div><dt>Abidjan</dt><dd>7 € / pouce</dd></div><div><dt>Cotonou</dt><dd>7 € / pouce</dd></div></dl>
          <p class="rate-note">Tarification valable pour les écrans plats uniquement.</p>
        </article>
        <article class="rate-card rate-card-wide">
          <span class="rate-icon">▱</span><h3>Fûts</h3>
          <div class="rate-table-wrap compact"><table class="rate-table mobile-destination-table"><thead><tr><th>Format</th><th>Lomé</th><th>Abidjan</th><th>Cotonou</th></tr></thead><tbody><tr><th>200 L <small>Collecte</small></th><td>120 €</td><td>150 €</td><td>150 €</td></tr><tr class="depot-row"><th>200 L <small>Dépôt</small></th><td>110 €</td><td>140 €</td><td>140 €</td></tr><tr><th>250 L <small>Collecte</small></th><td>140 €</td><td>170 €</td><td>170 €</td></tr><tr class="depot-row"><th>250 L <small>Dépôt</small></th><td>130 €</td><td>160 €</td><td>160 €</td></tr></tbody></table></div>
        </article>
        <article class="rate-card rate-card-wide">
          <span class="rate-icon">♢</span><h3>Vins & champagnes</h3>
          <div class="rate-table-wrap compact"><table class="rate-table mobile-destination-table"><thead><tr><th>Carton de 6 bouteilles</th><th>Lomé</th><th>Abidjan</th><th>Cotonou</th></tr></thead><tbody><tr><th>Vin · collecte</th><td>15 €</td><td>20 €</td><td>25 €</td></tr><tr class="depot-row"><th>Vin · dépôt</th><td>10 €</td><td>15 €</td><td>20 €</td></tr><tr><th>Champagne · collecte</th><td>25 €</td><td>30 €</td><td>40 €</td></tr><tr class="depot-row"><th>Champagne · dépôt</th><td>20 €</td><td>25 €</td><td>35 €</td></tr></tbody></table></div>
        </article>
      </div>

      <div class="bulky-block">
        <div class="rates-heading"><div><p class="kicker">Produits volumineux</p><h2>Électroménager & <em>mobilier</em></h2></div><p>Tarifs à partir de, selon la destination et le mode de remise.</p></div>
        <div class="rate-table-wrap"><table class="rate-table mobile-destination-table"><thead><tr><th>Article</th><th>Lomé</th><th>Abidjan</th><th>Cotonou</th></tr></thead><tbody><template v-for="item in bulkyRates" :key="item.item"><tr><th>{{ item.item }} <small>Collecte</small></th><td v-for="price in item.home" :key="price">{{ price }}</td></tr><tr v-if="item.depot" class="depot-row"><th>{{ item.item }} <small>Dépôt</small></th><td v-for="price in item.depot" :key="price">{{ price }}</td></tr></template></tbody></table></div>
      </div>
    </section>

    <section id="services" class="rates-section rates-dark">
      <div class="rates-heading"><div><p class="kicker">04 · Services complémentaires</p><h2>Une prise en charge <em>complète</em></h2></div></div>
      <div class="service-rate-grid">
        <article><h3>Conditionnement & emballage</h3><p><span>Conditionnement simple d’un carton</span><strong>10 €</strong></p><p><span>Conditionnement renforcé</span><strong>15 à 25 €</strong></p><p><span>Emballage d’un objet fragile</span><strong>Sur devis</strong></p></article>
        <article><h3>Démarches administratives</h3><p><span>Traitement administratif standard</span><strong>10 €</strong></p><p><span>Dossier complexe ou documents spécifiques</span><strong>Sur devis</strong></p></article>
        <article><h3>Solutions professionnelles</h3><p><span>Palette Europe ou industrielle</span><strong>Sur devis</strong></p><p><span>Conteneur 20 ou 40 pieds</span><strong>Sur devis</strong></p><p><span>Conteneur 40’ High Cube</span><strong>Sur devis</strong></p></article>
      </div>
    </section>

    <section id="conditions" class="rates-notice">
      <div><p class="kicker">À noter</p><h2>Des tarifs <em>indicatifs</em></h2></div>
      <ul><li>Les tarifs dépôt sont valables uniquement pour les colis déjà emballés et prêts à être expédiés.</li><li>Tout conditionnement, renforcement d’emballage ou formalité administrative supplémentaire sera facturé en supplément.</li><li>Les tarifs peuvent évoluer selon le volume, le poids et la nature des marchandises.</li><li>Le montant définitif est confirmé après vérification de votre envoi.</li></ul>
    </section>

    <section class="cta"><h2>Besoin d’un tarif pour <em>votre colis ?</em></h2><NuxtLink class="btn white" to="/devis-en-ligne?transport=À%20conseiller&cta=final&from=tarifs">Demander mon devis →</NuxtLink></section>
    <SiteFooter />
  </main>
</template>
