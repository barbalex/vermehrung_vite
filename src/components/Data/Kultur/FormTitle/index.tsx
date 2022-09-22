import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const KulturFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { artIdInActiveNodeArray, gartenIdInActiveNodeArray } = store

  let conditionAdder
  if (gartenIdInActiveNodeArray) {
    conditionAdder = (collection) =>
      collection.and('garten_id').equals(gartenIdInActiveNodeArray)
  }
  if (artIdInActiveNodeArray) {
    conditionAdder = (collection) =>
      collection.and('art_id').equals(artIdInActiveNodeArray)
  }

  const totalCount = useLiveQuery(
    async () =>
      await dexie.kulturs
        .filter((value) =>
          totalFilter({ value, store, table: 'kultur', conditionAdder }),
        )
        .count(),
    [store.filter.kultur, store.kultur_initially_queried],
  )

  const filteredCount = store.kultursFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Kultur"
        table="kultur"
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

export default observer(KulturFormTitleChooser)
