import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import uniqBy from 'lodash/uniqBy'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import Select from '../../../../shared/Select'
import exists from '../../../../../utils/exists'
import kultursSortedFromKulturs from '../../../../../utils/kultursSortedFromKulturs'
import sammlungsSortedFromSammlungs from '../../../../../utils/sammlungsSortedFromSammlungs'
import herkunftLabelFromHerkunft from '../../../../../utils/herkunftLabelFromHerkunft'
import collectionFromTable from '../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../utils/addTotalCriteriaToWhere'

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
const Herkunft = styled.div`
  height: 54px;
  user-select: none;
  ${(props) => !props['data-active'] && 'color: #c1c1c1;'}
`
const HerkunftLabel = styled.div`
  color: rgb(0, 0, 0, 0.54);
  font-size: 12px;
  padding-bottom: 2px;
`

const LieferungVon = ({
  showFilter,
  row,
  saveToDb,
  ifNeeded,
  herkunft,
  herkunftQuelle,
}) => {
  const store = useContext(StoreContext)
  const { errors, filter } = store

  const data = useLiveQuery(async () => {
    const [kulturs, sammlungs] = await Promise.all([
      collectionFromTable({
        table: 'kultur',
        where: addTotalCriteriaToWhere({ store, table: 'kultur' }),
      }).toArray(),
      collectionFromTable({
        table: 'sammlung',
        where: addTotalCriteriaToWhere({ store, table: 'sammlung' }),
      }).toArray(),
    ])

    const herkunftLabel =
      herkunftLabelFromHerkunft({ herkunft }) ??
      '(verfügbar, wenn Sammlung oder Kultur gewählt)'
    const kultursFiltered = kulturs
      // show only kulturen of art_id
      .filter((k) => {
        if (row?.art_id) return k.art_id === row.art_id
        return true
      })
      // show only kulturen with same herkunft
      .filter((k) => {
        if (herkunft) return k?.herkunft_id === herkunft.id
        return true
      })
      // shall not be delivered to same kultur it came from
      .filter((k) => {
        if (row?.nach_kultur_id && row?.von_kultur_id !== row?.nach_kultur_id) {
          return k.id !== row.nach_kultur_id
        }
        return true
      })

    const kultur = await row.vonKultur()
    const kultursIncludingChoosen = uniqBy(
      [...kultursFiltered, ...(kultur && !showFilter ? [kultur] : [])],
      'id',
    )
    const kultursSorted = await kultursSortedFromKulturs(
      kultursIncludingChoosen,
    )
    const vonKulturWerte = await Promise.all(
      kultursSorted.map(async (el) => {
        const label = await el.label()

        return {
          value: el.id,
          label,
        }
      }),
    )
    const sammlung = await row.sammlung()
    const sammlungsIncludingChoosen = uniqBy(
      [...sammlungs, ...(sammlung && !showFilter ? [sammlung] : [])],
      'id',
    )
    const sammlungsSorted = await sammlungsSortedFromSammlungs(
      sammlungsIncludingChoosen,
    )
    const sammlungWerte = await Promise.all(
      sammlungsSorted.map(async (el) => {
        const label = await el.label()

        return {
          value: el.id,
          label,
        }
      }),
    )

    return {
      herkunftLabel,
      vonKulturWerte,
      sammlungWerte,
    }
  }, [
    filter.kultur._deleted,
    filter.sammlung._deleted,
    herkunft,
    row?.art_id,
    row?.nach_kultur_id,
    row?.von_kultur_id,
    row?.von_sammlung_id,
    showFilter,
  ])

  const herkunftLabel = data?.herkunftLabel ?? ''
  const vonKulturWerte = data?.vonKulturWerte ?? []
  const sammlungWerte = data?.sammlungWerte ?? []

  if (!row) return null

  return (
    <>
      <TitleRow data-filter={showFilter}>
        <Title>von</Title>
      </TitleRow>
      {ifNeeded('von_sammlung_id') && (
        <Select
          key={`${row.id}${row.von_sammlung_id}von_sammlung_id`}
          name="von_sammlung_id"
          value={row.von_sammlung_id}
          field="von_sammlung_id"
          label={`Sammlung${
            exists(row.art_id) ? ' (nur solche derselben Art)' : ''
          }`}
          options={sammlungWerte}
          saveToDb={saveToDb}
          error={errors?.lieferung?.von_sammlung_id}
        />
      )}
      {ifNeeded('von_kultur_id') && (
        <Select
          key={`${row.id}${row.von_kultur_id}von_kultur_id`}
          name="von_kultur_id"
          value={row.von_kultur_id}
          field="von_kultur_id"
          label={`Kultur${
            exists(row.art_id) ? ' (nur solche derselben Art)' : ''
          }`}
          options={vonKulturWerte}
          saveToDb={saveToDb}
          error={errors?.lieferung?.von_kultur_id}
        />
      )}
      <Herkunft data-active={!!herkunft}>
        <HerkunftLabel>
          {herkunft ? `Herkunft (aus ${herkunftQuelle})` : 'Herkunft'}
        </HerkunftLabel>
        {herkunftLabel}
      </Herkunft>
    </>
  )
}

export default observer(LieferungVon)
