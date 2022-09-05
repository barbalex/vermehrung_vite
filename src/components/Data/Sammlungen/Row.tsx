import React, { useContext, useCallback, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

import StoreContext from '../../../storeContext'
import constants from '../../../utils/constants'

const Row = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: ${constants.singleRowHeight};
  border-top: thin solid rgba(74, 20, 140, 0.1);
  border-bottom: ${(props) => (props['data-last'] ? '1px' : 'thin')} solid
    rgba(74, 20, 140, 0.1);
  border-collapse: collapse;
  box-sizing: border-box;
  margin: -1px 0;
  padding: 10px;
  cursor: pointer;
  div {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  &:hover {
    background-color: rgba(74, 20, 140, 0.03);
  }
`

const ArtenRow = ({ row, style, last }) => {
  const store = useContext(StoreContext)
  const { herkunftIdInActiveNodeArray } = store
  const { activeNodeArray, setActiveNodeArray } = store.tree

  // console.log('ArtenRow, row:', row)

  const [label, setLabel] = useState('')
  useEffect(() => {
    herkunftIdInActiveNodeArray
      ? row.labelUnderHerkunft().then(setLabel)
      : row.label().then(setLabel)
  }, [herkunftIdInActiveNodeArray, row])
  // useEffect(() => {
  //   herkunftIdInActiveNodeArray
  //     ? row.labelUnderHerkunft().then(setLabel)
  //     : row.label().then(setLabel)
  // }, [herkunftIdInActiveNodeArray, row])

  // console.log('ArtenRow, label:', label)

  const onClickRow = useCallback(
    () => setActiveNodeArray([...activeNodeArray, row.id]),
    [activeNodeArray, row.id, setActiveNodeArray],
  )

  return (
    <Row key={row.id} onClick={onClickRow} style={style} data-last={last}>
      <div>{label}</div>
    </Row>
  )
}

export default observer(ArtenRow)
