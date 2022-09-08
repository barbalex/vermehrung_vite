import React, { useContext, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import IconButton from '@mui/material/IconButton'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import uniqBy from 'lodash/uniqBy'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import Select from '../../../shared/Select'
import SelectCreatable from '../../../shared/SelectCreatable'
import TextField from '../../../shared/TextField'
import Date from '../../../shared/Date'
import Checkbox2States from '../../../shared/Checkbox2States'
import JesNo from '../../../shared/JesNo'
import ifIsNumericAsNumber from '../../../../utils/ifIsNumericAsNumber'
import ErrorBoundary from '../../../shared/ErrorBoundary'
import ConflictList from '../../../shared/ConflictList'
import kultursSortedFromKulturs from '../../../../utils/kultursSortedFromKulturs'
import personLabelFromPerson from '../../../../utils/personLabelFromPerson'
import teilkulturSort from '../../../../utils/teilkulturSort'
import personSort from '../../../../utils/personSort'
import constants from '../../../../utils/constants'
import { dexie, KulturOption } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`
const FieldRow = styled.div`
  display: flex;
  justify-content: space-between;
  > div > button {
    margin-top: 8px;
  }
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

const EventForm = ({
  showFilter,
  id,
  row,
  activeConflict,
  setActiveConflict,
  showHistory,
}) => {
  const store = useContext(StoreContext)
  const { filter, online, insertTeilkulturRev, errors, unsetError } = store

  useEffect(() => {
    unsetError('event')
  }, [id, unsetError])

  const kulturId = row?.kultur_id

  const data = useLiveQuery(async () => {
    const [kulturs, teilkulturs, persons, kulturOption] = await Promise.all([
      dexie.kulturs
        .filter((value) => totalFilter({ value, store, table: 'kultur' }))
        .toArray(),
      dexie.teilkulturs
        .filter(
          (t) =>
            t._deleted === false &&
            (showFilter ? true : t.kultur_id === kulturId),
        )
        .toArray(),
      dexie.persons
        .filter((value) => totalFilter({ value, store, table: 'person' }))
        .toArray(),
      dexie.kultur_options.get(row.kultur_id),
    ])
    // need to show a choosen kultur even if inactive but not if deleted
    const kultur = await dexie.kulturs.get(row.kultur_id)
    const kultursIncludingChoosen = uniqBy(
      [...kulturs, ...(kultur && !showFilter ? [kultur] : [])],
      'id',
    )
    const kultursSorted = await kultursSortedFromKulturs(
      kultursIncludingChoosen,
    )
    const kulturWerte = await Promise.all(
      kultursSorted.map(async (t) => {
        const label = await t.label()

        return {
          value: t.id,
          label,
        }
      }),
    )

    const teilkultur = row.teilkultur_id
      ? await dexie.teilkulturs.get(row.teilkultur_id)
      : {}
    const teilkultursIncludingChoosen = uniqBy(
      [...teilkulturs, ...(teilkultur && !showFilter ? [teilkultur] : [])],
      'id',
    )
    const teilkulturWerte = teilkultursIncludingChoosen
      .sort(teilkulturSort)
      .map((t) => ({
        value: t.id,
        label: t.name || '(kein Name)',
      }))

    // need to show a choosen person even if inactive but not if deleted
    const person = row.person_id ? await dexie.persons.get(row.person_id) : {}
    try {
      person = await row.person.fetch()
    } catch {}
    const personsIncludingChoosen = uniqBy(
      [...persons, ...(person && !showFilter ? [person] : [])],
      'id',
    )
    const personWerte = personsIncludingChoosen
      .sort(personSort)
      .map((person) => ({
        value: person.id,
        label: personLabelFromPerson({ person }),
      }))

    return { kulturWerte, teilkulturWerte, personWerte, kulturOption }
  }, [store.filter.art, store.art_initially_queried])

  const kulturWerte = data?.kulturWerte ?? []
  const teilkulturWerte = data?.teilkulturWerte ?? []
  const personWerte = data?.personWerte ?? []
  const kulturOption: KulturOption = data?.kulturOption

  const { tk, ev_datum, ev_geplant, ev_person_id } = kulturOption ?? {}

  const saveToDb = useCallback(
    (event) => {
      const field = event.target.name
      let value = ifIsNumericAsNumber(event.target.value)
      if (event.target.value === undefined) value = null
      if (event.target.value === '') value = null

      if (showFilter) {
        return filter.setValue({ table: 'event', key: field, value })
      }

      const previousValue = ifIsNumericAsNumber(row?.[field])
      // only update if value has changed
      if (value === previousValue) return
      row.edit({ field, value, store })
    },
    [filter, row, showFilter, store],
  )
  const openPlanenDocs = useCallback(() => {
    const url = `${constants?.getAppUri()}/Dokumentation/Planen`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }, [])

  const onCreateNewTeilkultur = useCallback(
    async ({ name }) => {
      const teilkultur_id = await insertTeilkulturRev({
        noNavigateInTree: true,
        values: {
          name,
          kultur_id: row.kultur_id,
        },
      })
      row.edit({ field: 'teilkultur_id', value: teilkultur_id, store })
    },
    [insertTeilkulturRev, row, store],
  )

  const showDeleted = filter.event._deleted !== false || row?._deleted

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
                error={errors?.event?._deleted}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}_deleted`}
                label="gelöscht"
                name="_deleted"
                value={row._deleted}
                saveToDb={saveToDb}
                error={errors?.event?._deleted}
              />
            )}
          </>
        )}
        <Select
          key={`${row.id}${row.kultur_id}kultur_id`}
          name="kultur_id"
          value={row.kultur_id}
          field="kultur_id"
          label="Kultur"
          options={kulturWerte}
          saveToDb={saveToDb}
          error={errors?.event?.kultur_id}
        />
        {(tk || showFilter) && (
          <SelectCreatable
            key={`${row.id}${row.teilkultur_id}teilkultur_id`}
            row={row}
            showFilter={showFilter}
            table="event"
            field="teilkultur_id"
            label="Teilkultur"
            options={teilkulturWerte}
            error={errors?.event?.teilkultur_id}
            onCreateNew={onCreateNewTeilkultur}
          />
        )}
        <TextField
          key={`${row.id}beschreibung`}
          name="beschreibung"
          label="Beschreibung"
          value={row.beschreibung}
          saveToDb={saveToDb}
          error={errors?.event?.beschreibung}
          multiline
        />
        {(ev_person_id || showFilter) && (
          <Select
            key={`${row.id}${row.person_id}person_id`}
            name="person_id"
            value={row.person_id}
            field="person_id"
            label="Wer"
            options={personWerte}
            saveToDb={saveToDb}
            error={errors?.event?.person_id}
          />
        )}
        {(ev_datum || showFilter) && (
          <Date
            key={`${row.id}datum`}
            name="datum"
            label="Datum"
            value={row.datum}
            saveToDb={saveToDb}
            error={errors?.event?.datum}
          />
        )}
        {(ev_geplant || showFilter) && (
          <FieldRow>
            {showFilter ? (
              <JesNo
                key={`${row.id}geplant`}
                label="geplant"
                name="geplant"
                value={row.geplant}
                saveToDb={saveToDb}
                error={errors?.event?.geplant}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}geplant`}
                label="geplant"
                name="geplant"
                value={row.geplant}
                saveToDb={saveToDb}
                error={errors?.event?.geplant}
              />
            )}
            <div>
              <IconButton
                aria-label="Anleitung öffnen"
                title="Anleitung öffnen"
                onClick={openPlanenDocs}
                size="large"
              >
                <IoMdInformationCircleOutline />
              </IconButton>
            </div>
          </FieldRow>
        )}
        {online && !showFilter && row?._conflicts?.map && (
          <ConflictList
            conflicts={row._conflicts}
            activeConflict={activeConflict}
            setActiveConflict={setActiveConflict}
          />
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(EventForm)
