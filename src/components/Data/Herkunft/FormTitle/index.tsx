import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import hierarchyWhereAndFilterForTable from '../../../../utils/hierarchyWhereAndFilterForTable'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import filteredObjectsFromTable from '../../../../utils/filteredObjectsFromTable'

const HerkunftFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
  activeConflict,
}) => {
  const store = useContext(StoreContext)
  const { sammlungIdInActiveNodeArray, artIdInActiveNodeArray } = store

  const data = useLiveQuery(async () => {
    const { filter = () => true, where = {} } =
      await hierarchyWhereAndFilterForTable({ store, table: 'herkunft' })

    const [totalCount, filteredCount] = await Promise.all([
      collectionFromTable({
        table: 'herkunft',
        where: addTotalCriteriaToWhere({ store, table: 'herkunft', where }),
        filter,
      }).count(),
      filteredObjectsFromTable({ store, table: 'herkunft' }).count(),
    ])

    return { totalCount, filteredCount }
  }, [
    store.filter.herkunft,
    Object.values(store.filter.herkunft),
    store.herkunft_initially_queried,
    sammlungIdInActiveNodeArray,
    artIdInActiveNodeArray,
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

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
      totalCount={totalCount}
      filteredCount={filteredCount}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
      activeConflict={activeConflict}
    />
  )
}

export default observer(HerkunftFormTitleChooser)
