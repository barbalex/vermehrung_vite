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
import Zaehlungen from './Zaehlungen'
import Events from './Events'
import ErrorBoundary from '../../../shared/ErrorBoundary'
import ConflictList from '../../../shared/ConflictList'
import kultursSortedFromKulturs from '../../../../utils/kultursSortedFromKulturs'
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

const TeilkulturForm = ({
  showFilter,
  id,
  row,
  activeConflict,
  setActiveConflict,
  showHistory,
}) => {
  const store = useContext(StoreContext)
  const { filter, online, errors, unsetError } = store

  useEffect(() => {
    unsetError('teilkultur')
  }, [id, unsetError])

  const data = useLiveQuery(async () => {
    const [kulturs, kultur, kulturOption] = await Promise.all([
      dexie.kulturs
        .filter((value) => totalFilter({ value, store, table: 'kultur' }))
        .toArray(),
      dexie.kulturs.get(
        row.kultur_id ?? '99999999-9999-9999-9999-999999999999',
      ),
      dexie.kultur_options.get(
        row.kultur_id ?? '99999999-9999-9999-9999-999999999999',
      ),
    ])

    // need to show a choosen kultur even if inactive but not if deleted
    const kultursIncludingChoosen = uniqBy(
      [...kulturs, ...(kultur && !showFilter ? [kultur] : [])],
      'id',
    )
    const kultursSorted = await kultursSortedFromKulturs(
      kultursIncludingChoosen,
    )
    const kulturWerte = await Promise.all(
      kultursSorted.map(async (el) => {
        const label = await el.label()

        return {
          value: el.id,
          label,
        }
      }),
    )

    return { kulturWerte, kulturOption }
  }, [
    filter.kultur._deleted,
    filter.kultur.aktiv,
    row.kultur,
    row.kultur_id,
    showFilter,
  ])

  const kulturWerte = data?.kulturWerte ?? []
  const kulturOption = data?.kulturOption

  const { tk_bemerkungen } = kulturOption ?? {}

  const saveToDb = useCallback(
    async (event) => {
      const field = event.target.name
      let value = ifIsNumericAsNumber(event.target.value)
      if (event.target.value === undefined) value = null
      if (event.target.value === '') value = null

      if (showFilter) {
        return filter.setValue({ table: 'teilkultur', key: field, value })
      }

      const previousValue = ifIsNumericAsNumber(row[field])
      // only update if value has changed
      if (value === previousValue) return
      row.edit({ field, value, store })
    },
    [filter, row, showFilter, store],
  )
  const showDeleted = filter.teilkultur._deleted !== false || row?._deleted

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
                error={errors?.teilkultur?._deleted}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}_deleted`}
                label="gelöscht"
                name="_deleted"
                value={row._deleted}
                saveToDb={saveToDb}
                error={errors?.teilkultur?._deleted}
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
          error={errors?.teilkultur?.kultur_id}
        />
        <TextField
          key={`${row.id}name`}
          name="name"
          label="Name"
          value={row.name}
          saveToDb={saveToDb}
          error={errors?.teilkultur?.name}
        />
        <TextField
          key={`${row.id}ort1`}
          name="ort1"
          label="Ort 1"
          value={row.ort1}
          saveToDb={saveToDb}
          error={errors?.teilkultur?.ort1}
        />
        <TextField
          key={`${row.id}ort2`}
          name="ort2"
          label="Ort 2"
          value={row.ort2}
          saveToDb={saveToDb}
          error={errors?.teilkultur?.ort2}
        />
        <TextField
          key={`${row.id}ort3`}
          name="ort3"
          label="Ort 3"
          value={row.ort3}
          saveToDb={saveToDb}
          error={errors?.teilkultur?.ort3}
        />
        {(tk_bemerkungen || showFilter) && (
          <TextField
            key={`${row.id}bemerkungen`}
            name="bemerkungen"
            label="Bemerkungen"
            value={row.bemerkungen}
            saveToDb={saveToDb}
            error={errors?.teilkultur?.bemerkungen}
            multiline
          />
        )}
        {online && !showFilter && row?._conflicts?.map && (
          <ConflictList
            conflicts={row._conflicts}
            activeConflict={activeConflict}
            setActiveConflict={setActiveConflict}
          />
        )}
        {!showFilter && row.kultur_id && (
          <>
            <Zaehlungen teilkultur={row} />
            <Events teilkultur={row} />
          </>
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(TeilkulturForm)
