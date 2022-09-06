import React, { useCallback, useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { motion, useAnimation } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import Person from './Person'
import Select from '../../../../shared/Select'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import avsSortByPerson from '../../../../../utils/avsSortByPerson'
import personSort from '../../../../../utils/personSort'
import personLabelFromPerson from '../../../../../utils/personLabelFromPerson'
import constants from '../../../../../utils/constants'
import { dexie, Avs } from '../../../../../dexieClient'
import totalFilter from '../../../../../utils/totalFilter'

const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  margin-left: -10px;
  margin-right: -10px;
  margin-bottom: 10px;
  padding: 0 10px;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1;
  &:first-of-type {
    margin-top: -10px;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const Aven = styled.div`
  padding-bottom: 8px;
`

const ArtPersonen = ({ art }) => {
  const store = useContext(StoreContext)
  const { insertAvRev, errors, unsetError } = store

  useEffect(() => unsetError('av'), [art.id, unsetError])

  const [open, setOpen] = useState(false)
  const anim = useAnimation()
  const onClickToggle = useCallback(
    async (e) => {
      e.stopPropagation()
      if (open) {
        const was = open
        await anim.start({ opacity: 0 })
        await anim.start({ height: 0 })
        setOpen(!was)
      } else {
        setOpen(!open)
        setTimeout(async () => {
          await anim.start({ height: 'auto' })
          await anim.start({ opacity: 1 })
        })
      }
    },
    [anim, open],
  )

  const data = useLiveQuery(async () => {
    const [avs, persons] = await Promise.all([
      dexie.avs
        .filter((val) => val._deleted === false && val.art_id === art.id)
        .toArray(),
      dexie.persons
        .filter((value) => totalFilter({ value, store, table: 'person' }))
        .toArray(),
    ])

    const avsSorted = await avsSortByPerson(avs)
    const avPersonIds = avsSorted.map((v) => v.person_id)
    const personWerte = persons
      .filter((a) => !avPersonIds.includes(a.id))
      .sort(personSort)
      .map((el) => ({
        value: el.id,
        label: personLabelFromPerson({ person: el }),
      }))

    return { avsSorted, personWerte }
  }, [store.filter.art, store.art_initially_queried])

  const avsSorted: Avs[] = data?.avsSorted ?? []
  const personWerte = data?.personWerte ?? []

  const saveToDb = useCallback(
    async (event) => {
      insertAvRev({ values: { art_id: art.id, person_id: event.target.value } })
    },
    [art.id, insertAvRev],
  )

  return (
    <ErrorBoundary>
      <TitleRow onClick={onClickToggle} title={open ? 'schliessen' : 'öffnen'}>
        <Title>{`Mitarbeitende Personen (${avsSorted.length})`}</Title>
        <div>
          <IconButton
            aria-label={open ? 'schliessen' : 'öffnen'}
            title={open ? 'schliessen' : 'öffnen'}
            onClick={onClickToggle}
            size="large"
          >
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </IconButton>
        </div>
      </TitleRow>
      <motion.div animate={anim} transition={{ type: 'just', duration: 0.2 }}>
        {open && (
          <>
            <Aven>
              {avsSorted.map((av, index) => (
                <Person key={`${av.art_id}/${av.person_id}/${index}`} av={av} />
              ))}
            </Aven>
            {!!personWerte.length && (
              <Select
                name="person_id"
                value={''}
                field="person_id"
                label="Person hinzufügen"
                options={personWerte}
                saveToDb={saveToDb}
                isClearable={false}
                error={errors?.av?.person_id}
              />
            )}
          </>
        )}
      </motion.div>
    </ErrorBoundary>
  )
}

export default observer(ArtPersonen)
