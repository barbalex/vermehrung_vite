import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import last from 'lodash/last'
import isUuid from 'is-uuid'

import ArtForm from './Art'
import Arten from './Arten'
import EventComponent from './Event'
import Events from './Events'
import Herkunft from './Herkunft'
import Herkuenfte from './Herkuenfte'
import Sammlung from './Sammlung'
import Sammlungen from './Sammlungen'
import Garten from './Garten'
import Gaerten from './Gaerten'
import Kultur from './Kultur'
import Kulturen from './Kulturen'
import Lieferung from './Lieferung'
import Lieferungen from './Lieferungen'
import SammelLieferung from './SammelLieferung'
import SammelLieferungen from './SammelLieferungen'
import Person from './Person'
import Personen from './Personen'
import Zaehlung from './Zaehlung'
import Zaehlungen from './Zaehlungen'
import Teilkultur from './Teilkultur'
import Teilkulturen from './Teilkulturen'
import Root from './Root'
import StoreContext from '../../storeContext'
import ErrorBondary from '../shared/ErrorBoundary'

const Data = () => {
  const store = useContext(StoreContext)
  const { activeForm } = store
  const { activeNodeArray } = store.tree

  const id = last(activeNodeArray.filter((e) => isUuid.v1(e)))

  // console.log('Data, activeForm:', activeForm)
  // ERROR BOUNDARY

  switch (activeForm) {
    case 'root': {
      return (
        <ErrorBondary>
          <Root />
        </ErrorBondary>
      )
    }
    case 'art': {
      return (
        <ErrorBondary>
          <ArtForm id={id} />
        </ErrorBondary>
      )
    }
    case 'arten': {
      return (
        <ErrorBondary>
          <Arten />
        </ErrorBondary>
      )
    }
    case 'event': {
      return (
        <ErrorBondary>
          <EventComponent id={id} />
        </ErrorBondary>
      )
    }
    case 'events': {
      return (
        <ErrorBondary>
          <Events />
        </ErrorBondary>
      )
    }
    case 'garten': {
      return (
        <ErrorBondary>
          <Garten id={id} />
        </ErrorBondary>
      )
    }
    case 'gaerten': {
      return (
        <ErrorBondary>
          <Gaerten />
        </ErrorBondary>
      )
    }
    case 'herkunft': {
      return (
        <ErrorBondary>
          <Herkunft id={id} />
        </ErrorBondary>
      )
    }
    case 'herkuenfte': {
      return (
        <ErrorBondary>
          <Herkuenfte />
        </ErrorBondary>
      )
    }
    case 'kultur': {
      return (
        <ErrorBondary>
          <Kultur id={id} />
        </ErrorBondary>
      )
    }
    case 'kulturen': {
      return (
        <ErrorBondary>
          <Kulturen />
        </ErrorBondary>
      )
    }
    case 'sammel_lieferung': {
      return (
        <ErrorBondary>
          <SammelLieferung id={id} />
        </ErrorBondary>
      )
    }
    case 'sammelLieferungen': {
      return (
        <ErrorBondary>
          <SammelLieferungen />
        </ErrorBondary>
      )
    }
    case 'lieferung': {
      return (
        <ErrorBondary>
          <Lieferung id={id} />
        </ErrorBondary>
      )
    }
    case 'lieferungen': {
      return (
        <ErrorBondary>
          <Lieferungen />
        </ErrorBondary>
      )
    }
    case 'person': {
      return (
        <ErrorBondary>
          <Person id={id} />
        </ErrorBondary>
      )
    }
    case 'personen': {
      return (
        <ErrorBondary>
          <Personen />
        </ErrorBondary>
      )
    }
    case 'sammlung': {
      return (
        <ErrorBondary>
          <Sammlung id={id} />
        </ErrorBondary>
      )
    }
    case 'sammlungen': {
      return (
        <ErrorBondary>
          <Sammlungen />
        </ErrorBondary>
      )
    }
    case 'teilkultur': {
      return (
        <ErrorBondary>
          <Teilkultur id={id} />
        </ErrorBondary>
      )
    }
    case 'teilkulturen': {
      return (
        <ErrorBondary>
          <Teilkulturen />
        </ErrorBondary>
      )
    }
    case 'zaehlung': {
      return (
        <ErrorBondary>
          <Zaehlung id={id} />
        </ErrorBondary>
      )
    }
    case 'zaehlungen': {
      return (
        <ErrorBondary>
          <Zaehlungen />
        </ErrorBondary>
      )
    }
    default:
      return null
  }
}

export default observer(Data)
