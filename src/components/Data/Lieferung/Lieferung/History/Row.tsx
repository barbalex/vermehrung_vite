import React, { useCallback, useContext, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import md5 from 'blueimp-md5'
import { v1 as uuidv1 } from 'uuid'

import History from '../../../../shared/History'
import StoreContext from '../../../../../storeContext'
import checkForOnlineError from '../../../../../utils/checkForOnlineError'
import toPgArray from '../../../../../utils/toPgArray'
import mutations from '../../../../../utils/mutations'
import createDataArrayForRevComparison from '../createDataArrayForRevComparison'
import { dexie } from '../../../../../dexieClient'
import addIndexableBooleans from '../../../../../utils/addIndexableBooleans'
import addDerivedFieldsInDexie from '../../../../../utils/addDerivedFieldsInDexie'

const HistoryRow = ({ row, revRow, historyTakeoverCallback }) => {
  const store = useContext(StoreContext)
  const { user, addNotification, gqlClient } = store

  const dataArray = useMemo(
    () => createDataArrayForRevComparison({ row, revRow, store }),
    [revRow, row, store],
  )
  const onClickWiderspruchUebernehmen = useCallback(async () => {
    // need to attach to the winner, that is row
    // otherwise risk to still have lower depth and thus loosing
    const newDepth = row._depth + 1
    const newObject = {
      lieferung_id: revRow.lieferung_id,
      sammel_lieferung_id: revRow.sammel_lieferung_id,
      art_id: revRow.art_id,
      person_id: revRow.person_id,
      von_sammlung_id: revRow.von_sammlung_id,
      von_kultur_id: revRow.von_kultur_id,
      datum: revRow.datum,
      nach_kultur_id: revRow.nach_kultur_id,
      nach_ausgepflanzt: revRow.nach_ausgepflanzt,
      von_anzahl_individuen: revRow.von_anzahl_individuen,
      anzahl_pflanzen: revRow.anzahl_pflanzen,
      anzahl_auspflanzbereit: revRow.anzahl_auspflanzbereit,
      gramm_samen: revRow.gramm_samen,
      andere_menge: revRow.andere_menge,
      geplant: revRow.geplant,
      bemerkungen: revRow.bemerkungen,
      _parent_rev: row._rev,
      _depth: newDepth,
      _deleted: revRow._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    newObject._rev = rev
    newObject.id = uuidv1()
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    newObject._revisions = toPgArray([rev, ...row._revisions])
    const newObjectForStore = { ...newObject }
    const response = await gqlClient
      .query(mutations.mutateInsert_lieferung_rev_one, {
        object: newObject,
        on_conflict: {
          constraint: 'lieferung_rev_pkey',
          update_columns: ['id'],
        },
      })
      .toPromise()
    if (response.error) {
      checkForOnlineError({ error: response.error, store })
      return addNotification({
        message: response.error.message,
      })
    }
    historyTakeoverCallback()
    // do not stringify revisions for store
    // as _that_ is a real array
    newObjectForStore._revisions = row._revisions
      ? [rev, ...row._revisions]
      : [rev]
    // TODO: is this a good idea?
    newObjectForStore._conflicts = row._conflicts
    // for store: convert rev to winner
    newObjectForStore.id = row.id
    delete newObjectForStore.lieferung_id
    addIndexableBooleans({ table: 'lieferung', object: newObjectForStore })
    await dexie.lieferungs.update(row.id, newObjectForStore)
    return await addDerivedFieldsInDexie({
      table: 'lieferung',
      id: row.id,
    })
  }, [
    row,
    revRow.lieferung_id,
    revRow.sammel_lieferung_id,
    revRow.art_id,
    revRow.person_id,
    revRow.von_sammlung_id,
    revRow.von_kultur_id,
    revRow.datum,
    revRow.nach_kultur_id,
    revRow.nach_ausgepflanzt,
    revRow.von_anzahl_individuen,
    revRow.anzahl_pflanzen,
    revRow.anzahl_auspflanzbereit,
    revRow.gramm_samen,
    revRow.andere_menge,
    revRow.geplant,
    revRow.bemerkungen,
    revRow._deleted,
    user.email,
    gqlClient,
    historyTakeoverCallback,
    store,
    addNotification,
  ])

  return (
    <History
      rev={revRow._rev}
      dataArray={dataArray}
      onClickWiderspruchUebernehmen={onClickWiderspruchUebernehmen}
    />
  )
}

export default observer(HistoryRow)
