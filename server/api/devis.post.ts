import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body?.website) return { ok:true }

  const required = ['name', 'phone', 'destination', 'transport', 'parcelType', 'message']
  if (required.some(field => !String(body?.[field] || '').trim())) {
    throw createError({ statusCode:400, message:'Merci de remplir tous les champs obligatoires.' })
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

  if (!config.firebaseProjectId || !config.firebaseClientEmail || (!config.firebasePrivateKey && !config.firebasePrivateKeyBase64)) {
    throw createError({ statusCode:503, message:'Le service de devis doit encore être configuré par l’administrateur.' })
  }

  let quoteRef
  try {
    const privateKey = config.firebasePrivateKeyBase64
      ? Buffer.from(String(config.firebasePrivateKeyBase64).replace(/\s+/g, ''), 'base64').toString('utf8')
      : String(config.firebasePrivateKey).trim().replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n').replace(/\r/g, '')
    const app = getApps()[0] || initializeApp({ credential:cert({
      projectId: config.firebaseProjectId,
      clientEmail: config.firebaseClientEmail,
      privateKey
    }) })
    quoteRef = await getFirestore(app).collection('wefretafrica_demandes_devis').add({
      ...request,
      status:'nouveau',
      source:'site-wefretafrica',
      smsStatus:'en_attente',
      smsNotificationOwner:'firebase',
      createdAt:FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.error('Quote storage error', error)
    throw createError({ statusCode:502, message:'La demande n’a pas pu être enregistrée. Contactez-nous directement.' })
  }

  // onWefretAfricaQuoteCreate (Firebase) est l'unique expéditeur des SMS.
  // La confirmation indique que le devis est enregistré, pas que le SMS est livré.
  return { ok:true, quoteId:quoteRef.id, notificationStatus:'pending' }
})
