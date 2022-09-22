import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'
import hierarchyFilterForTable from '../../../../utils/hierarchyFilterForTable'

const TeilkulturFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { kulturIdInActiveNodeArray } = store

  const totalCount = useLiveQuery(async () => {
    const conditionAdder = await hierarchyFilterForTable({
      store,
      table: 'teilkultur',
    })

    return await dexie.teilkulturs
      .filter((value) =>
        totalFilter({ value, store, table: 'teilkultur', conditionAdder }),
      )
      .count()
  }, [
    kulturIdInActiveNodeArray,
    // need to rerender if any of the values of sammlungFilter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(store.filter.teilkultur),
    store,
  ])

  const filteredCount = store.teilkultursFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Teilkultur"
        table="teilkultur"
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

export default observer(TeilkulturFormTitleChooser)
