import React, { useContext, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'
import uniqBy from 'lodash/uniqBy'

import StoreContext from '../../../../storeContext'
import TextField from '../../../shared/TextField'
import Checkbox2States from '../../../shared/Checkbox2States'
import JesNo from '../../../shared/JesNo'
import ifIsNumericAsNumber from '../../../../utils/ifIsNumericAsNumber'
import Files from '../../Files'
import Coordinates from '../../../shared/Coordinates'
import ConflictList from '../../../shared/ConflictList'
import { dexie } from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'
import personSort from '../../../../utils/personSort'
import personLabelFromPerson from '../../../../utils/personLabelFromPerson'

const Container = styled.div`
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

const Herkunft = ({
  showFilter,
  id,
  row,
  activeConflict,
  setActiveConflict,
  showHistory,
}) => {
  const store = useContext(StoreContext)
  const { filter, online, errors, setError, unsetError, user } = store

  const data = useLiveQuery(async () => {
    const [persons, userPerson] = await Promise.all([
      dexie.persons
        .filter((value) => totalFilter({ value, store, table: 'person' }))
        .toArray(),
      dexie.persons.get({
        account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
      }),
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
    if (!showFilter && row.nr) {
      const otherHerkunftsWithSameNr = await dexie.herkunfts
        .filter(
          (h) => h._deleted === false && h.nr === row.nr && h.id !== row.id,
        )
        .toArray()
      if (otherHerkunftsWithSameNr.length > 0) {
        setError({
          path: 'herkunft.nr',
          value: `Diese Nummer wird ${
            otherHerkunftsWithSameNr.length + 1
          } mal verwendet. Sie sollte aber über alle Herkünfte eindeutig sein`,
        })
      }
    }

    return { personWerte, userPersonOption }
  }, [store.filter.garten, store.garten_initially_queried, id, user, row])

  const userPersonOption = data?.userPersonOption ?? {}

  // ensure that activeConflict is reset
  // when changing dataset
  useEffect(() => {
    setActiveConflict(null)
  }, [id, setActiveConflict])

  const { hk_kanton, hk_land, hk_bemerkungen, hk_geom_point } =
    userPersonOption ?? {}

  useEffect(() => {
    unsetError('herkunft')
  }, [id, unsetError])

  const saveToDb = useCallback(
    async (event) => {
      const field = event.target.name
      let value = ifIsNumericAsNumber(event.target.value)
      if (event.target.value === undefined) value = null
      if (event.target.value === '') value = null

      if (showFilter) {
        return filter.setValue({ table: 'herkunft', key: field, value })
      }

      const previousValue = ifIsNumericAsNumber(row[field])
      // only update if value has changed
      if (value === previousValue) return
      await row.edit({ field, value, store })
    },
    [filter, row, showFilter, store],
  )

  const showDeleted = filter.herkunft._deleted !== false || row?._deleted

  return (
    <Container>
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
              error={errors?.herkunft?._deleted}
            />
          ) : (
            <Checkbox2States
              key={`${row.id}_deleted`}
              label="gelöscht"
              name="_deleted"
              value={row._deleted}
              saveToDb={saveToDb}
              error={errors?.herkunft?._deleted}
            />
          )}
        </>
      )}
      <TextField
        key={`${row.id}nr`}
        name="nr"
        label="Nr"
        value={row.nr}
        saveToDb={saveToDb}
        error={errors?.herkunft?.nr}
      />
      <TextField
        key={`${row.id}lokalname`}
        name="lokalname"
        label="Lokalname"
        value={row.lokalname}
        saveToDb={saveToDb}
        error={errors?.herkunft?.lokalname}
      />
      <TextField
        key={`${row.id}gemeinde`}
        name="gemeinde"
        label="Gemeinde"
        value={row.gemeinde}
        saveToDb={saveToDb}
        error={errors?.herkunft?.gemeinde}
      />
      {hk_kanton && (
        <TextField
          key={`${row.id}kanton`}
          name="kanton"
          label="Kanton"
          value={row.kanton}
          saveToDb={saveToDb}
          error={errors?.herkunft?.kanton}
        />
      )}
      {hk_land && (
        <TextField
          key={`${row.id}land`}
          name="land"
          label="Land"
          value={row.land}
          saveToDb={saveToDb}
          error={errors?.herkunft?.land}
        />
      )}
      {!showFilter && hk_geom_point && (
        <Coordinates row={row} saveToDb={saveToDb} />
      )}
      {hk_bemerkungen && (
        <TextField
          key={`${row.id}bemerkungen`}
          name="bemerkungen"
          label="Bemerkungen"
          value={row.bemerkungen}
          saveToDb={saveToDb}
          error={errors?.herkunft?.bemerkungen}
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
      {!showFilter && row.id && <Files parentTable="herkunft" parent={row} />}
    </Container>
  )
}

export default observer(Herkunft)
