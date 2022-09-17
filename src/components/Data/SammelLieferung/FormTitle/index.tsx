import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const SammelLieferungFormTitleChooser = ({
  lieferung,
  printPreview,
  row,
  setPrintPreview,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const { filter } = store

  const totalCount = useLiveQuery(
    async () =>
      await dexie.sammel_lieferungs
        .filter((value) =>
          totalFilter({ value, store, table: 'sammel_lieferung' }),
        )
        .count(),
    [
      store.filter.sammel_lieferung,
      // need to rerender if any of the values of lieferungFilter changes
      ...Object.values(store.filter.sammel_lieferung),
      store.sammel_lieferung_initially_queried,
    ],
  )

  const filteredCount = store.sammelLieferungsFilteredCount ?? '...'

  if (!row || (!showFilter && filter.show)) return null

  if (showFilter) {
    return (
      <FilterTitle
        title="Sammel-Lieferung"
        table="sammel_lieferung"
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
      showFilter={showFilter}
      lieferung={lieferung}
      printPreview={printPreview}
      setPrintPreview={setPrintPreview}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
    />
  )
}

export default observer(SammelLieferungFormTitleChooser)
