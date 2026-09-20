<script setup lang="ts">
const mode = ref<'air'|'sea'>('air')
const destination = ref<'Togo'|'Bénin'|'Autre'>('Togo')
const category = ref<'parcel'|'clothes'|'other'|'electronic'|'carton'|'tv'>('parcel')
const weight = ref(10)
const itemCondition = ref<'new'|'used'>('new')
const screenSize = ref(43)
const shape = ref<'box'|'cylinder'|'sphere'|'irregular'>('box')
const length = ref(100), width = ref(60), height = ref(50)
const diameter = ref(60), cylinderHeight = ref(100)

const safe = (value: number) => Math.max(0, Number(value) || 0)
const volume = computed(() => {
  if (shape.value === 'cylinder') {
    const radius = safe(diameter.value) / 2
    return Math.PI * radius * radius * safe(cylinderHeight.value) / 1_000_000
  }
  if (shape.value === 'sphere') {
    const radius = safe(diameter.value) / 2
    return (4 / 3) * Math.PI * radius ** 3 / 1_000_000
  }
  return safe(length.value) * safe(width.value) * safe(height.value) / 1_000_000
})
watch(mode, value => { category.value = value === 'air' ? 'parcel' : 'carton' })
const needsQuote = computed(() => destination.value === 'Autre' || (mode.value === 'sea' && (category.value === 'other' || (category.value === 'tv' && destination.value !== 'Togo'))))
const rate = computed(() => mode.value === 'air'
  ? (destination.value === 'Togo' ? 12 : 15)
  : (destination.value === 'Togo' ? 600 : 750))
const freightEstimate = computed(() => mode.value === 'air'
  ? Math.round(safe(weight.value) * rate.value)
  : category.value === 'tv'
    ? Math.round(safe(screenSize.value) * (itemCondition.value === 'new' ? 5 : 3))
    : (destination.value === 'Togo' ? 100 : 150))
const customsLabel = computed(() => {
  if (itemCondition.value === 'used') return '15 000 à 20 000 FCFA'
  return destination.value === 'Togo' ? '25 000 FCFA' : '20 000 FCFA'
})
const measurement = computed(() => mode.value === 'air' ? `${safe(weight.value)} kg` : category.value === 'tv' ? `${safe(screenSize.value)} pouces` : '1 carton')
const quoteLink = computed(() => ({ path: '/devis-en-ligne', query: {
  transport: mode.value === 'air' ? 'Aérien' : 'Maritime', destination: destination.value,
  type: category.value === 'electronic' ? `Appareil électronique ${itemCondition.value === 'new' ? 'neuf' : 'd’occasion'}` : category.value === 'tv' ? `Télévision ${itemCondition.value === 'new' ? 'neuve' : 'd’occasion'}` : category.value === 'clothes' ? 'Vêtements / effets personnels' : category.value === 'carton' ? 'Carton' : category.value === 'other' ? 'Autre' : 'Colis',
  mesure: measurement.value
}}))
</script>
<template>
  <div class="calculator-card">
    <div class="mode-toggle"><button type="button" :class="{active:mode==='air'}" @click="mode='air'">✈ Aérien</button><button type="button" :class="{active:mode==='sea'}" @click="mode='sea'">▰ Maritime</button></div>
    <div class="calculator-fields">
      <label>Destination<select v-model="destination"><option>Togo</option><option>Bénin</option><option value="Autre">Autre pays d’Afrique de l’Ouest</option></select></label>
      <label>Type d’envoi<select v-if="mode==='air'" v-model="category"><option value="parcel">Colis</option><option value="clothes">Vêtements / effets personnels</option><option value="electronic">Appareil électronique</option><option value="other">Autre</option></select><select v-else v-model="category"><option value="carton">Carton</option><option value="tv">Télévision</option><option value="other">Autre objet / volume</option></select></label>
    </div>
    <template v-if="mode==='air'">
      <label>Poids du colis (kg)<input v-model.number="weight" type="number" min="0.1" step="0.1" inputmode="decimal"></label>
      <div v-if="category==='electronic'" class="calculator-fields customs-fields">
        <label>État de l’appareil<select v-model="itemCondition"><option value="new">Neuf</option><option value="used">Deuxième main / occasion</option></select></label>
        <div class="customs-info"><small>Frais de douane indicatifs</small><strong>{{customsLabel}}</strong></div>
      </div>
    </template>
    <template v-else>
      <div v-if="category==='tv'" class="calculator-fields customs-fields"><label>Taille de la télévision (pouces)<input v-model.number="screenSize" type="number" min="1" step="1" inputmode="numeric"></label><label>État de la télévision<select v-model="itemCondition"><option value="new">Neuve</option><option value="used">Deuxième main / occasion</option></select></label></div>
      <template v-if="category==='other'">
      <label>Forme de l’objet<select v-model="shape"><option value="box">Carton / pavé droit</option><option value="cylinder">Cylindre / rouleau / tonneau</option><option value="sphere">Sphère / objet rond</option><option value="irregular">Forme irrégulière</option></select></label>
      <div v-if="shape==='box' || shape==='irregular'" class="dimension-grid">
        <label>Longueur (cm)<input v-model.number="length" type="number" min="0" step="1"></label><label>Largeur (cm)<input v-model.number="width" type="number" min="0" step="1"></label><label>Hauteur (cm)<input v-model.number="height" type="number" min="0" step="1"></label>
      </div>
      <div v-else-if="shape==='cylinder'" class="dimension-grid two">
        <label>Diamètre (cm)<input v-model.number="diameter" type="number" min="0" step="1"></label><label>Hauteur (cm)<input v-model.number="cylinderHeight" type="number" min="0" step="1"></label>
      </div>
      <div v-else class="dimension-grid one"><label>Diamètre (cm)<input v-model.number="diameter" type="number" min="0" step="1"></label></div>
      <p v-if="shape==='irregular'" class="field-help">Mesurez les dimensions maximales de l’objet. Le volume retenu correspond à son encombrement.</p>
      <div class="volume-result"><span>Volume calculé</span><strong>{{volume.toFixed(3)}} m³</strong></div>
      </template>
    </template>
    <div v-if="needsQuote" class="estimate manual"><span>Tarification spécifique</span><strong>Sur devis</strong><small>{{category==='tv' ? `La télévision est facturée au pouce (${safe(screenSize)} pouces indiqués).` : 'Cette expédition nécessite une vérification manuelle.'}}</small></div>
    <div v-else-if="mode==='air' && category==='electronic'" class="estimate customs-estimate">
      <span>Transport aérien</span><strong>{{freightEstimate}} €</strong>
      <small>Douane indicative : {{customsLabel}} ({{itemCondition==='new' ? 'appareil neuf' : 'deuxième main'}}).</small>
      <b>Les frais de douane concernent uniquement les appareils électroniques.</b>
    </div>
    <div v-else class="estimate"><span>Estimation indicative</span><strong>{{freightEstimate}} €</strong><small>{{mode==='air' ? `${rate} €/kg` : category==='tv' ? `${itemCondition==='new' ? 5 : 3} €/pouce vers Lomé — télévision ${itemCondition==='new' ? 'neuve' : 'd’occasion'}` : `Tarif par carton vers ${destination}`}} — tarif final après contrôle du colis.</small></div>
    <p class="estimate-disclaimer">Estimation non contractuelle. Les dimensions, la valeur et les frais de douane seront contrôlés avant validation.</p>
    <NuxtLink class="btn full" :to="quoteLink">Recevoir mon devis détaillé →</NuxtLink>
  </div>
</template>
