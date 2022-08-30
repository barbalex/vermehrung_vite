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
    persist().then((val) => console.log('storage is persisted safely:', val))
  }, [])

  useEffect(() => {
    let isActive = true
    let unregister = () => {}
    initiateApp().then(
      ({ store: storeReturned, unregister: unregisterReturned }) => {
        if (!isActive) return

        setStore(storeReturned)
        unregister = unregisterReturned
      },
    )

    return () => {
      isActive = false
      unregister()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // without store bad things happen
  if (!store) return null

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
                  <Route path="Vermehrung/*" element={<Vermehrung />}/>
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
