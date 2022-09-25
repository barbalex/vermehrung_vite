/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
} from 'recharts'
import { observer } from 'mobx-react-lite'
import { withResizeDetector } from 'react-resize-detector'
import styled from 'styled-components'

import CustomTooltip from './Tooltip'
import LabelLieferung from './LabelLieferung'
import LabelZaehlung from './LabelZaehlung'
import CustomAxisTick from './CustomAxisTick'
import ErrorBoundary from '../../../../../shared/ErrorBoundary'
import herkunftLabelFromHerkunft from '../../../../../../utils/herkunftLabelFromHerkunft'
import buildData from './buildData'
import Spinner from '../../../../../shared/Spinner'

const H4 = styled.h4`
  margin-bottom: 5px;
`
const NoData = styled.div`
  padding: 0 10px 15px 0;
`

const ArtTimeline = ({ artId, herkunft, width }) => {
  const herkunftId = herkunft.id

  const [data, setData] = useState(null)
  useEffect(() => {
    let isActive = true
    buildData({ artId, herkunftId }).then((data) => {
      if (!isActive) return

      setData(data)
    })

    return () => {
      isActive = false
    }
  }, [artId, herkunftId])

  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    if (width < 1100 && !narrow) {
      setNarrow(true)
    }
    if (width > 1100 && narrow) {
      setNarrow(false)
    }
  }, [narrow, width])

  const herkunftLabel = herkunftLabelFromHerkunft({ herkunft })

  if (!data) return <Spinner />

  if (data && !data.length) {
    return (
      <>
        <H4>{herkunftLabel}</H4>
        <NoData>{`Keine Daten für die Anzahl Pflanzen verfügbar`}</NoData>
      </>
    )
  }

  return (
    <ErrorBoundary>
      <h4>{herkunftLabel}</h4>
      <ResponsiveContainer width="99%" height={450}>
        <ComposedChart
          data={data}
          margin={{ top: 25, right: 0, left: 0, bottom: 45 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis dataKey="datum" tick={CustomAxisTick} interval={0} />
          <YAxis
            label={{
              value: 'Anzahl Pflanzen',
              angle: -90,
              position: 'insideLeft',
              offset: 15,
              fontSize: 14,
              fontWeight: 700,
            }}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          {narrow ? (
            <Legend
              layout="horizontal"
              align="center"
              wrapperStyle={{ bottom: 0, fontSize: 12 }}
            />
          ) : (
            <Legend
              layout="vertical"
              align="right"
              wrapperStyle={{ right: -10, bottom: 150, fontSize: 12 }}
            />
          )}
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="Sammlung" fill="orange" label={<LabelLieferung />} />
          <Bar
            dataKey="Sammlung geplant"
            fill="yellow"
            label={<LabelLieferung />}
          />
          <Bar
            dataKey="Auspflanzung"
            fill="#016526"
            label={<LabelLieferung />}
          />
          <Bar
            dataKey="Auspflanzung geplant"
            fill="#9cffc0"
            label={<LabelLieferung />}
          />
          <Line
            type="monotone"
            connectNulls={true}
            dataKey="Anzahl berechnet"
            stroke="#4a148c"
            strokeWidth={3}
            label={<LabelZaehlung />}
            dot={false}
          />
          <Scatter
            dataKey="Zählung"
            stroke="#4a148c"
            fill="#4a148c"
            // fill white makes legend go completely white...
            //fill="white"
            strokeWidth={3}
          ></Scatter>
          <Scatter
            dataKey="Prognose"
            stroke="#e0e0ff"
            fill="#e0e0ff"
            strokeWidth={3}
          ></Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(ArtTimeline))
