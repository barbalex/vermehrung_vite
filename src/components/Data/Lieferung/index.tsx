import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'
import isUuid from 'is-uuid'
import last from 'lodash/last'
import { useLiveQuery } from 'dexie-react-hooks'

import Lieferung from './Lieferung'
import SammelLieferung from '../SammelLieferung'
import StoreContext from '../../../storeContext'
import { dexie } from '../../../dexieClient'

const StyledSplitPane = styled(SplitPane)`
  .Resizer {
    background: rgba(74, 20, 140, 0.1);
    opacity: 1;
    z-index: 1;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 7px;
    cursor: col-resize;
  }
  .Resizer:hover {
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
    background-color: #fff59d !important;
  }
  .Resizer.disabled {
    cursor: not-allowed;
  }
  .Resizer.disabled:hover {
    border-color: transparent;
  }
  .Pane {
    overflow: hidden;
  }
`

const LieferungContainer = ({ filter: showFilter, id: idPassed }) => {
  const store = useContext(StoreContext)
  const { filter, user } = store
  const { activeNodeArray } = store.tree
  let id = idPassed
  if (!idPassed) {
    id = showFilter
      ? '99999999-9999-9999-9999-999999999999'
      : last(activeNodeArray.filter((e) => isUuid.v1(e)))
  }

  const data = useLiveQuery(async () => {
    const [person, row] = await Promise.all([
      dexie.persons.get({ account_id: user.uid ?? '99999999-9999-9999-9999-999999999999' }),
      dexie.lieferungs.get(id),
    ])

    const personOption: PersonOption = await dexie.person_options.get(person.id)

    return { personOption, row: showFilter ? filter.lieferung : row }
  }, [user.uid, id, showFilter, filter.lieferung])

  const personOption = data?.personOption ?? {}
  const row = showFilter ? filter.lieferung : data?.row

  const { li_show_sl } = personOption ?? {}

  if (row?.sammel_lieferung_id && li_show_sl) {
    // this lieferung is part of a sammel_lieferung
    // show that too
    return (
      <StyledSplitPane split="vertical" size="50%" maxSize={-10}>
        <Lieferung showFilter={showFilter} row={row} id={id} />
        <SammelLieferung
          showFilter={showFilter}
          id={row?.sammel_lieferung_id}
          lieferung={row}
        />
      </StyledSplitPane>
    )
  }

  return <Lieferung id={id} row={row} showFilter={showFilter} />
}

export default observer(LieferungContainer)
