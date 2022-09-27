import React, { useCallback, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import IconButton from '@mui/material/IconButton'
import { FaPlus } from 'react-icons/fa'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../../../storeContext'
import TeilzaehlungenRows from './TeilzaehlungenRows'
import Settings from './Settings'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import teilzaehlungsSortByTk from '../../../../../utils/teilzaehlungsSortByTk'
import constants from '../../../../../utils/constants'
import { dexie } from '../../../../../dexieClient'
import Spinner from '../../../../shared/Spinner'
import collectionFromTable from '../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../utils/addTotalCriteriaToWhere'

const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  margin-left: -10px;
  margin-right: -10px;
  margin-bottom: 10px;
  padding: 0 10px;
  position: sticky;
  top: 0;
  z-index: 1;
  user-select: none;
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`

const Teilzaehlungen = ({ zaehlung }) => {
  const store = useContext(StoreContext)
  const { insertTeilzaehlungRev } = store

  const kulturId = zaehlung.kultur_id

  const data = useLiveQuery(async () => {
    const [tzs, kulturOption] = await Promise.all([
      collectionFromTable({
        table: 'teilzaehlung',
        where: addTotalCriteriaToWhere({
          table: 'teilzaehlung',
          store,
          where: { zaehlung_id: zaehlung.id },
        }),
      }).toArray(),
      dexie.kultur_options.get(
        zaehlung.kultur_id ?? '99999999-9999-9999-9999-999999999999',
      ),
    ])
    const teilzaehlungs = await teilzaehlungsSortByTk(tzs)

    return { teilzaehlungs, kulturOption }
  }, [zaehlung])

  const teilzaehlungs = data?.teilzaehlungs ?? []
  const kulturOption = data?.kulturOption ?? {}

  const { tk } = kulturOption

  const onClickNew = useCallback(() => {
    insertTeilzaehlungRev()
  }, [insertTeilzaehlungRev])

  const showNew = teilzaehlungs.length === 0 || tk
  const title = tk ? 'Teil-Zählungen' : 'Mengen'

  return (
    <ErrorBoundary>
      <TitleRow>
        <Title>{title}</Title>
        <div>
          {kulturId && <Settings kulturId={kulturId} />}
          {showNew && (
            <IconButton
              aria-label="Neu"
              title="Neue Teil-Zählung"
              onClick={onClickNew}
              size="large"
            >
              <FaPlus />
            </IconButton>
          )}
        </div>
      </TitleRow>
      {data?.teilzaehlungs ? (
        <TeilzaehlungenRows kulturId={kulturId} teilzaehlungs={teilzaehlungs} />
      ) : (
        <Spinner />
      )}
    </ErrorBoundary>
  )
}

export default observer(Teilzaehlungen)
