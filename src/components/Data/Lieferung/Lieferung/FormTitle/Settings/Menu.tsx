import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../../storeContext'
import constants from '../../../../../../utils/constants'
import { dexie, PersonOption } from '../../../../../../dexieClient'

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
const Info = styled.div`
  padding: 12px 16px;
  color: rgba(0, 0, 0, 0.4);
  user-select: none;
`

const SettingsLieferungMenu = ({ anchorEl, setAnchorEl }) => {
  const store = useContext(StoreContext)
  const { user } = store

  const userPersonOption = useLiveQuery(async () => {
    const person = await dexie.persons.get({
      account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
    })
    const personOption: PersonOption = await person?.personOption()

    return personOption
  }, [user.uid])

  const { li_show_sl_felder, li_show_sl } = userPersonOption ?? {}

  const saveToDb = useCallback(
    async (event) => {
      const field = event.target.name
      const value = event.target.value === 'false'
      userPersonOption.edit({ field, value, store })
    },
    [store, userPersonOption],
  )
  const openSettingsDocs = useCallback(() => {
    setAnchorEl(null)
    const url = `${constants?.getAppUri()}/Dokumentation/Felder-blenden`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }, [setAnchorEl])

  const onClose = useCallback(() => setAnchorEl(null), [setAnchorEl])

  return (
    <Menu
      id="long-menu"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <TitleRow>
        <Title>Optionen f??r Lieferungen w??hlen:</Title>
        <div>
          <IconButton
            aria-label="Anleitung ??ffnen"
            title="Anleitung ??ffnen"
            onClick={openSettingsDocs}
            size="large"
          >
            <IoMdInformationCircleOutline />
          </IconButton>
        </div>
      </TitleRow>
      <MenuItem>
        <FormControlLabel
          value={li_show_sl === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={li_show_sl}
              onClick={saveToDb}
              name="li_show_sl"
            />
          }
          label="Sammel-Lieferung rechts neben der Lieferung anzeigen"
          labelPlacement="end"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          value={li_show_sl_felder === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={li_show_sl_felder}
              onClick={saveToDb}
              name="li_show_sl_felder"
            />
          }
          label="Felder anzeigen, deren Werte in der Sammel-Lieferung gesetzt wurden"
          labelPlacement="end"
        />
      </MenuItem>
      <Info>Die Wahl gilt f??r alle Lieferungen.</Info>
    </Menu>
  )
}

export default observer(SettingsLieferungMenu)
