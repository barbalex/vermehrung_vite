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

  const store = useContext(storeContext)
  const { setNavigate } = store
  const { setActiveNodeArray, addNode, activeNodeArray } = store.tree

  // enable navigating in store > set this as store value
  // (can't be passed when creating store yet)
  useEffect(() => {
    setNavigate(navigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // need to update activeNodeArray on every navigation
  useEffect(() => {
    const activeNodeArrayFromUrl = getActiveNodeArrayFromUrl(pathname)
    // console.log('NavigationSyncController, setting activeNodeArray to', {
    //   activeNodeArrayFromUrl: activeNodeArrayFromUrl,
    //   activeNodeArrayFromStore: activeNodeArray?.slice(),
    // })

    if (!isEqual(activeNodeArrayFromUrl, activeNodeArray?.slice())) {
      console.log(
        'NavigationSyncController, setting activeNodeArray to',
        activeNodeArrayFromUrl,
      )
      setActiveNodeArray(activeNodeArrayFromUrl)
      addNode(activeNodeArrayFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pathname, setActiveNodeArray, activeNodeArray])

  // useEffect(() => {
  //   console.log('NavigationSyncController, pathname changed to:', pathname)
  // }, [pathname])

  return null
}

export default observer(NavigationSyncController)
