import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body?.website) return { ok:true }

  const required = ['name', 'phone', 'destination', 'transport', 'parcelType', 'message']
  if (required.some(field => !String(body?.[field] || '').trim())) {
    throw createError({ statusCode:400, statusMessage:'Merci de remplir tous les champs obligatoires.' })
  }

  const clean = (value:unknown) => String(value || '').replace(/[<>]/g, '').slice(0, 2000)
  const config = useRuntimeConfig(event)
  const request = {
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone),
    destination: clean(body.destination),
    transport: clean(body.transport),
    parcelType: clean(body.parcelType),
    measurement: clean(body.measurement),
    pickup: clean(body.pickup),
    city: clean(body.city),
    message: clean(body.message),
    cta: clean(body.cta),
    from: clean(body.from)
  }

  const saves: Promise<unknown>[] = []

  if (config.firebaseProjectId && config.firebaseClientEmail && config.firebasePrivateKey) {
    const app = getApps()[0] || initializeApp({ credential:cert({
      projectId: config.firebaseProjectId,
      clientEmail: config.firebaseClientEmail,
      privateKey: String(config.firebasePrivateKey).replace(/\\n/g, '\n')
    }) })
    saves.push(getFirestore(app).collection('wefretafrica_demandes_devis').add({
      ...request,
      status:'nouveau',
      source:'site-wefretafrica',
      createdAt:FieldValue.serverTimestamp()
    }))
  }

  if (config.resendApiKey) {
    const emailPayload:Record<string, unknown> = {
      from:config.quoteFromEmail,
      to:[config.quoteToEmail],
      subject:`Nouveau devis ${request.destination} — ${request.name}`,
      text:[`Nom : ${request.name}`,`E-mail : ${request.email || 'Non renseigné'}`,`Téléphone : ${request.phone}`,`Destination : ${request.destination}`,`Transport : ${request.transport}`,`Type : ${request.parcelType}`,`Poids / volume : ${request.measurement}`,`Enlèvement : ${request.pickup}`,`Ville : ${request.city || 'Non applicable'}`,`Origine : ${request.from || 'Non renseignée'}`,`CTA : ${request.cta || 'Non renseigné'}`,'',`Message : ${request.message}`].join('\n')
    }
    if (request.email) emailPayload.reply_to = request.email
    saves.push(fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ Authorization:`Bearer ${config.resendApiKey}`, 'Content-Type':'application/json' },
      body:JSON.stringify(emailPayload)
    }).then(async response => {
      if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text().catch(() => '')}`)
      return response
    }))
  }

  if (!saves.length) {
    throw createError({ statusCode:503, statusMessage:'Le service de devis doit encore être configuré par l’administrateur.' })
  }

  const results = await Promise.allSettled(saves)
  const succeeded = results.some(result => result.status === 'fulfilled')
  results.forEach(result => {
    if (result.status === 'rejected') console.error('Quote notification error', result.reason)
  })
  if (!succeeded) {
    throw createError({ statusCode:502, statusMessage:'La demande n’a pas pu être enregistrée. Contactez-nous directement.' })
  }

  return { ok:true }
})
