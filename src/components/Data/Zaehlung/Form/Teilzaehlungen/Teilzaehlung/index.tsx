import React, { useState, useEffect, useCallback, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'

import StoreContext from '../../../../../../storeContext'
import ErrorBoundary from '../../../../../shared/ErrorBoundary'
import Conflict from './Conflict'
import Form from './Form'
import History from './History'

const Container = styled.div`
  position: relative;
`
const InnerContainer = styled.div`
  padding-left: 10px;
`
const SplitPaneContainer = styled.div`
  padding-left: 10px;
  height: 650px;
  position: relative;
`
const TopLine = styled.div`
  background-color: rgba(74, 20, 140, 0.1);
  height: 4px;
  margin-left: -10px;
  margin-right: -10px;
  margin-bottom: 10px;
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

const Teilzaehlung = ({ row, kulturId, index }) => {
  const store = useContext(StoreContext)
  const { online } = store

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
  }, [row])

  const [showHistory, setShowHistory] = useState(null)
  const historyTakeoverCallback = useCallback(() => setShowHistory(null), [])

  const paneIsSplit = online && (activeConflict || showHistory)

  const firstPaneWidth = paneIsSplit ? '50%' : '100%'
  // hide resizer when tree is hidden
  const resizerStyle = !paneIsSplit ? { width: 0 } : {}

  if (online && (activeConflict || showHistory)) {
    return (
      <ErrorBoundary>
        <Container>
          {!!index && <TopLine />}
          <SplitPaneContainer>
            <StyledSplitPane
              split="vertical"
              size={firstPaneWidth}
              maxSize={-10}
              resizerStyle={resizerStyle}
            >
              <Form
                row={row}
                kulturId={kulturId}
                activeConflict={activeConflict}
                setActiveConflict={setActiveConflict}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
              />
              <>
                {online && (
                  <>
                    {activeConflict ? (
                      <Conflict
                        rev={activeConflict}
                        id={row.id}
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

  return (
    <ErrorBoundary>
      <Container>
        {!!index && <TopLine />}
        <InnerContainer>
          <Form
            row={row}
            kulturId={kulturId}
            activeConflict={activeConflict}
            setActiveConflict={setActiveConflict}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
        </InnerContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Teilzaehlung)
