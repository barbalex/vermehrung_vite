import React, { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'
import { combineLatest, of as $of } from 'rxjs'
import { Q } from '@nozbe/watermelondb'

import Row from './Row'
import StoreContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'
import getShowArt from '../../../utils/showArt'
import getShowEvent from '../../../utils/showEvent'
import getShowGarten from '../../../utils/showGarten'
import getShowHerkunft from '../../../utils/showHerkunft'
import getShowKultur from '../../../utils/showKultur'
import getShowLieferung from '../../../utils/showLieferung'
import getShowPerson from '../../../utils/showPerson'
import getShowSammelLieferung from '../../../utils/showSammelLieferung'
import getShowSammlung from '../../../utils/showSammlung'
import getShowTeilkultur from '../../../utils/showTeilkultur'
import getShowZaehlung from '../../../utils/showZaehlung'
import { dexie, Person } from '../../../dexieClient'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

const FieldsContainer = styled.div`
  height: 100%;
  overflow-y: auto;
`

const Root = ({ filter: showFilter }) => {
  const store = useContext(StoreContext)
  const { user } = store
  const { activeNodeArray: activeNodeArrayRaw } = store.tree
  const activeNodeArray = activeNodeArrayRaw.toJSON()

  const data = useLiveQuery(async () => {
    const person: Person = await dexie.persons.get({ account_id: user.uid })
    const userRole = await dexie.user_roles.get(person.user_role_id)
    const userPersonOption = await dexie.person_options.get(person.id)

    return { userRole, userPersonOption }
  })

  const userRole = data?.userRole
  const userPersonOption = data?.userPersonOption

  const showArt = getShowArt({ userRole, activeNodeArray })
  const showEvent = getShowEvent({ userPersonOption, activeNodeArray })
  const showGarten = getShowGarten()
  const showHerkunft = getShowHerkunft({ userRole, activeNodeArray })
  const showKultur = getShowKultur({ userPersonOption, activeNodeArray })
  const showLieferung = getShowLieferung({
    userPersonOption,
    activeNodeArray,
  })
  const showPerson = getShowPerson()
  const showSammelLieferung = getShowSammelLieferung({
    userPersonOption,
    activeNodeArray,
  })
  const showSammlung = getShowSammlung({ userRole, activeNodeArray })
  const showTeilkultur = getShowTeilkultur({
    userPersonOption,
    activeNodeArray,
  })
  const showZaehlung = getShowZaehlung({
    userPersonOption,
    activeNodeArray,
  })

  // TODO: filter according to roles
  // by adding each role name as key and true/false as value
  const rows = [
    ...(showArt
      ? [{ name: 'Arten', url: ['Arten'], table: 'art', sort: 1 }]
      : []),
    ...(showHerkunft
      ? [{ name: 'Herkünfte', url: ['Herkuenfte'], table: 'herkunft', sort: 2 }]
      : []),
    ...(showSammlung
      ? [
          {
            name: 'Sammlungen',
            url: ['Sammlungen'],
            table: 'sammlung',
            sort: 3,
          },
        ]
      : []),
    ...(showGarten
      ? [{ name: 'Gärten', url: ['Gaerten'], table: 'garten', sort: 4 }]
      : []),
    ...(showKultur
      ? [{ name: 'Kulturen', url: ['Kulturen'], table: 'kultur', sort: 5 }]
      : []),
    ...(showTeilkultur
      ? [
          {
            name: 'Teilkulturen',
            url: ['Teilkulturen'],
            table: 'teilkultur',
            sort: 6,
          },
        ]
      : []),
    ...(showZaehlung
      ? [{ name: 'Zählungen', url: ['Zaehlungen'], table: 'zaehlung', sort: 7 }]
      : []),
    ...(showLieferung
      ? [
          {
            name: 'Lieferungen',
            url: ['Lieferungen'],
            table: 'lieferung',
            sort: 8,
          },
        ]
      : []),
    ...(showSammelLieferung
      ? [
          {
            name: 'Sammel-Lieferungen',
            url: ['Sammel-Lieferungen'],
            table: 'sammel_lieferung',
            sort: 9,
          },
        ]
      : []),
    ...(showEvent
      ? [{ name: 'Events', url: ['Events'], table: 'event', sort: 10 }]
      : []),
    ...(showPerson
      ? [{ name: 'Personen', url: ['Personen'], table: 'person', sort: 11 }]
      : []),
  ]

  console.log('Root rendering')

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        <FieldsContainer>
          {rows.map((row) => (
            <Row key={row.name} row={row} />
          ))}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Root)
