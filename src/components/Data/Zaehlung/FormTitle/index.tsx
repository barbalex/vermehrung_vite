import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import hierarchyConditionAdderForTable from '../../../../utils/hierarchyConditionAdderForTable'
import filteredObjectsFromTable from '../../../../utils/filteredObjectsFromTable'

const ZaehlungFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { kulturIdInActiveNodeArray } = store

  const data = useLiveQuery(async () => {
    const conditionAdder = await hierarchyConditionAdderForTable({
      store,
      table: 'zaehlung',
    })

    const [totalCount, filteredCount] = await Promise.all([
      conditionAdder(
        collectionFromTable({
          table: 'zaehlung',
          where: addTotalCriteriaToWhere({ store, table: 'zaehlung' }),
        }),
      ).count(),
      filteredObjectsFromTable({ store, table: 'zaehlung', count: true }),
    ])

    return { totalCount, filteredCount }
  }, [
    kulturIdInActiveNodeArray,
    store,
    Object.values(store.filter.zaehlung),
    store.zaehlung_initially_queried,
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

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
