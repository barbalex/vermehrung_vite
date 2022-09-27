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
import exists from '../../../utils/exists'
import { ReactComponent as UpSvg } from '../../../svg/to_up.inline.svg'
import lieferungSort from '../../../utils/lieferungSort'
import constants from '../../../utils/constants'
import { dexie, Lieferung } from '../../../dexieClient'
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

const Lieferungen = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const {
    insertLieferungRev,
    sammlungIdInActiveNodeArray,
    personIdInActiveNodeArray,
    sammelLieferungIdInActiveNodeArray,
    kulturIdInActiveNodeArray,
  } = store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree

  const data = useLiveQuery(async () => {
    const conditionAdder = await hierarchyConditionAdderForTable({
      store,
      table: 'lieferung',
    })
    const [lieferungs, totalCount] = await Promise.all([
      filteredObjectsFromTable({
        store,
        table: 'lieferung',
      }),
      conditionAdder(
        collectionFromTable({
          table: 'lieferung',
          where: addTotalCriteriaToWhere({ store, table: 'lieferung' }),
        }),
      ).count(),
    ])

    const lieferungsSorted = lieferungs.sort(lieferungSort)

    return { lieferungs: lieferungsSorted, totalCount }
  }, [
    store.filter.lieferung,
    ...Object.values(store.filter.lieferung),
    store.lieferung_initially_queried,
    sammlungIdInActiveNodeArray,
    personIdInActiveNodeArray,
    sammelLieferungIdInActiveNodeArray,
    kulturIdInActiveNodeArray,
  ])

  const lieferungs: Lieferung[] = data?.lieferungs ?? []
  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.lieferungs?.length ?? '...'

  const add = useCallback(async () => {
    const isSammelLieferung =
      activeNodeArray.length >= 2 && activeNodeArray[1] === 'Sammel-Lieferungen'
    if (isSammelLieferung) {
      const slId = activeNodeArray[2]
      const sl = await dexie.sammel_lieferungs.get(
        slId ?? '99999999-9999-9999-9999-999999999999',
      )
      const additionalValuesToSet = {}

      const entries = Object.entries(sl)
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([key, value]) =>
            !key.startsWith('_') &&
            ![
              'lieferungs',
              'kulturByNachKulturId',
              'kulturByVonKulturId',
              'person',
              'sammlung',
            ].includes(key),
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([key, value]) => exists(value))
      for (const [key, value] of entries) {
        const keyToUse = key === 'id' ? 'sammel_lieferung_id' : key
        additionalValuesToSet[keyToUse] = value
      }
      additionalValuesToSet.sammel_lieferung_id = slId
      return insertLieferungRev({
        values: additionalValuesToSet,
      })
    }
    insertLieferungRev()
  }, [activeNodeArray, insertLieferungRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[1] === 'Lieferungen') {
    upTitle = 'Zu allen Listen'
  }
  if (activeNodeArray[activeNodeArray.length - 3] === 'Kulturen') {
    upTitle = 'Zur Kultur'
  }
  if (activeNodeArray[activeNodeArray.length - 3] === 'Sammlungen') {
    upTitle = 'Zur Sammlung'
  }
  if (activeNodeArray[activeNodeArray.length - 3] === 'Sammel-Lieferungen') {
    upTitle = 'Zur Sammel-Lieferung'
  }

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Lieferung"
            table="lieferung"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Lieferungen</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              <IconButton
                aria-label="neue Lieferung"
                title="neue Lieferung"
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
          {!data?.lieferungs && <Spinner />}
          {!!width && data?.lieferungs && (
            <FixedSizeList
              height={height - constants.titleRowHeight}
              itemCount={lieferungs.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={lieferungs[index]}
                  last={index === lieferungs.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Lieferungen))
