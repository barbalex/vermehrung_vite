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
    setLastActiveNodeArray,
    lastActiveNodeArray: lastANARaw,
    removeOpenNodeWithChildren,
    addOpenNode,
  } = store.tree
  const aNA = aNARaw.slice()
  const lastANA = lastANARaw.slice()

  // enable navigating in store > set this as store value
  // (can't be passed when creating store yet)
  useEffect(() => {
    setNavigate(navigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // when user clicks back or foward button, need to set lastActiveNodeArray
  useEffect(() => {
    window.onpopstate = () => {
      setLastActiveNodeArray(getActiveNodeArrayFromUrl(pathname))
    }
    // do not need to remove, see: https://stackoverflow.com/a/47997544/712005
  }, [pathname, setLastActiveNodeArray])

  // need to update activeNodeArray on every navigation
  useEffect(() => {
    const activeNodeArrayFromUrl = getActiveNodeArrayFromUrl(pathname)

    if (!isEqual(activeNodeArrayFromUrl, aNA)) {
      console.log(
        'NavigationSyncController, setting activeNodeArray to',
        activeNodeArrayFromUrl,
      )
      setActiveNodeArray(activeNodeArrayFromUrl)
      // addNode(activeNodeArrayFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    // edit openNodes
    // Three cases:
    // 1. new aNA longer
    // 2. new aNA shorter
    // 3. new aNA changed
    if (aNA.length > lastANA.length) {
      // new aNA is longer or simply changed
      addOpenNode(aNA)
    } else if (aNA.length < lastANA.length) {
      // 2. new aNA shorter
      removeOpenNodeWithChildren([...aNA, lastANA[aNA.length]])
    }
    // BEWARE: this should not make this effect fire again, so do not add lastANA as dependency
    setLastActiveNodeArray(aNA)
    // DO NOT add lastANA as that causes this effect to run twice and fail
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aNA, addOpenNode, removeOpenNodeWithChildren, setLastActiveNodeArray])

  return null
}

export default observer(NavigationSyncController)
