import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { motion, useAnimation } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'

import Pflanzen from './Pflanzen'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import herkunftSort from '../../../../../utils/herkunftSort'
import constants from '../../../../../utils/constants'
import { dexie } from '../../../../../dexieClient'
import Spinner from '../../../../shared/Spinner'
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

const TimelineArea = ({ artId = '99999999-9999-9999-9999-999999999999' }) => {
  const herkunfts = useLiveQuery(async () => {
    const sammlungs = await collectionFromTable({
      table: 'sammlung',
      where: addTotalCriteriaToWhere({
        table: 'sammlung',
        store,
        where: { art_id: artId },
      }),
    }).toArray()
    const herkunftIds = [...new Set(sammlungs.map((s) => s.herkunft_id))]
    const anyOfs = herkunftIds.map((id) => [id, 0])
    const herkunfts = await dexie.herkunfts
      .where('[id+__deleted_indexable]')
      .anyOf(anyOfs)
      .toArray()
    const herkunftsSorted = herkunfts.sort(herkunftSort)
    return herkunftsSorted
  }, [artId])

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

  return (
    <ErrorBoundary>
      <TitleRow onClick={onClickToggle} title={open ? 'schliessen' : 'öffnen'}>
        <Title>{`Zeit-Achsen ${(herkunfts ?? []).length} Herkünfte`}</Title>
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
            {herkunfts ? (
              herkunfts.map((herkunft) => (
                <Pflanzen key={herkunft.id} artId={artId} herkunft={herkunft} />
              ))
            ) : (
              <Spinner />
            )}
          </>
        )}
      </motion.div>
    </ErrorBoundary>
  )
}

export default TimelineArea
