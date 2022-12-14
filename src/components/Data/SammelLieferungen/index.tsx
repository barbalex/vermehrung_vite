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
import lieferungSort from '../../../utils/lieferungSort'
import constants from '../../../utils/constants'
import { SammelLieferung } from '../../../dexieClient'
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

const SammelLieferungen = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const { insertSammelLieferungRev } = store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree

  const data = useLiveQuery(async () => {
    const [sammelLieferungs, totalCount] = await Promise.all([
      filteredCollectionFromTable({
        store,
        table: 'sammel_lieferung',
      }).toArray(),
      collectionFromTable({
        table: 'sammel_lieferung',
        where: addTotalCriteriaToWhere({ store, table: 'sammel_lieferung' }),
      }).count(),
    ])

    const sammelLieferungsSorted = sammelLieferungs.sort(lieferungSort)

    return { sammelLieferungs: sammelLieferungsSorted, totalCount }
  }, [
    store.filter.sammel_lieferung,
    ...Object.values(store.filter.sammel_lieferung),
    store.sammel_lieferung_initially_queried,
  ])

  const sammelLieferungs: SammelLieferung[] = data?.sammelLieferungs ?? []
  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.sammelLieferungs?.length ?? '...'

  const add = useCallback(() => {
    insertSammelLieferungRev()
  }, [insertSammelLieferungRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene h??her'
  if (activeNodeArray[1] === 'Sammel-Lieferungen') {
    upTitle = 'Zu allen Listen'
  }

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Sammel-Lieferung"
            table="sammel_lieferung"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Sammel-Lieferungen</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              <IconButton
                aria-label="neue Sammel-Lieferung"
                title="neue Sammel-Lieferung"
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
          {!data?.sammelLieferungs && <Spinner />}
          {!!width && data?.sammelLieferungs && (
            <FixedSizeList
              height={height - constants.titleRowHeight}
              itemCount={sammelLieferungs.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={sammelLieferungs[index]}
                  last={index === sammelLieferungs.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(SammelLieferungen))
