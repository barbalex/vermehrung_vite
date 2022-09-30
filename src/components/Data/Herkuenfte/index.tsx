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
import herkunftSort from '../../../utils/herkunftSort'
import constants from '../../../utils/constants'
import { Herkunft } from '../../../dexieClient'
import filteredCollectionFromTable from '../../../utils/filteredCollectionFromTable'
import hierarchyWhereAndFilterForTable from '../../../utils/hierarchyWhereAndFilterForTable'
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

const Herkuenfte = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const {
    insertHerkunftRev,
    artIdInActiveNodeArray,
    sammlungIdInActiveNodeArray,
  } = store
  const {
    activeNodeArray: anaRaw,
    setActiveNodeArray,
    removeOpenNode,
  } = store.tree
  const activeNodeArray = anaRaw.toJSON()

  const data = useLiveQuery(async () => {
    const { filter = () => true, where = {} } =
      await hierarchyWhereAndFilterForTable({ store, table: 'herkunft' })
    const [herkunfts, totalCount] = await Promise.all([
      filteredCollectionFromTable({
        store,
        table: 'herkunft',
      }).toArray(),
      collectionFromTable({
        table: 'herkunft',
        where: addTotalCriteriaToWhere({ store, table: 'herkunft', where }),
        filter,
      }).count(),
    ])

    const herkunftsSorted = herkunfts.sort(herkunftSort)

    return { herkunfts: herkunftsSorted, totalCount }
  }, [
    store.filter.herkunft,
    ...Object.values(store.filter.herkunft),
    store.herkunft_initially_queried,
    sammlungIdInActiveNodeArray,
    artIdInActiveNodeArray,
  ])

  const herkunfts: Herkunft[] = data?.herkunfts ?? []
  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.herkunfts?.length ?? '...'

  const add = useCallback(() => insertHerkunftRev(), [insertHerkunftRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[1] === 'Herkuenfte') {
    upTitle = 'Zu allen Listen'
  }

  // herkuenfte is top node
  // never enable adding below that
  const showPlus = activeNodeArray.length < 2

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Herkunft"
            table="herkunft"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Herkünfte</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              {showPlus && (
                <IconButton
                  aria-label="neue Herkunft"
                  title="neue Herkunft"
                  onClick={add}
                  size="large"
                >
                  <FaPlus />
                </IconButton>
              )}
              <FilterNumbers
                filteredCount={filteredCount}
                totalCount={totalCount}
              />
            </TitleSymbols>
          </TitleContainer>
        )}
        <FieldsContainer>
          {!data?.herkunfts && <Spinner />}
          {!!width && data?.herkunfts && (
            <FixedSizeList
              height={height - constants.titleRowHeight}
              itemCount={herkunfts.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={herkunfts[index]}
                  last={index === herkunfts.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Herkuenfte))
