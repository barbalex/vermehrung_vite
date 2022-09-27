import format from 'date-fns/format'

import exists from '../../../../../../utils/exists'
import eventSort from '../../../../../../utils/eventSort'
import lieferungSort from '../../../../../../utils/lieferungSort'
import teilkulturSort from '../../../../../../utils/teilkulturSort'
import zaehlungSort from '../../../../../../utils/zaehlungSort'
import { dexie } from '../../../../../../dexieClient'
import totalFilter from '../../../../../../utils/totalFilter'
import collectionFromTable from '../../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../../utils/addTotalCriteriaToWhere'

const createMessageFunctions = async ({ kulturId, store }) => {
  const year = +format(new Date(), 'yyyy')
  const startYear = `${year}-01-01`
  const startNextYear = `${year + 1}-01-01`
  const now = new Date()

  const events = await collectionFromTable({
    table: 'event',
    where: addTotalCriteriaToWhere({
      table: 'event',
      store,
      where: { kultur_id: kulturId },
    }),
  }).toArray()
  const eventsSorted = events.sort(eventSort)

  const kultur = await dexie.kulturs.get(kulturId)

  const auslieferungs = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: { von_kultur_id: kulturId },
    }),
  }).toArray()
  const auslieferungsSorted = auslieferungs.sort(lieferungSort)
  const anlieferungs = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      table: 'lieferung',
      store,
      where: { nach_kultur_id: kulturId },
    }),
  }).toArray()
  const anlieferungsSorted = anlieferungs.sort(lieferungSort)

  const teilkulturs = await collectionFromTable({
    table: 'teilkultur',
    where: addTotalCriteriaToWhere({
      table: 'teilkultur',
      store,
      where: { kultur_id: kulturId },
    }),
  }).toArray()
  const teilkultursSorted = teilkulturs.sort(teilkulturSort)

  const zaehlungs = await collectionFromTable({
    table: 'zaehlung',
    where: addTotalCriteriaToWhere({
      table: 'zaehlung',
      store,
      where: { kultur_id: kulturId },
    }),
  }).toArray()
  const zaehlungsSorted = zaehlungs.sort(zaehlungSort)
  const idsOfZaehlungs = zaehlungs.map((z) => z.id)

  const teilzaehlungs = await dexie.teilzaehlungs
    .where('zaehlung_id')
    .anyOf(idsOfZaehlungs)
    .filter((value) => totalFilter({ value, store, table: 'teilzaehlung' }))
    .toArray()

  return {
    kultursWithoutVonAnzahlIndividuen: async () =>
      await Promise.all(
        [kultur]
          .filter((k) => !exists(k.von_anzahl_individuen))
          .map(async (k) => {
            const text = await k.label()

            return {
              url: ['Vermehrung', 'Kulturen', kulturId],
              text,
            }
          }),
      ),
    kultursWithoutGarten: async () =>
      await Promise.all(
        [kultur]
          .filter((k) => !k.garten_id)
          .map(async (k) => {
            const text = await k.label()

            return {
              url: ['Vermehrung', 'Kulturen', kulturId],
              text,
            }
          }),
      ),
    kultursWithoutHerkunft: async () =>
      await Promise.all(
        [kultur]
          .filter((k) => !k.herkunft_id)
          .map(async (k) => {
            const text = await k.label()

            return {
              url: ['Vermehrung', 'Kulturen', kulturId],
              text,
            }
          }),
      ),
    kultursWithoutZaehlungThisYear: async () =>
      await Promise.all(
        [kultur]
          .filter(
            (k) =>
              zaehlungs
                .filter((z) => z.kultur_id === k.id)
                .filter((z) => !z._deleted)
                .filter(
                  (z) =>
                    z.datum && z.datum > startYear && z.datum < startNextYear,
                ).length === 0,
          )
          .map(async (k) => {
            const text = await k.label()

            return {
              url: ['Vermehrung', 'Kulturen', kulturId],
              text,
            }
          }),
      ),
    teilkultursWithoutName: async () =>
      await Promise.all(
        teilkultursSorted
          .filter((tk) => !tk.name)
          .map(async (tk) => {
            const kultur = await tk.kultur()
            const kulturLabel = await kultur?.label()

            return {
              url: ['Vermehrung', 'Kulturen', kulturId, 'Teilkulturen', tk.id],
              text: `${kulturLabel ?? '(keine Kultur)'}, Teilkultur-ID: ${
                tk.id
              }`,
            }
          }),
      ),
    zaehlungsInFutureNotPrognose: async () =>
      await Promise.all(
        zaehlungsSorted
          .filter((z) => !!z.datum)
          .filter((z) => new Date(z.datum).getTime() > now)
          .map(async (z) => {
            const kultur = await z.kultur()
            const kulturLabel = await kultur?.label()

            return {
              url: [
                'Vermehrung',
                'Arten',
                kultur?.art_id,
                'Kulturen',
                z.id,
                'Zaehlungen',
                z.id,
              ],
              text: `${kulturLabel ?? '(keine Kultur)'}, Zählung-ID: ${z.id}`,
            }
          }),
      ),
    zaehlungsWithoutDatum: async () =>
      await Promise.all(
        zaehlungsSorted
          .filter((z) => !z.datum)
          .map(async (z) => {
            const kultur = await z.kultur()
            const kulturLabel = await kultur?.label()

            return {
              url: [
                'Vermehrung',
                'Arten',
                kultur?.art_id,
                'Kulturen',
                kulturId,
                'Zaehlungen',
                z.id,
              ],
              text: `${kulturLabel ?? '(keine Kultur)'}, Zählung-ID: ${z.id}`,
            }
          }),
      ),
    zaehlungsWithoutAnzahlPflanzen: async () =>
      await Promise.all(
        zaehlungsSorted
          .filter(
            (z) =>
              teilzaehlungs
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted)
                .filter((tz) => !exists(tz.anzahl_pflanzen)).length,
          )
          .map(async (z) => {
            const kultur = await z.kultur()
            const kulturLabel = await kultur?.label()

            const zaehlungLabel = z.datum
              ? `Zählung am ${format(new Date(z.datum), 'yyyy.MM.dd')}`
              : `Zählung-ID: ${z.id}`

            const tzs = teilzaehlungs.filter((t) => t.zaehlung_id === z.id)
            const anzTz = tzs.length
            const teilzaehlung = anzTz > 1 ? ` (${anzTz} Teilzählungen)` : ''
            const text = `${
              kulturLabel ?? '(keine Kultur)'
            }, ${zaehlungLabel}${teilzaehlung}`

            return {
              url: [
                'Vermehrung',
                'Arten',
                kultur?.art_id,
                'Kulturen',
                kulturId,
                'Zaehlungen',
                z.id,
              ],
              text,
            }
          }),
      ),
    zaehlungsWithoutAnzahlAuspflanzbereit: async () =>
      await Promise.all(
        zaehlungsSorted
          .filter(
            (z) =>
              teilzaehlungs
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted)
                .filter((tz) => !exists(tz.anzahl_auspflanzbereit)).length,
          )
          .map(async (z) => {
            const kultur = await z.kultur()
            const kulturLabel = await kultur?.label()

            const zaehlung = z.datum
              ? `Zählung am ${format(new Date(z.datum), 'yyyy.MM.dd')}`
              : `Zählung-ID: ${z.id}`
            const anzTz = teilzaehlungs
              .filter((tz) => tz.zaehlung_id === z.id)
              .filter((tz) => !tz._deleted).length
            const teilzaehlung = anzTz > 1 ? ` (${anzTz} Teilzählungen)` : ''
            const text = `${
              kulturLabel ?? '(keine Kultur)'
            }, ${zaehlung}${teilzaehlung}`
            return {
              url: [
                'Vermehrung',
                'Arten',
                kultur?.art_id,
                'Kulturen',
                kulturId,
                'Zaehlungen',
                z.id,
              ],
              text,
            }
          }),
      ),
    zaehlungsWithoutAnzahlMutterpflanzen: async () =>
      await Promise.all(
        zaehlungsSorted
          .filter(
            (z) =>
              teilzaehlungs
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted)
                .filter((tz) => !exists(tz.anzahl_mutterpflanzen)).length,
          )
          .map(async (z) => {
            const kultur = await z.kultur()
            const kulturLabel = await kultur?.label()

            const zaehlung = z.datum
              ? `Zählung am ${format(new Date(z.datum), 'yyyy.MM.dd')}`
              : `Zählung-ID: ${z.id}`
            const anzTz = teilzaehlungs
              .filter((tz) => tz.zaehlung_id === z.id)
              .filter((tz) => !tz._deleted).length
            const teilzaehlung = anzTz > 1 ? ` (${anzTz} Teilzählungen)` : ''
            const text = `${
              kulturLabel ?? '(keine Kultur)'
            }, ${zaehlung}${teilzaehlung}`

            return {
              url: [
                'Vermehrung',
                'Arten',
                kultur?.art_id,
                'Kulturen',
                kulturId,
                'Zaehlungen',
                z.id,
              ],
              text,
            }
          }),
      ),
    zaehlungsWithTeilzaehlungsWithoutTeilkulturThoughTeilkulturIsChoosen:
      async () =>
        await Promise.all(
          zaehlungsSorted
            .filter(async (z) => {
              const kulturOption = await z.kulturOption()

              return !!kulturOption?.tk
            })
            .filter((z) => {
              const tzs = teilzaehlungs
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted)
              return tzs.length && tzs.filter((tz) => !tz.teilkultur_id).length
            })
            .map(async (z) => {
              const kultur = await z.kultur()
              const kulturLabel = await kultur?.label()

              const zaehlung = z.datum
                ? `Zählung am ${format(new Date(z.datum), 'yyyy.MM.dd')}`
                : `Zählung-ID: ${z.id}`
              const anzTz = teilzaehlungs
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted).length
              const teilzaehlung = anzTz > 1 ? ` (${anzTz} Teilzählungen)` : ''

              return {
                url: [
                  'Vermehrung',
                  'Arten',
                  kultur?.art_id,
                  'Kulturen',
                  kultur?.id,
                  'Zaehlungen',
                  z.id,
                ],
                text: `${
                  kulturLabel ?? '(keine Kultur)'
                }, ${zaehlung}${teilzaehlung}`,
              }
            }),
        ),
    lieferungsWithMultipleVon: async () =>
      auslieferungsSorted
        .filter((l) => !!l.von_sammlung_id)
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Lieferungen', l.id],
            text,
          }
        }),
    lieferungsWithMultipleNach: async () =>
      anlieferungsSorted
        .filter((l) => l.nach_ausgepflanzt)
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Lieferungen', l.id],
            text,
          }
        }),
    anLieferungsWithoutAnzahlPflanzen: async () =>
      anlieferungsSorted
        .filter((l) => !exists(l.anzahl_pflanzen))
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
            text,
          }
        }),
    ausLieferungsWithoutAnzahlPflanzen: async () =>
      auslieferungsSorted
        .filter((l) => !exists(l.anzahl_pflanzen))
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
            text,
          }
        }),
    anLieferungsWithoutAnzahlAuspflanzbereit: async () =>
      anlieferungsSorted
        .filter((l) => !exists(l.anzahl_auspflanzbereit))
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
            text,
          }
        }),
    ausLieferungsWithoutAnzahlAuspflanzbereit: async () =>
      auslieferungsSorted
        .filter((l) => !exists(l.anzahl_auspflanzbereit))
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
            text,
          }
        }),
    anLieferungsWithoutVonAnzahlIndividuen: async () =>
      anlieferungsSorted
        .filter((l) => !exists(l.von_anzahl_individuen))
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
            text,
          }
        }),
    ausLieferungsWithoutVonAnzahlIndividuen: async () =>
      auslieferungsSorted
        .filter((l) => !exists(l.von_anzahl_individuen))
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
            text,
          }
        }),
    anLieferungsWithoutVon: async () =>
      anlieferungsSorted
        .filter((l) => !l.von_kultur_id)
        .filter((l) => !l.von_sammlung_id)
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
            text,
          }
        }),
    ausLieferungsWithoutNach: async () =>
      auslieferungsSorted
        .filter((l) => !l.nach_kultur_id)
        .filter((l) => !l.nach_ausgepflanzt)
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
            text,
          }
        }),
    anLieferungsWithoutDatum: async () =>
      anlieferungsSorted
        .filter((l) => !l.datum)
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
            text,
          }
        }),
    ausLieferungsWithoutDatum: async () =>
      auslieferungsSorted
        .filter((l) => !l.datum)
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
            text,
          }
        }),
    anLieferungsWithoutPerson: async () =>
      anlieferungsSorted
        .filter((l) => !l.person_id)
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
            text,
          }
        }),
    ausLieferungsWithoutPerson: async () =>
      auslieferungsSorted
        .filter((l) => !l.person_id)
        .map((l) => {
          const datum = l.datum
            ? format(new Date(l.datum), 'yyyy.MM.dd')
            : `kein Datum`
          const geplant = l.geplant ? ', (geplant)' : ''
          const text = `${datum}, ID: ${l.id}${geplant}`

          return {
            url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
            text,
          }
        }),
    eventsWithoutBeschreibung: async () =>
      await Promise.all(
        eventsSorted
          .filter((e) => !e.beschreibung)
          .map(async (ev) => {
            const kultur = await ev.kultur()
            const kulturLabel = await kultur?.label()

            return {
              url: ['Vermehrung', 'Kulturen', kulturId, 'Events', ev.id],
              text: `${kulturLabel ?? '(keine Kultur)'}, Event-ID: ${ev.id}`,
            }
          }),
      ),
    eventsWithoutDatum: async () =>
      await Promise.all(
        eventsSorted
          .filter((e) => !e.datum)
          .map(async (ev) => {
            const kultur = await ev.kultur()
            const kulturLabel = await kultur?.label()

            return {
              url: ['Vermehrung', 'Kulturen', kulturId, 'Events', ev.id],
              text: `${kulturLabel ?? '(keine Kultur)'}, Event-ID: ${ev.id}`,
            }
          }),
      ),
  }
}

export default createMessageFunctions
