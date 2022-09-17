import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import FilterTitle from '../../../../shared/FilterTitle'
import FormTitle from './FormTitle'
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
  if (sammlungIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('von_sammlung_id').equals(sammlungIdInActiveNodeArray)
  }

  const totalCount = useLiveQuery(
    async () =>
      await dexie.lieferungs
        .filter((value) =>
          totalFilter({ value, store, table: 'lieferung', conditionAdder }),
        )
        .count(),
    [
      store.filter.lieferung,
      // need to rerender if any of the values of lieferungFilter changes
      ...Object.values(store.filter.lieferung),
      store.lieferung_initially_queried,
      conditionAdder,
    ],
  )

  const filteredCount = store.lieferungsFilteredCount ?? '...'

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
