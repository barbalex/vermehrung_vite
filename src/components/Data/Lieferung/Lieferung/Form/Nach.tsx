import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'
import uniqBy from 'lodash/uniqBy'

import StoreContext from '../../../../../storeContext'
import Select from '../../../../shared/Select'
import Checkbox2States from '../../../../shared/Checkbox2States'
import JesNo from '../../../../shared/JesNo'
import exists from '../../../../../utils/exists'
import { dexie } from '../../../../../dexieClient'
import kultursSortedFromKulturs from '../../../../../utils/kultursSortedFromKulturs'

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

const LieferungNach = ({ showFilter, row, saveToDb, ifNeeded, herkunft }) => {
  const store = useContext(StoreContext)
  const { errors, filter } = store

  const nachKulturWerte = useLiveQuery(async () => {
    const kulturs = await dexie.kulturs
      .filter((k) => k._deleted === false)
      .toArray()

    const kultursFiltered = kulturs
      // show only kulturen of art_id
      .filter((k) => {
        if (row?.art_id) return k.art_id === row.art_id
        return true
      })
      // show only kulturen with same herkunft
      .filter((k) => {
        if (herkunft?.id) return k.herkunft_id === herkunft.id
        return true
      })
      // shall not be delivered to same kultur it came from
      .filter((k) => {
        if (row?.von_kultur_id && row?.von_kultur_id !== row?.nach_kultur_id) {
          return k.id !== row.von_kultur_id
        }
        return true
      })

    const kultur = await dexie.kulturs.get(
      row.von_kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )

    const kultursIncludingChoosen = uniqBy(
      [...kultursFiltered, ...(kultur && !showFilter ? [kultur] : [])],
      'id',
    )
    const kultursSorted = await kultursSortedFromKulturs(
      kultursIncludingChoosen,
    )
    const nachKulturWerte = await Promise.all(
      kultursSorted.map(async (el) => {
        const label = await el.label()

        return {
          value: el.id,
          label,
        }
      }),
    )

    return nachKulturWerte
  }, [
    filter.kultur._deleted,
    filter.sammlung._deleted,
    herkunft,
    row,
    showFilter,
  ])

  return (
    <>
      <TitleRow data-filter={showFilter}>
        <Title>nach</Title>
      </TitleRow>
      {ifNeeded('nach_kultur_id') && (
        <Select
          key={`${row.id}${row.nach_kultur_id}nach_kultur_id`}
          name="nach_kultur_id"
          value={row.nach_kultur_id}
          field="nach_kultur_id"
          label={`Kultur${
            exists(row.art_id)
              ? ` (Kulturen derselben Art und Herkunft${
                  row.von_kultur_id ? ', ohne die von-Kultur' : ''
                })`
              : ''
          }`}
          options={nachKulturWerte ?? []}
          saveToDb={saveToDb}
          error={errors?.lieferung?.nach_kultur_id}
        />
      )}
      {ifNeeded('nach_ausgepflanzt') && (
        <>
          {showFilter ? (
            <JesNo
              key={`${row.id}nach_ausgepflanzt`}
              label="ausgepflanzt"
              name="nach_ausgepflanzt"
              value={row.nach_ausgepflanzt}
              saveToDb={saveToDb}
              error={errors?.lieferung?.nach_ausgepflanzt}
            />
          ) : (
            <Checkbox2States
              key={`${row.id}nach_ausgepflanzt`}
              label="ausgepflanzt"
              name="nach_ausgepflanzt"
              value={row.nach_ausgepflanzt}
              saveToDb={saveToDb}
              error={errors?.lieferung?.nach_ausgepflanzt}
            />
          )}
        </>
      )}
    </>
  )
}

export default observer(LieferungNach)
