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

const TeilkulturFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { kulturIdInActiveNodeArray } = store

  const data = useLiveQuery(async () => {
    const { filter = () => true, where = {} } =
      await hierarchyWhereAndFilterForTable({ store, table: 'teilkultur' })

    const [totalCount, filteredCount] = await Promise.all([
      collectionFromTable({
        table: 'teilkultur',
        where: addTotalCriteriaToWhere({ store, table: 'teilkultur', where }),
        filter,
      }).count(),
      filteredObjectsFromTable({ store, table: 'teilkultur' }).count(),
    ])

    return { totalCount, filteredCount }
  }, [
    kulturIdInActiveNodeArray,
    // need to rerender if any of the values of sammlungFilter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(store.filter.teilkultur),
    store,
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

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
