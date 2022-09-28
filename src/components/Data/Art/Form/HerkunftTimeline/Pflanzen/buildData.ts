import uniq from 'lodash/uniq'
import sum from 'lodash/sum'
import max from 'lodash/max'

import { dexie } from '../../../../../../dexieClient'
import exists from '../../../../../../utils/exists'
import collectionFromTable from '../../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../../utils/addTotalCriteriaToWhere'

const buildData = async ({ artId, herkunftId }) => {
  const kultursOfArt = await collectionFromTable({
    table: 'kultur',
    where: addTotalCriteriaToWhere({
      table: 'kultur',
      store,
      where: { art_id: artId, herkunft_id: herkunftId },
    }),
  }).toArray()
  const idsOfKultursOfArt = kultursOfArt.map((k) => k.id)
  const zaehlungsDoneAll = await dexie.zaehlungs
    .where('[kultur_id+prognose_indexable+_deleted_indexable]')
    .anyOf(idsOfKultursOfArt.map((id) => [id, 0, 0]))
    .filter((z) => !!z.datum)
    .toArray()
  const idsOfZaehlungsDoneAll = zaehlungsDoneAll.map((z) => z.id)
  const teilzaehlungsOfZaehlungsDoneWithAnzahlPflanzen =
    await dexie.teilzaehlungs
      .where('[zaehlung_id+_deleted_indexable]')
      .anyOf(idsOfZaehlungsDoneAll.map((id) => [id, 0]))
      .filter((tz) => exists(tz.anzahl_pflanzen))
      .toArray()
  const zaehlungIdsOfTzOfZaehlungsDoneWithAnzahlPflanzen = [
    ...new Set(
      teilzaehlungsOfZaehlungsDoneWithAnzahlPflanzen.map(
        (tz) => tz.zaehlung_id,
      ),
    ),
  ]
  const zaehlungsDone = await dexie.zaehlungs
    .where('[zaehlung_id+_deleted_indexable]')
    .anyOf(
      zaehlungIdsOfTzOfZaehlungsDoneWithAnzahlPflanzen.map((id) => [id, 0]),
    )
    .toArray()
  // same for planned
  const zaehlungsPlannedAll1 = await dexie.zaehlungs
    .where('[kultur_id+prognose_indexable+_deleted_indexable]')
    .anyOf(idsOfKultursOfArt.map((id) => [id, 1, 0]))
    .filter((z) => !!z.datum)
    .toArray()
  const idsOfZaehlungsPlannedAll1 = zaehlungsPlannedAll1.map((z) => z.id)
  const teilzaehlungsOfZaehlungsPlannedWithAnzahlPflanzen =
    await dexie.teilzaehlungs
      .where('[zaehlung_id+_deleted_indexable]')
      .anyOf(idsOfZaehlungsPlannedAll1.map((id) => [id, 0]))
      .filter((tz) => exists(tz.anzahl_pflanzen))
      .toArray()
  const zaehlungIdsOfTzOfZaehlungsPlannedWithAnzahlPflanzen = [
    ...new Set(
      teilzaehlungsOfZaehlungsPlannedWithAnzahlPflanzen.map(
        (tz) => tz.zaehlung_id,
      ),
    ),
  ]
  const zaehlungsPlannedAll = await dexie.zaehlungs
    .where('[id+_deleted_indexable]')
    .anyOf(
      zaehlungIdsOfTzOfZaehlungsPlannedWithAnzahlPflanzen.map((id) => [id, 0]),
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
      where: { art_id: artId, herkunft_id: herkunftId },
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
      where: { art_id: artId, herkunft_id: herkunftId },
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

  const allLieferungsDone = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: { art_id: artId },
    }),
  })
    .filter(
      (l) =>
        l.nach_ausgepflanzt === true &&
        l.geplant === false &&
        !!l.datum &&
        exists(l.anzahl_pflanzen),
    )
    .toArray()
  const allLieferungsDonePromises = await Promise.all(
    allLieferungsDone.map(async (l) => {
      const vonKultur = await dexie.kulturs.get(
        l.von_kultur_id ?? '99999999-9999-9999-9999-999999999999',
      )

      return vonKultur?.herkunft_id === herkunftId
    }),
  )
  const lieferungsDoneOfThisHerkunft = allLieferungsDone.filter(
    (p, i) => allLieferungsDonePromises[i],
  )

  const allLieferungsPlanned = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: { art_id: artId },
    }),
  })
    .filter(
      (l) =>
        l.nach_ausgepflanzt === true &&
        l.geplant === true &&
        !!l.datum &&
        exists(l.anzahl_pflanzen),
    )
    .toArray()
  // can't use Q.on here because there are two associations to kultur
  const allLieferungsPlannedPromises = await Promise.all(
    allLieferungsPlanned.map(async (l) => {
      const vonKultur = await dexie.kulturs.get(
        l.von_kultur_id ?? '99999999-9999-9999-9999-999999999999',
      )

      return vonKultur?.herkunft_id === herkunftId
    }),
  )
  const lieferungsPlannedOfThisHerkunft = allLieferungsPlanned.filter(
    (l, i) => allLieferungsPlannedPromises[i],
  )
  const lieferungsPlannedIgnored = lieferungsPlannedOfThisHerkunft.filter(
    (zg) =>
      // check if more recent zaehlungsDone exists
      lieferungsDoneOfThisHerkunft.some((z) => z.datum >= zg.datum),
  )
  const lieferungsPlanned = lieferungsPlannedOfThisHerkunft.filter(
    (lg) => !lieferungsPlannedIgnored.map((l) => l.id).includes(lg.id),
  )

  // 1. get list of all dates when something was counted
  const dates = uniq(
    [
      ...zaehlungsDone,
      ...zaehlungsPlanned,
      ...sammlungsDone,
      ...sammlungsPlanned,
      ...lieferungsDoneOfThisHerkunft,
      ...lieferungsPlanned,
    ].map((z) => z.datum),
  ).sort()
  // 2. get list of all non deleted kulturs
  //    these are the basis for counting:
  //    at every date the last count is used
  // is: kultursOfArt
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
        lieferungsDoneOfThisHerkunft
          .filter((s) => s.datum === date)
          .map((s) => s.anzahl_pflanzen),
      )
      const lieferungPlannedNow = -sum(
        lieferungsPlanned
          .filter((s) => s.datum === date)
          .map((s) => s.anzahl_pflanzen),
      )

      const lastZaehlungsByKultur = await Promise.all(
        kultursOfArt.map(async (k) => {
          // for every kultur return
          // last zaehlung and whether it is prognose
          const allZaehlungs = await collectionFromTable({
            table: 'zaehlung',
            where: addTotalCriteriaToWhere({
              table: 'zaehlung',
              store,
              where: { kultur_id: k.id },
            }),
          })
            .filter((z) => !!z.datum)
            .toArray()
          const idsOfAllZaehlungs = allZaehlungs.map((z) => z.id)
          const tzsOfAllZaehlungs = await dexie.teilzaehlungs
            .where('[zaehlung_id,_deleted_indexable]')
            .anyOf(idsOfAllZaehlungs.map((id) => [id, 0]))
            .filter((tz) => exists(tz.anzahl_pflanzen))
            .toArray()
          const zaehlungIdsOfTzsOfAllZaehlungs = [
            ...new Set(tzsOfAllZaehlungs.map((tz) => tz.zaehlung_id)),
          ]
          const zaehlungs = await dexie.zaehlungs
            .where('[id+_deleted_indexable]')
            .anyOf(zaehlungIdsOfTzsOfAllZaehlungs.map((z) => [z.id, 0]))
            .toArray()
          const lastZaehlungDatum = max(
            zaehlungs.map((z) => z.datum).filter((d) => d <= date),
          )
          const lastZaehlungsOfKultur = zaehlungs.filter(
            (z) => z.datum === lastZaehlungDatum,
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
        ...lieferungsDoneOfThisHerkunft,
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

      const lfCount = [
        ...lieferungsDoneOfThisHerkunft,
        ...lieferungsPlanned,
      ].filter((s) => s.datum === date).length
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
