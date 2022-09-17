import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const ZaehlungFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { kulturIdInActiveNodeArray } = store

  let conditionAdder
  if (kulturIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('kultur_id').equals(kulturIdInActiveNodeArray)
  }

  const totalCount = useLiveQuery(
    async () =>
      await dexie.zaehlungs
        .filter((value) =>
          totalFilter({ value, store, table: 'zaehlung', conditionAdder }),
        )
        .count(),
    [
      kulturIdInActiveNodeArray,
      // need to rerender if any of the values of sammlungFilter changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...Object.values(store.filter.zaehlung),
      store,
    ],
  )

  const filteredCount = store.zaehlungsFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Zählung"
        table="zaehlung"
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

export default observer(ZaehlungFormTitleChooser)
