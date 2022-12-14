import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { withResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../storeContext'
import Settings from './Settings'
import Copy from './Copy'
import Add from './Add'
import Delete from './Delete'
import FilterNumbers from '../../../shared/FilterNumbers'
import Menu from '../../../shared/Menu'
import HistoryButton from '../../../shared/HistoryButton'
import NavButtons from './NavButtons'
import PrintButtons from './PrintButtons'
import Anleitung from './Anleitung'
import constants from '../../../../utils/constants'
import { dexie, PersonOption } from '../../../../dexieClient'

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

const SammelLieferungFormTitle = ({
  showFilter,
  row,
  totalCount,
  filteredCount,
  lieferung,
  printPreview,
  setPrintPreview,
  width,
  showHistory,
  setShowHistory,
}) => {
  const store = useContext(StoreContext)
  const { filter, user } = store
  const { activeNodeArray } = store.tree

  const personOption = useLiveQuery(async () => {
    const person = await dexie.persons.get({
      account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
    })
    const personOption: PersonOption = await person?.personOption()

    return personOption
  }, [user])

  const sl_auto_copy_edits = personOption?.sl_auto_copy_edits

  const shownAsSammelLieferung =
    activeNodeArray.length === 3 && activeNodeArray[1] === 'Sammel-Lieferungen'

  if (!row || (!showFilter && filter.show)) return null

  if (width < 515) {
    return (
      <TitleContainer>
        <Title>Sammel-Lieferung</Title>
        <TitleSymbols>
          {shownAsSammelLieferung && (
            <>
              <NavButtons />
              <Add />
              <Delete row={row} />
            </>
          )}
          {!sl_auto_copy_edits && (
            <Copy sammelLieferung={row} lieferung={lieferung} asMenu />
          )}
          <>
            <Menu white={false}>
              <PrintButtons
                printPreview={printPreview}
                setPrintPreview={setPrintPreview}
                asMenu
              />
              <Anleitung asMenu />
              <HistoryButton
                table="sammel_lieferung"
                id={row.id}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                asMenu
              />
              {row.id && <Settings asMenu />}
              {shownAsSammelLieferung && (
                <FilterNumbers
                  filteredCount={filteredCount}
                  totalCount={totalCount}
                  asMenu
                />
              )}
            </Menu>
          </>
        </TitleSymbols>
      </TitleContainer>
    )
  }

  if (width < 563) {
    return (
      <TitleContainer>
        <Title>Sammel-Lieferung</Title>
        <TitleSymbols>
          {shownAsSammelLieferung && (
            <>
              <NavButtons />
              <Add />
              <Delete row={row} />
            </>
          )}
          {!sl_auto_copy_edits && (
            <Copy sammelLieferung={row} lieferung={lieferung} asMenu />
          )}
          <>
            <PrintButtons
              printPreview={printPreview}
              setPrintPreview={setPrintPreview}
            />
            <Menu white={false}>
              <HistoryButton
                table="sammel_lieferung"
                id={row.id}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                asMenu
              />
              {row.id && <Settings asMenu />}
              <Anleitung asMenu />
              {shownAsSammelLieferung && (
                <FilterNumbers
                  filteredCount={filteredCount}
                  totalCount={totalCount}
                  asMenu
                />
              )}
            </Menu>
          </>
        </TitleSymbols>
      </TitleContainer>
    )
  }

  if (width < 610) {
    return (
      <TitleContainer>
        <Title>Sammel-Lieferung</Title>
        <TitleSymbols>
          {shownAsSammelLieferung && (
            <>
              <NavButtons />
              <Add />
              <Delete row={row} />
            </>
          )}
          {!sl_auto_copy_edits && (
            <Copy sammelLieferung={row} lieferung={lieferung} asMenu />
          )}
          <PrintButtons
            printPreview={printPreview}
            setPrintPreview={setPrintPreview}
          />
          <HistoryButton
            table="sammel_lieferung"
            id={row.id}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
          <>
            <Menu white={false}>
              {row.id && <Settings asMenu />}
              <Anleitung asMenu />
              {shownAsSammelLieferung && (
                <FilterNumbers
                  filteredCount={filteredCount}
                  totalCount={totalCount}
                  asMenu
                />
              )}
            </Menu>
          </>
        </TitleSymbols>
      </TitleContainer>
    )
  }

  if (width < 657) {
    return (
      <TitleContainer>
        <Title>Sammel-Lieferung</Title>
        <TitleSymbols>
          {shownAsSammelLieferung && (
            <>
              <NavButtons />
              <Add />
              <Delete row={row} />
              <PrintButtons
                printPreview={printPreview}
                setPrintPreview={setPrintPreview}
              />
            </>
          )}
          {!sl_auto_copy_edits && (
            <Copy sammelLieferung={row} lieferung={lieferung} />
          )}
          <HistoryButton
            table="sammel_lieferung"
            id={row.id}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
          {row.id && <Settings />}
          <>
            <Menu white={false}>
              <Anleitung asMenu />
              {shownAsSammelLieferung && (
                <FilterNumbers
                  filteredCount={filteredCount}
                  totalCount={totalCount}
                  asMenu
                />
              )}
            </Menu>
          </>
        </TitleSymbols>
      </TitleContainer>
    )
  }

  return (
    <TitleContainer>
      <Title>Sammel-Lieferung</Title>
      <TitleSymbols>
        {shownAsSammelLieferung && (
          <>
            <NavButtons />
            <Add />
            <Delete row={row} />
            <PrintButtons
              printPreview={printPreview}
              setPrintPreview={setPrintPreview}
            />
          </>
        )}
        {!sl_auto_copy_edits && (
          <Copy sammelLieferung={row} lieferung={lieferung} />
        )}
        <>
          <HistoryButton
            table="sammel_lieferung"
            id={row.id}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
          {row.id && <Settings />}
          <Anleitung />
          {shownAsSammelLieferung && (
            <FilterNumbers
              filteredCount={filteredCount}
              totalCount={totalCount}
            />
          )}
        </>
      </TitleSymbols>
    </TitleContainer>
  )
}

export default withResizeDetector(observer(SammelLieferungFormTitle))
