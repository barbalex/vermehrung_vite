import React, { useEffect, useState } from 'react'
import { Provider as UrqlProvider } from 'urql'

import { Provider as MobxProvider } from '../../storeContext'

import NavigationSyncController from '../../components/NavigationSyncController'
import Notifications from '../../components/Notifications'

import Vermehrung from './Vermehrung'
import initiateApp from '../../utils/initiateApp'
import Header from '../../components/HeaderVermehrung'

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

const App = () => {
  const [store, setStore] = useState(null)

  useEffect(() => {
    persist().then((val) => console.log('storage is persisted safely:', val))
  }, [])

  useEffect(() => {
    let isActive = true
    let unregister
    console.log('App, effect, will initiate App')
    initiateApp().then(
      ({ store: storeReturned, unregister: unregisterReturned }) => {
        if (!isActive) return

        console.log('App, setting store:', storeReturned)
        setStore(storeReturned)
        unregister = unregisterReturned
      },
    )

    return () => {
      console.log('App, effect, will unregister, unregister is:', unregister)
      isActive = false
      unregister?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  console.log('Vermehrung index, store:', store)

  // without store bad things happen
  if (!store) return null

  return (
    <MobxProvider value={store}>
      <UrqlProvider value={store.gqlClient}>
        <Header />
        <NavigationSyncController />
        <Vermehrung />
        <Notifications />
      </UrqlProvider>
    </MobxProvider>
  )
}

export default App
