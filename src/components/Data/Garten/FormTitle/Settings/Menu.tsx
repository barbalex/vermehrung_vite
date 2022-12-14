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

import StoreContext from '../../../../../storeContext'
import constants from '../../../../../utils/constants'
import { dexie } from '../../../../../dexieClient'

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
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

const SettingsGartenMenu = ({ anchorEl, setAnchorEl }) => {
  const store = useContext(StoreContext)
  const { user } = store

  const userPersonOption = useLiveQuery(async () => {
    const person = await dexie.persons.get({ account_id: user.uid ?? '99999999-9999-9999-9999-999999999999' })
    const personOption: PersonOption = await dexie.person_options.get(person.id)

    return personOption
  }, [user.uid])

  const {
    ga_strasse,
    ga_plz,
    ga_ort,
    ga_geom_point,
    ga_lat_lng,
    ga_aktiv,
    ga_bemerkungen,
  } = userPersonOption ?? {}

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
        <Title>Felder f??r G??rten w??hlen:</Title>
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
          value={ga_strasse === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={ga_strasse}
              onClick={saveToDb}
              name="ga_strasse"
            />
          }
          label="Strasse"
          labelPlacement="end"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          value={ga_plz === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={ga_plz}
              onClick={saveToDb}
              name="ga_plz"
            />
          }
          label="PLZ"
          labelPlacement="end"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          value={ga_ort === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={ga_ort}
              onClick={saveToDb}
              name="ga_ort"
            />
          }
          label="Ort"
          labelPlacement="end"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          value={ga_geom_point === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={ga_geom_point}
              onClick={saveToDb}
              name="ga_geom_point"
            />
          }
          label="Koordinaten"
          labelPlacement="end"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          value={ga_lat_lng === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={ga_lat_lng}
              onClick={saveToDb}
              name="ga_lat_lng"
            />
          }
          label="L??ngen- und Breitengrade"
          labelPlacement="end"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          value={ga_aktiv === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={ga_aktiv}
              onClick={saveToDb}
              name="ga_aktiv"
            />
          }
          label="aktiv"
          labelPlacement="end"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          value={ga_bemerkungen === true ? 'true' : 'false'}
          control={
            <Checkbox
              color="primary"
              checked={ga_bemerkungen}
              onClick={saveToDb}
              name="ga_bemerkungen"
            />
          }
          label="Bemerkungen"
          labelPlacement="end"
        />
      </MenuItem>
      <Info>
        Zwingende Felder sind nicht aufgelistet.
        <br />
        Die Wahl gilt f??r alle G??rten.
      </Info>
    </Menu>
  )
}

export default observer(SettingsGartenMenu)
