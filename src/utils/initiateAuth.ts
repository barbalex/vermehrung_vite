import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import getAuthToken from './getAuthToken'
import isOnline from './isOnline'

// Configure Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const initiateAuth = async ({ store }) => {
  console.log('initiateAuth running')
  const {
    setUser,
    setGettingAuthUser,
    online,
    setFirebaseAuth,
    setOnline,
    shortTermOnline,
    setShortTermOnline,
  } = store
  window.store = store
  let fbApp
  // catch app already existing
  // https://stackoverflow.com/a/48686803/712005
  if (!getApps().length) {
    fbApp = initializeApp(firebaseConfig)
  } else {
    fbApp = getApp() // if already initialized, use that one
  }
  const auth = getAuth(fbApp)
  setFirebaseAuth(auth)
  const unregisterAuthObserver = onAuthStateChanged(auth, async (user) => {
    // BEWARE: this is called at least twice
    // https://stackoverflow.com/questions/37673616/firebase-android-onauthstatechanged-called-twice
    if (store.user?.uid) return
    setUser(user)
    // set last activeNodeArray
    // only if top domain was visited
    // TODO:
    // without timeout and with timeout too low this errors before page Vermehrung logs
    const visitedTopDomain = window.location.pathname === '/'
    if (!!user && visitedTopDomain) {
      setTimeout(() => {
        store.navigate(`/Vermehrung/${store.tree.activeNodeArray.join('/')}`)
      }, 200)
    }
    const nowOnline = await isOnline()
    if (nowOnline !== online) setOnline(nowOnline)
    if (nowOnline !== shortTermOnline) setShortTermOnline(nowOnline)
    if (nowOnline) {
      console.log('initiateAuth getting auth token')
      await getAuthToken({ store })
    }
    setGettingAuthUser(false)
  })

  return unregisterAuthObserver
}

export default initiateAuth
