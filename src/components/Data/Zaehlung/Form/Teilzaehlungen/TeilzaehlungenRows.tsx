import React from 'react'

import Teilzaehlung from './Teilzaehlung'
import ErrorBoundary from '../../../../shared/ErrorBoundary'

const TeilzaehlungenRows = ({ kulturId, teilzaehlungs }) => (
  <ErrorBoundary>
    {teilzaehlungs.map((r, index) => (
      <Teilzaehlung key={r.id} index={index} row={r} kulturId={kulturId} />
    ))}
  </ErrorBoundary>
)

export default TeilzaehlungenRows
