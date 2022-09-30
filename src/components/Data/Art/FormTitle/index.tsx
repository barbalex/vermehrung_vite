import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import filteredCollectionFromTable from '../../../../utils/filteredCollectionFromTable'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'

const ArtFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const data = useLiveQuery(async () => {
    const [totalCount, filteredCount] = await Promise.all([
      await collectionFromTable({
        table: 'art',
        where: addTotalCriteriaToWhere({ store, table: 'art' }),
      }).count(),
      filteredCollectionFromTable({
        store,
        table: 'art',
        hierarchyWhereAndFilter: undefined,
      }).count(),
    ])
    return { totalCount, filteredCount }
  }, [store.filter.art, store.art_initially_queried])

  const totalCount = data?.totalCount ?? '...'
  const filteredCount = data?.filteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Art"
        table="art"
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

export default observer(ArtFormTitleChooser)
