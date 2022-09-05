import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { FixedSizeList } from 'react-window'
import { withResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import Row from './Row'
import ErrorBoundary from '../../shared/ErrorBoundary'
import FilterNumbers from '../../shared/FilterNumbers'
import { ReactComponent as UpSvg } from '../../../svg/to_up.inline.svg'
import herkunftSort from '../../../utils/herkunftSort'
import constants from '../../../utils/constants'
import { dexie, Herkunft } from '../../../dexieClient'
import filteredObjectsFromTable from '../../../utils/filteredObjectsFromTable'
import totalFilter from '../../../utils/totalFilter'

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

const Herkuenfte = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const {
    insertHerkunftRev,
    sammlungIdInActiveNodeArray,
    artIdInActiveNodeArray,
  } = store
  const {
    activeNodeArray: anaRaw,
    setActiveNodeArray,
    removeOpenNode,
  } = store.tree
  const activeNodeArray = anaRaw.toJSON()

  let conditionAdder
  if (sammlungIdInActiveNodeArray) {
    conditionAdder = async (collection) => {
      const activeSammlung = await dexie.sammlungs.get(
        sammlungIdInActiveNodeArray,
      )
      return collection.and('id').equals(activeSammlung.herkunft_id)
    }
  }
  if (artIdInActiveNodeArray) {
    conditionAdder = async (collection) => {
      const sammlungsOfArt = await dexie.sammlungs
        .where({
          art_id: artIdInActiveNodeArray,
        })
        .toArray()
      const herkunftIds = sammlungsOfArt.map((e) => e.herkunft_id)
      return collection.and('id').anyOf(herkunftIds)
    }
  }

  const data = useLiveQuery(async () => {
    const [herkunfts, totalCount] = await Promise.all([
      filteredObjectsFromTable({ store, table: 'herkunft', conditionAdder }),
      dexie.herkunfts
        .filter((value) => totalFilter({ value, store, table: 'herkunft' }))
        .count(),
    ])

    const herkunftsSorted = herkunfts.sort(herkunftSort)

    return { herkunfts: herkunftsSorted, totalCount }
  }, [store.filter.herkunft, store.herkunft_initially_queried])

  const herkunfts: Herkunft[] = data?.herkunfts ?? []
  const totalCount = data?.totalCount
  const filteredCount = herkunfts.length

  const add = useCallback(() => insertHerkunftRev(), [insertHerkunftRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[1] === 'Herkuenfte') {
    upTitle = 'Zu allen Listen'
  }

  // herkuenfte is top node
  // never enable adding below that
  const showPlus = activeNodeArray.length < 2

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Herkunft"
            table="herkunft"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Herkünfte</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              {showPlus && (
                <IconButton
                  aria-label="neue Herkunft"
                  title="neue Herkunft"
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
          {!!width && (
            <FixedSizeList
              height={height - constants.titleRowHeight}
              itemCount={herkunfts.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={herkunfts[index]}
                  last={index === herkunfts.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Herkuenfte))
