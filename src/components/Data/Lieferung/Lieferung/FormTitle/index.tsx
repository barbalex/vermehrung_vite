import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import FilterTitle from '../../../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../../../dexieClient'
import totalFilter from '../../../../../utils/totalFilter'

const LieferungTitleChooser = ({
  row,
  showFilter,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)

  const { hierarchyFilterForLieferung } = store

  const data = useLiveQuery(async () => {
    const [totalCount] = Promise.all([
      await dexie.lieferungs
        .filter((value) =>
          totalFilter({
            value,
            store,
            table: 'lieferung',
            conditionAdder: hierarchyFilterForLieferung,
          }),
        )
        .count(),
    ])
    return { totalCount }
  }, [store.lieferung_initially_queried, hierarchyFilterForLieferung])

  const totalCount = data?.totalCount
  const filteredCount = store.lieferungsFilteredCount ?? '...'

  if (showFilter) {
    return (
      <FilterTitle
        title="Lieferung"
        table="lieferung"
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

export default observer(LieferungTitleChooser)
