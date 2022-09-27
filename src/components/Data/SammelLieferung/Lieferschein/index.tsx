import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
// TODO: work on image
// import { StaticImage } from 'gatsby-plugin-image'
import { DateTime } from 'luxon'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { useLiveQuery } from 'dexie-react-hooks'

import Lieferung from './Lieferung'
import StoreContext from '../../../../storeContext'
import lieferungSort from '../../../../utils/lieferungSort'
import personFullname from '../../../../utils/personFullname'
import constants from '../../../../utils/constants'
import { dexie } from '../../../../dexieClient'
import collectionFromTable from '../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../utils/addTotalCriteriaToWhere'
import ProgressiveImg from '../../../shared/ProgressiveImg'
import image from '../../../../images/toposLogo.png'

const Container = styled.div`
  overflow: auto;
  background-color: #f8f8f8;
  font-size: 9pt;
  cursor: default;
  height: calc(
    100vh - ${constants.appBarHeight}px - ${constants.titleRowHeight}px
  );
  width: 100%;
  @media print {
    /* remove grey backgrond set for nice UI */
    background-color: #fff;
    /* with overflow auto an empty page is inserted between each page */
    overflow-y: visible;
  }
`
const PageContainer = styled.div`
  /* this part is for when page preview is shown */
  /* Divide single pages with some space and center all pages horizontally */
  /* will be removed in @media print */
  margin: 1cm auto;
  /* Define a white paper background that sticks out from the darker overall background */
  background: #fff;
  /* Show a drop shadow beneath each page */
  box-shadow: 0 4px 5px rgba(75, 75, 75, 0.2);

  display: flex;
  flex-direction: column;
  /*justify-content: space-between;*/

  /* set dimensions */
  width: 29.7cm;
  height: 21cm;
  padding: 1.5cm;

  @media print {
    height: 100%;
    width: 100%;

    margin: 0 !important;
    padding: 0.5cm !important;
    overflow-y: hidden !important;
  }
`
const Title = styled.h3`
  padding-top: 15px;
  margin-bottom: 0.4rem;
`
const HeaderRow = styled.div`
  display: flex;
  font-size: small;
`
const HaederLabel = styled.div`
  flex-basis: 50px;
  flex-grow: 0;
`
const HeaderValue = styled.div``
const StyledPaper = styled(Paper)`
  margin-top: 15px;
  box-shadow: none !important;
`
const StyledTable = styled(Table)`
  margin-bottom: 0;
  td,
  th {
    font-size: 0.75rem;
    padding-left: 8px;
    padding-right: 8px;
  }
  th:first-child,
  td:first-child {
    padding-left: 8px;
  }
`

const Lieferschein = ({ row }) => {
  const store = useContext(StoreContext)

  const data = useLiveQuery(async () => {
    const [lieferungs, kultur, person] = await Promise.all([
      collectionFromTable({
        table: 'lieferung',
        where: addTotalCriteriaToWhere({
          table: 'lieferung',
          store,
          where: { sammel_lieferung_id: row.id },
        }),
      }).toArray(),
      dexie.kulturs.get(
        row.von_kultur_id ?? '99999999-9999-9999-9999-999999999999',
      ),
      dexie.persons.get(
        row.person_id ?? '99999999-9999-9999-9999-999999999999',
      ),
    ])
    const vonKulturGarten = await dexie.gartens.get(
      kultur?.garten_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return {
      lieferungs: lieferungs.sort(lieferungSort),
      vonKulturGarten,
      person,
    }
  }, [row.id, row.von_kultur_id, row.person_id])

  const lieferungs = data?.lieferungs ?? []
  const vonKulturGarten = data?.vonKulturGarten
  const person = data?.person

  const von = row.von_kultur_id
    ? `${vonKulturGarten?.name ?? '(kein Name)'} (${
        vonKulturGarten?.ort ?? 'kein Ort'
      })`
    : '(keine von-Kultur erfasst)'

  const an = row.person_id
    ? `${personFullname(person) ?? '(kein Name)'} (${
        person?.ort ?? 'kein Ort'
      })`
    : '(keine Person erfasst)'

  const am = row.datum
    ? DateTime.fromSQL(row.datum).toFormat('dd.LL.yyyy')
    : '(Kein Datum erfasst)'

  return (
    <Container>
      <PageContainer className="querformat printer-content">
        <ProgressiveImg
          src={image}
          placeholderSrc={image}
          alt="topos Logo"
          width="500px"
          height="87px"
        />
        <Title>Lieferschein</Title>
        <HeaderRow>
          <HaederLabel>Projekt:</HaederLabel>
          <HeaderValue>
            {
              'Zwischenvermehrung von seltenen und bedrohten Pflanzenarten im Kanton Zürich'
            }
          </HeaderValue>
        </HeaderRow>
        <HeaderRow>
          <HaederLabel>von:</HaederLabel>
          <HeaderValue>{von}</HeaderValue>
        </HeaderRow>
        <HeaderRow>
          <HaederLabel>an:</HaederLabel>
          <HeaderValue>{an}</HeaderValue>
        </HeaderRow>
        <HeaderRow>
          <HaederLabel>am:</HaederLabel>
          <HeaderValue>{am}</HeaderValue>
        </HeaderRow>
        <StyledPaper square>
          <StyledTable size="small">
            <TableHead>
              <TableRow>
                <TableCell>Art</TableCell>
                <TableCell>Herkunft</TableCell>
                <TableCell>Was</TableCell>
                <TableCell>Bemerkungen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lieferungs.map((l) => (
                <Lieferung key={l.id} lieferung={l} />
              ))}
            </TableBody>
          </StyledTable>
        </StyledPaper>
      </PageContainer>
    </Container>
  )
}

export default observer(Lieferschein)
