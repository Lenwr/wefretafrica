<script setup>
import { ref, computed } from 'vue'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

// Infos dynamiques
const open = ref(false)
const siteTitle = 'WefretAfrica'
const siteDescription =
  'Expédiez vos colis vers l’Afrique et l’international en toute sérénité. Suivi en temps réel, transparence, efficacité.'

// ✅ Refs + scroll/focus
const searchSection = ref(null)
const trackingInput = ref(null)

const scrollToSearch = () => {
  const yOffset = -80 // hauteur navbar sticky
  const el = searchSection.value
  if (!el) return

  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
  window.scrollTo({ top: y, behavior: 'smooth' })

  setTimeout(() => {
    trackingInput.value?.focus()
  }, 500)
}

// Formatage de date
const formatDate = (dateString) => {
  if (!dateString) return 'Non disponible'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

// Données
const trackingCode = ref('')
const data = ref(null)
const error = ref('')
const loading = ref(false)

const search = async () => {
  error.value = ''
  loading.value = true
  data.value = null
  try {
    const q = query(collection(db, 'enlevements'), where('numero', '==', trackingCode.value))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const doc = snapshot.docs[0].data()

      const timelineSteps = [
        { status: 'Réceptionné', date: doc.date },
        { status: 'Expédié', date: doc.preparationDate },
        { status: 'Disponible pour retrait', date: doc.transitDate },
        { status: 'Livré', date: doc.deliveryDate }
      ]

      const colisDetails = (doc.colis || []).flatMap((colisItem, colisIndex) => {
        return (colisItem.details || []).map((item, index) => ({
          id: `${colisIndex + 1}-${index + 1}`,
          nom: colisItem.nom || `Colis ${colisIndex + 1}`,
          coli: item.coli || `Colis ${colisIndex + 1}.${index + 1}`,
          quantite: colisItem.quantite || 1,
          statutColis:
            typeof item.statutColis === 'string'
              ? item.statutColis
              : item.statutColis === false
                ? 'Réceptionné'
                : 'Inconnu',
          historique: item.historique || []
        }))
      })

      data.value = {
        etat: doc.deliveryStatus || 'Inconnu',
        dateEstimee: formatDate(doc.date),
        lastUpdate: formatDate(doc.lastUpdate),
        timeline: timelineSteps,
        colis: colisDetails,
        expediteur: doc.expediteur || 'Non renseigné',
        destinataire: doc.destinataire || 'Non renseigné',
        destination: doc.destination || 'Non renseigné',
        nombreColis: colisDetails.length,
        telephone: doc.telephoneDestinataire || 'Non renseigné'
      }

      // ✅ si tu veux, on peut auto-scroll vers le résultat après recherche:
      // setTimeout(() => scrollToSearch(), 50)
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

// ✅ UI status badge
const statusConfig = {
  Livré: 'bg-green-100 text-green-700 border-green-400',
  Expédié: 'bg-blue-100 text-blue-700 border-blue-400',
  Réceptionné: 'bg-orange-100 text-orange-700 border-orange-400',
  'Disponible pour retrait': 'bg-purple-100 text-purple-700 border-purple-400',
  Inconnu: 'bg-gray-100 text-gray-600 border-gray-300'
}

// ✅ Timeline step active (dernier step avec date)
const currentStepIndex = computed(() => {
  const t = timeline.value
  if (!t.length) return -1
  let last = -1
  t.forEach((s, i) => {
    if (s?.date) last = i
  })
  return last
})

// Volume (inchangé)
const longueur = ref(0)
const largeur = ref(0)
const hauteur = ref(0)
const volume = ref(null)
const tarifBase = 500

const calculerVolume = () => {
  if (longueur.value > 0 && largeur.value > 0 && hauteur.value > 0) {
    const v = (longueur.value * largeur.value * hauteur.value) / 1000000
    volume.value = parseFloat(v.toFixed(2))
  } else {
    volume.value = null
  }
}
</script>

<template>
  <div class="bg-white text-gray-800 font-sans min-h-screen" style="font-family: 'Inter', sans-serif;">
    <div class="navBar">
      <nav class="bg-white shadow sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center space-x-2">
              <span class="text-lg font-bold text-orange-600">WefretAfricaTracking</span>
            </div>

            <div class="hidden md:flex space-x-8 text-lg font-bold text-gray-700">
              <a href="https://wefretafrica.com" target="_blank" rel="noopener" class="hover:text-orange-500">
                WefretAfrica
              </a>
            </div>

            <div class="relative hidden" @mouseleave="open = false">
              <button
                @click="open = !open"
                class="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition"
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

    <!-- ✅ HERO premium : champ de suivi direct -->
    <div
      class="hero min-h-screen bg-cover relative flex items-center justify-center"
      style="background-image: url('/fret2.jpg');"
    >
      <div class="absolute inset-0 bg-black opacity-60"></div>

      <div class="relative z-10 text-center text-white px-4 max-w-3xl">
        <h1 class="mb-5 text-5xl font-extrabold">📦 Suivi Colis Afrique & International</h1>
        <p class="mb-6 text-lg">
          Suivez votre colis en temps réel. Transparence totale. Livraison maîtrisée.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            ref="trackingInput"
            v-model="trackingCode"
            placeholder="Entrez votre numéro de suivi"
            class="flex-1 px-6 py-4 rounded-full text-lg text-white focus:ring-2 focus:ring-orange-400 transition"
          />

          <button
            @click="search"
            :disabled="loading || trackingCode.length < 5"
            class="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-600 shadow transition disabled:opacity-50"
          >
            Suivre mon colis
          </button>
        </div>

        <!-- ✅ preuve sociale -->
        <div class="text-sm text-gray-200 flex flex-wrap justify-center gap-6">
          <span>🚚 +12 000 colis livrés</span>
          <span>⭐ 98% satisfaction</span>
          <span>🕒 Suivi 24/7</span>
        </div>

        <!-- ✅ bouton scroll optionnel -->
        <div class="mt-8">
          <button
            @click="scrollToSearch"
            class="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition"
          >
            Voir le détail du suivi
          </button>
        </div>
      </div>
    </div>

    <!-- ✅ SECTION SUIVI (résultat + timeline + skeleton) -->
    <section
      ref="searchSection"
      id="suivi-colis"
      class="py-16 px-4 max-w-4xl mx-auto text-center"
    >
      <h2 class="text-3xl font-bold mb-6">🔍 Résultat du suivi</h2>

      <!-- Skeleton loader -->
      <div v-if="loading" class="animate-pulse space-y-4 max-w-3xl mx-auto">
        <div class="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
        <div class="h-28 bg-gray-200 rounded-2xl"></div>
        <div class="h-28 bg-gray-200 rounded-2xl"></div>
      </div>

      <p v-if="error && !loading" class="text-red-600 font-semibold mt-6">
        {{ error }}
      </p>

      <div v-if="data && !loading" class="bg-white rounded-2xl shadow-lg p-8 text-left transition">
        <!-- Badge statut + last update -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <span
            class="px-4 py-2 rounded-full border font-semibold w-fit"
            :class="statusConfig[data.etat] || statusConfig['Inconnu']"
          >
            {{ data.etat }}
          </span>

          <p class="text-sm text-gray-500">
            Dernière mise à jour : <span class="font-semibold">{{ data.lastUpdate }}</span>
          </p>
        </div>

        <!-- Timeline moderne -->
        <div class="relative mb-10">
          <div class="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded"></div>

          <div class="flex justify-between items-start">
            <div
              v-for="(step, index) in timeline"
              :key="index"
              class="relative z-10 flex flex-col items-center text-center w-1/4 px-2"
            >
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow',
                  index <= currentStepIndex ? 'bg-orange-500' : 'bg-gray-300'
                ]"
              >
                {{ index + 1 }}
              </div>

              <p class="mt-2 text-sm font-semibold">{{ step.status }}</p>
              <p class="text-xs text-gray-500">
                {{ step.date ? formatDate(step.date) : 'En attente' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Message livré -->
        <div
          v-if="data.etat === 'Livré'"
          class="bg-green-50 p-6 rounded-xl border border-green-300 mb-8"
        >
          🎉 Votre colis a été livré avec succès.
        </div>

        <!-- Infos enlèvement -->
        <div class="mt-2 p-6 border border-orange-200 rounded-2xl bg-orange-50 text-orange-800 shadow">
          <h4 class="text-xl font-bold mb-3">Infos de l'enlèvement</h4>
          <p><strong>Expéditeur :</strong> {{ data.expediteur }}</p>
          <p><strong>Destinataire :</strong> {{ data.destinataire }}</p>
          <p><strong>Destination :</strong> {{ data.destination }}</p>
          <p><strong>Nombre de colis :</strong> {{ data.nombreColis }}</p>
          <p><strong>Téléphone :</strong> {{ data.telephone }}</p>
        </div>

        <!-- Liste des colis -->
        <div v-if="colisList.length" class="mt-12">
          <h4 class="text-2xl font-bold text-center mb-6">📦 Détail des colis ({{ colisList.length }})</h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              v-for="(colis, i) in colisList"
              :key="i"
              class="p-6 bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition"
            >
              <p class="font-bold text-orange-600 mb-1">{{ colis.coli }}</p>
              <p><strong>Nom :</strong> {{ colis.nom }}</p>
              <p><strong>Quantité :</strong> {{ colis.quantite }}</p>
              <p>
                <strong>Statut :</strong>
                <span v-if="colis.statutColis === 'Chargé'">Indisponible pour retrait</span>
                <span v-else>{{ colis.statutColis }}</span>
              </p>

              <!-- Timeline interne -->
              <div v-if="colis.historique?.length" class="mt-4 space-y-4 border-l-4 border-orange-400 pl-6">
                <div v-for="(step, index) in colis.historique" :key="index" class="relative">
                  <div class="absolute -left-3 top-1 w-3 h-3 bg-orange-400 rounded-full"></div>
                  <div>
                    <p class="font-semibold">{{ step.status }}</p>
                    <p class="text-gray-500 text-sm">{{ new Date(step.date).toLocaleString() }}</p>
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
                <tr v-for="item in colisList" :key="item.id" class="border-b border-gray-200">
                  <td class="p-2">{{ item.nom }}</td>
                  <td class="p-2">{{ item.coli }}</td>
                  <td class="p-2">{{ item.quantite }}</td>
                  <td class="p-2">
                    <span
                      :class="{
                        'text-green-600 font-bold': item.statutColis === 'Livré',
                        'text-orange-600 font-semibold': item.statutColis === 'Réceptionné',
                        'text-gray-600': !['Livré', 'Réceptionné'].includes(item.statutColis)
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

        <!-- Infos expéditeur / destinataire -->
        <div class="mt-8 text-sm text-gray-700 space-y-1">
          <p><strong>Expéditeur :</strong> {{ data.expediteur }}</p>
          <p><strong>Destinataire :</strong> {{ data.destinataire }}</p>
          <p><strong>Destination :</strong> {{ data.destination }}</p>
          <p><strong>Nombre de colis :</strong> {{ data.nombreColis }}</p>
          <p><strong>Téléphone destinataire :</strong> {{ data.telephone }}</p>
        </div>
      </div>
    </section>

    <!-- Argumentaire : Pourquoi suivre avec nous -->
    <section class="py-16 px-4 max-w-4xl mx-auto text-center">
      <h2 class="text-4xl font-bold mb-6 text-gray-900">🔒 Suivi sécurisé et précis</h2>
      <p class="text-lg text-gray-600 mb-8">
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

    <!-- Section Explication suivi colis -->
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

    <!-- Section Conseils pratiques -->
    <section class="max-w-4xl mx-auto px-4 py-16 bg-orange-50 rounded-xl shadow text-center">
      <h2 class="text-3xl font-bold mb-6">Conseils pour un envoi réussi</h2>
      <ul class="list-disc list-inside text-left max-w-md mx-auto text-gray-700 space-y-2">
        <li>Utilisez un emballage solide et adapté au contenu.</li>
        <li>Vérifiez l’adresse de destination et les coordonnées du destinataire.</li>
        <li>Collez bien l’étiquette de suivi visible sur le colis.</li>
        <li>Déclarez la valeur du contenu si nécessaire.</li>
        <li>Prévoyez une assurance pour les objets de valeur.</li>
      </ul>
      <img src="/fret.jpg" alt="Emballage colis" class="mt-8 mx-auto rounded-lg shadow-lg max-w-full h-auto" />
    </section>

    <!-- Section Délais de livraison -->
    <section class="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 class="text-3xl font-bold mb-6">Délais de livraison</h2>
      <p class="text-gray-700 max-w-xl mx-auto mb-4">
        Nos délais varient selon la destination et le mode d’expédition choisi. En général, comptez entre
        <strong>3 à 10 jours ouvrés</strong> pour les livraisons en fret aérien .
      </p>
      <p class="text-gray-700 max-w-xl mx-auto mb-6">
        Pour toute question spécifique, notre équipe est à votre disposition.
      </p>
      <img
        src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
        alt="Horloge délais"
        class="mx-auto rounded-lg shadow-lg max-w-full h-auto"
      />
    </section>

    <!-- FAQ simple -->
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
            Utilisez le bouton de contact en bas à droite ou envoyez-nous un email à wefretafrica.gmail.com
          </p>
        </details>
      </div>
    </section>

    <!-- Contact flottant -->
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

    <!-- Pied de page -->
    <footer class="bg-gray-800 text-gray-300 py-8 text-center text-sm">
      &copy; 2025 WefretAfrica - Tous droits réservés
    </footer>
  </div>
</template>
