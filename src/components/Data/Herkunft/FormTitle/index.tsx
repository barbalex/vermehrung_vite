import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'
import hierarchyFilterForTable from '../../../../utils/hierarchyFilterForTable'

const HerkunftFormTitleChooser = ({
  row,
  rawRow,
  showFilter,
  showHistory,
  setShowHistory,
  activeConflict,
}) => {
  const store = useContext(StoreContext)
  const { sammlungIdInActiveNodeArray, artIdInActiveNodeArray } = store

  const totalCount = useLiveQuery(async () => {
    const conditionAdder = await hierarchyFilterForTable({
      store,
      table: 'herkunft',
    })

    return await dexie.herkunfts
      .filter((value) =>
        totalFilter({ value, store, table: 'herkunft', conditionAdder }),
      )
      .count()
  }, [
    store.filter.herkunft,
    store.herkunft_initially_queried,
    sammlungIdInActiveNodeArray,
    artIdInActiveNodeArray,
  ])

  const filteredCount = store.herkunftsFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Herkunft"
        table="herkunft"
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
      activeConflict={activeConflict}
    />
  )
}

export default observer(HerkunftFormTitleChooser)
