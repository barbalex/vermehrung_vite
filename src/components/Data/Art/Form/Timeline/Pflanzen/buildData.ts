import uniq from 'lodash/uniq'
import sum from 'lodash/sum'
import max from 'lodash/max'

import { dexie } from '../../../../../../dexieClient'
import collectionFromTable from '../../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../../utils/addTotalCriteriaToWhere'
import exists from '../../../../../../utils/exists'

const buildData = async ({ artId }) => {
  // 1. get list of all active, non deleted kulturs
  //    these are the basis for counting:
  //    at every date the last count is used
  const kulturs = await collectionFromTable({
    table: 'kultur',
    where: addTotalCriteriaToWhere({
      table: 'kultur',
      store,
      where: { art_id: artId },
    }),
  }).toArray()
  const kultursIds = kulturs.map((k) => k.id)
  const zaehlungs = await dexie.zaehlungs
    .where('[kultur_id+__deleted_indexable]')
    .anyOf(kultursIds.map((id) => [id, 0]))
    .and((z) => !!z.datum)
    .toArray()
  const zaehlungsIds = zaehlungs.map((z) => z.id)
  const teilzaehlungsWithAnzahlPflanzen = await dexie.teilzaehlungs
    .where('[zaehlung_id+__deleted_indexable]')
    .anyOf(zaehlungsIds.map((id) => [id, 0]))
    .and((tz) => tz.anzahl_pflanzen !== null)
    .toArray()
  const zaehlungIdsOfTzWithAnzahlPflanzen = [
    ...new Set(teilzaehlungsWithAnzahlPflanzen.map((tz) => tz.zaehlung_id)),
  ]
  /**
   * This is RIDICULOUS
   * using the same observable (zaehlungsObservable) DOES NOT WORK
   * Result is always: []
   * So need to recreate it for every usage
   */
  const zaehlungsObservableForZaehlungsDone = dexie.zaehlungs
    .where('[kultur_id+__prognose_indexable+__deleted_indexable]')
    .anyOf(kultursIds.map((id) => [id, 0, 0]))
    .and((z) => !!z.datum)
  const zaehlungsDone = await zaehlungsObservableForZaehlungsDone
    .and((z) => zaehlungIdsOfTzWithAnzahlPflanzen.includes(z.id))
    .toArray()

  const zaehlungsObservableForZaehlungsPlannedAll = dexie.zaehlungs
    .where('[kultur_id+__deleted_indexable]')
    .anyOf(kultursIds.map((id) => [id, 0]))
    .and((z) => !!z.datum)
  const zaehlungsPlannedAll = await zaehlungsObservableForZaehlungsPlannedAll
    .filter(
      (z) =>
        z.prognose === true && zaehlungIdsOfTzWithAnzahlPflanzen.includes(z.id),
    )
    .toArray()
  const zaehlungsPlannedIgnored = zaehlungsPlannedAll.filter((zg) =>
    // check if more recent zaehlungsDone exists
    zaehlungsDone.some((z) => z.datum >= zg.datum),
  )
  const zaehlungsPlanned = zaehlungsPlannedAll.filter(
    (lg) => !zaehlungsPlannedIgnored.map((l) => l.id).includes(lg.id),
  )

  const sammlungsDone = await collectionFromTable({
    table: 'sammlung',
    where: addTotalCriteriaToWhere({
      table: 'sammlung',
      store,
      where: { art_id: artId },
    }),
  })
    .filter(
      (s) => s.geplant === false && !!s.datum && exists(s.anzahl_pflanzen),
    )
    .toArray()
  const sammlungsPlannedAll = await collectionFromTable({
    table: 'sammlung',
    where: addTotalCriteriaToWhere({
      table: 'sammlung',
      store,
      where: { art_id: artId },
    }),
  })
    .filter((s) => s.geplant === true && !!s.datum && exists(s.anzahl_pflanzen))
    .toArray()
  const sammlungsPlannedIgnored = sammlungsPlannedAll.filter((zg) =>
    // check if more recent zaehlungsDone exists
    sammlungsDone.some((z) => z.datum >= zg.datum),
  )
  const sammlungsPlanned = sammlungsPlannedAll.filter(
    (lg) => !sammlungsPlannedIgnored.map((l) => l.id).includes(lg.id),
  )

  const lieferungsDone = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: {
        art_id: artId,
        __nach_ausgepflanzt_indexable: 1,
        __geplant_indexable: 0,
      },
    }),
  })
    .filter(
      (s) =>
        s.nach_ausgepflanzt === true &&
        s.geplant === false &&
        !!s.datum &&
        exists(s.anzahl_pflanzen),
    )
    .toArray()
  const lieferungsPlannedAll = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: {
        art_id: artId,
        __nach_ausgepflanzt_indexable: 1,
        __geplant_indexable: 1,
      },
    }),
  })
    .filter((s) => !!s.datum && exists(s.anzahl_pflanzen))
    .toArray()
  const lieferungsPlannedIgnored = lieferungsPlannedAll.filter((zg) =>
    // check if more recent zaehlungsDone exists
    lieferungsDone.some((z) => z.datum >= zg.datum),
  )
  const lieferungsPlanned = lieferungsPlannedAll.filter(
    (lg) => !lieferungsPlannedIgnored.map((l) => l.id).includes(lg.id),
  )

  // 1. get list of all dates when something was counted
  const dates = uniq(
    [
      ...zaehlungsDone,
      ...zaehlungsPlanned,
      ...sammlungsDone,
      ...sammlungsPlanned,
      ...lieferungsDone,
      ...lieferungsPlanned,
    ].map((z) => z.datum),
  ).sort()

  // 3. for every date get:
  //    - sum of last zaehlung
  //    - whether last zahlung includes prognose
  return await Promise.all(
    dates.map(async (date) => {
      const sammlungNow = sum(
        sammlungsDone
          .filter((s) => s.datum === date)
          .map((s) => s.anzahl_pflanzen),
      )
      const sammlungPlannedNow = sum(
        sammlungsPlanned
          .filter((s) => s.datum === date)
          .map((s) => s.anzahl_pflanzen),
      )

      const lieferungNow = -sum(
        lieferungsDone
          .filter((s) => s.datum === date)
          .map((s) => s.anzahl_pflanzen),
      )
      const lieferungPlannedNow = -sum(
        lieferungsPlanned
          .filter((s) => s.datum === date)
          .map((s) => s.anzahl_pflanzen),
      )

      const lastZaehlungsByKultur = await Promise.all(
        kulturs.map(async (k) => {
          // for every kultur return
          // last zaehlung and whether it is prognose
          const zaehlungs = await collectionFromTable({
            table: 'zaehlung',
            where: addTotalCriteriaToWhere({
              table: 'zaehlung',
              store,
              where: { kultur_id: k.id },
            }),
          })
            .filter(
              (z) =>
                !!z.datum && zaehlungIdsOfTzWithAnzahlPflanzen.includes(z.id),
            )
            .toArray()
          const lastZaehlungDatum = max(
            zaehlungs.map((z) => z.datum).filter((d) => d <= date),
          )
          const lastZaehlungsOfKultur = await Promise.all(
            zaehlungs.filter((z) => z.datum === lastZaehlungDatum),
          )
          const lastTzAnzahls = await Promise.all(
            lastZaehlungsOfKultur.map(async (z) => {
              const tzs = await z.teilzaehlungs({ store })

              return sum(tzs.map((tz) => tz.anzahl_pflanzen))
            }),
          )
          return {
            anzahl_pflanzen: sum(lastTzAnzahls),
            prognose: lastZaehlungsOfKultur.some((z) => z.prognose),
          }
        }),
      )
      const lastZaehlungs = {
        anzahl_pflanzen: sum(
          lastZaehlungsByKultur.map((z) => z.anzahl_pflanzen),
        ),
        prognose: lastZaehlungsByKultur.some((z) => z.prognose),
      }

      // need to return old date in case no zaehlung exists
      const lastZaehlungDatum =
        max(
          [...zaehlungsDone, ...zaehlungsPlanned]
            .map((z) => z.datum)
            .filter((d) => !!d)
            .filter((d) => d <= date),
        ) || '1900-01-01'
      const sammlungsSinceLastZaehlung = [
        ...sammlungsDone,
        ...sammlungsPlanned,
      ].filter((l) => l.datum > lastZaehlungDatum && l.datum <= date)
      const sammlungsSince = {
        anzahl_pflanzen: sum(
          sammlungsSinceLastZaehlung.map((s) => s.anzahl_pflanzen),
        ),
        geplant: !!sammlungsPlanned.filter(
          (l) => l.datum > lastZaehlungDatum && l.datum <= date,
        ).length,
      }

      const lieferungsSinceLastZaehlung = [
        ...lieferungsDone,
        ...lieferungsPlanned,
      ].filter((l) => l.datum > lastZaehlungDatum && l.datum <= date)
      const lieferungsSince = {
        anzahl_pflanzen: sum(
          lieferungsSinceLastZaehlung.map((s) => s.anzahl_pflanzen),
        ),
        geplant: !!lieferungsPlanned.filter(
          (l) => l.datum > lastZaehlungDatum && l.datum <= date,
        ).length,
      }

      const zaehlungsCountNow = [...zaehlungsDone, ...zaehlungsPlanned].filter(
        (s) => s.datum === date,
      ).length
      const zaehlungsTitle = zaehlungsCountNow
        ? zaehlungsCountNow === 1
          ? `${zaehlungsCountNow} Zählung`
          : `${zaehlungsCountNow} Zählungen`
        : undefined

      const sCount = [...sammlungsDone, ...sammlungsPlanned].filter(
        (s) => s.datum === date,
      ).length
      const sammlungsTitle = sCount
        ? sCount === 1
          ? `${sCount} Sammlung`
          : `${sCount} Sammlungen`
        : undefined

      const lfCount = [...lieferungsDone, ...lieferungsPlanned].filter(
        (s) => s.datum === date,
      ).length
      const lieferungsTitle = lfCount
        ? lfCount === 1
          ? `${lfCount} Auspflanzung`
          : `${lfCount} Auspflanzungen`
        : undefined

      const data = {
        datum: date,
        'Anzahl berechnet':
          lastZaehlungs.anzahl_pflanzen +
          sammlungsSince.anzahl_pflanzen -
          lieferungsSince.anzahl_pflanzen,
        Zählung:
          lastZaehlungs.prognose ||
          sammlungsSince.geplant ||
          lieferungsSince.geplant
            ? undefined
            : lastZaehlungs.anzahl_pflanzen +
              sammlungsSince.anzahl_pflanzen -
              lieferungsSince.anzahl_pflanzen,
        Prognose:
          lastZaehlungs.prognose ||
          sammlungsSince.geplant ||
          lieferungsSince.geplant
            ? lastZaehlungs.anzahl_pflanzen +
              sammlungsSince.anzahl_pflanzen -
              lieferungsSince.anzahl_pflanzen
            : undefined,
        Sammlung: sammlungNow || undefined,
        'Sammlung geplant': sammlungPlannedNow || undefined,
        Auspflanzung: lieferungNow || undefined,
        'Auspflanzung geplant': lieferungPlannedNow || undefined,
        title: [zaehlungsTitle, sammlungsTitle, lieferungsTitle]
          .filter((e) => !!e)
          .join(', '),
      }

      return data
    }),
  )
}

export default buildData
