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
import teilkulturSort from '../../../utils/teilkulturSort'
import constants from '../../../utils/constants'
import { dexie, Teilkultur } from '../../../dexieClient'
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

const Teilkulturen = ({ filter: showFilter, width, height }) => {
  const store = useContext(StoreContext)
  const { insertTeilkulturRev, kulturIdInActiveNodeArray } = store
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store.tree

  let conditionAdder
  if (kulturIdInActiveNodeArray) {
    conditionAdder = async (collection) =>
      collection.and('kultur_id').equals(kulturIdInActiveNodeArray)
  }

  const data = useLiveQuery(async () => {
    const [teilkulturs, totalCount] = await Promise.all([
      filteredObjectsFromTable({ store, table: 'teilkultur' }),
      dexie.teilkulturs
        .filter((value) =>
          totalFilter({ value, store, table: 'teilkultur', conditionAdder }),
        )
        .count(),
    ])

    const teilkultursSorted = teilkulturs.sort(teilkulturSort)

    return { teilkulturs: teilkultursSorted, totalCount }
  }, [store.filter.teilkultur, store.teilkultur_initially_queried])

  const teilkulturs: Teilkultur[] = data?.teilkulturs ?? []
  const totalCount = data?.totalCount
  const filteredCount = teilkulturs.length

  const add = useCallback(() => {
    insertTeilkulturRev()
  }, [insertTeilkulturRev])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[1] === 'Teilkulturen') {
    upTitle = 'Zu allen Listen'
  }
  if (activeNodeArray[activeNodeArray.length - 3] === 'Kulturen') {
    upTitle = 'Zur Kultur'
  }

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        {showFilter ? (
          <FilterTitle
            title="Teilkultur"
            table="teilkultur"
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        ) : (
          <TitleContainer>
            <Title>Teilkulturen</Title>
            <TitleSymbols>
              <IconButton title={upTitle} onClick={onClickUp} size="large">
                <UpSvg />
              </IconButton>
              <IconButton
                aria-label="neue Teilkultur"
                title="neue Teilkultur"
                onClick={add}
                size="large"
              >
                <FaPlus />
              </IconButton>
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
              itemCount={teilkulturs.length}
              itemSize={constants.singleRowHeight}
              width={width}
            >
              {({ index, style }) => (
                <Row
                  key={index}
                  style={style}
                  index={index}
                  row={teilkulturs[index]}
                  last={index === teilkulturs.length - 1}
                />
              )}
            </FixedSizeList>
          )}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Teilkulturen))
