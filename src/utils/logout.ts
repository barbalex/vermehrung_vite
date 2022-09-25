import localForage from 'localforage'
import { signOut } from 'firebase/auth'
import { dexie } from '../dexieClient'

const logout = async ({ store }) => {
  const { firebaseAuth } = store
  console.log('LOGGING OUT')
  await signOut(firebaseAuth)
  await localForage.clear()
  await dexie.delete()
  window.localStorage.removeItem('token')
  window.location.reload(true)
}

export default logout
