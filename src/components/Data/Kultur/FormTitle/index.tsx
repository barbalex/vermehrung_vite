import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import hierarchyWhereAndFilterForTable from '../../../../utils/hierarchyWhereAndFilterForTable'
import filteredObjectsFromTable from '../../../../utils/filteredObjectsFromTable'

const KulturFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { artIdInActiveNodeArray, gartenIdInActiveNodeArray } = store

  const data = useLiveQuery(async () => {
    const { filter = () => true, where = {} } =
      await hierarchyWhereAndFilterForTable({ store, table: 'kultur' })

    const [totalCount, filteredCount] = await Promise.all([
      collectionFromTable({
        table: 'kultur',
        where: addTotalCriteriaToWhere({ store, table: 'kultur', where }),
        filter,
      }).count(),
      filteredObjectsFromTable({ store, table: 'kultur', count: true }),
    ])

    return { totalCount, filteredCount }
  }, [
    store.filter.kultur,
    Object.values(store.filter.kultur),
    store.kultur_initially_queried,
    artIdInActiveNodeArray,
    gartenIdInActiveNodeArray,
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Kultur"
        table="kultur"
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

export default observer(KulturFormTitleChooser)
