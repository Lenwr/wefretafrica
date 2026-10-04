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

  if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
    throw createError({ statusCode:503, statusMessage:'Le service de devis doit encore être configuré par l’administrateur.' })
  }

  try {
    const app = getApps()[0] || initializeApp({ credential:cert({
      projectId: config.firebaseProjectId,
      clientEmail: config.firebaseClientEmail,
      privateKey: String(config.firebasePrivateKey).replace(/\\n/g, '\n')
    }) })
    await getFirestore(app).collection('wefretafrica_demandes_devis').add({
      ...request,
      status:'nouveau',
      source:'site-wefretafrica',
      createdAt:FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.error('Quote storage error', error)
    throw createError({ statusCode:502, statusMessage:'La demande n’a pas pu être enregistrée. Contactez-nous directement.' })
  }

  return { ok:true }
})
