import React, { useContext, useCallback, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { FixedSizeList } from 'react-window'
import { withResizeDetector } from 'react-resize-detector'
import { Q } from '@nozbe/watermelondb'
import { combineLatest } from 'rxjs'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import Row from './Row'
import ErrorBoundary from '../../shared/ErrorBoundary'
import FilterNumbers from '../../shared/FilterNumbers'
import exists from '../../../utils/exists'
import { ReactComponent as UpSvg } from '../../../svg/to_up.inline.svg'
import tableFilter from '../../../utils/tableFilter'
import lieferungSort from '../../../utils/lieferungSort'
import constants from '../../../utils/constants'
import { dexie, Lieferung } from '../../../dexieClient'
import filteredObjectsFromTable from '../../../utils/filteredObjectsFromTable'
import totalFilter from '../../../utils/totalFilter'

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
    db,
    insertLieferungRev,
    kulturIdInActiveNodeArray,
    personIdInActiveNodeArray,
    sammelLieferungIdInActiveNodeArray,
    sammlungIdInActiveNodeArray,
    filter,
  } = store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree
  const { lieferung: lieferungFilter } = store.filter

  let conditionAdder
  if (kulturIdInActiveNodeArray) {
    // this should get kulturen connected by von_kultur_id or nach_kultur_id
    // depending on activeNodeArray[last] being 'An-Lieferung' or 'Aus-Lieferung'
    let kulturOnField = 'von_kultur_id'
    if (kulturIdInActiveNodeArray) {
      const lastAnAElement = activeNodeArray[activeNodeArray.length - 1]
      if (lastAnAElement === 'An-Lieferungen') kulturOnField = 'nach_kultur_id'
    }
    conditionAdder = async (collection) =>
      collection.and(kulturOnField).equals(kulturIdInActiveNodeArray)
  }
  if (sammelLieferungIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection
        .and('sammel_lieferung_id')
        .equals(sammelLieferungIdInActiveNodeArray)
  }
  if (personIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('person_id').equals(personIdInActiveNodeArray)
  }
  if (sammlungIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('von_sammlung_id').equals(sammlungIdInActiveNodeArray)
  }

  const data = useLiveQuery(async () => {
    const [lieferungs, totalCount] = await Promise.all([
      filteredObjectsFromTable({ store, table: 'lieferung' }),
      dexie.lieferungs
        .filter((value) =>
          totalFilter({ value, store, table: 'lieferung', conditionAdder }),
        )
        .count(),
    ])

    const lieferungsSorted = lieferungs.sort(lieferungSort)

    return { lieferungs: lieferungsSorted, totalCount }
  }, [store.filter.lieferung, store.lieferung_initially_queried])

  const lieferungs: Kultur[] = data?.lieferungs ?? []
  const totalCount = data?.totalCount
  const filteredCount = lieferungs.length

  const add = useCallback(async () => {
    const isSammelLieferung =
      activeNodeArray.length >= 2 && activeNodeArray[1] === 'Sammel-Lieferungen'
    if (isSammelLieferung) {
      const slId = activeNodeArray[2]
      let sl
      try {
        sl = await db.get('sammel_lieferung').find(slId)
      } catch {}
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
  }, [activeNodeArray, db, insertLieferungRev])

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
          {!!width && (
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
