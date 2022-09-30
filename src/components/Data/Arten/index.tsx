import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { FixedSizeList } from 'react-window'
import { withResizeDetector } from 'react-resize-detector'
import { ReactComponent as UpSvg } from '../../../svg/to_up.inline.svg'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import Row from './Row'
import ErrorBoundary from '../../shared/ErrorBoundary'
import FilterNumbers from '../../shared/FilterNumbers'
import artsSortedFromArts from '../../../utils/artsSortedFromArts'
import constants from '../../../utils/constants'
import { Art } from '../../../dexieClient'
import filteredCollectionFromTable from '../../../utils/filteredCollectionFromTable'
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

const Arten = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const { insertArtRev } = store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree

  const data = useLiveQuery(async () => {
    const [arts, totalCount] = await Promise.all([
      filteredCollectionFromTable({ store, table: 'art' }).toArray(),
      collectionFromTable({
        store,
        table: 'art',
        where: addTotalCriteriaToWhere({ store, table: 'art' }),
      }).count(),
    ])

    const artsSorted = await artsSortedFromArts(arts)

    return { arts: artsSorted, totalCount }
  }, [
    store.filter.art,
    ...Object.values(store.filter.art),
    store.art_initially_queried,
  ])

  const arts: Art[] = data?.arts ?? []
  const totalCount = data?.totalCount
  const filteredCount = arts.length

  const add = useCallback(() => {
    insertArtRev()
  }, [insertArtRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[1] === 'Arten') {
    upTitle = 'Zu allen Listen'
  }

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Art"
            table="art"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Arten</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              <IconButton
                aria-label="neue Art"
                title="neue Art"
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
          {!data?.arts && <Spinner />}
          {!!width && data?.arts && (
            <FixedSizeList
              height={height - 48}
              itemCount={arts.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={arts[index]}
                  last={index === arts.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Arten))
