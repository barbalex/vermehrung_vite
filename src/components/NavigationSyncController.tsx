import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import isEqual from 'lodash/isEqual'
import { useLocation, useNavigate } from 'react-router-dom'

import storeContext from '../storeContext'
import getActiveNodeArrayFromUrl from '../utils/activeNodeArrayFromUrl'

// syncs activeNodeArray with browser navigation
const NavigationSyncController = () => {
  const { pathname } = useLocation()

  const navigate = useNavigate()
  // enable navigating in store > set this as store value
  // (can't be passed when creating store yet)
  useEffect(() => {
    setNavigate(navigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const store = useContext(storeContext)
  const { setActiveNodeArray, setNavigate, addNode } = store

  // need to update activeNodeArray on every navigation
  useEffect(() => {
    console.log('NavigationSyncController, effect running')
    const activeNodeArray = getActiveNodeArrayFromUrl(pathname)

    if (!isEqual(activeNodeArray, store.activeNodeArray?.slice())) {
      console.log('NavigationSyncController, setting activeNodeArray to', store.activeNodeArray)
      setActiveNodeArray(activeNodeArray)
      addNode(activeNodeArray)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, setActiveNodeArray, store.activeNodeArray])
  
  console.log('NavigationSyncController, rendering')

  return null
}

export default observer(NavigationSyncController)
