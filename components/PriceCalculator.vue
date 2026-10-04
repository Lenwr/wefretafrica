<script setup lang="ts">
type Destination = 'Togo' | 'Bénin' | 'Sénégal' | 'Cameroun' | 'Abidjan / Côte d’Ivoire' | 'Autre'
type Category = 'parcel' | 'clothes' | 'electronic' | 'large-carton' | 'small-carton' | 'volume' | 'tv' | 'other'

const props = withDefaults(defineProps<{ initialMode?: 'air' | 'sea', source?: string }>(), { initialMode: 'air', source: 'tarifs' })
const mode = ref<'air' | 'sea'>(props.initialMode)
const destination = ref<Destination>('Togo')
const category = ref<Category>(props.initialMode === 'sea' ? 'large-carton' : 'parcel')
const weight = ref(10)
const itemCondition = ref<'new' | 'used'>('new')
const screenSize = ref(43)
const shape = ref<'box' | 'cylinder' | 'sphere' | 'irregular'>('box')
const length = ref(100), width = ref(60), height = ref(50)
const diameter = ref(60), cylinderHeight = ref(100)

const airRates: Partial<Record<Destination, number>> = { Togo: 12, Bénin: 15, Sénégal: 12, Cameroun: 13 }
const seaVolumeRates: Partial<Record<Destination, number>> = { Togo: 500, Sénégal: 500, 'Abidjan / Côte d’Ivoire': 500, Bénin: 750, Cameroun: 850 }
const largeCartonRates: Partial<Record<Destination, number>> = { Togo: 100, Sénégal: 100, 'Abidjan / Côte d’Ivoire': 100, Bénin: 150 }
const smallCartonRates: Partial<Record<Destination, number>> = { Togo: 60, Sénégal: 60, 'Abidjan / Côte d’Ivoire': 60, Bénin: 90 }
const tvRates: Partial<Record<Destination, number>> = { Togo: 5, Bénin: 7, 'Abidjan / Côte d’Ivoire': 7 }

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

watch(mode, value => { category.value = value === 'air' ? 'parcel' : 'large-carton' })

const currentRate = computed(() => mode.value === 'air' ? airRates[destination.value] : seaVolumeRates[destination.value])
const needsQuote = computed(() => {
  if (destination.value === 'Autre') return true
  if (mode.value === 'air') return !airRates[destination.value]
  if (category.value === 'tv') return !tvRates[destination.value]
  if (category.value === 'other') return true
  if (category.value === 'large-carton') return !largeCartonRates[destination.value] && destination.value !== 'Cameroun'
  if (category.value === 'small-carton') return !smallCartonRates[destination.value] && destination.value !== 'Cameroun'
  return !seaVolumeRates[destination.value]
})

const freightEstimate = computed(() => {
  if (mode.value === 'air') {
    const billableWeight = destination.value === 'Cameroun' ? Math.max(5, safe(weight.value)) : safe(weight.value)
    return Math.round(billableWeight * (airRates[destination.value] || 0))
  }
  if (category.value === 'tv') return Math.round(safe(screenSize.value) * (tvRates[destination.value] || 0))
  if (category.value === 'large-carton') return largeCartonRates[destination.value] || (destination.value === 'Cameroun' ? Math.round(0.195372 * 850) : 0)
  if (category.value === 'small-carton') return smallCartonRates[destination.value] || (destination.value === 'Cameroun' ? Math.round(0.096 * 850) : 0)
  return Math.round(volume.value * (seaVolumeRates[destination.value] || 0))
})

const customsLabel = computed(() => itemCondition.value === 'used' ? '15 000 à 20 000 FCFA' : destination.value === 'Togo' ? '25 000 FCFA' : '20 000 FCFA')
const parcelType = computed(() => {
  if (category.value === 'electronic' || category.value === 'tv') return 'Télévision / appareil électronique'
  if (category.value === 'clothes') return 'Vêtements / effets personnels'
  if (category.value === 'large-carton' || category.value === 'small-carton') return 'Carton / barrique'
  if (category.value === 'volume') return 'Électroménager / objet volumineux'
  if (category.value === 'other') return 'Autre'
  return 'Colis standard'
})
const measurement = computed(() => {
  if (mode.value === 'air') return `${safe(weight.value)} kg`
  if (category.value === 'tv') return `${safe(screenSize.value)} pouces`
  if (category.value === 'large-carton') return 'Grand carton 67 × 54 × 54 cm'
  if (category.value === 'small-carton') return 'Petit carton 60 × 40 × 40 cm'
  return `${volume.value.toFixed(3)} m³`
})
const estimateDetail = computed(() => {
  if (mode.value === 'air') return destination.value === 'Cameroun' ? `${currentRate.value} €/kg vers le Cameroun · minimum facturé 5 kg` : `${currentRate.value} €/kg vers ${destination.value}`
  if (category.value === 'tv') return `${tvRates[destination.value]} €/pouce vers ${destination.value}`
  if (category.value === 'large-carton') return destination.value === 'Cameroun' ? 'Grand carton calculé au volume à 850 €/m³' : `Grand carton vers ${destination.value}`
  if (category.value === 'small-carton') return destination.value === 'Cameroun' ? 'Petit carton calculé au volume à 850 €/m³' : `Petit carton vers ${destination.value}`
  return `${currentRate.value} €/m³ vers ${destination.value}`
})
const quoteLink = computed(() => ({ path: '/devis-en-ligne', query: {
  transport: mode.value === 'air' ? 'Aérien' : 'Maritime',
  destination: destination.value === 'Autre' ? 'Autres destinations' : destination.value,
  type: parcelType.value, mesure: measurement.value, cta: 'calc', from: props.source
} }))
</script>

<template>
  <div class="calculator-card">
    <div class="mode-toggle"><button type="button" :class="{ active: mode === 'air' }" @click="mode = 'air'">✈ Aérien</button><button type="button" :class="{ active: mode === 'sea' }" @click="mode = 'sea'">▰ Maritime</button></div>
    <div class="calculator-fields">
      <label>Destination<select v-model="destination"><option>Togo</option><option>Bénin</option><option>Sénégal</option><option>Cameroun</option><option>Abidjan / Côte d’Ivoire</option><option value="Autre">Autre destination</option></select></label>
      <label>Type d’envoi<select v-if="mode === 'air'" v-model="category"><option value="parcel">Colis standard</option><option value="clothes">Vêtements / effets personnels</option><option value="electronic">Appareil électronique</option><option value="other">Autre</option></select><select v-else v-model="category"><option value="large-carton">Grand carton</option><option value="small-carton">Petit carton</option><option value="volume">Au volume</option><option value="tv">Télévision</option><option value="other">Autre objet</option></select></label>
    </div>
    <template v-if="mode === 'air'">
      <label>Poids du colis (kg)<input v-model.number="weight" type="number" min="0.1" step="0.1" inputmode="decimal"></label>
      <div v-if="category === 'electronic'" class="calculator-fields customs-fields"><label>État de l’appareil<select v-model="itemCondition"><option value="new">Neuf</option><option value="used">Deuxième main / occasion</option></select></label><div class="customs-info"><small>Frais de douane indicatifs</small><strong>{{ customsLabel }}</strong></div></div>
    </template>
    <template v-else>
      <div v-if="category === 'tv'" class="calculator-fields"><label>Taille de la télévision (pouces)<input v-model.number="screenSize" type="number" min="1" step="1" inputmode="numeric"></label></div>
      <template v-if="category === 'volume'">
        <label>Forme de l’objet<select v-model="shape"><option value="box">Carton / pavé droit</option><option value="cylinder">Cylindre / rouleau / tonneau</option><option value="sphere">Sphère / objet rond</option><option value="irregular">Forme irrégulière</option></select></label>
        <div v-if="shape === 'box' || shape === 'irregular'" class="dimension-grid"><label>Longueur (cm)<input v-model.number="length" type="number" min="0" step="1"></label><label>Largeur (cm)<input v-model.number="width" type="number" min="0" step="1"></label><label>Hauteur (cm)<input v-model.number="height" type="number" min="0" step="1"></label></div>
        <div v-else-if="shape === 'cylinder'" class="dimension-grid two"><label>Diamètre (cm)<input v-model.number="diameter" type="number" min="0" step="1"></label><label>Hauteur (cm)<input v-model.number="cylinderHeight" type="number" min="0" step="1"></label></div>
        <div v-else class="dimension-grid one"><label>Diamètre (cm)<input v-model.number="diameter" type="number" min="0" step="1"></label></div>
        <p v-if="shape === 'irregular'" class="field-help">Mesurez les dimensions maximales de l’objet. Le volume retenu correspond à son encombrement.</p>
        <div class="volume-result"><span>Volume calculé</span><strong>{{ volume.toFixed(3) }} m³</strong></div>
      </template>
    </template>
    <div v-if="needsQuote" class="estimate manual"><span>Tarification spécifique</span><strong>Sur devis</strong><small>Le tarif de cet envoi doit être confirmé par notre équipe.</small></div>
    <div v-else-if="mode === 'air' && category === 'electronic'" class="estimate customs-estimate"><span>Transport aérien</span><strong>{{ freightEstimate }} €</strong><small>{{ estimateDetail }}. Douane indicative : {{ customsLabel }}.</small><b>Les frais de douane concernent uniquement les appareils électroniques.</b></div>
    <div v-else class="estimate"><span>Estimation indicative</span><strong>{{ freightEstimate }} €</strong><small>{{ estimateDetail }} — tarif final après contrôle du colis.</small></div>
    <p class="estimate-disclaimer">Estimation non contractuelle. Les dimensions, la valeur et les éventuels frais de douane sont contrôlés avant validation.</p>
    <NuxtLink class="btn full" :to="quoteLink">Demander mon devis →</NuxtLink>
  </div>
</template>
