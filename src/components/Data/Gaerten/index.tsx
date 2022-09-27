import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { FixedSizeList } from 'react-window'
import { withResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import Row from './Row'
import ErrorBoundary from '../../shared/ErrorBoundary'
import FilterNumbers from '../../shared/FilterNumbers'
import { ReactComponent as UpSvg } from '../../../svg/to_up.inline.svg'
import gartensSortedFromGartens from '../../../utils/gartensSortedFromGartens'
import constants from '../../../utils/constants'
import { Garten } from '../../../dexieClient'
import filteredObjectsFromTable from '../../../utils/filteredObjectsFromTable'
import hierarchyConditionAdderForTable from '../../../utils/hierarchyConditionAdderForTable'
import Spinner from '../../shared/Spinner'
import addTotalCriteriaToWhere from '../../../utils/addTotalCriteriaToWhere'
import collectionFromTable from '../../../utils/collectionFromTable'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

const TitleContainer = styled.div`
  background-color: rgba(74, 20, 140, 0.1);
  flex-shrink: 0;
  display: flex;
  @media print {
    display: none !important;
  }
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding 0 10px;
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const TitleSymbols = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
`
const FieldsContainer = styled.div`
  height: 100%;
`

const Gaerten = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const { insertGartenRev, personIdInActiveNodeArray } = store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree

  const data = useLiveQuery(async () => {
    const conditionAdder = await hierarchyConditionAdderForTable({
      store,
      table: 'garten',
    })
    const [gartens, totalCount] = await Promise.all([
      filteredObjectsFromTable({ store, table: 'garten' }),
      conditionAdder(
        collectionFromTable({
          table: 'garten',
          where: addTotalCriteriaToWhere({ store, table: 'garten' }),
        }),
      ).count(),
    ])

    const gartensSorted = await gartensSortedFromGartens(gartens)

    return { gartens: gartensSorted, totalCount }
  }, [
    store.filter.garten,
    ...Object.values(store.filter.garten),
    store.garten_initially_queried,
    personIdInActiveNodeArray,
  ])

  const gartens: Garten[] = data?.gartens ?? []
  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.gartens?.length ?? '...'

  const add = useCallback(() => {
    insertGartenRev()
  }, [insertGartenRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[1] === 'Gaerten') {
    upTitle = 'Zu allen Listen'
  }
  if (activeNodeArray[activeNodeArray.length - 3] === 'Personen') {
    upTitle = 'Zur Person'
  }

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Garten"
            table="garten"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Gärten</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              <IconButton
                aria-label="neuer Garten"
                title="neuer Garten"
                onClick={add}
                size="large"
              >
                <FaPlus />
              </IconButton>
              <FilterNumbers
                filteredCount={filteredCount}
                totalCount={totalCount}
              />
            </TitleSymbols>
          </TitleContainer>
        )}
        <FieldsContainer>
          {!data?.gartens && <Spinner />}
          {!!width && data?.gartens && (
            <FixedSizeList
              height={height - 48}
              itemCount={gartens.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={gartens[index]}
                  last={index === gartens.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Gaerten))
