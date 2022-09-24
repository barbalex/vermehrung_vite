import React, { useState, useCallback, useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Menu from '@mui/material/Menu'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../../../storeContext'
import TextField from '../../../../../../shared/TextField'
import ifIsNumericAsNumber from '../../../../../../../utils/ifIsNumericAsNumber'
import exists from '../../../../../../../utils/exists'
import constants from '../../../../../../../utils/constants'
import zaehlungSort from '../../../../../../../utils/zaehlungSort'
import ErrorBoundary from '../../../../../../shared/ErrorBoundary'
import { dexie } from '../../../../../../../dexieClient'

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
const Field = styled.div`
  padding: 0 16px;
`
const Buttons = styled.div`
  padding: 0 16px;
  display: flex;
  justify-content: flex-end;
`

const PrognoseMenu = ({
  onClosePrognosis,
  anchorEl,
  setAnchorEl,
  teilzaehlung,
}) => {
  const store = useContext(StoreContext)
  const { addNotification, insertZaehlungRev, db } = store

  const zaehlung = useLiveQuery(
    async () =>
      await dexie.zaehlungs.get(
        teilzaehlung?.zaehlung_id ?? '99999999-9999-9999-9999-999999999999',
      ),
    [teilzaehlung?.zaehlung_id],
  )

  const kulturId = zaehlung?.kultur_id

  const [jahr, setJahr] = useState(null)
  const [anz, setAnz] = useState(null)

  const [errors, setErrors] = useState({})
  useEffect(() => {
    setErrors({})
  }, [])

  const saveToDb = useCallback(
    async (event) => {
      setErrors({})
      const field = event.target.name
      let value = ifIsNumericAsNumber(event.target.value)
      if (event.target.value === undefined) value = null
      if (event.target.value === '') value = null
      // type is always number so no need to use 'valueToSet'
      // only do something if both values exist
      field === 'anzahl_auspflanzbereit' ? setAnz(value) : setJahr(value)
      const anzAuspflanzbereit =
        field === 'anzahl_auspflanzbereit' ? value : anz
      const yearToUse = field === 'jahr' ? value : jahr
      if (!exists(yearToUse)) return
      if (!(yearToUse > 1900 && yearToUse < 2200)) {
        return setErrors({
          jahr: 'Das Jahr muss zwischen 1900 und 2200 liegen',
        })
      }
      if (!exists(value)) return
      if (!exists(anzAuspflanzbereit)) return
      // we have both values. Let's go on
      // check if zaehlung with date of 15.09. of year exist
      const dateOfZaehlung = `${yearToUse}-09-15`
      const existingZaehlungData = await dexie.zaehlungs
        .where({ kultur_id: kulturId, datum: dateOfZaehlung })
        .filter((z) => z.prognose === true && z._deleted === false)
        .toArray()
      const existingZaehlungDataSorted = existingZaehlungData.sort(zaehlungSort)
      const existingZaehlung = existingZaehlungDataSorted?.[0]
      // if not: create it first
      let newZaehlungId
      // if not: create it first
      if (!existingZaehlung) {
        newZaehlungId = await insertZaehlungRev({
          values: {
            kultur_id: kulturId,
            datum: dateOfZaehlung,
            prognose: true,
          },
        })
      }
      const zaehlungId = existingZaehlung?.id ?? newZaehlungId
      // fetch teilzaehlungen with zaehlung_id === newZaehlungId, then update that
      // if inserting there will be two teilzaehlungs because of server trigger
      const interval = setInterval(async () => {
        const newTzs = await dexie.teilzaehlungs
          .where({ zaehlung_id: zaehlungId })
          .toArray()
        const newTz = newTzs?.[0]
        if (newTz) {
          clearInterval(interval)
          await newTz.edit({
            field: 'anzahl_auspflanzbereit',
            value: anzAuspflanzbereit,
            store,
          })
          addNotification({
            message: 'Die Prognose wurde gespeichert',
            type: 'info',
          })
        }
        setAnchorEl(null)
        setErrors({})
      }, 200)
    },
    [
      addNotification,
      anz,
      insertZaehlungRev,
      jahr,
      kulturId,
      setAnchorEl,
      store,
    ],
  )
  const onClickAbbrechen = useCallback(() => setAnchorEl(null), [setAnchorEl])
  const openDocs = useCallback(() => {
    const url = `${constants?.getAppUri()}/Dokumentation/Planen`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }, [])

  return (
    <ErrorBoundary>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClosePrognosis}
      >
        <TitleRow>
          <Title>Prognose für diese Teil-Zählung:</Title>
          <div>
            <IconButton
              aria-label="Anleitung öffnen"
              title="Anleitung öffnen"
              onClick={openDocs}
              size="large"
            >
              <IoMdInformationCircleOutline />
            </IconButton>
          </div>
        </TitleRow>
        <Field>
          <TextField
            key="jahr"
            name="jahr"
            label="Jahr"
            value=""
            saveToDb={saveToDb}
            error={errors.jahr}
            type="number"
            autoFocus
          />
        </Field>
        <Field>
          <TextField
            key="anzahl_auspflanzbereit"
            name="anzahl_auspflanzbereit"
            label="Anzahl auspflanz-bereit"
            value=""
            saveToDb={saveToDb}
            error={errors.anzahl_auspflanzbereit}
            type="number"
          />
        </Field>
        <Buttons>
          <Button onClick={onClickAbbrechen} color="inherit">
            abbrechen
          </Button>
          <Button onClick={onClickAbbrechen} color="inherit">
            speichern
          </Button>
        </Buttons>
      </Menu>
    </ErrorBoundary>
  )
}

export default observer(PrognoseMenu)
