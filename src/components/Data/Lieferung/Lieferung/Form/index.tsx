import React, { useContext, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import Checkbox2States from '../../../../shared/Checkbox2States'
import JesNo from '../../../../shared/JesNo'
import exists from '../../../../../utils/exists'
import ifIsNumericAsNumber from '../../../../../utils/ifIsNumericAsNumber'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import Was from './Was'
import Von from './Von'
import Nach from './Nach'
import Wann from './Wann'
import Wer from './Wer'
import { dexie } from '../../../../../dexieClient'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`
const CaseConflictTitle = styled.h4`
  margin-bottom: 10px;
`
const Rev = styled.span`
  font-weight: normal;
  padding-left: 7px;
  color: rgba(0, 0, 0, 0.4);
  font-size: 0.8em;
`

const LierferungForm = ({
  showFilter,
  id,
  row,
  activeConflict,
  setActiveConflict,
  showHistory,
}) => {
  const existsSammelLieferung = !!row?.sammel_lieferung_id
  const store = useContext(StoreContext)

  const { errors, filter, unsetError, user } = store

  const data = useLiveQuery(async () => {
    const [person, sammelLieferung, vonSammlung] = await Promise.all([
      dexie.persons.get({ account_id: user.uid }),
      dexie.sammel_lieferungs.get(
        row.sammel_lieferung_id ?? '99999999-9999-9999-9999-999999999999',
      ),
      dexie.sammlungs.get(
        row.von_sammlung_id ?? '99999999-9999-9999-9999-999999999999',
      ),
    ])

    const personOption: PersonOption = await dexie.person_options.get(person.id)
    const vonSammlungHerkunft = await dexie.herkunfts.get(
      vonSammlung?.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )

    if (vonSammlungHerkunft) {
      return {
        herkunft: vonSammlungHerkunft,
        personOption,
        herkunftQuelle: 'Sammlung',
        sammelLieferung,
      }
    }

    if (row.von_kultur_id) {
      const vonKultur = await dexie.kulturs.get(row.von_kultur_id)
      const herkunftByVonKultur = await dexie.herkunfts.get(
        vonKultur?.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
      )
      if (herkunftByVonKultur) {
        return {
          herkunft: herkunftByVonKultur,
          herkunftQuelle: 'von-Kultur',
          personOption,
          sammelLieferung,
        }
      }
    }

    const nachKultur = await dexie.kulturs.get(
      row?.nach_kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const herkunftByNachKultur = await dexie.herkunfts.get(
      nachKultur?.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return {
      herkunft: herkunftByNachKultur,
      herkunftQuelle: herkunftByNachKultur ? 'nach-Kultur' : 'keine',
      personOption,
      sammelLieferung,
    }
  }, [user.uid, row])

  const personOption = data?.personOption ?? {}
  const sammelLieferung = data?.sammelLieferung
  const herkunft = data?.herkunft
  const herkunftQuelle = data?.herkunftQuelle

  const { li_show_sl_felder } = personOption ?? {}

  const ifNeeded = useCallback(
    (field) => {
      if (existsSammelLieferung && li_show_sl_felder) return true
      if (
        !exists(sammelLieferung?.[field]) ||
        sammelLieferung?.[field] === false
      ) {
        return true
      } else if (sammelLieferung?.[field] !== row[field]) {
        return true
      }
      return false
    },
    [existsSammelLieferung, li_show_sl_felder, row, sammelLieferung],
  )
  const ifSomeNeeded = useCallback(
    (fields) => fields.some((f) => ifNeeded(f)),
    [ifNeeded],
  )

  useEffect(() => {
    unsetError('lieferung')
  }, [id, unsetError])

  const saveToDb = useCallback(
    async (event) => {
      const field = event.target.name
      let value = ifIsNumericAsNumber(event.target.value)
      if (event.target.value === undefined) value = null
      if (event.target.value === '') value = null

      if (showFilter) {
        return filter.setValue({ table: 'lieferung', key: field, value })
      }

      // only update if value has changed
      const previousValue = ifIsNumericAsNumber(row[field])
      if (value === previousValue) return
      row.edit({ field, value, store })
    },
    [filter, row, showFilter, store],
  )

  const showDeleted = filter.lieferung._deleted !== false || row?._deleted

  //console.log('Lieferung, row:', row)

  return (
    <ErrorBoundary>
      <FieldsContainer>
        {(activeConflict || showHistory) && (
          <CaseConflictTitle>
            Aktuelle Version<Rev>{row._rev}</Rev>
          </CaseConflictTitle>
        )}
        {showDeleted && (
          <>
            {showFilter ? (
              <JesNo
                key={`${row.id}_deleted`}
                label="gelöscht"
                name="_deleted"
                value={row._deleted}
                saveToDb={saveToDb}
                error={errors?.kultur?._deleted}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}_deleted`}
                label="gelöscht"
                name="_deleted"
                value={row._deleted}
                saveToDb={saveToDb}
                error={errors?.kultur?._deleted}
              />
            )}
          </>
        )}
        {ifSomeNeeded([
          'art_id',
          'anzahl_pflanzen',
          'anzahl_auspflanzbereit',
          'gramm_samen',
          'andere_menge',
          'von_anzahl_individuen',
        ]) && (
          <Was
            showFilter={showFilter}
            id={id}
            row={row}
            saveToDb={saveToDb}
            ifNeeded={ifNeeded}
          />
        )}
        <Von
          showFilter={showFilter}
          id={id}
          row={row}
          saveToDb={saveToDb}
          ifNeeded={ifNeeded}
          herkunft={herkunft}
          herkunftQuelle={herkunftQuelle}
        />
        <Nach
          showFilter={showFilter}
          id={id}
          row={row}
          saveToDb={saveToDb}
          ifNeeded={ifNeeded}
          herkunft={herkunft}
        />
        {ifSomeNeeded(['datum', 'geplant']) && (
          <Wann
            showFilter={showFilter}
            id={id}
            row={row}
            saveToDb={saveToDb}
            ifNeeded={ifNeeded}
          />
        )}
        {ifSomeNeeded(['person_id', 'bemerkungen']) && (
          <Wer
            showFilter={showFilter}
            id={id}
            row={row}
            saveToDb={saveToDb}
            ifNeeded={ifNeeded}
            activeConflict={activeConflict}
            setActiveConflict={setActiveConflict}
          />
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(LierferungForm)
