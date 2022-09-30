import React, { useCallback, useContext, useMemo } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import Checkbox from '@mui/material/Checkbox'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../../storeContext'
import { dexie } from '../../../../../../dexieClient'

const Row = styled.div`
  display: flex;
  padding: 5px;
  border-bottom: 1px solid #e8e8e8;
  min-height: 52px;
`
const Check = styled.div`
  padding: 0 5px;
`
const Titel = styled.div`
  padding: 0 5px;
  display: flex;
  align-items: center;
`
const Beschreibung = styled.div`
  padding: 0 5px;
  display: flex;
  align-items: center;
`

const ChooseKulturQkRow = ({ qk }) => {
  const store = useContext(StoreContext)
  const { user } = store

  const data = useLiveQuery(async () => {
    const person = await dexie.persons.get({
      account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
    })
    const personOption = await person?.personOption()
    const kulturQks = await dexie.kultur_qks
      .where({ __deleted_indexable: 0 })
      .toArray()

    return { personOption, kulturQkChoosen: kulturQks.map((q) => q.id) }
  }, [user.uid])

  const userPersonOption = data?.personOption
  const kulturQkChoosen = useMemo(
    () => userPersonOption?.kultur_qk_choosen ?? [],
    [userPersonOption?.kultur_qk_choosen],
  )
  const checked = kulturQkChoosen.includes(qk.id)

  const onChange = useCallback(() => {
    const newValue = event.target.checked
      ? [...kulturQkChoosen, qk.id]
      : kulturQkChoosen.filter((id) => id !== qk.id)

    userPersonOption.edit({
      field: 'kultur_qk_choosen',
      value: newValue,
      store,
    })
  }, [kulturQkChoosen, qk.id, store, userPersonOption])

  if (!kulturQkChoosen) return null

  return (
    <Row>
      <Check>
        <Checkbox checked={checked} onChange={onChange} color="primary" />
      </Check>
      <Titel>{qk.titel}</Titel>
      <Beschreibung>{qk.beschreibung}</Beschreibung>
    </Row>
  )
}

export default observer(ChooseKulturQkRow)
