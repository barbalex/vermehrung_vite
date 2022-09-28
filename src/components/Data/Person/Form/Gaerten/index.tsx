import React, { useCallback, useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { motion, useAnimation } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import Garten from './Garten'
import Select from '../../../../shared/Select'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import gartensSortedFromGartens from '../../../../../utils/gartensSortedFromGartens'
import gvsSortByGarten from '../../../../../utils/gvsSortByGarten'
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
const Gvs = styled.div`
  padding-bottom: 8px;
`

const PersonArten = ({ person }) => {
  const store = useContext(StoreContext)
  const { insertGvRev, filter } = store

  const [errors, setErrors] = useState({})
  useEffect(() => setErrors({}), [person.id])

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
    const gvs = await collectionFromTable({
      table: 'gv',
      where: addTotalCriteriaToWhere({
        table: 'gv',
        store,
        where: { person_id: person.id },
      }),
    }).toArray()
    const gvsSorted = await gvsSortByGarten(gvs)
    const gvGartenIds = gvs.map((v) => v.garten_id)

    const gartens = await dexie.gartens
      .where('[id+aktiv_indexable+_deleted_indexable]')
      .noneOf(gvGartenIds.map((id) => [id, 1, 0]))
      .toArray()
    const gartensSorted = await gartensSortedFromGartens(gartens)
    const gartenWerte = await Promise.all(
      gartensSorted.map(async (garten) => {
        const label = await garten.label()

        return {
          value: garten.id,
          label,
        }
      }),
    )

    return { gvs: gvsSorted, gartenWerte }
  }, [person, filter.garten._deleted, filter.garten.aktiv])

  const gvs = data?.gvs ?? []
  const gartenWerte = data?.gartenWerte ?? []

  const saveToDb = useCallback(
    async (event) => {
      insertGvRev({
        values: { garten_id: event.target.value, person_id: person.id },
      })
      setErrors({})
    },
    [insertGvRev, person.id],
  )

  return (
    <ErrorBoundary>
      <TitleRow onClick={onClickToggle} title={open ? 'schliessen' : 'öffnen'}>
        <Title>{`Mitarbeitend bei ${gvs.length} Gärten`}</Title>
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
            <Gvs>
              {gvs.map((gv, index) => (
                <Garten
                  key={`${gv.person_id}/${gv.garten_id}/${index}`}
                  gv={gv}
                />
              ))}
            </Gvs>
            {!!gartenWerte.length && (
              <Select
                name="garten_id"
                value={''}
                field="garten_id"
                label="Garten hinzufügen"
                options={gartenWerte}
                saveToDb={saveToDb}
                isClearable={false}
                error={errors.garten_id}
              />
            )}
          </>
        )}
      </motion.div>
    </ErrorBoundary>
  )
}

export default observer(PersonArten)
