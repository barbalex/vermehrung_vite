import React, { useContext, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import styled from 'styled-components'
import uniqBy from 'lodash/uniqBy'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import Select from '../../../shared/Select'
import TextField from '../../../shared/TextField'
import Date from '../../../shared/Date'
import Checkbox2States from '../../../shared/Checkbox2States'
import JesNo from '../../../shared/JesNo'
import Coordinates from '../../../shared/Coordinates'
import ifIsNumericAsNumber from '../../../../utils/ifIsNumericAsNumber'
import Files from '../../Files'
import constants from '../../../../utils/constants'
import ErrorBoundary from '../../../shared/ErrorBoundary'
import ConflictList from '../../../shared/ConflictList'
import herkunftLabelFromHerkunft from '../../../../utils/herkunftLabelFromHerkunft'
import personLabelFromPerson from '../../../../utils/personLabelFromPerson'
import artsSortedFromArts from '../../../../utils/artsSortedFromArts'
import personSort from '../../../../utils/personSort'
import herkunftSort from '../../../../utils/herkunftSort'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`
const FieldRow = styled.div`
  display: flex;
  justify-content: space-between;
  > div:not(:last-of-type) {
    padding-right: 8px;
  }
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

const SammlungForm = ({
  showFilter,
  id,
  row,
  activeConflict,
  setActiveConflict,
  showHistory,
}) => {
  const store = useContext(StoreContext)
  const { filter, online, errors, unsetError, setError } = store

  const data = useLiveQuery(async () => {
    const [persons, herkunfts, arts] = await Promise.all([
      dexie.persons
        .filter((value) => totalFilter({ value, store, table: 'person' }))
        .toArray(),
      dexie.herkunfts
        .filter((value) => totalFilter({ value, store, table: 'herkunft' }))
        .toArray(),
      dexie.arts
        .filter((value) => totalFilter({ value, store, table: 'art' }))
        .toArray(),
    ])

    // need to show a choosen person even if inactive but not if deleted
    const person = row.person_id ? await dexie.persons.get(row.person_id) : {}
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

    const herkunft = await dexie.herkunfts.get(
      row.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const herkunftsIncludingChoosen = uniqBy(
      [...herkunfts, ...(herkunft && !showFilter ? [herkunft] : [])],
      'id',
    )
    const herkunftWerte = herkunftsIncludingChoosen
      .sort(herkunftSort)
      .map((herkunft) => ({
        value: herkunft.id,
        label: herkunftLabelFromHerkunft({ herkunft }),
      }))

    const art = await dexie.arts.get(
      row.art_id ?? '99999999-9999-9999-99999999',
    )
    const artsIncludingChoosen = uniqBy(
      [...arts, ...(art && !showFilter ? [art] : [])],
      'id',
    )
    const artsSorted = await artsSortedFromArts(artsIncludingChoosen)
    const artWerte = await Promise.all(
      artsSorted.map(async (art) => {
        const label = await art.label()

        return {
          value: art.id,
          label,
        }
      }),
    )

    return { personWerte, herkunftWerte, artWerte }
  }, [
    filter.art._deleted,
    filter.herkunft,
    filter.person._deleted,
    filter.person.aktiv,
    filter.sammlung._deleted,
    row.art,
    row.herkunft,
    row.person,
    showFilter,
  ])

  const personWerte = data?.personWerte ?? []
  const herkunftWerte = data?.herkunftWerte ?? []
  const artWerte = data?.artWerte ?? []

  // ensure that activeConflict is reset
  // when changing dataset
  useEffect(() => {
    setActiveConflict(null)
  }, [id, setActiveConflict])

  // catch multiple nr's
  useEffect(() => {
    if (showFilter) return
    if (!row.nr && errors.sammlung.nr) {
      return unsetError('sammlung')
    }
    if (!row.nr) return
    dexie.sammlungs
      .where({ _deleted_indexable: 0 })
      .filter((h) => h.nr === row.nr && h.id !== row.id)
      .toArray()
      .then((otherSammlungsWithSameNr) => {
        if (otherSammlungsWithSameNr.length > 0) {
          setError({
            table: 'sammlung',
            field: 'nr',
            value: `Diese Nummer wird ${
              otherSammlungsWithSameNr.length + 1
            } mal verwendet. Sie sollte aber über alle Sammlungen eindeutig sein`,
          })
        } else {
          unsetError('sammlung')
        }
      })
  }, [showFilter, row.nr, row.id, setError, unsetError, errors.sammlung.nr])

  const saveToDb = useCallback(
    (event) => {
      const field = event.target.name
      let value = ifIsNumericAsNumber(event.target.value)
      if (event.target.value === undefined) value = null
      if (event.target.value === '') value = null

      if (showFilter) {
        return filter.setValue({ table: 'sammlung', key: field, value })
      }

      // only update if value has changed
      const previousValue = ifIsNumericAsNumber(row[field])
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
  const openGenVielfaldDocs = useCallback(() => {
    const url = `${constants?.getAppUri()}/Dokumentation/Genetische-Vielfalt`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }, [])

  const showDeleted = filter.sammlung._deleted !== false || row?._deleted

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
                error={!showFilter && errors?.sammlung?._deleted}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}_deleted`}
                label="gelöscht"
                name="_deleted"
                value={row._deleted}
                saveToDb={saveToDb}
                error={!showFilter && errors?.sammlung?._deleted}
              />
            )}
          </>
        )}
        <TextField
          key={`${row.id}nr`}
          name="nr"
          label="Nr."
          value={row.nr}
          saveToDb={saveToDb}
          error={!showFilter && errors?.sammlung?.nr}
          type="text"
        />
        <Select
          key={`${row.id}${row.art_id}art_id`}
          name="art_id"
          value={row.art_id}
          field="art_id"
          label="Art"
          options={artWerte}
          saveToDb={saveToDb}
          error={!showFilter && errors?.sammlung?.art_id}
        />
        <Select
          key={`${row.id}${row.herkunft_id}herkunft_id`}
          name="herkunft_id"
          value={row.herkunft_id}
          field="herkunft_id"
          label="Herkunft"
          options={herkunftWerte}
          saveToDb={saveToDb}
          error={!showFilter && errors?.sammlung?.herkunft_id}
        />
        <Select
          key={`${row.id}${row.person_id}person_id`}
          name="person_id"
          value={row.person_id}
          field="person_id"
          label="Person"
          options={personWerte}
          saveToDb={saveToDb}
          error={!showFilter && errors?.sammlung?.person_id}
        />
        <Date
          key={`${row.id}datum`}
          name="datum"
          label="Datum"
          value={row.datum}
          saveToDb={saveToDb}
          error={!showFilter && errors?.sammlung?.datum}
        />
        <TextField
          key={`${row.id}anzahl_pflanzen`}
          name="anzahl_pflanzen"
          label="Anzahl Pflanzen"
          value={row.anzahl_pflanzen}
          saveToDb={saveToDb}
          error={!showFilter && errors?.sammlung?.anzahl_pflanzen}
          type="number"
        />
        <FieldRow>
          <TextField
            key={`${row.id}gramm_samen`}
            name="gramm_samen"
            label="Gramm Samen"
            value={row.gramm_samen}
            saveToDb={saveToDb}
            error={!showFilter && errors?.sammlung?.gramm_samen}
            type="number"
          />
          <TextField
            key={`${row.id}andere_menge`}
            name="andere_menge"
            label={`Andere Menge (z.B. "3 Zwiebeln")`}
            value={row.andere_menge}
            saveToDb={saveToDb}
            error={!showFilter && errors?.sammlung?.andere_menge}
            type="text"
          />
        </FieldRow>
        <FieldRow>
          <TextField
            key={`${row.id}von_anzahl_individuen`}
            name="von_anzahl_individuen"
            label="von Anzahl Individuen"
            value={row.von_anzahl_individuen}
            saveToDb={saveToDb}
            error={!showFilter && errors?.sammlung?.von_anzahl_individuen}
            type="number"
          />
          <div>
            <IconButton
              aria-label="Anleitung öffnen"
              title="Anleitung öffnen"
              onClick={openGenVielfaldDocs}
              size="large"
            >
              <IoMdInformationCircleOutline />
            </IconButton>
          </div>
        </FieldRow>
        {!showFilter && <Coordinates row={row} saveToDb={saveToDb} />}
        <FieldRow>
          {showFilter ? (
            <JesNo
              key={`${row.id}geplant`}
              label="Geplant"
              name="geplant"
              value={row.geplant}
              saveToDb={saveToDb}
              error={!showFilter && errors?.sammlung?.geplant}
            />
          ) : (
            <Checkbox2States
              key={`${row.id}geplant`}
              label="Geplant"
              name="geplant"
              value={row.geplant}
              saveToDb={saveToDb}
              error={!showFilter && errors?.sammlung?.geplant}
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
        <TextField
          key={`${row.id}bemerkungen`}
          name="bemerkungen"
          label="Bemerkungen"
          value={row.bemerkungen}
          saveToDb={saveToDb}
          error={!showFilter && errors?.sammlung?.bemerkungen}
          multiLine
        />
        {online && !showFilter && row?._conflicts?.map && (
          <ConflictList
            conflicts={row._conflicts}
            activeConflict={activeConflict}
            setActiveConflict={setActiveConflict}
          />
        )}
        {!showFilter && <Files parentTable="sammlung" parent={row} />}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(SammlungForm)
