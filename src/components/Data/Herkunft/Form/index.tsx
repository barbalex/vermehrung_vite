import React, { useContext, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'
import uniqBy from 'lodash/uniqBy'
import { toJS } from 'mobx'

import StoreContext from '../../../../storeContext'
import TextField from '../../../shared/TextField'
import Checkbox2States from '../../../shared/Checkbox2States'
import JesNo from '../../../shared/JesNo'
import ifIsNumericAsNumber from '../../../../utils/ifIsNumericAsNumber'
import Files from '../../Files'
import Coordinates from '../../../shared/Coordinates'
import ConflictList from '../../../shared/ConflictList'
import { dexie } from '../../../../dexieClient'
import personSort from '../../../../utils/personSort'
import personLabelFromPerson from '../../../../utils/personLabelFromPerson'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import collectionFromTable from '../../../../utils/collectionFromTable'

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
  const { herkunft: herkunftError } = errors

  const data = useLiveQuery(async () => {
    const userPerson = await dexie.persons.get({
      account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
    })

    const userPersonOption = await dexie.person_options.get(
      userPerson.id ?? '99999999-9999-9999-9999-999999999999',
    )

    return { userPersonOption }
  }, [user.uid])

  const userPersonOption = data?.userPersonOption ?? {}

  // ensure that activeConflict is reset
  // when changing dataset
  useEffect(() => {
    setActiveConflict(null)
  }, [id, setActiveConflict])

  const { hk_kanton, hk_land, hk_bemerkungen, hk_geom_point } =
    userPersonOption ?? {}

  // catch multiple nr's
  useEffect(() => {
    if (showFilter) return
    if (!row.nr && errors.herkunft.nr) {
      return unsetError('herkunft')
    }
    if (!row.nr) return
    dexie.herkunfts
      .where({ _deleted_indexable: 0 })
      .filter((h) => h.nr === row.nr && h.id !== row.id)
      .toArray()
      .then((otherHerkunftsWithSameNr) => {
        if (otherHerkunftsWithSameNr.length > 0) {
          setError({
            table: 'herkunft',
            field: 'nr',
            value: `Diese Nummer wird ${
              otherHerkunftsWithSameNr.length + 1
            } mal verwendet. Sie sollte aber über alle Herkünfte eindeutig sein`,
          })
        } else {
          unsetError('herkunft')
        }
      })
  }, [showFilter, row.nr, row.id, setError, unsetError, errors.herkunft.nr])

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
              error={!showFilter && errors?.herkunft?._deleted}
            />
          ) : (
            <Checkbox2States
              key={`${row.id}_deleted`}
              label="gelöscht"
              name="_deleted"
              value={row._deleted}
              saveToDb={saveToDb}
              error={!showFilter && errors?.herkunft?._deleted}
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
        error={!showFilter && errors?.herkunft?.nr}
      />
      <TextField
        key={`${row.id}lokalname`}
        name="lokalname"
        label="Lokalname"
        value={row.lokalname}
        saveToDb={saveToDb}
        error={!showFilter && errors?.herkunft?.lokalname}
      />
      <TextField
        key={`${row.id}gemeinde`}
        name="gemeinde"
        label="Gemeinde"
        value={row.gemeinde}
        saveToDb={saveToDb}
        error={!showFilter && errors?.herkunft?.gemeinde}
      />
      {hk_kanton && (
        <TextField
          key={`${row.id}kanton`}
          name="kanton"
          label="Kanton"
          value={row.kanton}
          saveToDb={saveToDb}
          error={!showFilter && errors?.herkunft?.kanton}
        />
      )}
      {hk_land && (
        <TextField
          key={`${row.id}land`}
          name="land"
          label="Land"
          value={row.land}
          saveToDb={saveToDb}
          error={!showFilter && errors?.herkunft?.land}
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
          error={!showFilter && errors?.herkunft?.bemerkungen}
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
