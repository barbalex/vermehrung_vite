import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const GartenFormTitle = ({
  showFilter,
  row,
  rawRow,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { personIdInActiveNodeArray } = store

  let conditionAdder
  if (personIdInActiveNodeArray) {
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

  if (showFilter) {
    return (
      <FilterTitle
        title="Garten"
        table="garten"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return (
    <FormTitle
      row={row}
      rawRow={rawRow}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
      totalCount={totalCount}
      filteredCount={filteredCount}
    />
  )
}

export default observer(GartenFormTitle)
