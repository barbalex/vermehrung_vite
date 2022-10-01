import React, { useContext, useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useDebouncedCallback } from 'use-debounce'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../storeContext'
import Settings from './Settings'
import List from './List'
import buildNodes from './nodes'
import { dexie } from '../../dexieClient'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const Tree = () => {
  const store = useContext(StoreContext)
  const { user } = store
  const {
    art: artFilter,
    herkunft: herkunftFilter,
    sammlung: sammlungFilter,
    garten: gartenFilter,
    kultur: kulturFilter,
    teilkultur: teilkulturFilter,
    zaehlung: zaehlungFilter,
    lieferung: lieferungFilter,
    sammel_lieferung: sammelLieferungFilter,
    event: eventFilter,
    person: personFilter,
  } = store.filter
  const { activeNodeArray: aNAProxy, openNodes: openNodesProxy } = store.tree
  const aNA = getSnapshot(aNAProxy)
  const openNodes = getSnapshot(openNodesProxy)

  const [nodes, setNodes] = useState([])

  const data = useLiveQuery(async () => {
    const person = await dexie.persons.get({
      account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
    })
    const personOption: PersonOption = await person?.personOption()

    return { personOption, userRole: person?.user_role }
  }, [user.uid])

  const userPersonOption = data?.personOption
  const userRole = data?.userRole

  const buildMyNodes = useCallback(async () => {
    const nodes = await buildNodes({
      store,
      userPersonOption,
      userRole,
    })
    setNodes(nodes)
  }, [store, userPersonOption, userRole])

  const buildMyNodesDebounced = useDebouncedCallback(buildMyNodes, 100)

  useEffect(() => {
    //console.log('Tree second useEffect ordering nodes build')
    buildMyNodesDebounced()
  }, [
    buildMyNodesDebounced,
    // need to rebuild tree if any filter value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(artFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(herkunftFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(sammlungFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(gartenFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(kulturFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(teilkulturFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(zaehlungFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(lieferungFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(sammelLieferungFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(eventFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(personFilter),
    // need to rebuild tree on activeNodeArray changes
    aNA,
    // need to rebuild tree on openNodes changes
    openNodes,
    openNodes.length,
    user.uid,
  ])

  // console.log('Tree rendering', { openNodes, nodes, aNA })

  return (
    <Container>
      <Settings />
      <AutoSizer
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        {({ height, width }) => (
          <List
            nodes={nodes}
            width={width}
            height={height}
            userRole={userRole}
          />
        )}
      </AutoSizer>
    </Container>
  )
}

export default observer(Tree)
