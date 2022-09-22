import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import FilterTitle from '../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'
import hierarchyFilterForTable from '../../../../utils/hierarchyFilterForTable'

const EventFormTitle = ({ row, showFilter, showHistory, setShowHistory }) => {
  const store = useContext(StoreContext)
  const { kulturIdInActiveNodeArray } = store

  const totalCount = useLiveQuery(async () => {
    const conditionAdder = await hierarchyFilterForTable({
      store,
      table: 'event',
    })

    return await dexie.events
      .filter((value) =>
        totalFilter({ value, store, table: 'event', conditionAdder }),
      )
      .count()
  }, [
    store.filter.event,
    store.event_initially_queried,
    kulturIdInActiveNodeArray,
  ])

  const filteredCount = store.eventsFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Event"
        table="event"
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

export default observer(EventFormTitle)
