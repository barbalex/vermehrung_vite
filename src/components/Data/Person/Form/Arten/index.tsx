import React, { useCallback, useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { motion, useAnimation } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import Art from './Art'
import Select from '../../../../shared/Select'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import artsSortedFromArts from '../../../../../utils/artsSortedFromArts'
import avsSortByArt from '../../../../../utils/avsSortByArt'
import constants from '../../../../../utils/constants'
import { dexie } from '../../../../../dexieClient'
import collectionFromTable from '../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../utils/addTotalCriteriaToWhere'

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
const Avs = styled.div`
  padding-bottom: 8px;
`

const PersonArten = ({ person }) => {
  const store = useContext(StoreContext)
  const { insertAvRev } = store

  const [errors, setErrors] = useState({})
  useEffect(() => setErrors({}), [person])

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
    const avs = await collectionFromTable({
      table: 'av',
      where: addTotalCriteriaToWhere({
        table: 'av',
        store,
        where: { person_id: person.id },
      }),
    }).toArray()
    const avsSorted = await avsSortByArt(avs)
    const avArtIds = [...new Set(avs.map((v) => v.art_id))]
    const arts = await dexie.arts
      .where('[id+__deleted_indexable]')
      .noneOf(avArtIds.map((id) => [id, 0]))
      .toArray()
    const artsSorted = await artsSortedFromArts(arts)
    const artWerte = await Promise.all(
      artsSorted.map(async (art) => {
        const label = await art.label()

        return {
          value: art.id,
          label,
        }
      }),
    )

    return { avs: avsSorted, artWerte }
  }, [person])

  const avs = data?.avs ?? []
  const artWerte = data?.artWerte ?? []

  const saveToDb = useCallback(
    async (event) => {
      insertAvRev({
        values: { person_id: person.id, art_id: event.target.value },
      })
      setErrors({})
    },
    [insertAvRev, person.id],
  )

  // console.log('Person Arten, avs:', avs)

  return (
    <ErrorBoundary>
      <TitleRow onClick={onClickToggle} title={open ? 'schliessen' : 'öffnen'}>
        <Title>{`Mitarbeitend bei ${avs.length} Arten`}</Title>
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
            <Avs>
              {avs.map((av, index) => (
                <Art key={`${av.person_id}/${av.art_id}/${index}`} av={av} />
              ))}
            </Avs>
            {!!artWerte.length && (
              <Select
                name="art_id"
                value={''}
                field="art_id"
                label="Art hinzufügen"
                options={artWerte}
                saveToDb={saveToDb}
                isClearable={false}
                error={errors.art_id}
              />
            )}
          </>
        )}
      </motion.div>
    </ErrorBoundary>
  )
}

export default observer(PersonArten)
