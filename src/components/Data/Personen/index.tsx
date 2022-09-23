import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { FixedSizeList } from 'react-window'
import { withResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'dexie-react-hooks'

import FilterTitle from '../../shared/FilterTitle'
import Row from './Row'
import ErrorBoundary from '../../shared/ErrorBoundary'
import FilterNumbers from '../../shared/FilterNumbers'
import StoreContext from '../../../storeContext'
import { ReactComponent as UpSvg } from '../../../svg/to_up.inline.svg'
import personSort from '../../../utils/personSort'
import constants from '../../../utils/constants'
import { dexie, Person } from '../../../dexieClient'
import filteredObjectsFromTable from '../../../utils/filteredObjectsFromTable'
import totalFilter from '../../../utils/totalFilter'
import Spinner from '../../shared/Spinner'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

const TitleContainer = styled.div`
  background-color: rgba(74, 20, 140, 0.1);
  flex-shrink: 0;
  display: flex;
  @media print {
    display: none !important;
  }
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding 0 10px;
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const TitleSymbols = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
`
const FieldsContainer = styled.div`
  height: 100%;
`

const Personen = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const { insertPersonRev, user } = store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree
  const { person: personFilter } = store.filter

  const data = useLiveQuery(async () => {
    const [persons, totalCount, userRole] = await Promise.all([
      filteredObjectsFromTable({ store, table: 'person' }),
      dexie.persons
        .filter((value) => totalFilter({ value, store, table: 'person' }))
        .count(),
      dexie.persons.get({ account_id: user.uid }),
    ])

    const personsSorted = persons.sort(personSort)

    return { persons: personsSorted, totalCount, userRole }
  }, [...Object.values(personFilter), store.person_initially_queried, user.uid])

  const persons: Person[] = data?.persons ?? []
  const totalCount = data?.totalCount
  const userRole = data?.userRole
  const filteredCount = persons.length

  const add = useCallback(() => {
    insertPersonRev()
  }, [insertPersonRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[1] === 'Personen') {
    upTitle = 'Zu allen Listen'
  }

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Person"
            table="person"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Personen</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              {userRole?.name === 'manager' && (
                <IconButton
                  aria-label="neue Person"
                  title="neue Person"
                  onClick={add}
                  size="large"
                >
                  <FaPlus />
                </IconButton>
              )}
              <FilterNumbers
                filteredCount={filteredCount}
                totalCount={totalCount}
              />
            </TitleSymbols>
          </TitleContainer>
        )}
        <FieldsContainer>
          {!data?.persons && <Spinner />}
          {!!width && data?.persons && (
            <FixedSizeList
              height={height - constants.titleRowHeight}
              itemCount={persons.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={persons[index]}
                  last={index === persons.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Personen))
