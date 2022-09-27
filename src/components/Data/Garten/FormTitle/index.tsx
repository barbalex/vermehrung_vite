import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import hierarchyConditionAdderForTable from '../../../../utils/hierarchyConditionAdderForTable'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import filteredObjectsFromTable from '../../../../utils/filteredObjectsFromTable'

const GartenFormTitle = ({ showFilter, row, showHistory, setShowHistory }) => {
  const store = useContext(StoreContext)
  const { personIdInActiveNodeArray } = store

  const data = useLiveQuery(async () => {
    const conditionAdder = await hierarchyConditionAdderForTable({
      store,
      table: 'garten',
    })

    const [totalCount, filteredCount] = await Promise.all([
      conditionAdder(
        collectionFromTable({
          table: 'garten',
          where: addTotalCriteriaToWhere({ store, table: 'garten' }),
        }),
      ).count(),
      filteredObjectsFromTable({ store, table: 'garten', count: true }),
    ])

    return { totalCount, filteredCount }
  }, [
    personIdInActiveNodeArray,
    // need to rerender if any of the values of sammlungFilter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(store.filter.garten),
    store,
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Garten"
        table="garten"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return (
    <FormTitle
      row={row}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
      totalCount={totalCount}
      filteredCount={filteredCount}
    />
  )
}

export default observer(GartenFormTitle)
