
import { onSnapshot } from 'mobx-state-tree'

import { dexie } from '../dexieClient'
import MobxStore from '../store'
import { defaultValue as defaultErrors } from '../store/Errors'

const createStore = async () => {
  const dbStore = await dexie.stores.get('store')
  let st
  if (dbStore) {
    console.log('recreating persisted store')
    // reset some values
    if (!dbStore?.store?.showMap) dbStore.store.mapInitiated = false
    dbStore.store.notifications = {}
    // need to blacklist authorizing or mst-persist will set it to false
    // and login form appears for a short moment until auth state changed
    dbStore.store.authorizing = true
    dbStore.store.user = {}
    dbStore.store.gqlWsClient = null
    dbStore.store.gettingAuthUser = true
    dbStore.store.online = true
    dbStore.store.shortTermOnline = true
    dbStore.store.errors = defaultErrors
    dbStore.store.ae_art_initially_queried = false
    dbStore.store.art_initially_queried = false
    dbStore.store.art_file_initially_queried = false
    dbStore.store.art_qk_initially_queried = false
    dbStore.store.av_initially_queried = false
    dbStore.store.event_initially_queried = false
    dbStore.store.garten_initially_queried = false
    dbStore.store.garten_file_initially_queried = false
    dbStore.store.gv_initially_queried = false
    dbStore.store.herkunft_initially_queried = false
    dbStore.store.herkunft_file_initially_queried = false
    dbStore.store.kultur_initially_queried = false
    dbStore.store.kultur_file_initially_queried = false
    dbStore.store.kultur_option_initially_queried = false
    dbStore.store.kultur_qk_initially_queried = false
    dbStore.store.lieferung_initially_queried = false
    dbStore.store.lieferung_file_initially_queried = false
    dbStore.store.person_initially_queried = false
    dbStore.store.person_file_initially_queried = false
    dbStore.store.person_option_initially_queried = false
    dbStore.store.sammel_lieferung_initially_queried = false
    dbStore.store.sammlung_initially_queried = false
    dbStore.store.sammlung_file_initially_queried = false
    dbStore.store.teilkultur_initially_queried = false
    dbStore.store.teilzaehlung_initially_queried = false
    dbStore.store.user_role_initially_queried = false
    dbStore.store.zaehlung_initially_queried = false
    st = MobxStore.create(dbStore?.store)
  } else {
    st = MobxStore.create()
  }
  // navigate to previous activeNodeArray - if exists
  const shouldNavigate =
    dbStore?.activeNodeArray?.length &&
    !isEqual(
      activeNodeArrayFromUrl(window.location.pathname),
      dbStore?.activeNodeArray,
    )
  if (shouldNavigate) {
    window.location.href = `${
      window.location.origin
    }/${dbStore?.activeNodeArray?.join('/')}`
  }
  // persist store on every snapshot
  onSnapshot(st, (ss) => dexie.stores.put({ id: 'store', store: ss }))
  return st
}

export default createStore