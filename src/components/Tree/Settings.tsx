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

import StoreContext from '../../storeContext'
import constants from '../../utils/constants'
import ErrorBoundary from '../shared/ErrorBoundary'
import { dexie } from '../../dexieClient'

const Container = styled.div`
  position: absolute;
  top: 2px;
  right: 12px;
  z-index: 1;
`
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

const SettingsTree = () => {
  const store = useContext(StoreContext)
  const { user } = store

  const userPersonOption = useLiveQuery(async () => {
    const person = await dexie.persons.get({
      account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
    })
    const personOption: PersonOption = await person?.personOption()

    return personOption
  }, [user.uid])

  const {
    tree_kultur,
    tree_teilkultur,
    tree_zaehlung,
    tree_lieferung,
    tree_event,
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
    const url = `${constants?.getAppUri()}/Dokumentation/Ordner-blenden`
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
      <Container>
        <IconButton
          aria-label="Ordner w??hlen"
          aria-owns={anchorEl ? 'long-menu' : null}
          aria-haspopup="true"
          title="Ordner w??hlen"
          onClick={onClickConfig}
          size="large"
        >
          <FaCog />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onClose}
        >
          <TitleRow>
            <Title>Fakultative Ordner w??hlen:</Title>
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
              value={tree_kultur === true ? 'true' : 'false'}
              control={
                <Checkbox
                  color="primary"
                  checked={tree_kultur}
                  onClick={saveToDb}
                  name="tree_kultur"
                />
              }
              label="Kulturen"
              labelPlacement="end"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              value={tree_teilkultur === true ? 'true' : 'false'}
              control={
                <Checkbox
                  color="primary"
                  checked={tree_teilkultur}
                  onClick={saveToDb}
                  name="tree_teilkultur"
                />
              }
              label="Teilkulturen"
              labelPlacement="end"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              value={tree_zaehlung === true ? 'true' : 'false'}
              control={
                <Checkbox
                  color="primary"
                  checked={tree_zaehlung}
                  onClick={saveToDb}
                  name="tree_zaehlung"
                />
              }
              label="Z??hlungen"
              labelPlacement="end"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              value={tree_lieferung === true ? 'true' : 'false'}
              control={
                <Checkbox
                  color="primary"
                  checked={tree_lieferung}
                  onClick={saveToDb}
                  name="tree_lieferung"
                />
              }
              label="Lieferungen"
              labelPlacement="end"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              value={tree_event === true ? 'true' : 'false'}
              control={
                <Checkbox
                  color="primary"
                  checked={tree_event}
                  onClick={saveToDb}
                  name="tree_event"
                />
              }
              label="Events"
              labelPlacement="end"
            />
          </MenuItem>
          <Info>
            F??r die Navigation zwingende Ordner sind nicht aufgelistet.
          </Info>
        </Menu>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(SettingsTree)
