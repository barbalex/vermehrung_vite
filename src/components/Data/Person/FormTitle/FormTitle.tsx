import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { withResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import AddButton from './AddButton'
import DeleteButton from './DeleteButton'
import FilterNumbers from '../../../shared/FilterNumbers'
import Menu from '../../../shared/Menu'
import HistoryButton from '../../../shared/HistoryButton'
import KontoMenu from './KontoMenu'
import NavButtons from './NavButtons'
import constants from '../../../../utils/constants'
import { dexie } from '../../../../dexieClient'

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

const PersonFormTitle = ({
  row,
  totalCount,
  filteredCount,
  width,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { user } = store

  const userRole = useLiveQuery(async () => {
    const person = await dexie.persons.get({ account_id: user.uid ?? '99999999-9999-9999-9999-999999999999' })

    return person.user_role
  }, [user.uid])

  if (width < 568) {
    return (
      <TitleContainer>
        <Title>Person</Title>
        <TitleSymbols>
          <NavButtons />
          {userRole?.name === 'manager' && (
            <>
              <AddButton />
              <DeleteButton row={row} />
            </>
          )}
          <Menu white={false}>
            <HistoryButton
              table="person"
              id={row.id}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
              asMenu
            />
            <KontoMenu row={row} asMenu />
            <FilterNumbers
              filteredCount={filteredCount}
              totalCount={totalCount}
              asMenu
            />
          </Menu>
        </TitleSymbols>
      </TitleContainer>
    )
  }

  return (
    <TitleContainer>
      <Title>Person</Title>
      <TitleSymbols>
        <NavButtons />
        {userRole?.name === 'manager' && (
          <>
            <AddButton />
            <DeleteButton row={row} />
          </>
        )}
        <HistoryButton
          table="person"
          id={row.id}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
        <KontoMenu row={row} />
        <FilterNumbers filteredCount={filteredCount} totalCount={totalCount} />
      </TitleSymbols>
    </TitleContainer>
  )
}

export default withResizeDetector(observer(PersonFormTitle))
