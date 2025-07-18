<script setup>
import { ref, computed } from 'vue'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

// Infos dynamiques
const siteTitle = 'WefretAfrica'
const siteDescription = 'Expédiez vos colis vers l’Afrique et l’international en toute sérénité. Suivi en temps réel, transparence, efficacité.'

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
          statutColis: typeof item.statutColis === 'string'
            ? item.statutColis
            : (item.statutColis === false ? 'Réceptionné' : 'Inconnu'),
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
        telephone: doc.telephoneDestinataire || 'Non renseigné',
      }
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

// Volume
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
    <!-- Hero Banner -->
    <div class="hero min-h-screen bg-cover relative flex items-center justify-center"
      style="background-image: url('/fret2.jpg');">
      <div class="absolute inset-0 bg-black opacity-60"></div>
      <div class="relative z-10 text-center text-white px-4 max-w-3xl">
        <h1 class="mb-5 text-5xl font-extrabold">📦 WefretAfrica</h1>
        <p class="mb-5 text-lg">
          Suivez vos colis en toute simplicité et restez informé à chaque étape de l’expédition.
          Votre sérénité est notre priorité.
        </p>
        <button
          class="bg-orange-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-600 shadow transition">
          Commencer le suivi
        </button>
      </div>
    </div>

    <!-- Suivi -->
    <section class="py-16 px-4 max-w-3xl mx-auto text-center">
      <h3 class="text-3xl font-bold mb-4">🔍 Recherchez votre colis</h3>
      <p class="mb-6 text-gray-600">Saisissez votre numéro de suivi pour obtenir des informations détaillées et
        actualisées.</p>
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <input v-model="trackingCode" placeholder="Ex: COLIS-XXXX"
          class="flex-1 px-5 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-400 transition" />
        <button @click="search"
          class="bg-orange-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-600 shadow transition disabled:opacity-50"
          :disabled="loading || trackingCode.length < 5">
          {{ "Rechercher" }}
        </button>
      </div>
      <p v-if="error" class="text-red-600 font-semibold mb-4">{{ error }}</p>
      <p v-if="loading" class="text-gray-500 mb-4">Chargement...</p>

      <div v-if="data" class="bg-white rounded-xl shadow p-6 text-left">
        <!--   <h4 class="text-xl font-bold mb-3">État actuel : <span class="text-orange-500">{{ data.etat }}</span></h4>
        <p class="mb-2 text-sm text-gray-600">Dernière mise à jour : {{ data.lastUpdate }}</p>

     
        <div class="overflow-x-auto mb-8">
          <ul class="flex space-x-6 text-center whitespace-nowrap">
            <li v-for="(step, index) in timeline" :key="index" class="flex flex-col items-center">
              <div
                :class="[
                  'w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold',
                  step.date ? 'border-orange-500 bg-orange-100 text-orange-600' : 'border-gray-300 text-gray-400'
                ]"
              >
                {{ step.status[0] }}
              </div>
              <div class="mt-2 text-xs max-w-[90px]">{{ step.status }}</div>
              <div class="text-xs text-gray-500">{{ step.date ? formatDate(step.date) : 'En attente' }}</div>
            </li>
          </ul>
        </div>
      -->

        <!-- Légende Timeline -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-left mb-8">
          <div><strong>Réceptionné :</strong> Le colis a été pris en charge par notre service.</div>
          <div><strong>Expédié :</strong> Le colis est en route vers la destination.</div>
          <div><strong>Disponible pour retrait :</strong> Le colis est prêt à être récupéré ou livré.</div>
          <div><strong>Livré :</strong> Le colis a été remis au destinataire.</div>
        </div>


        <!-- Enlèvement Info -->
        <div v-if="data" class="mt-10 p-6 border border-orange-200 rounded-2xl bg-orange-50 text-orange-800 shadow">
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
            <div v-for="(colis, i) in colisList" :key="i"
              class="p-6 bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition">
              <p class="font-bold text-orange-600 mb-1">{{ colis.coli }}</p>
              <p><strong>Nom :</strong> {{ colis.nom }}</p>
              <p><strong>Quantité :</strong> {{ colis.quantite }}</p>
              <p><strong>Statut :</strong>
                <span v-if="colis.statutColis === 'Chargé'">Indisponible pour retrait</span>
                <span v-else>{{ colis.statutColis }}</span>
              </p>

              <!-- Timeline interne -->
              <div class="mt-4 space-y-4 border-l-4 border-orange-400 pl-6">
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

        <h4 class="text-lg font-semibold mb-3">Détails des colis :</h4>
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
                <span :class="{
                  'text-green-600 font-bold': item.statutColis === 'Livré',
                  'text-orange-600 font-semibold': item.statutColis === 'Réceptionné',
                  'text-gray-600': !['Livré', 'Réceptionné'].includes(item.statutColis)
                }">
                  {{ item.statutColis }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

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
        détails clairs pour chaque colis.
        Fini le stress : restez maître de vos expéditions à tout moment.
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
        de l’expédition à la livraison.
        Grâce à notre système, vous pouvez suivre en temps réel l’acheminement et être informé en cas d’incident.
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
        Nos délais varient selon la destination et le mode d’expédition choisi.
        En général, comptez entre <strong>3 à 10 jours ouvrés</strong> pour les livraisons en Afrique, et <strong>5 à 15
          jours</strong> pour l’international.
      </p>
      <p class="text-gray-700 max-w-xl mx-auto mb-6">
        Pour toute question spécifique, notre équipe est à votre disposition.
      </p>
      <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
        alt="Horloge délais" class="mx-auto rounded-lg shadow-lg max-w-full h-auto" />
    </section>



    <!-- FAQ simple -->
    <section class="max-w-4xl mx-auto px-4 py-16 text-center bg-orange-50 rounded-xl shadow">
      <h2 class="text-3xl font-bold mb-6">FAQ - Questions fréquentes</h2>
      <div class="max-w-xl mx-auto text-left space-y-4 text-gray-700">
        <details class="p-4 bg-white rounded-lg shadow">
          <summary class="cursor-pointer font-semibold">Comment obtenir mon numéro de suivi ?</summary>
          <p class="mt-2">Le numéro de suivi vous est fourni lors de l’enregistrement de votre colis, généralement par
            email ou SMS.</p>
        </details>
        <details class="p-4 bg-white rounded-lg shadow">
          <summary class="cursor-pointer font-semibold">Que faire si mon colis est en retard ?</summary>
          <p class="mt-2">Contactez notre support via le bouton en bas de page pour que nous vérifiions l’état de votre
            envoi.</p>
        </details>
        <details class="p-4 bg-white rounded-lg shadow">
          <summary class="cursor-pointer font-semibold">Puis-je modifier l’adresse de livraison ?</summary>
          <p class="mt-2">Une fois le colis expédié, la modification d’adresse est généralement impossible.
            Contactez-nous rapidement si besoin.</p>
        </details>
        <details class="p-4 bg-white rounded-lg shadow">
          <summary class="cursor-pointer font-semibold">Comment contacter le support ?</summary>
          <p class="mt-2">Utilisez le bouton de contact en bas à droite ou envoyez-nous un email à
            support@wefretafrica.com</p>
        </details>
      </div>
    </section>

    <!-- Contact flottant -->
    <a href="mailto:support@wefretafrica.com"
      class="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition flex items-center space-x-2 z-50">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
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
