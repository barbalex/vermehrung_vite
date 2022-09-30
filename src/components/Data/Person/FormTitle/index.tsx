import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import filteredCollectionFromTable from '../../../../utils/filteredCollectionFromTable'

const PersonFormTitleChooser = ({
  showFilter,
  row,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const data = useLiveQuery(async () => {
    const [totalCount, filteredCount] = await Promise.all([
      collectionFromTable({
        table: 'person',
        where: addTotalCriteriaToWhere({ store, table: 'person' }),
      }).count(),
      filteredCollectionFromTable({ store, table: 'person' }).count(),
    ])

    return { totalCount, filteredCount }
  }, [
    store.person_initially_queried,
    // need to rerender if any of the values of personFilter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(store.filter.person),
  ])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="PersonFormTitleChooser"
        table="person"
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

export default observer(PersonFormTitleChooser)
