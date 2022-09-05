import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import totalFilter from '../../../../utils/totalFilter'
import { dexie } from '../../../../dexieClient'

const ArtFormTitleChooser = ({
  row,
  rawRow,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const totalCount = useLiveQuery(
    async () =>
      await dexie.arts
        .filter((value) => totalFilter({ value, store, table: 'art' }))
        .count(),
    [store.filter.art, store.art_initially_queried],
  )

  const filteredCount = store.artsFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Art"
        table="art"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return (
    <FormTitle
      row={row}
      rawRow={rawRow}
      totalCount={totalCount}
      filteredCount={filteredCount}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
    />
  )
}

export default observer(ArtFormTitleChooser)
