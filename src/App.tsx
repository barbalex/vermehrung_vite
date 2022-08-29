import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Provider as UrqlProvider } from 'urql'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Notifications from './components/Notifications'

import materialTheme from './utils/materialTheme'
import createGlobalStyle from './utils/createGlobalStyle'
const GlobalStyle = createGlobalStyle()

import { Provider as MobxProvider } from './storeContext'

import initiateApp from './utils/initiateApp'
import NavigationSyncController from './components/NavigationSyncController'

import { dexie } from './dexieClient'
import Layout from './components/Layout'
import Home from './routes/index.js'
import Vermehrung from './routes/Vermehrung'
import Dokumentation from './routes/Dokumentation'
import FourOhFour from './routes/404'
import { defaultValue as defaultErrors } from './store/Errors'

// trying to persist indexedDB
// https://dexie.org/docs/StorageManager#controlling-persistence 
// TODO: consider calling this only if user choose it in settings
// or pop own window to explain as shown in above link
// because it pops a request window
async function persist() {
  return (
    (await navigator.storage) &&
    navigator.storage.persist &&
    navigator.storage.persist()
  )
}

const App = ({ element }) => {
  const [store, setStore] = useState(null)
  const [database, setDatabase] = useState(null)

  useEffect(() => {
    // on first render regenerate store (if exists)
    dexie.stores.get('store').then((dbStore) => {
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
      setStore(st)
      fetchFromServer(st)
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
    })

    return () => {
      // TODO: remove subscriptions
      // supabase.removeAllSubscriptions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    persist().then((val) => console.log('storage is persisted safely:', val))
  }, [])

  // useEffect(() => {
  //   let isActive = true
  //   let unregister
  //   initiateApp().then(
  //     ({ store: storeReturned, unregister: unregisterReturned }) => {
  //       if (!isActive) return

  //       // console.log('App, effect, storeReturned:',storeReturned)
  //       setStore(storeReturned)
  //       unregister = unregisterReturned
  //       const db = initiateDb(store)
  //       setDatabase(db)
  //       storeReturned.setDb(db)
  //     },
  //   )

  //   return () => {
  //     isActive = false
  //     unregister()
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // without store bad things happen
  if (!store) return null

  // return <p>hi</p>

  return (
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={materialTheme}>
          <MobxProvider value={store}>
            <UrqlProvider value={store.gqlClient}>
              <GlobalStyle />
              <NavigationSyncController />
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="Dokumentation/*" element={<Dokumentation />} />
                  {/* <Route path="Vermehrung/*" element={<Vermehrung />}/> */}
                  <Route path="*" element={<FourOhFour />} />
                </Routes>
              </Layout>
            </UrqlProvider>
          </MobxProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  )
}

export default observer(App)
