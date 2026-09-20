export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body.website) return {ok:true}
  const required=['name','email','phone','destination','transport','parcelType','message']
  if(required.some(field=>!String(body[field]||'').trim())) throw createError({statusCode:400,statusMessage:'Merci de remplir tous les champs obligatoires.'})
  const config=useRuntimeConfig(event)
  if(!config.resendApiKey) throw createError({statusCode:503,statusMessage:'Le service e-mail doit encore être configuré par l’administrateur.'})
  const clean=(value:unknown)=>String(value||'').replace(/[<>]/g,'')
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.resendApiKey}`,'Content-Type':'application/json'},body:JSON.stringify({
    from:config.quoteFromEmail,
    to:[config.quoteToEmail],
    reply_to:clean(body.email),
    subject:`Nouveau devis ${clean(body.destination)} — ${clean(body.name)}`,
    text:[`Nom : ${clean(body.name)}`,`E-mail : ${clean(body.email)}`,`Téléphone : ${clean(body.phone)}`,`Destination : ${clean(body.destination)}`,`Transport : ${clean(body.transport)}`,`Type : ${clean(body.parcelType)}`,`Poids / volume : ${clean(body.measurement)}`,`Enlèvement : ${clean(body.pickup)}`,`Ville : ${clean(body.city)}`,'',`Message : ${clean(body.message)}`].join('\n')
  })})
  if(!response.ok) throw createError({statusCode:502,statusMessage:'Le service e-mail n’a pas accepté la demande. Vérifiez sa configuration.'})
  return {ok:true}
})
