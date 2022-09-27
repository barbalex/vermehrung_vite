import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import filteredObjectsFromTable from '../../../../utils/filteredObjectsFromTable'

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

  const data = useLiveQuery(async () => {
    const [totalCount, filteredCount] = await Promise.all([
      collectionFromTable({
        table: 'sammel_lieferung',
        where: addTotalCriteriaToWhere({ store, table: 'sammel_lieferung' }),
      }).count(),
      filteredObjectsFromTable({
        store,
        table: 'sammel_lieferung',
        count: true,
      }),
    ])

    return { totalCount, filteredCount }
  }, [
    // need to rerender if any of the values of lieferungFilter changes
    ...Object.values(store.filter.sammel_lieferung),
    store.sammel_lieferung_initially_queried,
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

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
