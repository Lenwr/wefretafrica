import { createHash } from 'node:crypto'

const requestsByIp = new Map<string, number[]>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor:true }) || 'unknown'
  const now = Date.now()
  const recent = (requestsByIp.get(ip) || []).filter(time => now - time < 60 * 60 * 1000)
  if (recent.length >= 5) throw createError({ statusCode:429, statusMessage:'Trop de demandes. Contactez-nous directement si votre demande est urgente.' })
  recent.push(now); requestsByIp.set(ip, recent)

  const body = await readBody(event)
  if (body?.website) return { ok:true }
  const required = ['name','phone','email','address','postalCode','city','destination','parcelDetails']
  if (required.some(field => !String(body?.[field] || '').trim())) throw createError({ statusCode:400, statusMessage:'Merci de compléter tous les champs obligatoires.' })
  const clean = (value:unknown) => String(value || '').replace(/[<>]/g, '').slice(0, 1200)
  const email = clean(body.email)
  if (!/^\S+@\S+\.\S+$/.test(email)) throw createError({ statusCode:400, statusMessage:'L’adresse e-mail n’est pas valide.' })

  const config = useRuntimeConfig(event)
  const reference = createHash('sha256').update(`${ip}-${now}`).digest('hex').slice(0, 8).toUpperCase()
  const text = [
    `DEMANDE D’ENLÈVEMENT IA — ${reference}`,'',
    `Nom : ${clean(body.name)}`, `Téléphone : ${clean(body.phone)}`, `E-mail : ${email}`,
    `Adresse : ${clean(body.address)}`, `Code postal / ville : ${clean(body.postalCode)} ${clean(body.city)}`,
    `Destination : ${clean(body.destination)}`, `Transport : ${clean(body.transport)}`,'',
    `Colis : ${clean(body.parcelDetails)}`, `Précisions : ${clean(body.notes)}`,'',
    'Important : demande préparée sur le site avec l’assistant IA. Le passage du chauffeur reste à confirmer avec le client.'
  ].join('\n')
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioFromNumber || !config.twilioToNumber) throw createError({ statusCode:503, statusMessage:'Les notifications SMS doivent encore être configurées par WefretAfrica.' })
  const sms = [`ENLEVEMENT IA ${reference}`, clean(body.name), clean(body.phone), `${clean(body.address)}, ${clean(body.postalCode)} ${clean(body.city)}`, `Vers: ${clean(body.destination)} (${clean(body.transport)})`, `Colis: ${clean(body.parcelDetails)}`, clean(body.notes)].filter(Boolean).join('\n').slice(0, 1500)
  const smsPayload = new URLSearchParams({ To:config.twilioToNumber, From:config.twilioFromNumber, Body:sms })
  const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(config.twilioAccountSid)}/Messages.json`, { method:'POST', headers:{ Authorization:`Basic ${Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64')}`, 'Content-Type':'application/x-www-form-urlencoded' }, body:smsPayload })
  if (!twilioResponse.ok) {
    console.error('Pickup SMS error', twilioResponse.status, await twilioResponse.text().catch(() => ''))
    throw createError({ statusCode:502, statusMessage:'Le SMS n’a pas pu être transmis. Contactez-nous directement.' })
  }
  if (config.resendApiKey) {
    const response = await fetch('https://api.resend.com/emails', { method:'POST', headers:{ Authorization:`Bearer ${config.resendApiKey}`, 'Content-Type':'application/json' }, body:JSON.stringify({ from:config.quoteFromEmail, to:[config.quoteToEmail], reply_to:email, subject:`Enlèvement IA ${clean(body.city)} — ${clean(body.name)} — ${reference}`, text }) })
    if (!response.ok) console.error('Pickup backup email error', response.status)
  }
  return { ok:true, reference }
})
