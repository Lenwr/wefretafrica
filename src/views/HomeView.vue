<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import ParcelHero3D from '../components/ParcelHero3D.vue'
import { getPublicTracking, TrackingApiError } from '../services/trackingApi'

const route = useRoute()
const router = useRouter()

const trackingInput = ref(null)
const companySelect = ref(null)
const resultsSection = ref(null)
const trackingCode = ref('')
const data = ref(null)
const error = ref('')
const loading = ref(false)
const copied = ref(false)
const qrCodeUrl = ref('')
const recentSearches = ref([])
const now = ref(Date.now())
let refreshTimer
let clockTimer

const longueur = ref('')
const largeur = ref('')
const hauteur = ref('')
const destinationCalcul = ref('Togo')
const destinationAerienne = ref('Togo')
const estimationMode = ref('maritime')
const poidsAerien = ref('')
const volume = ref(null)
const estimationTarif = ref(null)
const estimationAerien = ref(null)

const agencyPhone = '0676492528'
const agencyPhoneInternational = '+33676492528'

const tarifsDestination = {
  Togo: 500,
  Bénin: 750
}

const trackingSlug = (value, fallback = 'wefretafrica') => {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

const partnerCompanies = [
  { slug: 'paris-fret', name: 'Paris Fret', routes: 'France · Togo · Bénin' },
  { slug: 'aaron-travel', name: 'Aaron Travel', routes: 'Fret international' },
  { slug: 'wefretafrica', name: 'WefretAfrica', routes: 'Afrique · International' }
]
const selectedCompanySlug = ref(
  trackingSlug(route.params.entrepriseSlug || route.query.entreprise || 'wefretafrica')
)
const entrepriseSlug = computed(() => selectedCompanySlug.value)
const availableCompanies = computed(() => {
  if (partnerCompanies.some(company => company.slug === selectedCompanySlug.value)) {
    return partnerCompanies
  }
  return [
    { slug: selectedCompanySlug.value, name: selectedCompanySlug.value, routes: 'Entreprise partenaire' },
    ...partnerCompanies
  ]
})
const selectedCompany = computed(() =>
  availableCompanies.value.find(company => company.slug === selectedCompanySlug.value)
)

const tarifBase = computed(() => tarifsDestination[destinationCalcul.value] || 0)
const tarifsAeriens = {
  Togo: 12,
  Cotonou: 15
}
const tarifAerienKg = computed(() => tarifsAeriens[destinationAerienne.value] || 0)
const whatsappLink = computed(() =>
  `https://wa.me/${agencyPhoneInternational.replace('+', '')}`
)
const publicTrackingUrl = computed(() => {
  if (!data.value || typeof window === 'undefined') return ''
  const url = new URL(`/suivi/${entrepriseSlug.value}`, window.location.origin)
  url.searchParams.set('code', data.value.numero)
  return url.toString()
})
const shareWhatsappLink = computed(() =>
  `https://wa.me/?text=${encodeURIComponent(`Suivez le colis ${data.value?.numero || ''} sur TRACKSEND : ${publicTrackingUrl.value}`)}`
)
const reportProblemLink = computed(() =>
  `https://wa.me/${agencyPhoneInternational.replace('+', '')}?text=${encodeURIComponent(`Bonjour, je souhaite signaler un problème avec le colis ${data.value?.numero || ''}.`)}`
)
const quoteWhatsappLink = computed(() => {
  const message = estimationMode.value === 'aerien'
    ? `Bonjour, je souhaite un devis aérien vers ${destinationAerienne.value} pour ${poidsAerien.value || 0} kg. Estimation TRACKSEND : ${estimationAerien.value ?? '-'} €.`
    : `Bonjour, je souhaite un devis maritime vers ${destinationCalcul.value} pour ${volume.value ?? 0} m³. Estimation TRACKSEND : ${estimationTarif.value ?? '-'} €.`
  return `https://wa.me/${agencyPhoneInternational.replace('+', '')}?text=${encodeURIComponent(message)}`
})

const normalizeStatus = value => {
  return ({
    PENDING: 'En attente',
    RECEIVED: 'Réceptionné',
    LOADED: 'Chargé',
    IN_TRANSIT: 'En transit',
    READY_FOR_PICKUP: 'Disponible pour retrait',
    DELIVERED: 'Livré',
    CANCELLED: 'Annulé'
  })[String(value || '').toUpperCase()] || 'Inconnu'
}

const statusRank = {
  Inconnu: -1,
  'En attente': -1,
  Réceptionné: 0,
  Chargé: 1,
  'En transit': 2,
  'Disponible pour retrait': 3,
  Livré: 4,
  Annulé: -1
}

const statusClasses = {
  Livré: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'En transit': 'border-sky-200 bg-sky-50 text-sky-700',
  Chargé: 'border-blue-200 bg-blue-50 text-blue-700',
  Réceptionné: 'border-amber-200 bg-amber-50 text-amber-700',
  'Disponible pour retrait': 'border-violet-200 bg-violet-50 text-violet-700',
  Annulé: 'border-red-200 bg-red-50 text-red-700',
  'En attente': 'border-slate-200 bg-slate-100 text-slate-700',
  Inconnu: 'border-slate-200 bg-slate-100 text-slate-700'
}

const formatDate = dateValue => {
  if (!dateValue) return 'Non disponible'

  try {
    const date = typeof dateValue?.toDate === 'function'
      ? dateValue.toDate()
      : new Date(dateValue)

    if (Number.isNaN(date.getTime())) return 'Non disponible'

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return 'Non disponible'
  }
}

const normalizeColisDetails = (colis = []) => {
  return colis.map((item, index) => ({
    id: item.id || `package-${index + 1}`,
    nom: item.label || `Colis ${index + 1}`,
    coli: item.label || `Colis ${index + 1}`,
    quantite: Number(item.quantity || 1),
    poids: Number(item.weightKg || 0),
    statutColis: normalizeStatus(item.status),
    historique: []
  }))
}

const countReachedStep = (items, targetStatus) => {
  const targetRank = statusRank[targetStatus]

  return items.filter(item => {
    const currentRank = statusRank[item.statutColis] ?? -1
    return currentRank >= targetRank
  }).length
}

const buildTimeline = (docData, colisDetails) => {
  const total = colisDetails.length
  const events = Array.isArray(docData.events) ? docData.events : []

  return [
    ['RECEIVED', 'Réceptionné'],
    ['LOADED', 'Chargé'],
    ['IN_TRANSIT', 'En transit'],
    ['READY_FOR_PICKUP', 'Disponible pour retrait'],
    ['DELIVERED', 'Livré']
  ].map(([code, label]) => {
    const event = [...events].reverse().find(item => item.status === code)
    const count = countReachedStep(colisDetails, label)

    return {
      status: label,
      date: event?.occurredAt || null,
      location: event?.location || '',
      note: event?.note || event?.label || '',
      count,
      total,
      done: total > 0 && count === total,
      started: count > 0
    }
  })
}

const rememberSearch = code => {
  const entry = { code, slug: entrepriseSlug.value, searchedAt: Date.now() }
  recentSearches.value = [
    entry,
    ...recentSearches.value.filter(item => item.code !== code || item.slug !== entry.slug)
  ].slice(0, 5)
  localStorage.setItem('tracksendRecentSearches', JSON.stringify(recentSearches.value))
}

const search = async (options = {}) => {
  const silent = options?.silent === true
  if (!silent) {
    error.value = ''
    loading.value = true
    data.value = null
  }

  try {
    const code = trackingCode.value.trim()

    if (!code || code.length < 3) {
      error.value = 'Veuillez entrer un numéro de suivi valide.'
      return
    }

    const docData = await getPublicTracking(entrepriseSlug.value, code)
    const colisDetails = normalizeColisDetails(docData.packages || [])

    data.value = {
      numero: docData.trackingNumber || code,
      etat: normalizeStatus(docData.shipment?.status),
      lastUpdate: formatDate(docData.updatedAt),
      dateDepot: formatDate(docData.createdAt),
      timeline: buildTimeline(docData, colisDetails),
      colis: colisDetails,
      expediteur: docData.sender?.name || 'Non renseigné',
      destinataire: docData.recipient?.name || 'Non renseigné',
      destination: docData.shipment?.destination || 'Non renseigné',
      typeDeFret: docData.shipment?.service || 'Non renseigné',
      nombreColis: colisDetails.reduce((sum, item) => sum + item.quantite, 0),
      poidsTotal: colisDetails.reduce((sum, item) => sum + item.poids, 0),
      estimatedDeliveryAt: docData.shipment?.estimatedDeliveryAt || null,
      updatedAt: docData.updatedAt,
      companyName: docData.company?.name || ''
    }

    document.title = `${data.value.numero} · TRACKSEND`
    rememberSearch(data.value.numero)
    if (route.query.code !== data.value.numero) {
      await router.replace({
        name: 'tracking',
        params: { entrepriseSlug: entrepriseSlug.value },
        query: { code: data.value.numero }
      })
    }
    qrCodeUrl.value = await QRCode.toDataURL(publicTrackingUrl.value, {
      width: 240,
      margin: 1,
      color: { dark: '#0f2f5f', light: '#ffffff' }
    })

    if (!silent) {
      await nextTick()
      const top = resultsSection.value?.getBoundingClientRect().top + window.scrollY - 88
      if (Number.isFinite(top)) {
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  } catch (e) {
    if (e instanceof TrackingApiError && e.status === 404) {
      error.value = `Aucun colis trouvé chez ${selectedCompany.value?.name || entrepriseSlug.value} pour ce numéro.`
    } else if (e instanceof TrackingApiError && e.code === 'API_NOT_CONFIGURED') {
      error.value = 'Le service de suivi n’est pas configuré.'
    } else if (e instanceof TrackingApiError && e.status === 429) {
      error.value = 'Trop de recherches. Réessayez dans une minute.'
    } else {
      console.error(e)
      error.value = 'Le service de suivi est momentanément indisponible.'
    }
  } finally {
    if (!silent) loading.value = false
  }
}

const colisList = computed(() => data.value?.colis || [])
const timeline = computed(() => data.value?.timeline || [])

const reachedStepIndex = computed(() => {
  let lastReached = -1

  timeline.value.forEach((step, index) => {
    if (step.started || step.done) lastReached = index
  })

  return lastReached
})

const lineFillWidth = computed(() => {
  if (!timeline.value.length || reachedStepIndex.value <= 0) return '0%'
  return `${(reachedStepIndex.value / (timeline.value.length - 1)) * 100}%`
})
const nextStep = computed(() => timeline.value.find(step => !step.done))
const updatedAgo = computed(() => {
  const updatedAt = new Date(data.value?.updatedAt || 0).getTime()
  if (!updatedAt) return ''
  const minutes = Math.max(0, Math.floor((now.value - updatedAt) / 60000))
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return `il y a ${Math.floor(hours / 24)} j`
})
const aerienFormula = computed(() =>
  estimationAerien.value === null
    ? ''
    : `${Number(poidsAerien.value)} kg × ${tarifAerienKg.value} € = ${estimationAerien.value} €`
)

const copyTrackingNumber = async () => {
  try {
    await navigator.clipboard.writeText(data.value?.numero || '')
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1800)
  } catch {
    copied.value = false
  }
}

const useRecentSearch = async item => {
  trackingCode.value = item.code
  if (item.slug !== entrepriseSlug.value) {
    await router.push({
      name: 'tracking',
      params: { entrepriseSlug: item.slug },
      query: { code: item.code }
    })
  }
  await search()
}

const changeCompany = async () => {
  error.value = ''
  data.value = null
  qrCodeUrl.value = ''
  await router.replace({
    name: 'tracking',
    params: { entrepriseSlug: selectedCompanySlug.value },
    query: trackingCode.value.trim() ? { code: trackingCode.value.trim() } : {}
  })
  trackingInput.value?.focus()
}

const calculerVolume = () => {
  estimationAerien.value = null

  const l = Number(longueur.value)
  const L = Number(largeur.value)
  const h = Number(hauteur.value)

  if (l > 0 && L > 0 && h > 0) {
    const v = (l * L * h) / 1000000
    volume.value = Number(v.toFixed(3))
    estimationTarif.value = Number((volume.value * tarifBase.value).toFixed(2))
    return
  }

  volume.value = null
  estimationTarif.value = null
}

const calculerAerien = () => {
  volume.value = null
  estimationTarif.value = null

  const poids = Number(String(poidsAerien.value).replace(',', '.'))

  estimationAerien.value = poids > 0
    ? Number((poids * tarifAerienKg.value).toFixed(2))
    : null
}

onMounted(() => {
  try {
    recentSearches.value = JSON.parse(localStorage.getItem('tracksendRecentSearches') || '[]')
  } catch {
    recentSearches.value = []
  }

  let savedCalculator = {}
  try {
    savedCalculator = JSON.parse(localStorage.getItem('tracksendCalculator') || '{}')
  } catch {
    savedCalculator = {}
  }
  destinationCalcul.value = savedCalculator.destinationCalcul || destinationCalcul.value
  destinationAerienne.value = savedCalculator.destinationAerienne || destinationAerienne.value
  estimationMode.value = savedCalculator.estimationMode || estimationMode.value

  clockTimer = window.setInterval(() => { now.value = Date.now() }, 30000)
  refreshTimer = window.setInterval(() => {
    if (data.value && !loading.value) search({ silent: true })
  }, 60000)

  if (route.query.code) {
    trackingCode.value = String(route.query.code)
    search()
  } else {
    trackingInput.value?.focus()
  }
})

watch(
  [destinationCalcul, destinationAerienne, estimationMode],
  () => localStorage.setItem('tracksendCalculator', JSON.stringify({
    destinationCalcul: destinationCalcul.value,
    destinationAerienne: destinationAerienne.value,
    estimationMode: estimationMode.value
  }))
)

watch(
  () => route.params.entrepriseSlug,
  value => {
    const slug = trackingSlug(value || route.query.entreprise || 'wefretafrica')
    if (slug !== selectedCompanySlug.value) selectedCompanySlug.value = slug
  }
)

watch([poidsAerien, destinationAerienne], () => {
  if (Number(String(poidsAerien.value).replace(',', '.')) > 0) calculerAerien()
})

watch([longueur, largeur, hauteur, destinationCalcul], () => {
  if ([longueur.value, largeur.value, hauteur.value].every(value => Number(value) > 0)) {
    calculerVolume()
  }
})

onBeforeUnmount(() => {
  window.clearInterval(refreshTimer)
  window.clearInterval(clockTimer)
  document.title = 'TRACKSEND · Suivi de colis'
})
</script>

<template>
  <div class="min-h-screen bg-sky-50 text-slate-900">
    <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-white shadow-xl backdrop-blur">
      <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
          <img
            src="/tracksend-logo.png"
            alt="TRACKSEND"
            class="h-14 w-44 rounded-xl bg-white object-contain px-2 shadow-lg shadow-sky-500/10"
          />
          <p class="hidden text-xs font-semibold uppercase tracking-[0.2em] text-sky-200 lg:block">
            Suivez · Expédiez · Livrez
          </p>
        </div>

        <a href="#calculateur" class="hidden rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-400/20 sm:inline">
          Estimer un envoi
        </a>
      </div>
    </header>

    <main>
      <section
        class="relative overflow-hidden bg-slate-950"
        style="background-image: radial-gradient(circle at 18% 20%, rgba(249,115,22,.34), transparent 28%), radial-gradient(circle at 84% 18%, rgba(14,165,233,.28), transparent 30%), linear-gradient(rgba(2, 6, 23, .72), rgba(15, 23, 42, .68)), url('/fret2.jpg'); background-size: cover; background-position: center;"
      >
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-sky-50 to-transparent"></div>

        <div class="mx-auto grid min-h-[82vh] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
          <div class="max-w-3xl text-white">
            <p class="mb-4 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 shadow-lg shadow-sky-500/10">
              Suivi sécurisé par numéro de colis
            </p>
            <h1 class="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Suivez votre colis en quelques secondes.
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Entrez le numéro inscrit sur votre bordereau ou scannez le QR code pour consulter l'état d'avancement en temps réel.
            </p>

            <div class="mt-7 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p class="text-2xl font-black text-sky-300">24/7</p>
                <p class="mt-1 text-xs font-bold text-slate-200">Suivi disponible</p>
              </div>
              <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p class="text-2xl font-black text-sky-300">QR</p>
                <p class="mt-1 text-xs font-bold text-slate-200">Accès rapide</p>
              </div>
              <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p class="text-2xl font-black text-emerald-300">SMS</p>
                <p class="mt-1 text-xs font-bold text-slate-200">Contact agence</p>
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="relative h-52 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-500 via-blue-950 to-cyan-500 shadow-2xl shadow-slate-950/30 sm:h-64 lg:h-72">
              <ParcelHero3D />
              <div class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/35 to-transparent"></div>
            </div>

            <div class="relative z-10 -mt-8 rounded-3xl border border-white/30 bg-white p-4 shadow-2xl sm:p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-black uppercase text-blue-700">Suivre un colis</p>
                  <p class="mt-1 text-xs font-semibold text-slate-500">
                    Choisissez votre entreprise puis saisissez le numéro du bordereau.
                  </p>
                </div>
                <span class="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-blue-700 sm:inline">
                  Multi-entreprises
                </span>
              </div>
              <div class="mt-3 space-y-3">
                <label class="block">
                  <span class="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Entreprise de fret
                  </span>
                  <select
                    ref="companySelect"
                    v-model="selectedCompanySlug"
                    class="h-14 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 text-base font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    @change="changeCompany"
                  >
                    <option
                      v-for="company in availableCompanies"
                      :key="company.slug"
                      :value="company.slug"
                    >
                      {{ company.name }} — {{ company.routes }}
                    </option>
                  </select>
                </label>

                <label class="block">
                  <span class="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Numéro de suivi
                  </span>
                <input
                  ref="trackingInput"
                  v-model="trackingCode"
                  class="h-14 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 text-base font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  placeholder="Ex: COL-1781180000"
                  @keyup.enter="search"
                />
                </label>

                <button
                  class="h-14 w-full rounded-2xl bg-blue-700 px-5 text-base font-black text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="loading || trackingCode.trim().length < 3"
                  @click="search"
                >
                  {{ loading ? 'Recherche en cours...' : 'Suivre mon colis' }}
                </button>
              </div>

              <p class="mt-4 text-sm leading-6 text-slate-500">
                Recherche chez <strong class="text-slate-700">{{ selectedCompany?.name }}</strong>.
                Les informations sont accessibles uniquement avec l’entreprise et le numéro du colis.
              </p>
              <div v-if="recentSearches.length" class="mt-4 border-t border-slate-100 pt-4">
                <p class="text-xs font-bold uppercase text-slate-400">Recherches récentes</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <button
                    v-for="item in recentSearches"
                    :key="`${item.slug}-${item.code}`"
                    class="max-w-full truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-sky-100 hover:text-blue-700"
                    @click="useRecentSearch(item)"
                  >
                    {{ item.code }} · {{ availableCompanies.find(company => company.slug === item.slug)?.name || item.slug }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref="resultsSection" class="relative z-20 scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div class="animate-pulse space-y-4">
              <div class="h-6 w-44 rounded bg-slate-200"></div>
              <div class="h-28 rounded-xl bg-slate-100"></div>
              <div class="grid gap-4 md:grid-cols-3">
                <div class="h-24 rounded-xl bg-slate-100"></div>
                <div class="h-24 rounded-xl bg-slate-100"></div>
                <div class="h-24 rounded-xl bg-slate-100"></div>
              </div>
            </div>
          </div>

          <div v-else-if="error" class="rounded-3xl border border-red-100 bg-white p-6 text-red-700 shadow-xl shadow-red-100">
            <p class="text-lg font-black">Recherche impossible</p>
            <p class="mt-1 text-sm">{{ error }}</p>
            <p class="mt-3 text-sm text-red-500">
              Vérifiez le numéro du bordereau et l’entreprise sélectionnée, ou utilisez le QR code généré depuis la fiche colis.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                class="rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700"
                @click="trackingInput?.focus()"
              >
                Corriger le numéro
              </button>
              <button
                class="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-700 hover:bg-red-50"
                @click="companySelect?.focus()"
              >
                Changer d’entreprise
              </button>
            </div>
          </div>

          <div v-else-if="data" class="space-y-6">
            <section class="rounded-3xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/70 sm:p-6">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p class="text-sm font-bold text-slate-500">Colis {{ data.numero }}</p>
                  <h2 class="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                    {{ data.destination }}
                  </h2>
                  <p class="mt-2 text-sm text-slate-500">
                    Dernière mise à jour : <span class="font-bold text-slate-700">{{ data.lastUpdate }}</span>
                    <span v-if="updatedAgo" class="ml-1 text-sky-700">({{ updatedAgo }})</span>
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50" @click="copyTrackingNumber">
                    {{ copied ? 'Copié ✓' : 'Copier le numéro' }}
                  </button>
                  <a :href="shareWhatsappLink" target="_blank" rel="noopener" class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                    Partager
                  </a>
                  <span
                    class="w-fit rounded-full border px-4 py-2 text-sm font-black"
                    :class="statusClasses[data.etat] || statusClasses.Inconnu"
                  >
                    {{ data.etat }}
                  </span>
                </div>
              </div>

              <div class="mt-5 grid gap-3 md:grid-cols-2">
                <div class="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <p class="text-xs font-bold uppercase text-blue-600">Prochaine étape</p>
                  <p class="mt-1 font-black">{{ nextStep ? nextStep.status : 'Acheminement terminé' }}</p>
                  <p class="mt-1 text-sm text-slate-600">
                    {{ nextStep ? 'Le suivi sera actualisé automatiquement.' : 'Le colis a atteint sa dernière étape.' }}
                  </p>
                </div>
                <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p class="text-xs font-bold uppercase text-emerald-700">Livraison estimée</p>
                  <p class="mt-1 font-black">
                    {{ data.estimatedDeliveryAt ? formatDate(data.estimatedDeliveryAt) : 'À confirmer par l’agence' }}
                  </p>
                  <p class="mt-1 text-sm text-emerald-700">Actualisation automatique toutes les minutes</p>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div class="rounded-2xl bg-sky-50 p-4">
                  <p class="text-xs font-bold uppercase text-slate-400">Fret</p>
                  <p class="mt-1 font-black">{{ data.typeDeFret }}</p>
                </div>
                <div class="rounded-2xl bg-sky-50 p-4">
                  <p class="text-xs font-bold uppercase text-slate-400">Colis</p>
                  <p class="mt-1 font-black">{{ data.nombreColis }}</p>
                </div>
                <div class="rounded-2xl bg-emerald-50 p-4">
                  <p class="text-xs font-bold uppercase text-slate-400">Poids</p>
                  <p class="mt-1 font-black">
                    {{ data.poidsTotal > 0 ? `${data.poidsTotal} kg` : '-' }}
                  </p>
                </div>
                <div class="rounded-2xl bg-violet-50 p-4">
                  <p class="text-xs font-bold uppercase text-slate-400">Dépôt</p>
                  <p class="mt-1 text-sm font-black">{{ data.dateDepot }}</p>
                </div>
              </div>
            </section>

            <section class="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 class="text-lg font-black">Avancement</h3>

              <div class="relative mt-7">
                <div class="absolute left-0 right-0 top-5 hidden h-1 rounded bg-slate-200 md:block"></div>
                <div
                  class="absolute left-0 top-5 hidden h-1 rounded bg-blue-600 transition-all md:block"
                  :style="{ width: lineFillWidth }"
                ></div>

                <div class="grid gap-4 md:grid-cols-5">
                  <div
                    v-for="(step, index) in timeline"
                    :key="step.status"
                    class="relative rounded-xl border border-slate-200 bg-white p-4 md:border-0 md:p-0 md:text-center"
                  >
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-lg md:mx-auto"
                      :class="step.done
                        ? 'bg-emerald-600 shadow-emerald-200'
                        : index <= reachedStepIndex
                          ? 'bg-blue-600 shadow-blue-200'
                          : 'bg-slate-300 shadow-slate-100'"
                    >
                      {{ index + 1 }}
                    </div>
                    <p class="mt-3 font-black">{{ step.status }}</p>
                    <p class="mt-1 text-sm text-slate-500">
                      {{ step.count }}/{{ step.total }} colis
                    </p>
                    <p v-if="step.date" class="mt-1 text-xs text-slate-400">
                      {{ formatDate(step.date) }}
                    </p>
                    <p v-if="step.location" class="mt-1 text-xs font-semibold text-slate-500">
                      {{ step.location }}
                    </p>
                    <p v-if="step.note" class="mt-1 text-xs text-slate-400">{{ step.note }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 class="text-lg font-black">Détails des colis</h3>

                <div class="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <div class="hidden grid-cols-[1fr_120px_170px] bg-slate-950 px-4 py-3 text-sm font-black text-white md:grid">
                    <span>Désignation</span>
                    <span>Quantité</span>
                    <span>Statut</span>
                  </div>

                  <div
                    v-for="item in colisList"
                    :key="item.id"
                    class="grid gap-2 border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid-cols-[1fr_120px_170px] md:items-center"
                  >
                    <div>
                      <p class="font-black">{{ item.coli }}</p>
                      <p class="text-sm text-slate-500">{{ item.nom }}</p>
                    </div>
                    <p class="text-sm font-bold text-slate-700">{{ item.quantite }}</p>
                    <span
                      class="w-fit rounded-full border px-3 py-1 text-xs font-black"
                      :class="statusClasses[item.statutColis] || statusClasses.Inconnu"
                    >
                      {{ item.statutColis === 'Chargé' ? 'En transit' : item.statutColis }}
                    </span>
                  </div>
                </div>
              </div>

              <aside class="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
                <h3 class="text-lg font-black">Informations</h3>
                <dl class="mt-4 space-y-4 text-sm">
                  <div>
                    <dt class="font-bold uppercase text-slate-400">Expéditeur</dt>
                    <dd class="mt-1 font-black">{{ data.expediteur }}</dd>
                  </div>
                  <div>
                    <dt class="font-bold uppercase text-slate-400">Destinataire</dt>
                    <dd class="mt-1 font-black">{{ data.destinataire }}</dd>
                  </div>
                </dl>

                <div class="mt-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-4">
                  <p class="text-xs font-bold uppercase text-slate-400">Agence</p>
                  <p class="mt-1 text-lg font-black">{{ agencyPhone }}</p>
                  <div class="mt-3 grid grid-cols-2 gap-2">
                    <a
                      :href="`tel:${agencyPhone}`"
                      class="rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-black text-white"
                    >
                      Appeler
                    </a>
                    <a
                      :href="whatsappLink"
                      target="_blank"
                      rel="noopener"
                      class="rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-black text-white"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div class="mt-5 rounded-2xl border border-sky-100 p-4 text-center">
                  <p class="text-xs font-bold uppercase text-blue-700">QR code du suivi</p>
                  <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR code du suivi" class="mx-auto mt-2 h-36 w-36" />
                  <p class="mt-2 text-xs text-slate-500">Scannez pour rouvrir ce colis.</p>
                </div>

                <a
                  :href="reportProblemLink"
                  target="_blank"
                  rel="noopener"
                  class="mt-4 block rounded-xl border border-red-100 px-4 py-3 text-center text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  Signaler un problème
                </a>
                <p v-if="data.companyName" class="mt-4 text-center text-xs text-slate-400">
                  Expédition gérée par {{ data.companyName }}
                </p>
              </aside>
            </section>
          </div>
        </div>
      </section>

      <div id="calculateur" class="border-t border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-4 py-12 sm:px-6 lg:px-8">
        <div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <div>
            <p class="text-sm font-black uppercase text-blue-700">Estimation d'envoi</p>
            <h2 class="mt-2 text-3xl font-black text-slate-950">Estimez rapidement un envoi maritime ou aérien.</h2>
            <p class="mt-3 max-w-2xl text-slate-600">
              Le maritime se calcule au volume en m3. L'aérien se calcule au poids selon la destination.
              Pour un tarif confirmé, contactez l'agence.
            </p>

            <div class="mt-5 flex flex-wrap gap-3">
              <a :href="`tel:${agencyPhone}`" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-800">
                Appeler {{ agencyPhone }}
              </a>
              <a :href="whatsappLink" target="_blank" rel="noopener" class="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">
                WhatsApp agence
              </a>
            </div>
          </div>

          <div class="rounded-3xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/70">
            <div class="grid grid-cols-2 rounded-2xl bg-sky-50 p-1">
              <button
                class="h-11 rounded-lg text-sm font-black transition"
                :class="estimationMode === 'maritime' ? 'bg-blue-700 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-950'"
                @click="estimationMode = 'maritime'"
              >
                Maritime
              </button>
              <button
                class="h-11 rounded-lg text-sm font-black transition"
                :class="estimationMode === 'aerien' ? 'bg-sky-600 text-white shadow-lg shadow-sky-200' : 'text-slate-500 hover:text-slate-950'"
                @click="estimationMode = 'aerien'"
              >
                Aérien
              </button>
            </div>

            <div v-if="estimationMode === 'maritime'" class="mt-4 grid gap-3 sm:grid-cols-2">
              <select v-model="destinationCalcul" class="h-12 rounded-xl border border-slate-200 bg-white px-3 font-semibold outline-none focus:border-blue-500 sm:col-span-2">
                <option value="Togo">Togo</option>
                <option value="Bénin">Bénin</option>
              </select>
              <input v-model="longueur" type="number" min="1" max="1000" inputmode="decimal" class="h-12 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-500" placeholder="Longueur cm" />
              <input v-model="largeur" type="number" min="1" max="1000" inputmode="decimal" class="h-12 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-500" placeholder="Largeur cm" />
              <input v-model="hauteur" type="number" min="1" max="1000" inputmode="decimal" class="h-12 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-500 sm:col-span-2" placeholder="Hauteur cm" />

              <button class="h-12 rounded-xl bg-blue-700 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-800 sm:col-span-2" @click="calculerVolume">
                Calculer maritime
              </button>
            </div>

            <div v-else class="mt-4 grid gap-3">
              <div class="rounded-xl border border-sky-100 bg-sky-50 p-4">
                <p class="text-xs font-black uppercase text-blue-700">
                  Tarif aérien vers {{ destinationAerienne }}
                </p>
                <p class="mt-1 text-2xl font-black text-slate-950">{{ tarifAerienKg }} € / kg</p>
              </div>

              <select
                v-model="destinationAerienne"
                class="h-12 rounded-xl border border-slate-200 bg-white px-3 font-semibold outline-none focus:border-blue-500"
                @change="estimationAerien = null"
              >
                <option value="Togo">Togo · 12 € / kg</option>
                <option value="Cotonou">Cotonou · 15 € / kg</option>
              </select>

              <input
                v-model="poidsAerien"
                type="number"
                min="0.1"
                max="10000"
                step="0.1"
                inputmode="decimal"
                class="h-12 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-500"
                placeholder="Poids total en kg"
              />

              <button class="h-12 rounded-xl bg-sky-600 font-black text-white shadow-lg shadow-sky-200 hover:bg-sky-700" @click="calculerAerien">
                Calculer aérien
              </button>
            </div>

            <div v-if="estimationMode === 'maritime' && volume !== null" class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-white p-4">
                <p class="text-xs font-bold uppercase text-slate-400">Volume maritime</p>
                <p class="mt-1 text-xl font-black">{{ volume }} m3</p>
              </div>
              <div class="rounded-xl bg-blue-700 p-4 text-white">
                <p class="text-xs font-bold uppercase text-blue-100">Estimation</p>
                <p class="mt-1 text-xl font-black">{{ estimationTarif }} €</p>
              </div>
            </div>

            <div v-if="estimationMode === 'aerien' && estimationAerien !== null" class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-white p-4">
                <p class="text-xs font-bold uppercase text-slate-400">
                  Poids aérien · {{ destinationAerienne }}
                </p>
                <p class="mt-1 text-xl font-black">{{ poidsAerien }} kg</p>
              </div>
              <div class="rounded-xl bg-blue-700 p-4 text-white">
                <p class="text-xs font-bold uppercase text-blue-100">Estimation</p>
                <p class="mt-1 text-xl font-black">{{ estimationAerien }} €</p>
              </div>
            </div>

            <div v-if="estimationAerien !== null && estimationMode === 'aerien'" class="mt-3 rounded-xl bg-sky-50 p-3 text-center text-sm font-bold text-blue-800">
              {{ aerienFormula }}
            </div>

            <a
              v-if="(estimationMode === 'aerien' && estimationAerien !== null) || (estimationMode === 'maritime' && estimationTarif !== null)"
              :href="quoteWhatsappLink"
              target="_blank"
              rel="noopener"
              class="mt-3 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-black text-white hover:bg-emerald-700"
            >
              Demander ce devis sur WhatsApp
            </a>

            <p class="mt-4 text-xs leading-5 text-slate-500">
              Estimation indicative hors frais particuliers. Le tarif final peut dépendre de la destination, du volume réel et de la prise en charge.
            </p>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-slate-950 px-4 py-10 text-sm text-slate-300">
      <div class="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <div>
          <img src="/tracksend-logo.png" alt="TRACKSEND" class="h-14 w-40 rounded-xl bg-white object-contain px-2" />
          <p class="mt-3 text-slate-400">Suivez · Expédiez · Livrez.</p>
        </div>
        <div id="confidentialite">
          <p class="font-black text-white">Confidentialité</p>
          <p class="mt-2 leading-6 text-slate-400">
            Seules les informations publiques nécessaires au suivi sont affichées. Les paiements, adresses précises et documents internes restent privés.
          </p>
        </div>
        <div id="conditions">
          <p class="font-black text-white">Informations</p>
          <p class="mt-2 leading-6 text-slate-400">
            Les délais et estimations sont indicatifs. Pour une confirmation ou une réclamation, contactez directement l’agence.
          </p>
          <div class="mt-3 flex gap-4">
            <a :href="`tel:${agencyPhone}`" class="font-bold text-sky-300">Appeler</a>
            <a :href="whatsappLink" target="_blank" rel="noopener" class="font-bold text-emerald-300">WhatsApp</a>
          </div>
        </div>
      </div>
      <p class="mx-auto mt-8 max-w-7xl border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
        © {{ new Date().getFullYear() }} TRACKSEND · Suivi public sécurisé
      </p>
    </footer>
  </div>
</template>
