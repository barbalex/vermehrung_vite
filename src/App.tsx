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
// import initiateDb from './utils/initiateDb'
import NavigationSyncController from './components/NavigationSyncController'

import { dexie } from './dexieClient'
import Layout from './components/Layout'

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
    let isActive = true
    let unregister
    initiateApp().then(
      ({ store: storeReturned, unregister: unregisterReturned }) => {
        if (!isActive) return

        // console.log('App, effect, storeReturned:',storeReturned)
        setStore(storeReturned)
        unregister = unregisterReturned
        // const db = initiateDb(store)
        // setDatabase(db)
        // storeReturned.setDb(db)
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
                <>
                  {element}
                  <p>hi</p>
                </>
              </Layout>
            </UrqlProvider>
          </MobxProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  )
}

export default observer(App)
