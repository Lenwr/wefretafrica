import { initializeApp } from 'firebase/app'
import { initializeFirestore, collection } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyAD3_lBREn2mj9hdNVG_oXmWAXpylFzI3o',
  authDomain: 'aarontravelgestion.firebaseapp.com',
  projectId: 'aarontravelgestion',
  storageBucket: 'aarontravelgestion.appspot.com',
  messagingSenderId: '251921548029',
  appId: '1:251921548029:web:936a9dc35f715ae401f494',
  measurementId: 'G-99L11P6DYT'
})

export const db = initializeFirestore(firebaseApp, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false
})

export const auth = getAuth(firebaseApp)
export const storage = getStorage(firebaseApp)

// Références réutilisables
export const enlevementsCollection = collection(db, 'enlevements')
export const customersCollection = collection(db, 'customers')