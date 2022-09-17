import React from 'react'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import teilzaehlungsSortByZaehlungTk from '../../../../../utils/teilzaehlungsSortByZaehlungTk'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import Teilzaehlungen from './Teilzaehlungen'
import constants from '../../../../../utils/constants'
import Spinner from '../../../../shared/Spinner'
import { dexie } from '../../../../../dexieClient'

const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  margin-left: -10px;
  margin-right: -10px;
  ${(props) => !props['data-has-data'] && 'margin-bottom: 10px;'}
  padding: 0 10px;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1;
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const Rows = styled.div``

const TkZaehlungen = ({ teilkultur }) => {
  const teilzaehlungs = useLiveQuery(async () => {
    const teilzaehlungs = await dexie.teilzaehlungs
      .filter((t) => t._deleted === false && t.teilkultur_id === teilkultur.id)
      .toArray()
    const teilzaehlungsSorted = await teilzaehlungsSortByZaehlungTk(
      teilzaehlungs,
    )

    return teilzaehlungsSorted
  }, [teilkultur.kultur_id])

  return (
    <ErrorBoundary>
      <TitleRow data-has-data={!!(teilzaehlungs ?? []).length}>
        <Title>Zählungen</Title>
      </TitleRow>
      <Rows>
        {teilzaehlungs ? (
          teilzaehlungs.map((tz, i) => (
            <Teilzaehlungen
              key={tz.id}
              tz={tz}
              last={i === (teilzaehlungs ?? []).length - 1}
            />
          ))
        ) : (
          <Spinner />
        )}
      </Rows>
    </ErrorBoundary>
  )
}

export default TkZaehlungen
