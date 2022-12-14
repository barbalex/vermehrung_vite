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
import zaehlungSort from '../../../utils/zaehlungSort'
import constants from '../../../utils/constants'
import { Zaehlung } from '../../../dexieClient'
import filteredCollectionFromTable from '../../../utils/filteredCollectionFromTable'
import Spinner from '../../shared/Spinner'
import collectionFromTable from '../../../utils/collectionFromTable'
import hierarchyWhereAndFilterForTable from '../../../utils/hierarchyWhereAndFilterForTable'
import addTotalCriteriaToWhere from '../../../utils/addTotalCriteriaToWhere'

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

const Zaehlungen = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const { insertZaehlungRev, kulturIdInActiveNodeArray } = store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree

  const data = useLiveQuery(async () => {
    const { where, filter } = await hierarchyWhereAndFilterForTable({
      store,
      table: 'zaehlung',
    })

    const [zaehlungs, totalCount] = await Promise.all([
      filteredCollectionFromTable({
        store,
        table: 'zaehlung',
        where,
        filter,
      }).toArray(),
      collectionFromTable({
        table: 'zaehlung',
        where: addTotalCriteriaToWhere({ store, table: 'zaehlung', where }),
        filter,
      }).count(),
    ])

    const zaehlungsSorted = zaehlungs.sort(zaehlungSort)

    return { zaehlungs: zaehlungsSorted, totalCount }
  }, [
    store.filter.zaehlung,
    ...Object.values(store.filter.zaehlung),
    store.zaehlung_initially_queried,
    kulturIdInActiveNodeArray,
  ])

  const zaehlungs: Zaehlung[] = data?.zaehlungs ?? []
  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.zaehlungs?.length ?? '...'

  const add = useCallback(() => {
    insertZaehlungRev()
  }, [insertZaehlungRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene h??her'
  if (activeNodeArray[1] === 'Zaehlungen') {
    upTitle = 'Zu allen Listen'
  }
  if (activeNodeArray[activeNodeArray.length - 3] === 'Kulturen') {
    upTitle = 'Zur Kultur'
  }

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Z??hlung"
            table="zaehlung"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Z??hlungen</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              <IconButton
                aria-label="neue Z??hlung"
                title="neue Z??hlung"
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
          {!data?.zaehlungs && <Spinner />}
          {!!width && data?.zaehlungs && (
            <FixedSizeList
              height={height - constants.titleRowHeight}
              itemCount={zaehlungs.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={zaehlungs[index]}
                  last={index === zaehlungs.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Zaehlungen))
