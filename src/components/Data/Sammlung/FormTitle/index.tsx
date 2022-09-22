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
    conditionAdder = (c) => c.art_id === artIdInActiveNodeArray
  }
  if (herkunftIdInActiveNodeArray) {
    conditionAdder = (c) => c.herkunft_id === herkunftIdInActiveNodeArray
  }
  if (personIdInActiveNodeArray) {
    conditionAdder = (c) => c.person_id === personIdInActiveNodeArray
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
