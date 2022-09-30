import React from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import herkunftLabelFromHerkunft from '../../../../utils/herkunftLabelFromHerkunft'

const StyledTableCell = styled(TableCell)`
  vertical-align: top !important;
`

const Zeile = ({ value }) => <div>{value}</div>

const LieferungForLieferschein = ({ lieferung: row }) => {
  const data = useLiveQuery(async () => {
    const [art, kultur, vonSammlung] = await Promise.all([
      row.art(),
      row.vonKultur(),
      row.sammlung(),
    ])
    const vonKulturHerkunft = await kultur?.herkunft?.()
    const vonSammlungHerkunft = await vonSammlung?.herkunft?.()
    const artLabel = await art.label?.()
    const herkunftLabel = vonKulturHerkunft
      ? herkunftLabelFromHerkunft({
          herkunft: vonKulturHerkunft,
        })
      : vonSammlungHerkunft
      ? herkunftLabelFromHerkunft({ herkunft: vonSammlungHerkunft })
      : ''

    return { artLabel, herkunftLabel }
  }, [row.art_id, row.von_kultur_id, row.von_sammlung_id])

  const artLabel = data?.artLabel ?? ''
  const herkunftLabel = data?.herkunftLabel ?? ''

  const wasArray = []
  row.anzahl_pflanzen && wasArray.push(`${row.anzahl_pflanzen} Pflanzen`)
  row.anzahl_auspflanzbereit &&
    wasArray.push(`${row.anzahl_auspflanzbereit} Pflanzen auspflanzbereit`)
  row.gramm_samen && wasArray.push(`${row.gramm_samen} Gramm Samen`)
  row.von_anzahl_individuen &&
    wasArray.push(`von ${row.von_anzahl_individuen} Individuen`)
  row.andere_menge && wasArray.push(row.andere_menge)
  const bemerkungen = row.bemerkungen ?? ''

  return (
    <TableRow>
      <StyledTableCell>{artLabel}</StyledTableCell>
      <StyledTableCell>{herkunftLabel}</StyledTableCell>
      <StyledTableCell>
        {wasArray.map((w, i) => (
          <Zeile key={i} value={w} />
        ))}
      </StyledTableCell>
      <StyledTableCell>{bemerkungen}</StyledTableCell>
    </TableRow>
  )
}

export default LieferungForLieferschein
