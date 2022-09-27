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

  const data = useLiveQuery(async () => {
    const conditionAdder = await hierarchyConditionAdderForTable({
      store,
      table: 'sammlung',
    })

    const [totalCount, filteredCount] = await Promise.all([
      conditionAdder(
        collectionFromTable({
          table: 'sammlung',
          where: addTotalCriteriaToWhere({ store, table: 'sammlung' }),
        }),
      ).count(),
      filteredObjectsFromTable({ store, table: 'sammlung', count: true }),
    ])

    return { totalCount, filteredCount }
  }, [
    Object.values(store.filter.sammlung),
    store,
    artIdInActiveNodeArray,
    herkunftIdInActiveNodeArray,
    personIdInActiveNodeArray,
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

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
