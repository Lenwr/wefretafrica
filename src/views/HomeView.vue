<script setup>
import { ref, computed } from 'vue'
import { query, where, getDocs } from 'firebase/firestore'
import { enlevementsCollection } from '../firebase/config'

// UI
const open = ref(false)
const searchSection = ref(null)
const trackingInput = ref(null)

// SEO / contenus
const siteTitle = 'WefretAfrica'
const siteDescription =
  'Expédiez vos colis vers l’Afrique et l’international en toute sérénité. Suivi en temps réel, transparence, efficacité.'

const scrollToSearch = () => {
  const yOffset = -80
  const el = searchSection.value
  if (!el) return

  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
  window.scrollTo({ top: y, behavior: 'smooth' })

  setTimeout(() => {
    trackingInput.value?.focus()
  }, 500)
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'Non disponible'

  try {
    let date

    if (typeof dateValue?.toDate === 'function') {
      date = dateValue.toDate()
    } else {
      date = new Date(dateValue)
    }

    if (isNaN(date.getTime())) return 'Non disponible'

    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  } catch {
    return 'Non disponible'
  }
}

// Données
const trackingCode = ref('')
const data = ref(null)
const error = ref('')
const loading = ref(false)

// Nettoyage fort des statuts
const simplify = (value) => {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

const normalizeStatus = (value) => {
  if (value === false) return 'Réceptionné'
  if (value === true) return 'Livré'

  const v = simplify(value)

  if (!v) return 'Inconnu'

  if (
    v === 'receptionne' ||
    v === 'recu' ||
    v === 'reception' ||
    v.includes('reception')
  ) {
    return 'Réceptionné'
  }

  if (
    v === 'expedie' ||
    v === 'expediee' ||
    v.includes('exped')
  ) {
    return 'Expédié'
  }

  if (
    v === 'disponible pour retrait' ||
    v === 'disponible' ||
    v === 'retrait' ||
    v.includes('retrait')
  ) {
    return 'Disponible pour retrait'
  }

  if (
    v === 'livre' ||
    v === 'livree' ||
    v.includes('livr')
  ) {
    return 'Livré'
  }

  if (
    v === 'charge' ||
    v === 'chargee' ||
    v.includes('charg')
  ) {
    return 'Chargé'
  }

  return 'Inconnu'
}

// Ordre métier des statuts
const statusRank = {
  Inconnu: -1,
  Réceptionné: 0,
  Expédié: 1,
  'Disponible pour retrait': 2,
  Livré: 3
}

// Normalisation de tous les colis
// quantité = nombre total de colis par article
const normalizeColisDetails = (colis = []) => {
  return colis.flatMap((colisItem, colisIndex) => {
    const quantiteTotaleArticle =
      Number(colisItem.quantite) ||
      (Array.isArray(colisItem.details) && colisItem.details.length
        ? colisItem.details.length
        : 1)

    // CAS 1 : sous-colis dans details
    if (Array.isArray(colisItem.details) && colisItem.details.length) {
      return colisItem.details.map((item, index) => {
        const normalized = normalizeStatus(item.statutColis)

        return {
          id: `${colisIndex + 1}-${index + 1}`,
          nom: colisItem.nom || `Colis ${colisIndex + 1}`,
          coli: item.coli || `Colis ${colisIndex + 1}.${index + 1}`,
          quantite: quantiteTotaleArticle,
          statutColis: normalized,
          rawStatutColis: item.statutColis,
          historique: item.historique || []
        }
      })
    }

    // CAS 2 : quantité > 1 sans details
    if (colisItem.quantite && colisItem.quantite > 1) {
      return Array.from({ length: colisItem.quantite }, (_, i) => {
        const normalized = normalizeStatus(colisItem.statutColis)

        return {
          id: `${colisIndex + 1}-${i + 1}`,
          nom: colisItem.nom || `Colis ${colisIndex + 1}`,
          coli: `${colisItem.nom || `Colis ${colisIndex + 1}`} ${i + 1}/${colisItem.quantite}`,
          quantite: quantiteTotaleArticle,
          statutColis: normalized,
          rawStatutColis: colisItem.statutColis,
          historique: colisItem.historique || []
        }
      })
    }

    // CAS 3 : colis simple
    const normalized = normalizeStatus(colisItem.statutColis)

    return [{
      id: `${colisIndex + 1}-1`,
      nom: colisItem.nom || `Colis ${colisIndex + 1}`,
      coli: colisItem.nom || `Colis ${colisIndex + 1}`,
      quantite: quantiteTotaleArticle,
      statutColis: normalized,
      rawStatutColis: colisItem.statutColis,
      historique: colisItem.historique || []
    }]
  })
}

// Compteurs cumulés
const countReachedStep = (items, targetStatus) => {
  const targetRank = statusRank[targetStatus]

  return items.filter((item) => {
    const currentRank = statusRank[normalizeStatus(item.statutColis)] ?? -1
    return currentRank >= targetRank
  }).length
}

const search = async () => {
  error.value = ''
  loading.value = true
  data.value = null

  try {
    const code = trackingCode.value.trim()

    if (!code || code.length < 3) {
      error.value = 'Veuillez entrer un numéro de suivi valide.'
      return
    }

    const q = query(enlevementsCollection, where('numero', '==', code))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data()

      const colisDetails = normalizeColisDetails(docData.colis || [])
      const totalColis = colisDetails.length

      const receivedCount = countReachedStep(colisDetails, 'Réceptionné')
      const shippedCount = countReachedStep(colisDetails, 'Expédié')
      const availableCount = countReachedStep(colisDetails, 'Disponible pour retrait')
      const deliveredCount = countReachedStep(colisDetails, 'Livré')

      const timelineSteps = [
        {
          status: 'Réceptionné',
          count: receivedCount,
          total: totalColis,
          done: totalColis > 0 && receivedCount === totalColis,
          started: receivedCount > 0,
          date: docData.date || null
        },
        {
          status: 'Expédié',
          count: shippedCount,
          total: totalColis,
          done: totalColis > 0 && shippedCount === totalColis,
          started: shippedCount > 0,
          date: docData.preparationDate || null
        },
        {
          status: 'Disponible pour retrait',
          count: availableCount,
          total: totalColis,
          done: totalColis > 0 && availableCount === totalColis,
          started: availableCount > 0,
          date: docData.transitDate || null
        },
        {
          status: 'Livré',
          count: deliveredCount,
          total: totalColis,
          done: totalColis > 0 && deliveredCount === totalColis,
          started: deliveredCount > 0,
          date: docData.deliveryDate || null
        }
      ]

      data.value = {
        etat: docData.deliveryStatus || 'Inconnu',
        dateEstimee: formatDate(docData.date),
        lastUpdate: formatDate(docData.lastUpdate),
        timeline: timelineSteps,
        colis: colisDetails,
        expediteur: docData.expediteur || 'Non renseigné',
        destinataire: docData.destinataire || 'Non renseigné',
        destination: docData.destination || 'Non renseigné',
        nombreColis: totalColis,
        telephone: docData.telephoneDestinataire || 'Non renseigné'
      }

      setTimeout(() => {
        scrollToSearch()
      }, 150)
    } else {
      error.value = 'Aucun colis trouvé pour ce numéro.'
    }
  } catch (e) {
    console.error(e)
    error.value = 'Erreur lors de la récupération.'
  } finally {
    loading.value = false
  }
}

const colisList = computed(() => data.value?.colis || [])
const timeline = computed(() => data.value?.timeline || [])

const statusConfig = {
  Livré: 'bg-green-100 text-green-700 border-green-400',
  Expédié: 'bg-blue-100 text-blue-700 border-blue-400',
  Réceptionné: 'bg-orange-100 text-orange-700 border-orange-400',
  'Disponible pour retrait': 'bg-purple-100 text-purple-700 border-purple-400',
  Inconnu: 'bg-gray-100 text-gray-600 border-gray-300'
}

// Etape atteinte visuellement
const reachedStepIndex = computed(() => {
  const steps = timeline.value
  let lastReached = -1

  steps.forEach((step, index) => {
    if (step.started || step.done) {
      lastReached = index
    }
  })

  return lastReached
})

const lineFillWidth = computed(() => {
  const steps = timeline.value
  if (!steps.length || reachedStepIndex.value <= 0) return '0%'

  return `${(reachedStepIndex.value / (steps.length - 1)) * 100}%`
})

// Calcul volume redesigné
const longueur = ref(0)
const largeur = ref(0)
const hauteur = ref(0)
const destinationCalcul = ref('Togo')
const volume = ref(null)
const estimationTarif = ref(null)

const tarifsDestination = {
  Togo: 500,
  Bénin: 750
}

const tarifBase = computed(() => tarifsDestination[destinationCalcul.value] || 0)

const calculerVolume = () => {
  const l = Number(longueur.value)
  const L = Number(largeur.value)
  const h = Number(hauteur.value)

  if (l > 0 && L > 0 && h > 0) {
    const v = (l * L * h) / 1000000
    volume.value = parseFloat(v.toFixed(3))
    estimationTarif.value = parseFloat((volume.value * tarifBase.value).toFixed(2))
  } else {
    volume.value = null
    estimationTarif.value = null
  }
}
</script>

<template>
  <div class="bg-white text-gray-800 font-sans min-h-screen" style="font-family: 'Inter', sans-serif;">
    <div class="navBar">
      <nav class="bg-white/90 backdrop-blur-xl shadow sticky top-0 z-50 border-b border-orange-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center space-x-2">
              <span class="text-lg font-extrabold text-orange-600">WefretAfricaTracking</span>
            </div>

            <div class="hidden md:flex space-x-8 text-lg font-bold text-gray-700">
              <a
                href="https://wefretafrica.com"
                target="_blank"
                rel="noopener"
                class="hover:text-orange-500 transition"
              >
                WefretAfrica
              </a>
            </div>

            <div class="relative hidden" @mouseleave="open = false">
              <button
                @click="open = !open"
                class="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition shadow-lg shadow-orange-200"
              >
                Se connecter
              </button>

              <div
                v-if="open"
                class="absolute right-0 mt-0.5 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <a
                  href="/#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  Particulier
                </a>
                <a
                  href="/#"
                  target="_blank"
                  rel="noopener"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  Entreprise
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- HERO -->
    <div
      class="hero min-h-screen bg-cover bg-center relative flex items-center justify-center"
      style="background-image: url('/fret2.jpg');"
    >
      <div class="absolute inset-0 bg-black/65"></div>

      <div class="relative z-10 text-center text-white px-4 max-w-4xl">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 mb-6">
          <span>📦</span>
          <span class="text-sm font-medium">Suivi colis premium</span>
        </div>

        <h1 class="mb-5 text-5xl md:text-6xl font-extrabold leading-tight">
          Suivi Colis Afrique & International
        </h1>

        <p class="mb-8 text-lg md:text-xl text-white/90">
          Suivez votre colis en temps réel. Transparence totale. Livraison maîtrisée.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 mb-6 max-w-2xl mx-auto">
          <input
            ref="trackingInput"
            v-model="trackingCode"
            placeholder="Entrez votre numéro de suivi"
            class="flex-1 px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur text-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            @keyup.enter="search"
          >

          <button
            @click="search"
            :disabled="loading || trackingCode.trim().length < 3"
            class="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-600 shadow-xl shadow-orange-400/30 transition disabled:opacity-50"
          >
            {{ loading ? 'Recherche...' : 'Suivre mon colis' }}
          </button>
        </div>

        <div class="text-sm text-gray-200 flex flex-wrap justify-center gap-6">
          <span>🚚 +12 000 colis livrés</span>
          <span>⭐ 98% satisfaction</span>
          <span>🕒 Suivi 24/7</span>
        </div>

        <div class="mt-8">
          <button
            @click="scrollToSearch"
            class="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition backdrop-blur"
          >
            Voir le détail du suivi
          </button>
        </div>
      </div>
    </div>

    <!-- RESULTAT -->
    <section
      ref="searchSection"
      id="suivi-colis"
      class="py-16 px-4 max-w-5xl mx-auto text-center"
    >
      <h2 class="text-3xl md:text-4xl font-extrabold mb-6">🔍 Résultat du suivi</h2>

      <div v-if="loading" class="animate-pulse space-y-4 max-w-3xl mx-auto">
        <div class="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
        <div class="h-28 bg-gray-200 rounded-2xl"></div>
        <div class="h-28 bg-gray-200 rounded-2xl"></div>
      </div>

      <p v-if="error && !loading" class="text-red-600 font-semibold mt-6">
        {{ error }}
      </p>

      <div
        v-if="data && !loading"
        class="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-orange-100 p-8 text-left transition"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <span
            class="px-4 py-2 rounded-full border font-semibold w-fit"
            :class="statusConfig[data.etat] || statusConfig['Inconnu']"
          >
            {{ data.etat }}
          </span>

          <p class="text-sm text-gray-500">
            Dernière mise à jour :
            <span class="font-semibold">{{ data.lastUpdate }}</span>
          </p>
        </div>

        <!-- Timeline cumulative -->
        <div class="relative mb-12">
          <div class="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded"></div>

          <div
            class="absolute top-5 left-0 h-1 bg-green-500 rounded transition-all duration-500"
            :style="{ width: lineFillWidth }"
          ></div>

          <div class="flex justify-between items-start relative z-10">
            <div
              v-for="(step, index) in timeline"
              :key="index"
              class="flex flex-col items-center text-center w-1/4 px-2"
            >
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow transition',
                  index < reachedStepIndex
                    ? 'bg-green-500'
                    : index === reachedStepIndex
                      ? (step.done ? 'bg-green-500' : 'bg-orange-500')
                      : 'bg-gray-300'
                ]"
              >
                {{ index + 1 }}
              </div>

              <p class="mt-2 text-sm font-semibold">
                {{ step.status }}
                <span v-if="step.total > 0">({{ step.count }}/{{ step.total }})</span>
              </p>

              <p class="text-xs text-gray-500">
                {{
                  index < reachedStepIndex
                    ? 'Terminé'
                    : index === reachedStepIndex
                      ? (step.done
                          ? (step.date ? formatDate(step.date) : 'Terminé')
                          : 'En cours')
                      : 'En attente'
                }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="data.etat === 'Livré'"
          class="bg-green-50 p-6 rounded-xl border border-green-300 mb-8"
        >
          🎉 Votre colis a été livré avec succès.
        </div>

        <!-- Infos enlèvement -->
        <div class="mt-2 p-6 border border-orange-200 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 text-orange-800 shadow-sm">
          <h4 class="text-xl font-bold mb-3">Infos de l'enlèvement</h4>
          <p><strong>Expéditeur :</strong> {{ data.expediteur }}</p>
          <p><strong>Destinataire :</strong> {{ data.destinataire }}</p>
          <p><strong>Destination :</strong> {{ data.destination }}</p>
          <p><strong>Nombre de colis :</strong> {{ data.nombreColis }}</p>
          <p><strong>Téléphone :</strong> {{ data.telephone }}</p>
        </div>

        <!-- Cartes colis -->
        <div v-if="colisList.length" class="mt-12">
          <h4 class="text-2xl font-bold text-center mb-6">
            📦 Détail des colis ({{ colisList.length }})
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              v-for="(colis, i) in colisList"
              :key="i"
              class="p-6 bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition"
            >
              <p class="font-bold text-orange-600 mb-1">{{ colis.coli }}</p>
              <p><strong>Nom :</strong> {{ colis.nom }}</p>
              <p><strong>Quantité totale article :</strong> {{ colis.quantite }}</p>
              <p>
                <strong>Statut :</strong>
                <span v-if="colis.statutColis === 'Chargé'">Indisponible pour retrait</span>
                <span v-else>{{ colis.statutColis }}</span>
              </p>

              <div
                v-if="colis.historique?.length"
                class="mt-4 space-y-4 border-l-4 border-orange-400 pl-6"
              >
                <div
                  v-for="(step, index) in colis.historique"
                  :key="index"
                  class="relative"
                >
                  <div class="absolute -left-3 top-1 w-3 h-3 bg-orange-400 rounded-full"></div>
                  <div>
                    <p class="font-semibold">{{ step.status }}</p>
                    <p class="text-gray-500 text-sm">{{ formatDate(step.date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableau -->
        <div class="mt-10">
          <h4 class="text-lg font-semibold mb-3">Détails des colis :</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-300">
                  <th class="p-2">Nom du colis</th>
                  <th class="p-2">Coli</th>
                  <th class="p-2">Quantité</th>
                  <th class="p-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in colisList"
                  :key="item.id"
                  class="border-b border-gray-200"
                >
                  <td class="p-2">{{ item.nom }}</td>
                  <td class="p-2">{{ item.coli }}</td>
                  <td class="p-2">{{ item.quantite }}</td>
                  <td class="p-2">
                    <span
                      :class="{
                        'text-green-600 font-bold': item.statutColis === 'Livré',
                        'text-orange-600 font-semibold': item.statutColis === 'Réceptionné',
                        'text-blue-600 font-semibold': item.statutColis === 'Expédié',
                        'text-purple-600 font-semibold': item.statutColis === 'Disponible pour retrait',
                        'text-gray-600': !['Livré', 'Réceptionné', 'Expédié', 'Disponible pour retrait'].includes(item.statutColis)
                      }"
                    >
                      {{ item.statutColis }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Infos répétées -->
        <div class="mt-8 text-sm text-gray-700 space-y-1">
          <p><strong>Expéditeur :</strong> {{ data.expediteur }}</p>
          <p><strong>Destinataire :</strong> {{ data.destinataire }}</p>
          <p><strong>Destination :</strong> {{ data.destination }}</p>
          <p><strong>Nombre de colis :</strong> {{ data.nombreColis }}</p>
          <p><strong>Téléphone destinataire :</strong> {{ data.telephone }}</p>
        </div>
      </div>
    </section>

    <!-- Argumentaire -->
    <section class="py-16 px-4 max-w-5xl mx-auto text-center">
      <h2 class="text-4xl font-extrabold mb-6 text-gray-900">🔒 Suivi sécurisé et précis</h2>
      <p class="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
        Avec <strong>WefretAfrica</strong>, vous bénéficiez d’un suivi en temps réel, d’alertes instantanées et de
        détails clairs pour chaque colis. Fini le stress : restez maître de vos expéditions à tout moment.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div class="p-6 bg-orange-50 border border-orange-200 rounded-2xl shadow">
          <h3 class="text-xl font-bold mb-2">✅ Transparence</h3>
          <p class="text-gray-700">Suivez chaque étape de votre colis, du départ à la livraison.</p>
        </div>

        <div class="p-6 bg-orange-50 border border-orange-200 rounded-2xl shadow">
          <h3 class="text-xl font-bold mb-2">✅ Notifications</h3>
          <p class="text-gray-700">Recevez des mises à jour instantanées pour rester informé.</p>
        </div>

        <div class="p-6 bg-orange-50 border border-orange-200 rounded-2xl shadow">
          <h3 class="text-xl font-bold mb-2">✅ Assistance</h3>
          <p class="text-gray-700">Une équipe disponible pour répondre à toutes vos questions.</p>
        </div>
      </div>
    </section>

    <!-- Explication -->
    <section class="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 class="text-3xl font-bold mb-6">Qu’est-ce que le suivi de colis ?</h2>
      <p class="text-gray-700 max-w-xl mx-auto mb-4">
        Le numéro de suivi est une référence unique qui permet de localiser votre colis à chaque étape de son transport,
        de l’expédition à la livraison. Grâce à notre système, vous pouvez suivre en temps réel l’acheminement et être
        informé en cas d’incident.
      </p>
      <p class="text-gray-700 max-w-xl mx-auto">
        Chaque mise à jour reflète l’état exact de votre envoi, pour une transparence totale et une tranquillité
        d’esprit.
      </p>
    </section>

    <!-- Conseils -->
    <section class="max-w-4xl mx-auto px-4 py-16 bg-orange-50 rounded-xl shadow text-center">
      <h2 class="text-3xl font-bold mb-6">Conseils pour un envoi réussi</h2>
      <ul class="list-disc list-inside text-left max-w-md mx-auto text-gray-700 space-y-2">
        <li>Utilisez un emballage solide et adapté au contenu.</li>
        <li>Vérifiez l’adresse de destination et les coordonnées du destinataire.</li>
        <li>Collez bien l’étiquette de suivi visible sur le colis.</li>
        <li>Déclarez la valeur du contenu si nécessaire.</li>
        <li>Prévoyez une assurance pour les objets de valeur.</li>
      </ul>

      <img
        src="/fret.jpg"
        alt="Emballage colis"
        class="mt-8 mx-auto rounded-lg shadow-lg max-w-full h-auto"
      >
    </section>

    <!-- Délais -->
    <section class="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 class="text-3xl font-bold mb-6">Délais de livraison</h2>
      <p class="text-gray-700 max-w-xl mx-auto mb-4">
        Nos délais varient selon la destination et le mode d’expédition choisi. En général, comptez entre
        <strong>3 à 10 jours ouvrés</strong> pour les livraisons en fret aérien.
      </p>
      <p class="text-gray-700 max-w-xl mx-auto mb-6">
        Pour toute question spécifique, notre équipe est à votre disposition.
      </p>

      <img
        src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
        alt="Horloge délais"
        class="mx-auto rounded-lg shadow-lg max-w-full h-auto"
      >
    </section>

    <!-- FAQ -->
    <section class="max-w-4xl mx-auto px-4 py-16 text-center bg-orange-50 rounded-xl shadow">
      <h2 class="text-3xl font-bold mb-6">FAQ - Questions fréquentes</h2>

      <div class="max-w-xl mx-auto text-left space-y-4 text-gray-700">
        <details class="p-4 bg-white rounded-lg shadow">
          <summary class="cursor-pointer font-semibold">Comment obtenir mon numéro de suivi ?</summary>
          <p class="mt-2">
            Le numéro de suivi vous est fourni lors de l’enregistrement de votre colis, généralement par email ou SMS.
          </p>
        </details>

        <details class="p-4 bg-white rounded-lg shadow">
          <summary class="cursor-pointer font-semibold">Que faire si mon colis est en retard ?</summary>
          <p class="mt-2">
            Contactez notre support via le bouton en bas de page pour que nous vérifiions l’état de votre envoi.
          </p>
        </details>

        <details class="p-4 bg-white rounded-lg shadow">
          <summary class="cursor-pointer font-semibold">Puis-je modifier l’adresse de livraison ?</summary>
          <p class="mt-2">
            Une fois le colis expédié, la modification d’adresse est généralement impossible. Contactez-nous rapidement
            si besoin.
          </p>
        </details>

        <details class="p-4 bg-white rounded-lg shadow">
          <summary class="cursor-pointer font-semibold">Comment contacter le support ?</summary>
          <p class="mt-2">
            Utilisez le bouton de contact en bas à droite ou envoyez-nous un email à support@wefretafrica.com
          </p>
        </details>
      </div>
    </section>

    <!-- Calculateur volume redesigné -->
    <section class="max-w-6xl mx-auto px-4 py-20">
      <div
        class="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-[0_20px_80px_rgba(0,0,0,0.08)]"
      >
        <div class="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-orange-200/40 blur-3xl"></div>
        <div class="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl"></div>

        <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-12 items-center">
          <!-- bloc gauche -->
          <div class="text-left">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 border border-orange-100 shadow-sm">
              <span class="text-xl">📦</span>
              <span class="text-sm font-semibold text-orange-700">Calculateur volume colis</span>
            </div>

            <h2 class="mt-6 text-4xl font-extrabold text-gray-900 leading-tight">
              Estime ton volume en <span class="text-orange-500">mètre cube</span> et ton tarif
            </h2>

            <p class="mt-4 text-gray-600 text-lg leading-relaxed max-w-xl">
              Renseigne les dimensions en <strong>cm</strong>, choisis la destination
              et obtiens une estimation rapide selon le tarif au <strong>m³</strong>.
            </p>

            <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-2xl bg-white/80 border border-orange-100 p-4 shadow-sm">
                <p class="text-sm text-gray-500">Destination Togo</p>
                <p class="text-2xl font-bold text-gray-900">500 € / m³</p>
              </div>

              <div class="rounded-2xl bg-white/80 border border-orange-100 p-4 shadow-sm">
                <p class="text-sm text-gray-500">Destination Bénin</p>
                <p class="text-2xl font-bold text-gray-900">750 € / m³</p>
              </div>
            </div>
          </div>

          <!-- bloc droit -->
          <div class="rounded-[1.75rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl p-6 md:p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Simulation rapide</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <select
                  v-model="destinationCalcul"
                  class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="Togo">Togo</option>
                  <option value="Bénin">Bénin</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Longueur (cm)
                </label>
                <input
                  v-model.number="longueur"
                  type="number"
                  min="0"
                  placeholder="Ex: 120"
                  class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Largeur (cm)
                </label>
                <input
                  v-model.number="largeur"
                  type="number"
                  min="0"
                  placeholder="Ex: 80"
                  class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Hauteur (cm)
                </label>
                <input
                  v-model.number="hauteur"
                  type="number"
                  min="0"
                  placeholder="Ex: 60"
                  class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            <button
              @click="calculerVolume"
              class="mt-6 w-full rounded-2xl bg-orange-500 text-white px-6 py-4 font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
            >
              Calculer mon estimation
            </button>

            <div
              v-if="volume !== null"
              class="mt-6 rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6"
            >
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="rounded-2xl bg-white p-4 border border-orange-100 shadow-sm">
                  <p class="text-sm text-gray-500">Destination</p>
                  <p class="text-lg font-bold text-gray-900">{{ destinationCalcul }}</p>
                </div>

                <div class="rounded-2xl bg-white p-4 border border-orange-100 shadow-sm">
                  <p class="text-sm text-gray-500">Volume</p>
                  <p class="text-lg font-bold text-gray-900">{{ volume }} m³</p>
                </div>

                <div class="rounded-2xl bg-white p-4 border border-orange-100 shadow-sm">
                  <p class="text-sm text-gray-500">Tarif au m³</p>
                  <p class="text-lg font-bold text-gray-900">{{ tarifBase }} €</p>
                </div>
              </div>

              <div class="mt-5 rounded-2xl bg-orange-500 text-white p-5 shadow-lg">
                <p class="text-sm uppercase tracking-wide opacity-90">Estimation tarifaire</p>
                <p class="text-3xl font-extrabold mt-1">{{ estimationTarif }} €</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <a
      href="mailto:support@wefretafrica.com"
      class="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition flex items-center space-x-2 z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M4 4h16v16H4z" />
        <path d="M22 6L12 13 2 6" />
      </svg>
      <span class="font-semibold">Contactez-nous</span>
    </a>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 py-8 text-center text-sm">
      &copy; 2025 WefretAfrica - Tous droits réservés
    </footer>
  </div>
</template>