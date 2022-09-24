import React, { useContext, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import uniqBy from 'lodash/uniqBy'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import Select from '../../../shared/Select'
import TextField from '../../../shared/TextField'
import Checkbox2States from '../../../shared/Checkbox2States'
import JesNo from '../../../shared/JesNo'
import ifIsNumericAsNumber from '../../../../utils/ifIsNumericAsNumber'
import personLabelFromPerson from '../../../../utils/personLabelFromPerson'
import personSort from '../../../../utils/personSort'
import Files from '../../Files'
import Coordinates from '../../../shared/Coordinates'
import Personen from './Personen'
import ConflictList from '../../../shared/ConflictList'
import { dexie } from '../../../../dexieClient' 
import totalFilter from '../../../../utils/totalFilter' 

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

const GartenForm = ({
  showFilter,
  id,
  row,
  activeConflict,
  setActiveConflict,
  showHistory,
}) => {
  const store = useContext(StoreContext)
  const { filter, online, errors, unsetError, insertGvRev, user } = store

  const data = useLiveQuery(async () => {
    const [persons, userPerson, gvs] = await Promise.all([
      dexie.persons
        .filter((value) => totalFilter({ value, store, table: 'person' }))
        .toArray(),
      dexie.persons.get({ account_id: user.uid ?? '99999999-9999-9999-9999-999999999999' }),
      dexie.gvs.filter((g) => g._deleted === false).toArray(),
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

    const userPersonOption = await dexie.person_options.get(userPerson.id)

    return { personWerte, userPersonOption, gvs }
  }, [store.filter.garten, store.garten_initially_queried])

  const personWerte = data?.personWerte ?? []
  const userPersonOption = data?.userPersonOption ?? {}
  const gvs = data?.gvs ?? []

  useEffect(() => {
    unsetError('garten')
  }, [id, unsetError])

  const gvPersonIds = gvs.map((v) => v.person_id)

  const {
    ga_strasse,
    ga_plz,
    ga_ort,
    ga_geom_point,
    ga_aktiv,
    ga_bemerkungen,
  } = userPersonOption ?? {}

  const saveToDb = useCallback(
    async (event) => {
      const field = event.target.name
      let value = ifIsNumericAsNumber(event.target.value)
      if (event.target.value === undefined) value = null
      if (event.target.value === '') value = null

      if (showFilter) {
        return filter.setValue({ table: 'garten', key: field, value })
      }
      const previousValue = ifIsNumericAsNumber(row[field])
      // only update if value has changed
      if (value === previousValue) return
      //console.log('Garten, will edit row:', { field, value })
      row.edit({ field, value, store })
      if (field === 'person_id') {
        // only if not yet exists
        // do this in garten.edit?
        if (!gvPersonIds.includes(value)) {
          // console.log('Garten, will insert into gvRev:', {
          //   garten_id: row.id,
          //   person_id: value,
          //   gvPersonIds,
          // })
          insertGvRev({ values: { garten_id: row.id, person_id: value } })
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, gvPersonIds.length, insertGvRev, row, showFilter, store],
  )

  const showDeleted = filter.garten._deleted !== false || row?._deleted

  return (
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
              error={errors?.garten?._deleted}
            />
          ) : (
            <Checkbox2States
              key={`${row.id}_deleted`}
              label="gelöscht"
              name="_deleted"
              value={row._deleted}
              saveToDb={saveToDb}
              error={errors?.garten?._deleted}
            />
          )}
        </>
      )}
      <TextField
        key={`${row.id}name`}
        name="name"
        label="Name"
        value={row.name}
        saveToDb={saveToDb}
        error={errors?.garten?.name}
      />
      <Select
        key={`${row.id}${row.person_id}person_id`}
        name="person_id"
        value={row.person_id}
        field="person_id"
        label="Person"
        options={personWerte}
        saveToDb={saveToDb}
        error={errors?.garten?.person_id}
      />
      {ga_strasse && (
        <TextField
          key={`${row.id}strasse`}
          name="strasse"
          label="Strasse"
          value={row.strasse}
          saveToDb={saveToDb}
          error={errors?.garten?.strasse}
        />
      )}
      {ga_plz && (
        <TextField
          key={`${row.id}plz`}
          name="plz"
          label="PLZ"
          value={row.plz}
          saveToDb={saveToDb}
          error={errors?.garten?.plz}
          type="number"
        />
      )}
      {ga_ort && (
        <TextField
          key={`${row.id}ort`}
          name="ort"
          label="Ort"
          value={row.ort}
          saveToDb={saveToDb}
          error={errors?.garten?.ort}
        />
      )}
      {!showFilter && ga_geom_point && (
        <Coordinates row={row} saveToDb={saveToDb} />
      )}
      {ga_aktiv && (
        <>
          {showFilter ? (
            <JesNo
              key={`${row.id}aktiv`}
              label="aktiv"
              name="aktiv"
              value={row.aktiv}
              saveToDb={saveToDb}
              error={errors?.garten?.aktiv}
            />
          ) : (
            <Checkbox2States
              key={`${row.id}aktiv`}
              label="aktiv"
              name="aktiv"
              value={row.aktiv}
              saveToDb={saveToDb}
              error={errors?.garten?.aktiv}
            />
          )}
        </>
      )}
      {ga_bemerkungen && (
        <TextField
          key={`${row.id}bemerkungen`}
          name="bemerkungen"
          label="Bemerkungen"
          value={row.bemerkungen}
          saveToDb={saveToDb}
          error={errors?.garten?.bemerkungen}
          multiLine
        />
      )}
      {online && !showFilter && row?._conflicts?.map && (
        <ConflictList
          conflicts={row._conflicts}
          activeConflict={activeConflict}
          setActiveConflict={setActiveConflict}
        />
      )}
      {!showFilter && (
        <>
          <Personen gartenId={row.id} garten={row} />
          <Files parentTable="garten" parent={row} />
        </>
      )}
    </FieldsContainer>
  )
}

export default observer(GartenForm)
