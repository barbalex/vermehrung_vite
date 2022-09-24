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

const ChooseArtQkRow = ({ qk }) => {
  const store = useContext(StoreContext)
  const { user } = store

  const data = useLiveQuery(async () => {
    const person = await dexie.persons.get({
      account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
    })
    const personOption = await dexie.person_options.get(person.id)
    const artQks = await dexie.art_qks
      .filter((q) => q._deleted === false)
      .toArray()

    return { personOption, artQkChoosen: artQks.map((q) => q.id) }
  }, [user.uid])

  const userPersonOption = data?.personOption
  const artQkChoosen = useMemo(
    () => data?.artQkChoosen ?? [],
    [data?.artQkChoosen],
  )
  const checked = artQkChoosen.includes(qk.id)

  const onChange = useCallback(
    (event) => {
      const newValue = event.target.checked
        ? [...artQkChoosen, qk.id]
        : artQkChoosen.filter((id) => id !== qk.id)

      userPersonOption.edit({
        field: 'art_qk_choosen',
        value: newValue,
        store,
      })
    },
    [artQkChoosen, qk.id, store, userPersonOption],
  )

  return (
    <Row>
      <Check>
        <Checkbox checked={checked} onChange={onChange} color="primary" />
      </Check>
      <Titel>{qk?.titel}</Titel>
      {!!qk?.beschreibung && <Beschreibung>{qk?.beschreibung}</Beschreibung>}
    </Row>
  )
}

export default observer(ChooseArtQkRow)
