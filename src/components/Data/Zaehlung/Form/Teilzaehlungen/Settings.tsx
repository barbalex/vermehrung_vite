import React, { useContext, useCallback, useState } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { FaCog } from 'react-icons/fa'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import constants from '../../../../../utils/constants'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import { dexie } from '../../../../../dexieClient'

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

const SettingsTeilzaehlungen = ({ kulturId }) => {
  const store = useContext(StoreContext)

  const kulturOption = useLiveQuery(
    async () => await dexie.kultur_options.get(kulturId),
    [kulturId],
  )

  const {
    tz_teilkultur_id,
    tz_andere_menge,
    tz_auspflanzbereit_beschreibung,
    tz_bemerkungen,
  } = kulturOption ?? {}

  const saveToDb = useCallback(
    async (event) => {
      const field = event.target.name
      const value = event.target.value === 'false'
      kulturOption.edit({ field, value, store })
    },
    [kulturOption, store],
  )
  const openSettingsDocs = useCallback(() => {
    setAnchorEl(null)
    const url = `${constants?.getAppUri()}/Dokumentation/Felder-blenden`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }, [])

  const [anchorEl, setAnchorEl] = useState(null)
  const onClose = useCallback(() => setAnchorEl(null), [])
  const onClickConfig = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    [],
  )

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="Felder w??hlen"
        aria-owns={anchorEl ? 'long-menu' : null}
        aria-haspopup="true"
        title="Felder w??hlen"
        onClick={onClickConfig}
        size="large"
      >
        <FaCog />
      </IconButton>
      {
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onClose}
        >
          <TitleRow>
            <Title>Felder f??r Teil-Z??hlungen w??hlen:</Title>
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
              value={tz_teilkultur_id === true ? 'true' : 'false'}
              control={
                <Checkbox
                  color="primary"
                  checked={tz_teilkultur_id}
                  onClick={saveToDb}
                  name="tz_teilkultur_id"
                />
              }
              label="Teilkultur"
              labelPlacement="end"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              value={tz_andere_menge === true ? 'true' : 'false'}
              control={
                <Checkbox
                  color="primary"
                  checked={tz_andere_menge}
                  onClick={saveToDb}
                  name="tz_andere_menge"
                />
              }
              label={`Andere Menge (z.B. "3 Zwiebeln")`}
              labelPlacement="end"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              value={
                tz_auspflanzbereit_beschreibung === true ? 'true' : 'false'
              }
              control={
                <Checkbox
                  color="primary"
                  checked={tz_auspflanzbereit_beschreibung}
                  onClick={saveToDb}
                  name="tz_auspflanzbereit_beschreibung"
                />
              }
              label="Beschreibung auspflanzbereite Pflanzen (z.B. Topfgr??sse)"
              labelPlacement="end"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              value={tz_bemerkungen === true ? 'true' : 'false'}
              control={
                <Checkbox
                  color="primary"
                  checked={tz_bemerkungen}
                  onClick={saveToDb}
                  name="tz_bemerkungen"
                />
              }
              label="Bemerkungen"
              labelPlacement="end"
            />
          </MenuItem>
          <Info>
            Zwingende Felder sind nicht aufgelistet.
            <br />
            Die Wahl gilt (nur) f??r diese Kultur.
          </Info>
        </Menu>
      }
    </ErrorBoundary>
  )
}

export default observer(SettingsTeilzaehlungen)
