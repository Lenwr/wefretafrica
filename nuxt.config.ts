export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    resendApiKey: process.env.NUXT_RESEND_API_KEY || '',
    quoteToEmail: process.env.NUXT_QUOTE_TO_EMAIL || 'wefretafrica@gmail.com',
    quoteFromEmail: process.env.NUXT_QUOTE_FROM_EMAIL || 'WefretAfrica <onboarding@resend.dev>',
    twilioAccountSid: process.env.NUXT_TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.NUXT_TWILIO_AUTH_TOKEN || '',
    twilioFromNumber: process.env.NUXT_TWILIO_FROM_NUMBER || '',
    twilioToNumber: process.env.NUXT_TWILIO_TO_NUMBER || '',
    public: {
      firebase: {
        apiKey: 'AIzaSyAD3_lBREn2mj9hdNVG_oXmWAXpylFzI3o',
        authDomain: 'aarontravelgestion.firebaseapp.com',
        projectId: 'aarontravelgestion',
        storageBucket: 'aarontravelgestion.appspot.com',
        messagingSenderId: '251921548029',
        appId: '1:251921548029:web:936a9dc35f715ae401f494',
        measurementId: 'G-99L11P6DYT'
      }
    }
  },
  routeRules: {
    '/**': { headers: { 'cache-control': 'no-store, max-age=0' } },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
  },
  app: { head: { htmlAttrs: { lang: 'fr' }, titleTemplate: '%s', meta: [{ name: 'application-name', content: 'WefretAfrica' }, { name: 'theme-color', content: '#071a27' }], link: [{ rel: 'icon', href: '/favicon.png' }] } }
})
