import { initializeApp } from 'firebase/app'
import { initializeFirestore, collection } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyBpgPmOUmp-rHSG3D2K5PJ4oGAZ3bHymYM',
  authDomain: 'rdsgestion-b3ec6.firebaseapp.com',
  projectId: 'rdsgestion-b3ec6',
  storageBucket: 'rdsgestion-b3ec6.firebasestorage.app',
  messagingSenderId: '302693543482',
  appId: '1:302693543482:web:e11edce2a238c368cc4f03'
})

export const db = initializeFirestore(firebaseApp, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false
})

export const auth = getAuth(firebaseApp)
export const storage = getStorage(firebaseApp)

// Références réutilisables
export const enlevementsCollection = collection(db, 'enlevements')
export const publicTrackingsCollection = collection(db, 'publicTrackings')
export const customersCollection = collection(db, 'customers')
