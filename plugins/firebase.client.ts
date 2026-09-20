import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public.firebase
  const app = getApps()[0] || initializeApp(config)
  return { provide: { firestore: getFirestore(app) } }
})
