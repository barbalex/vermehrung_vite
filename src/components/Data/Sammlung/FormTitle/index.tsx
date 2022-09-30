import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import hierarchyWhereAndFilterForTable from '../../../../utils/hierarchyWhereAndFilterForTable'
import filteredCollectionFromTable from '../../../../utils/filteredCollectionFromTable'

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
    const hierarchyWhereAndFilter = await hierarchyWhereAndFilterForTable({
      store,
      table: 'sammlung',
    })
    const { filter = () => true, where = {} } = hierarchyWhereAndFilter

    const [totalCount, filteredCount] = await Promise.all([
      collectionFromTable({
        table: 'sammlung',
        where: addTotalCriteriaToWhere({ store, table: 'sammlung', where }),
        filter,
      }).count(),
      filteredCollectionFromTable({
        store,
        table: 'sammlung',
        hierarchyWhereAndFilter,
      }).count(),
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
