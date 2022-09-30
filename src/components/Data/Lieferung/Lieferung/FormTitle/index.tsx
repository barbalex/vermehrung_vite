import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import FilterTitle from '../../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import collectionFromTable from '../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../utils/addTotalCriteriaToWhere'
import hierarchyWhereAndFilterForTable from '../../../../../utils/hierarchyWhereAndFilterForTable'
import filteredCollectionFromTable from '../../../../../utils/filteredCollectionFromTable'

const LieferungTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const {
    kulturIdInActiveNodeArray,
    sammelLieferungIdInActiveNodeArray,
    personIdInActiveNodeArray,
    sammlungIdInActiveNodeArray,
  } = store

  const data = useLiveQuery(async () => {
    const hierarchyWhereAndFilter = await hierarchyWhereAndFilterForTable({
      store,
      table: 'lieferung',
    })
    const { filter = () => true, where = {} } = hierarchyWhereAndFilter

    const [totalCount, filteredCount] = await Promise.all([
      collectionFromTable({
        table: 'lieferung',
        where: addTotalCriteriaToWhere({ store, table: 'lieferung', where }),
        filter,
      }).count(),
      filteredCollectionFromTable({
        store,
        table: 'lieferung',
        hierarchyWhereAndFilter,
      }).count(),
    ])

    return { totalCount, filteredCount }
  }, [
    Object.values(store.filter.lieferung),
    store.lieferung_initially_queried,
    kulturIdInActiveNodeArray,
    sammelLieferungIdInActiveNodeArray,
    personIdInActiveNodeArray,
    sammlungIdInActiveNodeArray,
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Lieferung"
        table="lieferung"
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

export default observer(LieferungTitleChooser)
