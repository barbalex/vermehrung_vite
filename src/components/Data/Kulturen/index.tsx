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
import kultursSortedFromKulturs from '../../../utils/kultursSortedFromKulturs'
import constants from '../../../utils/constants'
import { Kultur } from '../../../dexieClient'
import filteredObjectsFromTable from '../../../utils/filteredObjectsFromTable'
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

const Kulturen = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const { artIdInActiveNodeArray, gartenIdInActiveNodeArray, insertKulturRev } =
    store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree

  const data = useLiveQuery(async () => {
    const { filter = () => true, where = {} } =
      await hierarchyWhereAndFilterForTable({ store, table: 'kultur' })
    const [kulturs, totalCount] = await Promise.all([
      filteredObjectsFromTable({ store, table: 'kultur' }).toArray(),
      collectionFromTable({
        table: 'kultur',
        where: addTotalCriteriaToWhere({ store, table: 'kultur', where }),
        filter,
      }).count(),
    ])

    const kultursSorted = await kultursSortedFromKulturs(kulturs)

    return { kulturs: kultursSorted, totalCount }
  }, [
    store.filter.kultur,
    ...Object.values(store.filter.kultur),
    store.kultur_initially_queried,
    artIdInActiveNodeArray,
    gartenIdInActiveNodeArray,
  ])

  const kulturs: Kultur[] = data?.kulturs ?? []
  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.kulturs?.length ?? '...'

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[1] === 'Kulturen') {
    upTitle = 'Zu allen Listen'
  }
  if (activeNodeArray[activeNodeArray.length - 3] === 'Arten') {
    upTitle = 'Zur Art'
  }
  if (activeNodeArray[activeNodeArray.length - 3] === 'Gaerten') {
    upTitle = 'Zum Garten'
  }

  const add = useCallback(() => {
    insertKulturRev()
  }, [insertKulturRev])

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Kultur"
            table="kultur"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Kulturen</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              <IconButton
                aria-label="neue Kultur"
                title="neue Kultur"
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
          {!data?.kulturs && <Spinner />}
          {!!width && data?.kulturs && (
            <FixedSizeList
              height={height - constants.titleRowHeight}
              itemCount={kulturs.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={kulturs[index]}
                  last={index === kulturs.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Kulturen))
