import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'
import hierarchyFilterForTable from '../../../../utils/hierarchyFilterForTable'

const SammlungFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const {
    artIdInActiveNodeArray,
    herkunftIdInActiveNodeArray,
    personIdInActiveNodeArray,
  } = store

  const totalCount = useLiveQuery(async () => {
    const conditionAdder = await hierarchyFilterForTable({
      store,
      table: 'sammlung',
    })

    return await dexie.sammlungs
      .filter((value) =>
        totalFilter({
          value,
          store,
          table: 'sammlung',
          conditionAdder,
        }),
      )
      .count()
  }, [
    store,
    artIdInActiveNodeArray,
    herkunftIdInActiveNodeArray,
    personIdInActiveNodeArray,
  ])

  const filteredCount = store.sammlungsFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Sammlung"
        table="sammlung"
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

export default observer(SammlungFormTitleChooser)
