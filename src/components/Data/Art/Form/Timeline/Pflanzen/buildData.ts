import uniq from 'lodash/uniq'
import sum from 'lodash/sum'
import max from 'lodash/max'
import { dexie } from '../../../../../../dexieClient'

const buildData = async ({ artId }) => {
  // 1. get list of all active, non deleted kulturs
  //    these are the basis for counting:
  //    at every date the last count is used
  const kulturs = await dexie.kulturs
    .filter(
      (k) => k.art_id === artId && k._deleted === false && k.aktiv === true,
    )
    .toArray()
  const kultursIds = kulturs.map((k) => k.id)
  const zaehlungsObservableForZaehlungs = dexie.zaehlungs
    .where('kultur_id')
    .anyOf(kultursIds)
    .and((z) => z._deleted === false && !!z.datum)
  const zaehlungs = await zaehlungsObservableForZaehlungs.toArray()
  const zaehlungsIds = zaehlungs.map((z) => z.id)
  const teilzaehlungsWithAnzahlPflanzen = await dexie.teilzaehlungs
    .where('zaehlung_id')
    .anyOf(zaehlungsIds)
    .and((tz) => tz._deleted === false && tz.anzahl_pflanzen !== null)
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
    .where('kultur_id')
    .anyOf(kultursIds)
    .and((z) => z._deleted === false && !!z.datum)
  const zaehlungsDone = await zaehlungsObservableForZaehlungsDone
    .and(
      (z) =>
        z.prognose === false &&
        zaehlungIdsOfTzWithAnzahlPflanzen.includes(z.id),
    )
    .toArray()

  const zaehlungsObservableForZaehlungsPlannedAll = dexie.zaehlungs
    .where('kultur_id')
    .anyOf(kultursIds)
    .and((z) => z._deleted === false && !!z.datum)
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

  const sammlungsDone = await dexie.sammlungs
    .filter(
      (s) =>
        s.art_id === artId &&
        s.geplant === false &&
        !!s.datum &&
        s.anzahl_pflanzen !== null &&
        s._deleted === false,
    )
    .toArray()
  const sammlungsPlannedAll = await dexie.sammlungs
    .filter(
      (s) =>
        s.art_id === artId &&
        s.geplant === true &&
        !!s.datum &&
        s.anzahl_pflanzen !== null &&
        s._deleted === false,
    )
    .toArray()
  const sammlungsPlannedIgnored = sammlungsPlannedAll.filter((zg) =>
    // check if more recent zaehlungsDone exists
    sammlungsDone.some((z) => z.datum >= zg.datum),
  )
  const sammlungsPlanned = sammlungsPlannedAll.filter(
    (lg) => !sammlungsPlannedIgnored.map((l) => l.id).includes(lg.id),
  )

  const lieferungsDone = await dexie.lieferungs
    .filter(
      (s) =>
        s.art_id === artId &&
        s.nach_ausgepflanzt === true &&
        s.geplant === false &&
        !!s.datum &&
        s.anzahl_pflanzen !== null &&
        s._deleted === false,
    )
    .toArray()
  const lieferungsPlannedAll = await dexie.lieferungs
    .filter(
      (s) =>
        s.art_id === artId &&
        s.nach_ausgepflanzt === true &&
        s.geplant === true &&
        !!s.datum &&
        s.anzahl_pflanzen !== null &&
        s._deleted === false,
    )
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

  console.log('Art Timeline buildData', {
    sammlungsDone,
    sammlungsPlanned,
    lieferungsDone,
    lieferungsPlanned,
    zaehlungsDone,
    zaehlungsPlanned,
  })

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
          const zaehlungs = await dexie.zaehlungs
            .filter(
              (z) =>
                z.kultur_id === k.id &&
                z._deleted === false &&
                !!z.datum &&
                zaehlungIdsOfTzWithAnzahlPflanzen.includes(z.id),
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
              const tzs = await z.teilzaehlungs()

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
