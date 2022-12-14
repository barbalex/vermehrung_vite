import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import sumBy from 'lodash/sumBy'
import format from 'date-fns/format'

import exists from '../../../../../utils/exists'
import collectionFromTable from '../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../utils/addTotalCriteriaToWhere'

const buildData = async ({ row }) => {
  const zaehlungs = await collectionFromTable({
    table: 'zaehlung',
    where: addTotalCriteriaToWhere({
      table: 'zaehlung',
      store,
      where: { kultur_id: row.id },
    }),
  }).sortBy('datum')
  const zaehlungsDone = await zaehlungs.filter(
    (z) =>
      z.prognose === false &&
      !!z.datum &&
      z.datum <= format(new Date(), 'yyyy-mm-dd'),
  )
  const lastZaehlungDone = zaehlungsDone.slice(-1)[0] ?? {}

  const zaehlungsPlanned = zaehlungs.filter(
    (z) => z.prognose === true && !!z.datum,
  )
  const zaehlungenPlannedIgnored = zaehlungsPlanned.filter((zg) =>
    // check if more recent zaehlungenDone exists
    zaehlungsDone.some((z) => z.datum >= zg.datum),
  )

  let zaehlungenPlannedIncluded = zaehlungsPlanned.filter(
    (lg) => !zaehlungenPlannedIgnored.map((l) => l.id).includes(lg.id),
  )
  if (zaehlungenPlannedIncluded.length) {
    // need to add last zaehlung to zaehlungenPlannedIncluded to connect lines
    zaehlungenPlannedIncluded = [lastZaehlungDone, ...zaehlungenPlannedIncluded]
  }

  // console.log('Kultur buildData', {
  //   zaehlungs,
  //   zaehlungsDone,
  //   lastZaehlungDone,
  //   zaehlungsPlanned,
  //   zaehlungenPlannedIgnored,
  // })

  const zaehlungenForLine = sortBy(
    [...zaehlungsDone, ...zaehlungenPlannedIncluded],
    'datum',
  )
  const zaehlungenForLineReversed = [...zaehlungenForLine].reverse()
  const zaehlungenDoneData = await Promise.all(
    zaehlungsDone.map(async (z) => {
      const teilzaehlungs = await collectionFromTable({
        table: 'teilzaehlung',
        where: addTotalCriteriaToWhere({
          table: 'teilzaehlung',
          store,
          where: { zaehlung_id: z.id },
        }),
      }).toArray()
      const anzahlenPflanzen = teilzaehlungs
        .map((tz) => tz.anzahl_pflanzen)
        .filter((a) => exists(a))
      const anzPflanzen = anzahlenPflanzen.length
        ? anzahlenPflanzen.reduce((a, b) => a + b, 0)
        : undefined
      const anzahlenAuspflanzbereit = teilzaehlungs
        .map((tz) => tz.anzahl_auspflanzbereit)
        .filter((a) => exists(a))
      const anzAuspflanzbereit = anzahlenAuspflanzbereit.length
        ? anzahlenAuspflanzbereit.reduce((a, b) => a + b, 0)
        : undefined
      const anzahlenMutterPflanzen = teilzaehlungs
        .map((tz) => tz.anzahl_mutterpflanzen)
        .filter((a) => exists(a))
      const anzMutterPflanzen = anzahlenMutterPflanzen.length
        ? anzahlenMutterPflanzen.reduce((a, b) => a + b, 0)
        : undefined
      const datum = new Date(z.datum).getTime()

      return {
        datum: datum,
        'Z??hlung Pflanzen': anzPflanzen,
        'Z??hlung Pflanzen auspflanzbereit': anzAuspflanzbereit,
        'Z??hlung Mutterpflanzen': anzMutterPflanzen,
        'Z??hlung andere Mengen': teilzaehlungs
          .map((t) => t.andere_menge)
          .join(', '),
        'Z??hlung Beschreibung auspflanzbereite Pflanzen': teilzaehlungs
          .map((t) => t.auspflanzbereit_beschreibung)
          .join(', '),
        'Z??hlung Bemerkungen': teilzaehlungs
          .map((t) => t.bemerkungen)
          .join(', '),
        ereignis: 'Z??hlung',
      }
    }),
  )
  const zaehlungenPlannedIncludedData = await Promise.all(
    zaehlungenPlannedIncluded.map(async (z) => {
      const teilzaehlungs = z.teilzaehlungs
        ? await await collectionFromTable({
            table: 'teilzaehlung',
            where: addTotalCriteriaToWhere({
              table: 'teilzaehlung',
              store,
              where: { zaehlung_id: z.id },
            }),
          }).toArray()
        : []
      const anzahlenPflanzen = teilzaehlungs
        .map((tz) => tz.anzahl_pflanzen)
        .filter((a) => exists(a))
      const anzPflanzen = anzahlenPflanzen.length
        ? anzahlenPflanzen.reduce((a, b) => a + b, 0)
        : undefined
      const anzahlenAuspflanzbereit = teilzaehlungs
        .map((tz) => tz.anzahl_auspflanzbereit)
        .filter((a) => exists(a))
      const anzAuspflanzbereit = anzahlenAuspflanzbereit.length
        ? anzahlenAuspflanzbereit.reduce((a, b) => a + b, 0)
        : undefined
      const anzahlenMutterPflanzen = teilzaehlungs
        .map((tz) => tz.anzahl_mutterpflanzen)
        .filter((a) => exists(a))
      const anzMutterPflanzen = anzahlenMutterPflanzen.length
        ? anzahlenMutterPflanzen.reduce((a, b) => a + b, 0)
        : undefined

      return {
        datum: new Date(z.datum).getTime(),
        'Z??hlung Pflanzen Prognose': anzPflanzen,
        'Z??hlung Pflanzen auspflanzbereit Prognose': anzAuspflanzbereit,
        'Z??hlung Mutterpflanzen Prognose': anzMutterPflanzen,
        'Z??hlung Prognose': teilzaehlungs
          .map((t) => (t.prognose ? 'ja' : 'nein'))
          .join(', '),
        'Z??hlung andere Mengen': teilzaehlungs
          .map((t) => t.andere_menge)
          .join(', '),
        'Z??hlung Beschreibung auspflanzbereite Pflanzen': teilzaehlungs
          .map((t) => t.auspflanzbereit_beschreibung)
          .join(', '),
        'Z??hlung Bemerkungen': teilzaehlungs
          .map((t) => t.bemerkungen)
          .join(', '),
        ereignis: 'Z??hlung',
      }
    }),
  )
  const zaehlungenPlannedIgnoredData = await Promise.all(
    zaehlungenPlannedIgnored.map(async (z) => {
      const teilzaehlungs = await collectionFromTable({
        table: 'teilzaehlung',
        where: addTotalCriteriaToWhere({
          table: 'teilzaehlung',
          store,
          where: { zaehlung_id: z.id },
        }),
      }).toArray()
      const anzahlenPflanzen = teilzaehlungs
        .map((tz) => tz.anzahl_pflanzen)
        .filter((a) => exists(a))
      const anzPflanzen = anzahlenPflanzen.length
        ? anzahlenPflanzen.reduce((a, b) => a + b, 0)
        : undefined
      const anzahlenAuspflanzbereit = teilzaehlungs
        .map((tz) => tz.anzahl_auspflanzbereit)
        .filter((a) => exists(a))
      const anzAuspflanzbereit = anzahlenAuspflanzbereit.length
        ? anzahlenAuspflanzbereit.reduce((a, b) => a + b, 0)
        : undefined
      const anzahlenMutterPflanzen = teilzaehlungs
        .map((tz) => tz.anzahl_mutterpflanzen)
        .filter((a) => exists(a))
      const anzMutterPflanzen = anzahlenMutterPflanzen.length
        ? anzahlenMutterPflanzen.reduce((a, b) => a + b, 0)
        : undefined

      return {
        datum: new Date(z.datum).getTime(),
        'Z??hlung Pflanzen Prognose, ignoriert': anzPflanzen,
        'Z??hlung Pflanzen auspflanzbereit Prognose, ignoriert':
          anzAuspflanzbereit,
        'Z??hlung Mutterpflanzen Prognose, ignoriert': anzMutterPflanzen,
        'Z??hlung Prognose': teilzaehlungs
          .map((t) => (t.prognose ? 'ja' : 'nein'))
          .join(', '),
        'Z??hlung andere Mengen': teilzaehlungs
          .map((t) => t.andere_menge)
          .join(', '),
        'Z??hlung Beschreibung auspflanzbereite Pflanzen': teilzaehlungs
          .map((t) => t.auspflanzbereit_beschreibung)
          .join(', '),
        'Z??hlung Bemerkungen': teilzaehlungs
          .map((t) => t.bemerkungen)
          .join(', '),
        ereignis: 'Z??hlung',
      }
    }),
  )
  const zaehlungenDataGroupedByDatum = groupBy(
    [...zaehlungenDoneData, ...zaehlungenPlannedIncludedData],
    'datum',
  )
  const zaehlungenData = Object.entries(
    zaehlungenDataGroupedByDatum,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ).map(([key, value]) => Object.assign({}, ...value))

  const anLieferungenDone = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: { nach_kultur_id: row.id },
    }),
  })
    .filter(
      (l) =>
        l.geplant === false &&
        !!l.datum &&
        l.datum <= format(new Date(), 'yyyy-mm-dd'),
    )
    .toArray()
  const anLieferungenPlanned = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: { nach_kultur_id: row.id },
    }),
  })
    .filter((l) => l.geplant === false && !!l.datum)
    .toArray()
  const anLieferungenPlannedIgnored = anLieferungenPlanned.filter((lg) =>
    // check if more recent anLieferungenDone exists
    anLieferungenDone.some((lu) => lu.datum >= lg.datum),
  )
  const anLieferungenPlannedIncluded = anLieferungenPlanned.filter(
    (lg) => !anLieferungenPlannedIgnored.map((l) => l.id).includes(lg.id),
  )
  const anLieferungenForLine = sortBy(
    [...anLieferungenDone, ...anLieferungenPlannedIncluded],
    'datum',
  )

  const ausLieferungenDone = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: { von_kultur_id: row.id },
    }),
  })
    .filter(
      (l) =>
        l.geplant === false &&
        !!l.datum &&
        l.datum <= format(new Date(), 'yyyy-mm-dd'),
    )
    .toArray()
  const ausLieferungenPlanned = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: { von_kultur_id: row.id },
    }),
  })
    .filter((l) => l.geplant === true && !!l.datum)
    .toArray()
  const ausLieferungenPlannedIgnored = ausLieferungenPlanned.filter((lg) =>
    // check if more recent ausLieferungenDone exists
    ausLieferungenDone.some((l) => l.datum >= lg.datum),
  )
  const ausLieferungenPlannedIncluded = ausLieferungenPlanned.filter(
    (lg) => !ausLieferungenPlannedIgnored.map((l) => l.id).includes(lg.id),
  )
  const ausLieferungenForLine = sortBy(
    [...ausLieferungenDone, ...ausLieferungenPlannedIncluded],
    'datum',
  )
  const anLieferungenDoneData = await Promise.all(
    anLieferungenDone.map(async (l) => {
      // 1. previous Zaehlung is basis
      // If none, pretend this is first zaehlung
      const previousZaehlung = zaehlungenForLineReversed.find(
        (z) => z.datum < l.datum,
      )
      // 2. Summ all Lieferungen since
      const anLieferungenSince = anLieferungenForLine.filter(
        (a) =>
          a.datum > (previousZaehlung?.datum ?? '1900.01.01') &&
          a.datum < l.datum,
      )
      const ausLieferungenSince = ausLieferungenForLine.filter(
        (a) =>
          a.datum > (previousZaehlung?.datum ?? '1900.01.01') &&
          a.datum < l.datum,
      )

      const previousZaehlungTzs = previousZaehlung
        ? await collectionFromTable({
            table: 'teilzaehlung',
            where: addTotalCriteriaToWhere({
              table: 'teilzaehlung',
              store,
              where: { zaehlung_id: previousZaehlung?.id },
            }),
          }).toArray()
        : []
      const anzahlenPflanzenOfPreviousZaehlung = previousZaehlungTzs
        .map((tz) => tz.anzahl_pflanzen)
        .filter((a) => exists(a))
      const anzPflanzen = anzahlenPflanzenOfPreviousZaehlung.reduce(
        (a, b) => a + b,
        0,
      )
      const anzahlenAuspflanzbereitOfPreviousZaehlung = previousZaehlungTzs
        .map((tz) => tz.anzahl_auspflanzbereit)
        .filter((a) => exists(a))
      const anzAuspflanzbereit =
        anzahlenAuspflanzbereitOfPreviousZaehlung.reduce((a, b) => a + b, 0)

      const sumAnzahlPflanzen =
        anzPflanzen +
        (sumBy(anLieferungenSince, 'anzahl_pflanzen') || 0) -
        (sumBy(ausLieferungenSince, 'anzahl_pflanzen') || 0)
      const sumAnzahlAuspflanzbereit =
        anzAuspflanzbereit +
        (sumBy(anLieferungenSince, 'anzahl_auspflanzbereit') || 0) -
        (sumBy(ausLieferungenSince, 'anzahl_auspflanzbereit') || 0)

      return {
        datum: new Date(l.datum).getTime(),
        'Lieferung Pflanzen': l.anzahl_pflanzen || undefined,
        'Lieferung Pflanzen auspflanzbereit':
          l.anzahl_auspflanzbereit || undefined,
        'Lieferung andere Mengen': l.andere_menge,
        'Lieferung Gramm Samen': l.gramm_samen,
        'Lieferung von Anzahl Individuen': l.von_anzahl_individuen,
        'Lieferung Bemerkungen': l.bemerkungen,
        'Z??hlung Pflanzen': sumAnzahlPflanzen + l.anzahl_pflanzen ?? undefined,
        'Z??hlung Pflanzen auspflanzbereit':
          sumAnzahlAuspflanzbereit + l.anzahl_auspflanzbereit ?? undefined,
        ereignis: 'Lieferung',
      }
    }),
  )
  const ausLieferungenDoneData = await Promise.all(
    ausLieferungenDone.map(async (l) => {
      // 1. previous Zaehlung is basis. If none, take 0
      const previousZaehlung = zaehlungenForLineReversed.find(
        (z) => z.datum < l.datum,
      )
      // 2. Summ all Lieferungen since
      const anLieferungenSince = anLieferungenForLine.filter(
        (a) =>
          a.datum > (previousZaehlung?.datum ?? '1900.01.01') &&
          a.datum < l.datum,
      )
      const ausLieferungenSince = ausLieferungenForLine.filter(
        (a) =>
          a.datum > (previousZaehlung?.datum ?? '1900.01.01') &&
          a.datum < l.datum,
      )
      const previousZaehlungTzs = previousZaehlung
        ? await collectionFromTable({
            table: 'teilzaehlung',
            where: addTotalCriteriaToWhere({
              table: 'teilzaehlung',
              store,
              where: { zaehlung_id: previousZaehlung?.id },
            }),
          }).toArray()
        : []
      const anzahlenPflanzenOfPreviousZaehlung = previousZaehlungTzs
        .map((tz) => tz.anzahl_pflanzen)
        .filter((a) => exists(a))
      const anzPflanzen = anzahlenPflanzenOfPreviousZaehlung.reduce(
        (a, b) => a + b,
        0,
      )
      const anzahlenAuspflanzbereitOfPreviousZaehlung = previousZaehlungTzs
        .map((tz) => tz.anzahl_auspflanzbereit)
        .filter((a) => exists(a))
      const anzAuspflanzbereit =
        anzahlenAuspflanzbereitOfPreviousZaehlung.reduce((a, b) => a + b, 0)
      const sumAnzahlPflanzen =
        anzPflanzen +
        (sumBy(anLieferungenSince, 'anzahl_pflanzen') || 0) -
        (sumBy(ausLieferungenSince, 'anzahl_pflanzen') || 0)
      const sumAnzahlAuspflanzbereit =
        anzAuspflanzbereit +
        (sumBy(anLieferungenSince, 'anzahl_auspflanzbereit') || 0) -
        (sumBy(ausLieferungenSince, 'anzahl_auspflanzbereit') || 0)

      return {
        datum: new Date(l.datum).getTime(),
        'Lieferung Pflanzen': -l.anzahl_pflanzen || undefined,
        'Lieferung Pflanzen auspflanzbereit':
          -l.anzahl_auspflanzbereit || undefined,
        'Lieferung andere Mengen': l.andere_menge,
        'Lieferung Gramm Samen': l.gramm_samen,
        'Lieferung von Anzahl Individuen': l.von_anzahl_individuen,
        'Lieferung Bemerkungen': l.bemerkungen,
        'Z??hlung Pflanzen': sumAnzahlPflanzen - l.anzahl_pflanzen ?? undefined,
        'Z??hlung Pflanzen auspflanzbereit':
          sumAnzahlAuspflanzbereit - l.anzahl_auspflanzbereit ?? undefined,
        ereignis: 'Lieferung',
      }
    }),
  )
  const anLieferungenPlannedData = await Promise.all(
    anLieferungenPlannedIncluded.map(async (l) => {
      // 1. previous Zaehlung is basis
      // If none, pretend this is first zaehlung
      const previousZaehlung = zaehlungenForLineReversed.find(
        (z) => z.datum < l.datum,
      )
      // 2. Summ all Lieferungen since
      const anLieferungenSince = anLieferungenPlannedIncluded.filter(
        (a) =>
          a.datum > (previousZaehlung?.datum ?? '1900.01.01') &&
          a.datum < l.datum,
      )
      const ausLieferungenSince = ausLieferungenPlannedIncluded.filter(
        (a) =>
          a.datum > (previousZaehlung?.datum ?? '1900.01.01') &&
          a.datum < l.datum,
      )

      const previousZaehlungTzs = previousZaehlung
        ? await collectionFromTable({
            table: 'teilzaehlung',
            where: addTotalCriteriaToWhere({
              table: 'teilzaehlung',
              store,
              where: { zaehlung_id: previousZaehlung?.id },
            }),
          }).toArray()
        : []
      const anzahlenPflanzenOfPreviousZaehlung = previousZaehlungTzs
        .map((tz) => tz.anzahl_pflanzen)
        .filter((a) => exists(a))
      const anzPflanzen = anzahlenPflanzenOfPreviousZaehlung.reduce(
        (a, b) => a + b,
        0,
      )
      const anzahlenAuspflanzbereitOfPreviousZaehlung = previousZaehlungTzs
        .map((tz) => tz.anzahl_auspflanzbereit)
        .filter((a) => exists(a))
      const anzAuspflanzbereit =
        anzahlenAuspflanzbereitOfPreviousZaehlung.reduce((a, b) => a + b, 0)
      const sumAnzahlPflanzen =
        anzPflanzen +
        (sumBy(anLieferungenSince, 'anzahl_pflanzen') || 0) -
        (sumBy(ausLieferungenSince, 'anzahl_pflanzen') || 0)
      const sumAnzahlAuspflanzbereit =
        anzAuspflanzbereit +
        (sumBy(anLieferungenSince, 'anzahl_auspflanzbereit') || 0) -
        (sumBy(ausLieferungenSince, 'anzahl_auspflanzbereit') || 0)

      const data = {
        datum: new Date(l.datum).getTime(),
        'Lieferung Pflanzen geplant': l.anzahl_pflanzen || undefined,
        'Lieferung Pflanzen auspflanzbereit geplant':
          l.anzahl_auspflanzbereit || undefined,
        'Lieferung andere Mengen': l.andere_menge,
        'Lieferung Gramm Samen': l.gramm_samen,
        'Lieferung von Anzahl Individuen': l.von_anzahl_individuen,
        'Lieferung Bemerkungen': l.bemerkungen,
        ereignis: 'Lieferung',
      }
      if (data.datum < new Date(lastZaehlungDone.datum).getTime()) {
        data['Z??hlung Pflanzen'] =
          sumAnzahlPflanzen + l.anzahl_pflanzen ?? undefined
        data['Z??hlung Pflanzen auspflanzbereit'] =
          sumAnzahlAuspflanzbereit + l.anzahl_auspflanzbereit ?? undefined
      } else {
        data['Z??hlung Pflanzen Prognose'] =
          sumAnzahlPflanzen + l.anzahl_pflanzen ?? undefined
        data['Z??hlung Pflanzen auspflanzbereit Prognose'] =
          sumAnzahlAuspflanzbereit + l.anzahl_auspflanzbereit ?? undefined
      }
      return data
    }),
  )
  const anLieferungenPlannedIgnoredData = anLieferungenPlannedIgnored.map(
    (l) => ({
      datum: new Date(l.datum).getTime(),
      'Lieferung Pflanzen geplant, ignoriert': l.anzahl_pflanzen || undefined,
      'Lieferung Pflanzen auspflanzbereit geplant, ignoriert':
        l.anzahl_auspflanzbereit || undefined,
      'Lieferung andere Mengen': l.andere_menge,
      'Lieferung Gramm Samen': l.gramm_samen,
      'Lieferung von Anzahl Individuen': l.von_anzahl_individuen,
      'Lieferung Bemerkungen': l.bemerkungen,
      ereignis: 'Lieferung',
    }),
  )
  const ausLieferungenPlannedData = await Promise.all(
    ausLieferungenPlannedIncluded.map(async (l) => {
      // 1. previous Zaehlung is basis
      // If none, pretend this is first zaehlung
      const previousZaehlung = zaehlungenForLineReversed.find(
        (z) => z.datum < l.datum,
      )
      // 2. Summ all Lieferungen since
      const anLieferungenSince = anLieferungenPlannedIncluded.filter(
        (a) =>
          a.datum > (previousZaehlung?.datum ?? '1900.01.01') &&
          a.datum < l.datum,
      )
      const ausLieferungenSince = ausLieferungenPlannedIncluded.filter(
        (a) =>
          a.datum > (previousZaehlung?.datum ?? '1900.01.01') &&
          a.datum < l.datum,
      )

      const previousZaehlungTzs = previousZaehlung
        ? await collectionFromTable({
            table: 'teilzaehlung',
            where: addTotalCriteriaToWhere({
              table: 'teilzaehlung',
              store,
              where: { zaehlung_id: previousZaehlung?.id },
            }),
          }).toArray()
        : []
      const anzahlenPflanzenOfPreviousZaehlung = previousZaehlungTzs
        .map((tz) => tz.anzahl_pflanzen)
        .filter((a) => exists(a))
      const anzPflanzen = anzahlenPflanzenOfPreviousZaehlung.reduce(
        (a, b) => a + b,
        0,
      )
      const anzahlenAuspflanzbereitOfPreviousZaehlung = previousZaehlungTzs
        .map((tz) => tz.anzahl_auspflanzbereit)
        .filter((a) => exists(a))
      const anzAuspflanzbereit =
        anzahlenAuspflanzbereitOfPreviousZaehlung.reduce((a, b) => a + b, 0)
      const sumAnzahlPflanzen =
        anzPflanzen +
        (sumBy(anLieferungenSince, 'anzahl_pflanzen') || 0) -
        (sumBy(ausLieferungenSince, 'anzahl_pflanzen') || 0)
      const sumAnzahlAuspflanzbereit =
        anzAuspflanzbereit +
        (sumBy(anLieferungenSince, 'anzahl_auspflanzbereit') || 0) -
        (sumBy(ausLieferungenSince, 'anzahl_auspflanzbereit') || 0)

      const data = {
        datum: new Date(l.datum).getTime(),
        'Lieferung Pflanzen geplant': -l.anzahl_pflanzen || undefined,
        'Lieferung Pflanzen auspflanzbereit geplant':
          -l.anzahl_auspflanzbereit || undefined,
        'Lieferung andere Mengen': l.andere_menge,
        'Lieferung Gramm Samen': l.gramm_samen,
        'Lieferung von Anzahl Individuen': l.von_anzahl_individuen,
        'Lieferung Bemerkungen': l.bemerkungen,
        ereignis: 'Lieferung',
      }
      if (data.datum < new Date(lastZaehlungDone.datum).getTime()) {
        data['Z??hlung Pflanzen'] =
          sumAnzahlPflanzen - l.anzahl_pflanzen ?? undefined
        data['Z??hlung Pflanzen auspflanzbereit'] =
          sumAnzahlAuspflanzbereit - l.anzahl_auspflanzbereit ?? undefined
      } else {
        data['Z??hlung Pflanzen Prognose'] =
          sumAnzahlPflanzen - l.anzahl_pflanzen ?? undefined
        data['Z??hlung Pflanzen auspflanzbereit Prognose'] =
          sumAnzahlAuspflanzbereit - l.anzahl_auspflanzbereit ?? undefined
      }
      return data
    }),
  )
  const ausLieferungenPlannedIgnoredData = ausLieferungenPlannedIgnored.map(
    (l) => ({
      datum: new Date(l.datum).getTime(),
      'Lieferung Pflanzen geplant, ignoriert': -l.anzahl_pflanzen || undefined,
      'Lieferung Pflanzen auspflanzbereit geplant, ignoriert':
        -l.anzahl_auspflanzbereit || undefined,
      'Lieferung andere Mengen': l.andere_menge,
      'Lieferung Gramm Samen': l.gramm_samen,
      'Lieferung von Anzahl Individuen': l.von_anzahl_individuen,
      'Lieferung Bemerkungen': l.bemerkungen,
      ereignis: 'Lieferung',
    }),
  )

  const allData = sortBy(
    [
      ...anLieferungenDoneData,
      ...anLieferungenPlannedData,
      ...anLieferungenPlannedIgnoredData,
      ...ausLieferungenDoneData,
      ...ausLieferungenPlannedData,
      ...ausLieferungenPlannedIgnoredData,
      ...zaehlungenData,
      ...zaehlungenPlannedIgnoredData,
    ],
    'datum',
  )

  return allData
}

export default buildData
