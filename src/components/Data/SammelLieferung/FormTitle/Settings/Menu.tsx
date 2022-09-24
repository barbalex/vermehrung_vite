import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import { dexie, PersonOption } from '../../../../../dexieClient'

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding-right: 16px;
  user-select: none;
`
const Title = styled.div`
  padding: 12px 16px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 700;
  user-select: none;
`

const SettingsSammelLieferungMenu = ({ anchorEl, setAnchorEl }) => {
  const store = useContext(StoreContext)
  const { user } = store

  const data = useLiveQuery(async () => {
    const person = await dexie.persons.get({ account_id: user.uid ?? '99999999-9999-9999-9999-999999999999' })
    const personOption: PersonOption = await dexie.person_options.get(person.id)

    return { personOption }
  }, [user])

  const { sl_show_empty_when_next_to_li, sl_auto_copy_edits } =
    data?.personOption ?? {}

  const saveToDb = useCallback(
    async (event) => {
      const field = event.target.name
      const value = event.target.value === 'false'
      userPersonOption.edit({ field, value, store })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, user],
  )

  const onClose = useCallback(() => setAnchorEl(null), [setAnchorEl])

  return (
    <Menu
      id="long-menu"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <TitleRow>
        <Title>Optionen für Sammel-Lieferungen wählen:</Title>
      </TitleRow>
      <MenuItem>
        <FormControlLabel
          value={sl_show_empty_when_next_to_li === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={sl_show_empty_when_next_to_li}
              onClick={saveToDb}
              name="sl_show_empty_when_next_to_li"
            />
          }
          label="Felder mit Leer-Werten anzeigen (wenn neben einer Lieferung angezeigt)"
          labelPlacement="end"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          value={sl_auto_copy_edits === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={sl_auto_copy_edits}
              onClick={saveToDb}
              name="sl_auto_copy_edits"
            />
          }
          label="Änderungen automatisch in alle Lieferungen kopieren"
          labelPlacement="end"
        />
      </MenuItem>
    </Menu>
  )
}

export default observer(SettingsSammelLieferungMenu)
