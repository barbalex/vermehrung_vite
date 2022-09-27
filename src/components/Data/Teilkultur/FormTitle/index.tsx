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

const TeilkulturFormTitleChooser = ({
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
      table: 'teilkultur',
    })

    const [totalCount, filteredCount] = await Promise.all([
      conditionAdder(
        collectionFromTable({
          table: 'teilkultur',
          where: addTotalCriteriaToWhere({ store, table: 'teilkultur' }),
        }),
      ).count(),
      filteredObjectsFromTable({ store, table: 'teilkultur', count: true }),
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
