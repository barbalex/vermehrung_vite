import React, { useContext, useState, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import FormTitle from './FormTitle'
import ErrorBoundary from '../../shared/ErrorBoundary'
import Spinner from '../../shared/Spinner'
import Conflict from './Conflict'
import Form from './Form'
import History from './History'
import { dexie, Event } from '../../../dexieClient'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`
const SplitPaneContainer = styled.div`
  height: 100%;
  position: relative;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
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

const EventComponent = ({
  filter: showFilter,
  id = '99999999-9999-9999-9999-999999999999',
}) => {
  const store = useContext(StoreContext)
  const { filter, online } = store

  let row: Event = useLiveQuery(async () => dexie.events.get(id??'99999999-9999-9999-9999-999999999999'), [id])
  if (showFilter) row = filter.event

  const [activeConflict, setActiveConflict] = useState(null)
  const conflictDisposalCallback = useCallback(
    () => setActiveConflict(null),
    [],
  )
  const conflictSelectionCallback = useCallback(
    () => setActiveConflict(null),
    [],
  )
  // ensure that activeConflict is reset
  // when changing dataset
  useEffect(() => {
    setActiveConflict(null)
  }, [id])

  const [showHistory, setShowHistory] = useState(null)
  const historyTakeoverCallback = useCallback(() => setShowHistory(null), [])

  if (!row) return <Spinner />
  if (!showFilter && filter.show) return null

  const paneIsSplit = online && (activeConflict || showHistory)

  const firstPaneWidth = paneIsSplit ? '50%' : '100%'
  // hide resizer when tree is hidden
  const resizerStyle = !paneIsSplit ? { width: 0 } : {}

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        <FormTitle
          row={row}
          showFilter={showFilter}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
        <SplitPaneContainer>
          <StyledSplitPane
            split="vertical"
            size={firstPaneWidth}
            maxSize={-10}
            resizerStyle={resizerStyle}
          >
            <Form
              showFilter={showFilter}
              id={id}
              row={row}
              activeConflict={activeConflict}
              setActiveConflict={setActiveConflict}
              showHistory={showHistory}
            />
            <>
              {online && (
                <>
                  {activeConflict ? (
                    <Conflict
                      rev={activeConflict}
                      id={id}
                      row={row}
                      conflictDisposalCallback={conflictDisposalCallback}
                      conflictSelectionCallback={conflictSelectionCallback}
                      setActiveConflict={setActiveConflict}
                    />
                  ) : showHistory ? (
                    <History
                      row={row}
                      historyTakeoverCallback={historyTakeoverCallback}
                    />
                  ) : null}
                </>
              )}
            </>
          </StyledSplitPane>
        </SplitPaneContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(EventComponent)
