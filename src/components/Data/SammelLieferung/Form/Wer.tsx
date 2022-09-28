import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import uniqBy from 'lodash/uniqBy'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import Select from '../../../shared/Select'
import TextField from '../../../shared/TextField'
import personLabelFromPerson from '../../../../utils/personLabelFromPerson'
import personSort from '../../../../utils/personSort'
import { dexie } from '../../../../dexieClient'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'

const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const TitleRow = styled.div`
  background-color: ${(props) =>
    props['data-filter'] ? '#ffe0b2' : 'rgba(248, 243, 254, 1)'};
  flex-shrink: 0;
  display: flex;
  height: 40px;
  justify-content: space-between;
  margin-left: -10px;
  margin-right: -10px;
  margin-bottom: 10px;
  padding: 0 10px;
  position: sticky;
  top: 0;
  user-select: none;
  z-index: 1;
  &:first-of-type {
    margin-top: -10px;
  }
`

const SammelLieferungWer = ({ showFilter, ifNeeded, saveToDb, row }) => {
  const store = useContext(StoreContext)
  const { errors, filter } = store

  const data = useLiveQuery(async () => {
    const [persons, person] = await Promise.all([
      collectionFromTable({
        table: 'person',
        where: addTotalCriteriaToWhere({ table: 'person', store }),
      }).toArray(),
      row.person(),
    ])

    const personsIncludingChoosen = uniqBy(
      [...persons, ...(person && !showFilter ? [person] : [])],
      'id',
    )
    const personWerte = personsIncludingChoosen.sort(personSort).map((el) => ({
      value: el.id,
      label: personLabelFromPerson({ person: el }),
    }))

    return { row: showFilter ? filter.lieferung : row, personWerte }
  }, [
    filter.lieferung,
    filter.person._deleted,
    filter.person.aktiv,
    row,
    showFilter,
  ])
  const personWerte = data?.personWerte ?? []

  if (!row) return null

  return (
    <>
      <TitleRow data-filter={showFilter}>
        <Title>wer</Title>
      </TitleRow>
      {ifNeeded('person_id') && (
        <Select
          key={`${row.id}person_id`}
          name="person_id"
          value={row.person_id}
          field="person_id"
          label="Person"
          options={personWerte}
          saveToDb={saveToDb}
          error={errors?.sammel_lieferung?.person_id}
        />
      )}
      {ifNeeded('bemerkungen') && (
        <TextField
          key={`${row.id}bemerkungen`}
          name="bemerkungen"
          label="Bemerkungen"
          value={row.bemerkungen}
          saveToDb={saveToDb}
          error={errors?.sammel_lieferung?.bemerkungen}
          multiLine
        />
      )}
    </>
  )
}

export default observer(SammelLieferungWer)
