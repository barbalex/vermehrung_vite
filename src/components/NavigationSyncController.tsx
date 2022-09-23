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
  const {
    setActiveNodeArray,
    addNode,
    activeNodeArray: aNARaw,
    setLastTouchedNode,
  } = store.tree
  const aNA = aNARaw.slice()

  // enable navigating in store > set this as store value
  // (can't be passed when creating store yet)
  useEffect(() => {
    setNavigate(navigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // when user clicks back or foward button, need to set lastTouchedNode
  useEffect(() => {
    window.onpopstate = () => {
      setLastTouchedNode(getActiveNodeArrayFromUrl(pathname))
    }
    // do not need to remove, see: https://stackoverflow.com/a/47997544/712005
  }, [pathname, setLastTouchedNode])

  // need to update activeNodeArray on every navigation
  useEffect(() => {
    const activeNodeArrayFromUrl = getActiveNodeArrayFromUrl(pathname)

    if (!isEqual(activeNodeArrayFromUrl, aNA)) {
      console.log(
        'NavigationSyncController, setting activeNodeArray to',
        activeNodeArrayFromUrl,
      )
      setActiveNodeArray(activeNodeArrayFromUrl)
      addNode(activeNodeArrayFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // setting last touched node on every change of activeNodeArray
  // to ensure tree follows navigation in form lists
  useEffect(() => {
    setLastTouchedNode(aNA)
  }, [aNA, setLastTouchedNode])

  return null
}

export default observer(NavigationSyncController)
