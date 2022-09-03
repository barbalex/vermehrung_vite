import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import filteredObjectsFromTable from '../../../utils/filteredObjectsFromTable'
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

const RootRow = ({ row, style, last }) => {
  const store = useContext(StoreContext)
  const { setActiveNodeArray } = store.tree

  const count = useLiveQuery(
    async () =>
      await filteredObjectsFromTable({ store, table: row.table, count: true }),
    [row.table],
  )

  const onClickRow = useCallback(
    () => setActiveNodeArray(row.url),
    [row.url, setActiveNodeArray],
  )

  return (
    <Row key={row.id} onClick={onClickRow} style={style} data-last={last}>
      <div>{`${row.name} (${count})`}</div>
    </Row>
  )
}

export default observer(RootRow)
