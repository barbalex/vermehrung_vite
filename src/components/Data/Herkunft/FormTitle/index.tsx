import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const HerkunftFormTitleChooser = ({
  row,
  rawRow,
  showFilter,
  showHistory,
  setShowHistory,
  activeConflict,
}) => {
  const store = useContext(StoreContext)
  const { sammlungIdInActiveNodeArray, artIdInActiveNodeArray } = store

  let conditionAdder
  if (sammlungIdInActiveNodeArray) {
    conditionAdder = async (collection) => {
      const activeSammlung = await dexie.sammlungs.get(
        sammlungIdInActiveNodeArray,
      )
      return collection.and('id').equals(activeSammlung.herkunft_id)
    }
  }
  if (artIdInActiveNodeArray) {
    conditionAdder = async (collection) => {
      const sammlungsOfArt = await dexie.sammlungs
        .where({
          art_id: artIdInActiveNodeArray,
        })
        .toArray()
      const herkunftIds = sammlungsOfArt.map((e) => e.herkunft_id)
      return collection.and('id').anyOf(herkunftIds)
    }
  }

  const totalCount = useLiveQuery(
    async () =>
      await dexie.herkunfts
        .filter((value) =>
          totalFilter({ value, store, table: 'herkunft', conditionAdder }),
        )
        .count(),
    [store.filter.herkunft, store.herkunft_initially_queried],
  )

  const filteredCount = store.herkunftsFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Herkunft"
        table="herkunft"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return (
    <FormTitle
      row={row}
      rawRow={rawRow}
      totalCount={totalCount}
      filteredCount={filteredCount}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
      activeConflict={activeConflict}
    />
  )
}

export default observer(HerkunftFormTitleChooser)
