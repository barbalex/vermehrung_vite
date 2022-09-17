import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const SammlungFormTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const {
    herkunftIdInActiveNodeArray,
    personIdInActiveNodeArray,
    artIdInActiveNodeArray,
  } = store

  let conditionAdder
  if (artIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('art_id').equals(artIdInActiveNodeArray)
  }
  if (herkunftIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('herkunft_id').equals(herkunftIdInActiveNodeArray)
  }
  if (personIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('person_id').equals(personIdInActiveNodeArray)
  }

  const totalCount = useLiveQuery(
    async () =>
      await dexie.sammlungs
        .filter((value) =>
          totalFilter({ value, store, table: 'sammlung', conditionAdder }),
        )
        .count(),
    [
      artIdInActiveNodeArray,
      herkunftIdInActiveNodeArray,
      personIdInActiveNodeArray,
      // need to rerender if any of the values of sammlungFilter changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...Object.values(store.filter.sammlung),
      store,
    ],
  )

  const filteredCount = store.sammlungsFilteredCount ?? '...'

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
