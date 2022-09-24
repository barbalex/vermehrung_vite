import React from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import herkunftLabelFromHerkunft from '../../../../utils/herkunftLabelFromHerkunft'
import { dexie } from '../../../../dexieClient'

const StyledTableCell = styled(TableCell)`
  vertical-align: top !important;
`

const Zeile = ({ value }) => <div>{value}</div>

const LieferungForLieferschein = ({ lieferung: row }) => {
  const data = useLiveQuery(async () => {
    const [art, kultur] = await Promise.all([
      dexie.arts.get(row.art_id ?? '99999999-9999-9999-9999-999999999999'),
      dexie.kulturs.get(
        row.von_kultur_id ?? '99999999-9999-9999-9999-999999999999',
      ),
    ])
    const vonKulturHerkunft = await dexie.herkunfts.get(
      kultur?.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const vonSammlung = await dexie.sammlungs.get(
      row.von_sammlung_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const vonSammlungHerkunft = await dexie.herkunfts.get(
      vonSammlung?.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const artLabel = await art.label()
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
