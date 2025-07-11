import { initializeApp } from 'firebase/app'
import { getFirestore, collection } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import {getAuth} from 'firebase/auth'
// ... other firebase imports

export const firebaseApp = initializeApp({
    apiKey: "AIzaSyBpgPmOUmp-rHSG3D2K5PJ4oGAZ3bHymYM",
    authDomain: "rdsgestion-b3ec6.firebaseapp.com",
    projectId: "rdsgestion-b3ec6",
    storageBucket: "rdsgestion-b3ec6.firebasestorage.app",
    messagingSenderId: "302693543482",
    appId: "1:302693543482:web:e11edce2a238c368cc4f03"
})

// used for the firestore refs
export const db = getFirestore(firebaseApp)


const storage = getStorage(firebaseApp)

// here we can export reusable database reference
export const auth = getAuth()
export { storage  }
