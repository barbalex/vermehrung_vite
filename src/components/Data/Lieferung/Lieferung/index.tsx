import React, { useContext, useState, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'

import StoreContext from '../../../../storeContext'
import ErrorBoundary from '../../../shared/ErrorBoundary'
import Spinner from '../../../shared/Spinner'
import Conflict from './Conflict'
import FormTitle from './FormTitle'
import Form from './Form'
import History from './History'

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

const Lieferung = ({ id, showFilter, row, rawRow }) => {
  const store = useContext(StoreContext)
  const { filter, online } = store

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
        {/* <FormTitle
          row={row}
          rawRow={rawRow}
          showFilter={showFilter}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        /> */}
        <div>Form title</div>
        <SplitPaneContainer>
          <StyledSplitPane
            split="vertical"
            size={firstPaneWidth}
            maxSize={-10}
            resizerStyle={resizerStyle}
          >
            {/* <Form
              showFilter={showFilter}
              id={id}
              row={row}
              rawRow={rawRow}
              activeConflict={activeConflict}
              setActiveConflict={setActiveConflict}
              showHistory={showHistory}
            /> */}
            <p>Form</p>
            <>
              {online && (
                <>
                  {activeConflict ? (
                    <Conflict
                      rev={activeConflict}
                      id={id}
                      row={row}
                      rawRow={rawRow}
                      conflictDisposalCallback={conflictDisposalCallback}
                      conflictSelectionCallback={conflictSelectionCallback}
                      setActiveConflict={setActiveConflict}
                    />
                  ) : showHistory ? (
                    <History
                      row={row}
                      rawRow={rawRow}
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

export default observer(Lieferung)
