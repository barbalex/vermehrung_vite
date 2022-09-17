import React, { useContext } from 'react'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import ErrorBoundary from '../../../../shared/ErrorBoundary'
import eventSort from '../../../../../utils/eventSort'
import storeContext from '../../../../../storeContext'
import Row from './Row'
import constants from '../../../../../utils/constants'
import { dexie } from '../../../../../dexieClient'
import totalFilter from '../../../../../utils/totalFilter'
import Spinner from '../../../../shared/Spinner'

const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  margin-left: -10px;
  margin-right: -10px;
  padding: 0 10px;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1;
  user-select: none;
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const Rows = styled.div``

const TkEvents = ({ teilkultur }) => {
  const store = useContext(storeContext)
  const { filter } = store

  const events = useLiveQuery(
    async () =>
      await dexie.events
        .filter(
          (e) => e._deleted === false && e.teilkultur_id === teilkultur._id,
        )
        .toArray(),
    [filter.event._deleted, teilkultur],
  )
  const eventsSorted = (events ?? []).sort(eventSort)

  return (
    <ErrorBoundary>
      <TitleRow>
        <Title>Events</Title>
      </TitleRow>
      <Rows>
        {events ? (
          eventsSorted.map((ev, i) => (
            <Row key={ev.id} event={ev} last={i === events.length - 1} />
          ))
        ) : (
          <Spinner />
        )}
      </Rows>
    </ErrorBoundary>
  )
}

export default TkEvents
