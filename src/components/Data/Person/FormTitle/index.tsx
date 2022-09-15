import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const PersonFormTitleChooser = ({
  showFilter,
  row,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const totalCount = useLiveQuery(
    async () =>
      await dexie.persons
        .filter((value) => totalFilter({ value, store, table: 'person' }))
        .count(),
    [
      store.filter.person,
      store.person_initially_queried,
      // need to rerender if any of the values of personFilter changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...Object.values(store.filter.person),
    ],
  )

  const filteredCount = store.personsFilteredCount ?? '...'

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
