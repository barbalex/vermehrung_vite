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
    conditionAdder = (c) => c.von_kultur_id === kulturIdInActiveNodeArray
  }
  if (kulturIdInActiveNodeArray && activeNodeArray.includes('An-Lieferungen')) {
    conditionAdder = (c) => c.nach_kultur_id === kulturIdInActiveNodeArray
  }
  if (sammelLieferungIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
    conditionAdder = (c) =>
      c.sammel_lieferung_id === sammelLieferungIdInActiveNodeArray
  }
  if (personIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
    conditionAdder = (c) => c.person_id === personIdInActiveNodeArray
  }
  if (sammlungIdInActiveNodeArray && !kulturIdInActiveNodeArray) {
    conditionAdder = (c) => c.von_sammlung_id === sammlungIdInActiveNodeArray
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
