import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import totalFilter from '../../../../utils/totalFilter'
import filteredObjectsFromTable from '../../../../utils/filteredObjectsFromTable'
import { dexie } from '../../../../dexieClient'

const ArtFormTitleChooser = ({
  row,
  rawRow,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const data = useLiveQuery(async () => {
    const [totalCount, filteredCount] = await Promise.all([
      await dexie.arts
        .filter((value) => totalFilter({ value, store, table: 'art' }))
        .count(),
      filteredObjectsFromTable({ store, table: 'art', count: true }),
    ])
    return { totalCount, filteredCount }
  }, [store.filter.art, store.art_initially_queried])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

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
