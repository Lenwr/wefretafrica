<script setup>
import { ref } from 'vue'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { computed } from 'vue'



// Infos dynamiques
const siteTitle = ''
const siteDescription = 'Expédiez vos colis vers l’Afrique et l’international en toute sérénité. Suivi en temps réel, transparence, efficacité.'

// Formatage de date
const formatDate = (dateString) => {
  if (!dateString) return 'Non disponible'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
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
        { label: 'réceptionné', date: formatDate(doc.date) },
        { label: 'expédié', date: formatDate(doc.preparationDate) },
        { label: 'disponible pour retrait', date: formatDate(doc.transitDate) },
        { label: 'livré', date: formatDate(doc.deliveryDate) }
      ]

      // On mappe les colis et on force le statut en string, avec fallback sur 'scanné'
      const colisDetails = (doc.colis || []).flatMap((colisItem, colisIndex) => {
        return (colisItem.details || []).map((item, index) => ({
          id: `${colisIndex + 1}-${index + 1}`,
          nom: colisItem.nom || `Colis ${colisIndex + 1}`,
          coli: item.coli || `Colis ${colisIndex + 1}.${index + 1}`,
          quantite: colisItem.quantite || 1,
          statutColis: typeof item.statutColis === 'string'
            ? item.statutColis
            : (item.statutColis === false ? 'réceptionné' : 'inconnu'),
          historique: item.historique || []
        }))
      })


      data.value = {
        etat: doc.deliveryStatus || 'Inconnu',
        dateEstimee: formatDate(doc.date),
        lastUpdate: formatDate(doc.lastUpdate),
        timeline: timelineSteps,
        colis: colisDetails,

        // Ajout des infos demandées
        expediteur: doc.expediteur || 'Non renseigné',
        destinataire: doc.destinataire || 'Non renseigné',
        destination: doc.destination || 'Non renseigné',
        nombreColis: colisDetails.length,
        telephone: doc.telephoneDestinataire || 'Non renseigné',
      }
      console.log(data.value.colis)
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



// Volume
const longueur = ref(0)
const largeur = ref(0)
const hauteur = ref(0)
const volume = ref(null)
const tarifBase = 500

const calculerVolume = () => {
  console.log(longueur.value, largeur.value, hauteur.value)
  if (longueur.value > 0 && largeur.value > 0 && hauteur.value > 0) {
    const v = (longueur.value * largeur.value * hauteur.value) / 1000000
    volume.value = parseFloat(v.toFixed(2))
    console.log("work:", volume.value)
  } else {
    volume.value = null
    console.log("not work")
  }
}




</script>

<template>
  <div class="bg-white text-black font-sans">
    <!-- Hero -->
    <section class="bg-orange-50 py-16 text-center px-4 animate-fade-in">
      <h1 class="text-4xl font-bold mb-4">{{ siteTitle }}</h1>
      <p class="text-lg max-w-2xl mx-auto">{{ siteDescription }}</p>
    </section>

    <!-- Tracking -->
    <section class="py-12 px-4 max-w-3xl mx-auto animate-fade-in-up">
      <h2 class="text-2xl font-semibold mb-6 text-center">🔍 Suivi de votre colis</h2>
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <input v-model="trackingCode" placeholder="Ex: COLIS-20250630-154523-837"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition" />
        <button @click="search"
          class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold transition">
          Rechercher
        </button>
      </div>

      <div v-if="loading" class="text-center text-gray-600 animate-pulse">Chargement...</div>
      <div v-if="error" class="text-center text-red-600 font-semibold animate-shake">{{ error }}</div>




      <div class="timeline-container">
        <div v-for="(step, idx) in timeline" :key="idx" class="timeline-step">
          <div class="timeline-icon">
            <span v-if="idx === doneIndex">✅</span>
            <span v-else-if="idx < doneIndex">✔️</span>
            <span v-else>⏳</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-label">{{ step.status }}</div>
            <div class="timeline-date">{{ formatDate(step.date) }}</div>
          </div>
        </div>
      </div>
      <div v-if="data" class="mb-6 p-4 border border-orange-300 rounded-lg bg-orange-50 text-orange-800">
        <h3 class="text-xl font-semibold mb-2">Infos de l'enlèvement</h3>
        <p><strong>Expéditeur :</strong> {{ data.expediteur }}</p>
        <p><strong>Destinataire :</strong> {{ data.destinataire }}</p>
        <p><strong>Destination :</strong> {{ data.destination }}</p>
        <p><strong>Nombre de colis :</strong> {{ data.nombreColis }}</p>
        <p><strong>Téléphone :</strong> {{ data.telephone }}</p>
      </div>


      <!-- Liste des colis avec timeline -->
      <div v-if="colisList.length" class="mt-8">
        <h3 class="text-lg font-semibold text-center mb-4">📦 Détail des colis ({{ colisList.length }})</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="(colis, i) in colisList" :key="i"
            class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-fade-in-up">
            <p class="font-bold text-orange-700 mb-1">{{ colis.coli }}</p>
            <p><strong>Nom :</strong> {{ colis.nom }}</p>
            <p><strong>Quantité :</strong> {{ colis.quantite }}</p>

            <!-- Statut avec ta règle Chargé => Indispo -->
            <p><strong>Statut :</strong>
              <span v-if="colis.statutColis === 'Chargé'">Indisponible pour retrait</span>
              <span v-else>{{ colis.statutColis }}</span>
            </p>

            <!-- Timeline -->
            <div class="border-l-4 border-orange-500 pl-4 mt-3 space-y-2">
              <div v-for="(step, index) in colis.historique" :key="index" class="relative ml-2">
                <div class="absolute -left-6 top-1 text-orange-600">✔️</div>
                <div>
                  <p class="font-semibold capitalize">{{ step.status }}</p>
                  <small class="text-gray-600">{{ new Date(step.date).toLocaleString() }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Volume -->
    <section class="py-12 px-4 bg-gray-50 max-w-2xl mx-auto rounded-lg shadow animate-fade-in">
      <h2 class="text-xl font-semibold mb-6 text-center">📦 Estimez le volume de vos affaires</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input v-model.number="longueur" placeholder="Longueur (cm)"
          class="px-4 py-3 border border-gray-300 rounded-lg" />
        <input v-model.number="largeur" placeholder="Largeur (cm)"
          class="px-4 py-3 border border-gray-300 rounded-lg" />
        <input v-model.number="hauteur" placeholder="Hauteur (cm)"
          class="px-4 py-3 border border-gray-300 rounded-lg" />
      </div>
      <div class="mt-4 text-center">
        <button @click="calculerVolume"
          class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold transition">
          Calculer
        </button>
        <div v-if="volume !== null" class="mt-4 text-lg font-bold text-orange-700 animate-fade-in-up">
          Volume estimé : {{ volume }} m³
        </div>

      </div>
    </section>

    <!-- Tarif -->
    <section class="py-10 text-center px-4 animate-fade-in">
      <h2 class="text-xl font-semibold mb-4">💸 Estimation du prix</h2>
      <p class="mb-2">Tarif de base : <strong>{{ tarifBase }} € / m³</strong></p>
      <p v-if="volume" class="text-lg font-bold text-orange-700 animate-fade-in-up">
        Prix estimé : {{ (volume * tarifBase).toFixed(2) }} €
      </p>
    </section>

    <!-- Footer -->
    <footer class="py-6 bg-orange-50 text-center text-sm text-gray-600">
      © {{ new Date().getFullYear() }} {{ siteTitle }}. Tous droits réservés.
    </footer>
  </div>
</template>


<style scoped>
/* Animations CSS custom (ou utilise animate.css / vueuse/motion pour plus d’effets) */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shake {

  10%,
  90% {
    transform: translateX(-2px);
  }

  20%,
  80% {
    transform: translateX(4px);
  }

  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }

  40%,
  60% {
    transform: translateX(4px);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-slide-in-left {
  animation: slideInLeft 0.5s ease-out forwards;
}

.animate-shake {
  animation: shake 0.6s ease-in-out;

  .timeline-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .timeline-step {
    display: flex;
    align-items: center;
  }

  .timeline-icon {
    width: 2rem;
    text-align: center;
  }

  .timeline-content {
    margin-left: 0.5rem;
  }

  .timeline-label {
    font-weight: bold;
    text-transform: capitalize;
  }

  .timeline-date {
    font-size: 0.875rem;
    color: #555;
  }
}
</style>
