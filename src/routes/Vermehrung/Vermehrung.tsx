import React, { useEffect, useContext } from 'react'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'
import { observer } from 'mobx-react-lite'
import CircularProgress from '@mui/material/CircularProgress'
import { useLocation } from 'react-router-dom'

import StoreContext from '../../storeContext'
import activeNodeArrayFromPathname from '../../utils/activeNodeArrayFromPathname'
import openNodesFromActiveNodeArray from '../../utils/openNodesFromActiveNodeArray'
import fetchFromServer from '../../utils/fetchFromServer'
import Tree from '../../components/Tree'
import Data from '../../components/Data'
import Filter from '../../components/Filter'
import Login from '../../components/Login'
import ErrorBoundary from '../../components/shared/ErrorBoundary'
import ApiDetector from '../../components/ApiDetector'
import QueuedQueries from '../../components/QueuedQueries'
import tableNames from '../../utils/tableNames'
import constants from '../../utils/constants'

const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
`
const SpinnerContainer = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const LoginContainer = styled.div`
  margin: 20px;
`
const SpinnerText = styled.div`
  padding-top: 10px;
`
const SpinnerText2 = styled.div`
  padding: 0;
`
const StyledSplitPane = styled(SplitPane)`
  .Resizer {
    background: rgba(74, 20, 140, 0.1);
    opacity: 1;
    z-index: 1;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 7px;
    cursor: col-resize;
  }
  .Resizer:hover {
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
    background-color: #fff59d !important;
  }
  .Resizer.disabled {
    cursor: not-allowed;
  }
  .Resizer.disabled:hover {
    border-color: transparent;
  }
  .Pane {
    overflow: hidden;
  }
`

const Vermehrung = () => {
  const { pathname } = useLocation()
  const store = useContext(StoreContext)
  // console.log('Vermehrung, store:', store)
  const {
    activeForm,
    gettingAuthUser,
    authorizing,
    initialDataQueried,
    initiallyQuerying,
    isPrint,
    showQueuedQueries,
    singleColumnView,
    showTreeInSingleColumnView,
    user,
    online,
  } = store
  const {
    setActiveNodeArray,
    setLastTouchedNode,
    setOpenNodes,
    widthInPercentOfScreen,
    wsReconnectCount,
  } = store.tree

  const existsUser = !!user?.uid
  const showFilter = store.filter.show
  let treeWidth = singleColumnView
    ? (!showTreeInSingleColumnView && activeForm) || showFilter
      ? 0
      : // if no form is active, show only tree
        '100%'
    : `${widthInPercentOfScreen}%`
  // ensure tree is invisible when printing but still exists
  // (caused errors to render form without tree while printing)
  if (isPrint) treeWidth = 0

  const activeNodeArray = activeNodeArrayFromPathname(pathname)

  // on first render set openNodes
  // DO NOT add activeNodeArray to useEffet's dependency array or
  // it will not be possible to open multiple branches in tree
  // as openNodes is overwritten every time activeNodeArray changes
  useEffect(() => {
    setOpenNodes(openNodesFromActiveNodeArray(activeNodeArray))
    // set last touched node in case project is directly opened on it
    setLastTouchedNode(activeNodeArray)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // TODO: test if necessary
  // useEffect(() => {
  //   // user pushed back button > update activeNodeArray
  //   console.log(
  //     'Vermehrung, effect setting activeNodeArray with nonavigate (user pushed back button) to:',
  //     activeNodeArray,
  //   )

  //   setActiveNodeArray(activeNodeArray, 'nonavigate')
  // }, [activeNodeArray, pathname, setActiveNodeArray])

  useEffect(() => {
    // console.log('vermehrung, subscription effect: authorizing:', authorizing)
    // console.log('vermehrung, subscription effect: existsUser:', existsUser)
    let unsubscribe
    if (existsUser && !authorizing) {
      // TODO:
      // need to fetch user to get role
      // then pass role to fetchFromServer to skip fields
      // this user has no access to
      // would be much nicer if hasura simply passed null values
      // https://github.com/hasura/graphql-engine/issues/6541

      // TODO:
      // if no data exists yet
      // set initial data queried false
      // then true on first data event
      unsubscribe = fetchFromServer({ store })
    }
    return function cleanup() {
      if (unsubscribe && Object.values(unsubscribe)) {
        Object.values(unsubscribe).forEach((value) => value?.unsubscribe?.())
      }
    }
    // wsReconnectCount is made so a subscription can provoke re-subscription on error
    // see fetchFromServer, unsubscribe.ae_art
  }, [existsUser, store, wsReconnectCount, authorizing])

  //if (gettingAuthUser || isIOS) {
  if (gettingAuthUser) {
    return (
      <ErrorBoundary>
        <SpinnerContainer>
          <CircularProgress />
          {/* <SpinnerText>{isIOS ? 'prüfe' : 'autorisiere'}</SpinnerText> */}
          <SpinnerText>autorisiere</SpinnerText>
        </SpinnerContainer>
      </ErrorBoundary>
    )
  }

  if (!existsUser) {
    return (
      <ErrorBoundary>
        <LoginContainer>
          <Login />
        </LoginContainer>
      </ErrorBoundary>
    )
  }

  if (online && !initialDataQueried) {
    return (
      <ErrorBoundary>
        <SpinnerContainer>
          <CircularProgress />
          <SpinnerText>lade Daten für offline-Nutzung</SpinnerText>
          <SpinnerText2>{tableNames(initiallyQuerying)}</SpinnerText2>
        </SpinnerContainer>
      </ErrorBoundary>
    )
  }

  /*if (
    error &&
    !error.message.includes('Failed to fetch') &&
    !error.message.includes('JWT')
  ) {
    return (
      <ErrorBoundary>
        <ErrorContainer>{error.message}</ErrorContainer>
      </ErrorBoundary>
    )
  }
  if (error && error.message.includes('JWT')) {
    checkAuthOnError({ error, store })
  }*/
  if (showQueuedQueries) {
    return (
      <>
        <Container>
          <QueuedQueries />
        </Container>
        <ApiDetector />
      </>
    )
  }

  // hide resizer when tree is hidden
  const resizerStyle = treeWidth === 0 ? { width: 0 } : {}

  return (
    <ErrorBoundary>
      <Container>
        <StyledSplitPane
          split="vertical"
          size={treeWidth}
          maxSize={-10}
          resizerStyle={resizerStyle}
        >
          <ErrorBoundary>
            <Tree />
          </ErrorBoundary>
          <ErrorBoundary>
            <Data />
          </ErrorBoundary>
          {/* {showFilter ? <Filter /> : <Data />} */}
        </StyledSplitPane>
      </Container>
      <ApiDetector />
    </ErrorBoundary>
  )
}

export default observer(Vermehrung)
