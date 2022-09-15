import React, { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Q } from '@nozbe/watermelondb'
import { combineLatest } from 'rxjs'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import FilterTitle from '../../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import tableFilter from '../../../../../utils/tableFilter'
import { dexie } from '../../../../../dexieClient'
import totalFilter from '../../../../../utils/totalFilter'

const LieferungTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const {
    kulturIdInActiveNodeArray,
    personIdInActiveNodeArray,
    sammelLieferungIdInActiveNodeArray,
    sammlungIdInActiveNodeArray,
    db,
    filter,
  } = store
  const { activeNodeArray } = store.tree

  let conditionAdder
  if (
    kulturIdInActiveNodeArray &&
    activeNodeArray.includes('Aus-Lieferungen')
  ) {
    conditionAdder = async (collection) =>
      collection.and('von_kultur_id').equals(kulturIdInActiveNodeArray)
  }
  if (kulturIdInActiveNodeArray && activeNodeArray.includes('An-Lieferungen')) {
    conditionAdder = async (collection) =>
      collection.and('nach_kultur_id').equals(kulturIdInActiveNodeArray)
  }
  if (sammelLieferungIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection
        .and('sammel_lieferung_id')
        .equals(sammelLieferungIdInActiveNodeArray)
  }
  if (personIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('person_id').equals(personIdInActiveNodeArray)
  }

  const totalCount = useLiveQuery(
    async () =>
      await dexie.gartens
        .filter((value) =>
          totalFilter({ value, store, table: 'garten', conditionAdder }),
        )
        .count(),
    [store.filter.garten, store.garten_initially_queried],
  )

  const filteredCount = store.gartensFilteredCount ?? '...'

  const [countState, setCountState] = useState({
    totalCount: 0,
    filteredCount: 0,
  })
  useEffect(() => {
    const hierarchyQuery =
      sammlungIdInActiveNodeArray && !kulturIdInActiveNodeArray
        ? [
            Q.experimentalJoinTables(['sammlung']),
            Q.on('sammlung', 'id', sammlungIdInActiveNodeArray),
          ]
        : []
    const collection = db.get('lieferung')
    const totalCountObservable = collection
      .query(
        Q.where(
          '_deleted',
          Q.oneOf(
            filter.lieferung._deleted === false
              ? [false]
              : filter.lieferung._deleted === true
              ? [true]
              : [true, false, null],
          ),
        ),
        ...hierarchyQuery,
      )
      .observeCount()
    const filteredCountObservable = collection
      .query(...tableFilter({ store, table: 'lieferung' }), ...hierarchyQuery)
      .observeCount()
    const combinedObservables = combineLatest([
      totalCountObservable,
      filteredCountObservable,
    ])
    const subscription = combinedObservables.subscribe(
      ([totalCount, filteredCount]) =>
        setCountState({ totalCount, filteredCount }),
    )

    return () => subscription?.unsubscribe?.()
  }, [
    db,
    kulturIdInActiveNodeArray,
    sammelLieferungIdInActiveNodeArray,
    personIdInActiveNodeArray,
    sammlungIdInActiveNodeArray,
    // need to rerender if any of the values of lieferungFilter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(store.filter.lieferung),
    store,
    activeNodeArray,
    filter.lieferung._deleted,
  ])

  const { totalCount, filteredCount } = countState

  /*const hierarchyFilter = (e) => {
    if (kulturIdInActiveNodeArray) {
      if (activeNodeArray.includes('Aus-Lieferungen')) {
        return e.von_kultur_id === kulturIdInActiveNodeArray
      }
      if (activeNodeArray.includes('An-Lieferungen')) {
        return e.nach_kultur_id === kulturIdInActiveNodeArray
      }
    }
    if (sammelLieferungIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
      return e.sammel_lieferung_id === sammelLieferungIdInActiveNodeArray
    }
    if (personIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
      return e.person_id === personIdInActiveNodeArray
    }
    if (sammlungIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
      return e.von_sammlung_id === sammlungIdInActiveNodeArray
    }
    return true
  }*/

  if (showFilter) {
    return (
      <FilterTitle
        title="Lieferung"
        table="lieferung"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return (
    <FormTitle
      row={row}
      totalCount={totalCount}
      filteredCount={filteredCount}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
    />
  )
}

export default observer(LieferungTitleChooser)
