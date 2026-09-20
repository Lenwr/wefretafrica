<script setup lang="ts">
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
const route = useRoute()
useSeoMeta({title:'Demander un devis | WefretAfrica',description:'Recevez un devis personnalisé pour votre envoi vers le Togo, le Bénin ou un autre pays d’Afrique de l’Ouest.'})
useHead({link:[{rel:'canonical',href:'https://www.wefretafrica.com/devis-en-ligne'}]})

const form = reactive({
  name:'', email:'', phone:'',
  destination:String(route.query.destination || 'Togo'),
  transport:String(route.query.transport || 'Aérien'),
  parcelType:String(route.query.type || 'Colis standard'),
  measurement:String(route.query.mesure || ''),
  pickup:'Enlèvement à domicile', city:String(route.query.city || ''), message:'', website:''
})
const sending=ref(false)
const success=ref(false)
const error=ref('')
async function submit(){
  sending.value=true; error.value=''; success.value=false
  try{
    const { $firestore } = useNuxtApp()
    const firebaseSave = addDoc(collection($firestore as any, 'wefretafrica_demandes_devis'), {
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      destination: form.destination, transport: form.transport, parcelType: form.parcelType,
      measurement: form.measurement.trim(), pickup: form.pickup, city: form.city.trim(),
      message: form.message.trim(), status: 'nouveau', source: 'site-wefretafrica',
      createdAt: serverTimestamp()
    })
    const emailSave = $fetch('/api/devis',{method:'POST',body:form})
    const [firebaseResult, emailResult] = await Promise.allSettled([firebaseSave, emailSave])
    if (firebaseResult.status === 'rejected') console.error('Firebase n’a pas accepté la demande.', firebaseResult.reason)
    if (emailResult.status === 'rejected') console.error('La copie e-mail du devis n’a pas pu être envoyée.', emailResult.reason)
    if (firebaseResult.status === 'rejected' && emailResult.status === 'rejected') throw firebaseResult.reason
    success.value=true
  }
  catch(e:any){ error.value=e?.data?.statusMessage || 'Impossible d’envoyer la demande. Réessayez ou contactez-nous directement.' }
  finally{ sending.value=false }
}
</script>
<template><main>
  <SiteHeader />
  <section class="quote-page"><div class="quote-intro"><p class="kicker">Devis personnalisé</p><h1>Parlez-nous de <em>votre envoi</em></h1><p>Remplissez ce formulaire. Votre demande sera transmise à l’équipe WefretAfrica avec toutes les informations utiles pour vous répondre.</p><ul><li>✓ Plusieurs destinations africaines</li><li>✓ Aérien ou maritime</li><li>✓ Électronique étudiée séparément</li><li>✓ Enlèvement en Île-de-France</li><li>✓ Enlèvement à Lille et dans la métropole lilloise</li><li>✓ Enlèvement à Lyon</li></ul></div>
    <form class="quote-form" :aria-busy="sending" @submit.prevent="submit">
      <div class="form-grid"><label>Nom et prénom *<input v-model="form.name" required autocomplete="name"></label><label>Téléphone *<input v-model="form.phone" required type="tel" autocomplete="tel"></label><label class="wide">Adresse e-mail *<input v-model="form.email" required type="email" autocomplete="email"></label><label>Destination *<select v-model="form.destination" required><option>Togo</option><option>Bénin</option><option>Congo-Brazzaville</option><option>Sénégal</option><option>Guinée</option><option>Comores</option><option>Abidjan / Côte d’Ivoire</option><option>Autres destinations</option></select></label><label>Transport souhaité *<select v-model="form.transport" required><option>Aérien</option><option>Maritime</option><option>À conseiller</option></select></label><label>Type de colis *<select v-model="form.parcelType" required><option>Colis standard</option><option>Vêtements / effets personnels</option><option>Télévision / appareil électronique</option><option>Électroménager / objet volumineux</option><option>Carton / barrique</option><option>Autre</option></select></label><label>Poids ou volume<input v-model="form.measurement" placeholder="Ex. 20 kg ou 0,5 m³"></label><label>Mode de remise en France<select v-model="form.pickup"><option>Enlèvement à domicile</option><option>Dépôt au Thillay</option><option>Dépôt à Lille–Wazemmes</option></select></label><label>Ville de collecte *<input v-model="form.city" required list="collection-cities" placeholder="Ex. Paris, Lille, Lyon…"><datalist id="collection-cities"><option value="Le Thillay"></option><option value="Paris"></option><option value="Lille"></option><option value="Roubaix"></option><option value="Tourcoing"></option><option value="Villeneuve-d’Ascq"></option><option value="Lyon"></option><option value="Villeurbanne"></option></datalist></label><label class="wide">Précisions sur le contenu *<textarea v-model="form.message" required rows="5" placeholder="Nature, quantité, dimensions, modèle de l’appareil électronique…"></textarea></label><label class="honeypot" aria-hidden="true">Ne pas remplir<input v-model="form.website" tabindex="-1" autocomplete="off"></label></div>
      <p class="privacy">En envoyant ce formulaire, vous acceptez d’être recontacté au sujet de cette demande.</p>
      <button class="btn full submit-button" type="submit" :disabled="sending">
        <span v-if="sending" class="button-spinner" aria-hidden="true"></span>
        <span>{{ sending ? 'Envoi de votre demande…' : 'Envoyer ma demande de devis →' }}</span>
      </button>
      <div class="submit-feedback" aria-live="polite" aria-atomic="true">
        <p v-if="sending" class="form-pending"><span class="status-spinner" aria-hidden="true"></span><span><b>Transmission en cours</b><small>Veuillez patienter et ne fermez pas cette page.</small></span></p>
        <p v-else-if="success" class="form-success"><span>✓</span><span><b>Demande bien envoyée</b><small>Notre équipe vous répondra rapidement par téléphone ou par e-mail.</small></span></p>
        <p v-else-if="error" class="form-error"><span>!</span><span><b>La demande n’a pas été envoyée</b><small>{{ error }}</small></span></p>
      </div>
    </form>
  </section>
</main></template>
