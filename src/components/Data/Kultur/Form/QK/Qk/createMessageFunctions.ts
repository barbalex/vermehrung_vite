import format from 'date-fns/format'
import { first as first$ } from 'rxjs/operators'
import { Q } from '@nozbe/watermelondb'

import exists from '../../../../../../utils/exists'
import notDeletedQuery from '../../../../../../utils/notDeletedQuery'
import kultursSortedFromKulturs from '../../../../../../utils/kultursSortedFromKulturs'
import eventSort from '../../../../../../utils/eventSort'
import lieferungSort from '../../../../../../utils/lieferungSort'
import teilkulturSort from '../../../../../../utils/teilkulturSort'
import zaehlungSort from '../../../../../../utils/zaehlungSort'
import { dexie } from '../../../../../../dexieClient'
import totalFilter from '../../../../../../utils/totalFilter'

const createMessageFunctions = async ({ kulturId, db, store }) => {
  const { filter } = store
  const year = +format(new Date(), 'yyyy')
  const startYear = `${year}-01-01`
  const startNextYear = `${year + 1}-01-01`
  const now = new Date()

  const events = await dexie.events
    .filter((value) => totalFilter({ value, store, table: 'event' }))
    .toArray()
  const eventsSorted = events.sort(eventSort)

  const kulturs = await dexie.kulturs
    .filter((value) => totalFilter({ value, store, table: 'kultur' }))
    .toArray()
  const kultursSorted = await kultursSortedFromKulturs(kulturs)

  const lieferungs = await dexie.lieferungs
    .filter((value) => totalFilter({ value, store, table: 'lieferung' }))
    .toArray()
  const lieferungsSorted = lieferungs.sort(lieferungSort)

  const teilkulturs = await dexie.teilkulturs
    .filter((value) => totalFilter({ value, store, table: 'teilkultur' }))
    .toArray()
  const teilkultursSorted = teilkulturs.sort(teilkulturSort)

  const zaehlungs = await dexie.zaehlungs
    .filter((value) => totalFilter({ value, store, table: 'zaehlung' }))
    .toArray()
  const zaehlungsSorted = zaehlungs.sort(zaehlungSort)

  const teilzaehlungs = await dexie.teilzaehlungs
    .filter((value) => totalFilter({ value, store, table: 'teilzaehlung' }))
    .toArray()

  return {
    kultursWithoutVonAnzahlIndividuen: async () =>
      await Promise.all(
        kultursSorted
          .filter((k) => k.id === kulturId)
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
        kultursSorted
          .filter((k) => k.id === kulturId)
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
        kultursSorted
          .filter((k) => k.id === kulturId)
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
        kultursSorted
          .filter((k) => k.id === kulturId)
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
          .filter((tk) => tk.kultur_id === kulturId)
          .filter((tk) => !tk.name)
          .map(async (tk) => {
            const kultur = await dexie.kulturs.get(
              tk.kultur_id ?? '99999999-9999-9999-9999-999999999999',
            )
            const kulturLabel = await kultur.label()

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
          .filter((z) => z.kultur_id === kulturId)
          .filter((z) => !!z.datum)
          .filter((z) => new Date(z.datum).getTime() > now)
          .map(async (z) => {
            const kultur = await dexie.kulturs.get(
              z.kultur_id ?? '99999999-9999-9999-9999-999999999999',
            )
            const kulturLabel = await kultur.label()

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
          .filter((z) => z.kultur_id === kulturId)
          .filter((z) => !z.datum)
          .map(async (z) => {
            const kultur = await dexie.kulturs.get(
              z.kultur_id ?? '99999999-9999-9999-9999-999999999999',
            )
            const kulturLabel = await kultur.label()

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
    //   zaehlungsWithoutAnzahlPflanzen: async () =>
    //     await Promise.all(
    //       zaehlungsSorted
    //         .filter((z) => z.kultur_id === kulturId)
    //         .filter(
    //           (z) =>
    //             teilzaehlungs
    //               .filter((tz) => tz.zaehlung_id === z.id)
    //               .filter((tz) => !tz._deleted)
    //               .filter((tz) => !exists(tz.anzahl_pflanzen)).length,
    //         )
    //         .map(async (z) => {
    //           let kultur
    //           try {
    //             kultur = await z.kultur.fetch()
    //           } catch {}
    //           let kulturLabel
    //           try {
    //             kulturLabel = await kultur.label()
    //           } catch {}
    //           const zaehlungLabel = z.datum
    //             ? `Zählung am ${format(new Date(z.datum), 'yyyy.MM.dd')}`
    //             : `Zählung-ID: ${z.id}`
    //           const tzs = await z.teilzaehlungs.extend(notDeletedQuery).fetch()
    //           const anzTz = tzs.length
    //           const teilzaehlung = anzTz > 1 ? ` (${anzTz} Teilzählungen)` : ''
    //           const text = `${
    //             kulturLabel ?? '(keine Kultur)'
    //           }, ${zaehlungLabel}${teilzaehlung}`
    //           return {
    //             url: [
    //               'Vermehrung',
    //               'Arten',
    //               kultur?.art_id,
    //               'Kulturen',
    //               kulturId,
    //               'Zaehlungen',
    //               z.id,
    //             ],
    //             text,
    //           }
    //         }),
    //     ),
    //   zaehlungsWithoutAnzahlAuspflanzbereit: async () =>
    //     await Promise.all(
    //       zaehlungsSorted
    //         .filter((z) => z.kultur_id === kulturId)
    //         .filter(
    //           (z) =>
    //             teilzaehlungs
    //               .filter((tz) => tz.zaehlung_id === z.id)
    //               .filter((tz) => !tz._deleted)
    //               .filter((tz) => !exists(tz.anzahl_auspflanzbereit)).length,
    //         )
    //         .map(async (z) => {
    //           let kultur
    //           try {
    //             kultur = await z.kultur.fetch()
    //           } catch {}
    //           let kulturLabel
    //           try {
    //             kulturLabel = await kultur.label()
    //           } catch {}
    //           const zaehlung = z.datum
    //             ? `Zählung am ${format(new Date(z.datum), 'yyyy.MM.dd')}`
    //             : `Zählung-ID: ${z.id}`
    //           const anzTz = teilzaehlungs
    //             .filter((tz) => tz.zaehlung_id === z.id)
    //             .filter((tz) => !tz._deleted).length
    //           const teilzaehlung = anzTz > 1 ? ` (${anzTz} Teilzählungen)` : ''
    //           const text = `${
    //             kulturLabel ?? '(keine Kultur)'
    //           }, ${zaehlung}${teilzaehlung}`
    //           return {
    //             url: [
    //               'Vermehrung',
    //               'Arten',
    //               kultur?.art_id,
    //               'Kulturen',
    //               kulturId,
    //               'Zaehlungen',
    //               z.id,
    //             ],
    //             text,
    //           }
    //         }),
    //     ),
    //   zaehlungsWithoutAnzahlMutterpflanzen: async () =>
    //     await Promise.all(
    //       zaehlungsSorted
    //         .filter((z) => z.kultur_id === kulturId)
    //         .filter(
    //           (z) =>
    //             teilzaehlungs
    //               .filter((tz) => tz.zaehlung_id === z.id)
    //               .filter((tz) => !tz._deleted)
    //               .filter((tz) => !exists(tz.anzahl_mutterpflanzen)).length,
    //         )
    //         .map(async (z) => {
    //           let kultur
    //           try {
    //             kultur = await z.kultur.fetch()
    //           } catch {}
    //           let kulturLabel
    //           try {
    //             kulturLabel = await kultur.label()
    //           } catch {}
    //           const zaehlung = z.datum
    //             ? `Zählung am ${format(new Date(z.datum), 'yyyy.MM.dd')}`
    //             : `Zählung-ID: ${z.id}`
    //           const anzTz = teilzaehlungs
    //             .filter((tz) => tz.zaehlung_id === z.id)
    //             .filter((tz) => !tz._deleted).length
    //           const teilzaehlung = anzTz > 1 ? ` (${anzTz} Teilzählungen)` : ''
    //           const text = `${
    //             kulturLabel ?? '(keine Kultur)'
    //           }, ${zaehlung}${teilzaehlung}`
    //           return {
    //             url: [
    //               'Vermehrung',
    //               'Arten',
    //               kultur?.art_id,
    //               'Kulturen',
    //               kulturId,
    //               'Zaehlungen',
    //               z.id,
    //             ],
    //             text,
    //           }
    //         }),
    //     ),
    //   zaehlungsWithTeilzaehlungsWithoutTeilkulturThoughTeilkulturIsChoosen:
    //     async () =>
    //       await Promise.all(
    //         zaehlungsSorted
    //           .filter((z) => z.kultur_id === kulturId)
    //           .filter(async (z) => {
    //             let kulturOption
    //             try {
    //               kulturOption = await z.kultur_option.fetch()
    //             } catch {}
    //             return !!kulturOption?.tk
    //           })
    //           .filter((z) => {
    //             const tzs = teilzaehlungs
    //               .filter((tz) => tz.zaehlung_id === z.id)
    //               .filter((tz) => !tz._deleted)
    //             return tzs.length && tzs.filter((tz) => !tz.teilkultur_id).length
    //           })
    //           .map(async (z) => {
    //             let kultur
    //             try {
    //               kultur = await z.kultur.fetch()
    //             } catch {}
    //             let kulturLabel
    //             try {
    //               kulturLabel = await kultur.label()
    //             } catch {}
    //             const zaehlung = z.datum
    //               ? `Zählung am ${format(new Date(z.datum), 'yyyy.MM.dd')}`
    //               : `Zählung-ID: ${z.id}`
    //             const anzTz = teilzaehlungs
    //               .filter((tz) => tz.zaehlung_id === z.id)
    //               .filter((tz) => !tz._deleted).length
    //             const teilzaehlung = anzTz > 1 ? ` (${anzTz} Teilzählungen)` : ''
    //             return {
    //               url: [
    //                 'Vermehrung',
    //                 'Arten',
    //                 kultur?.art_id,
    //                 'Kulturen',
    //                 kultur?.id,
    //                 'Zaehlungen',
    //                 z.id,
    //               ],
    //               text: `${
    //                 kulturLabel ?? '(keine Kultur)'
    //               }, ${zaehlung}${teilzaehlung}`,
    //             }
    //           }),
    //       ),
    //   lieferungsWithMultipleVon: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.von_kultur_id === kulturId)
    //       .filter((l) => !!l.von_sammlung_id)
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   lieferungsWithMultipleNach: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.nach_kultur_id === kulturId)
    //       .filter((l) => l.nach_ausgepflanzt)
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   anLieferungsWithoutAnzahlPflanzen: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.nach_kultur_id === kulturId)
    //       .filter((l) => !exists(l.anzahl_pflanzen))
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   ausLieferungsWithoutAnzahlPflanzen: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.von_kultur_id === kulturId)
    //       .filter((l) => !exists(l.anzahl_pflanzen))
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   anLieferungsWithoutAnzahlAuspflanzbereit: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.nach_kultur_id === kulturId)
    //       .filter((l) => !exists(l.anzahl_auspflanzbereit))
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   ausLieferungsWithoutAnzahlAuspflanzbereit: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.von_kultur_id === kulturId)
    //       .filter((l) => !exists(l.anzahl_auspflanzbereit))
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   anLieferungsWithoutVonAnzahlIndividuen: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.nach_kultur_id === kulturId)
    //       .filter((l) => !exists(l.von_anzahl_individuen))
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   ausLieferungsWithoutVonAnzahlIndividuen: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.von_kultur_id === kulturId)
    //       .filter((l) => !exists(l.von_anzahl_individuen))
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   anLieferungsWithoutVon: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.nach_kultur_id === kulturId)
    //       .filter((l) => !l.von_kultur_id)
    //       .filter((l) => !l.von_sammlung_id)
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   ausLieferungsWithoutNach: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.von_kultur_id === kulturId)
    //       .filter((l) => !l.nach_kultur_id)
    //       .filter((l) => !l.nach_ausgepflanzt)
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   anLieferungsWithoutDatum: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.von_kultur_id === kulturId)
    //       .filter((l) => !l.datum)
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   ausLieferungsWithoutDatum: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.von_kultur_id === kulturId)
    //       .filter((l) => !l.datum)
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   anLieferungsWithoutPerson: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.nach_kultur_id === kulturId)
    //       .filter((l) => !l.person_id)
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   ausLieferungsWithoutPerson: async () =>
    //     lieferungsSorted
    //       .filter((l) => l.von_kultur_id === kulturId)
    //       .filter((l) => !l.person_id)
    //       .map((l) => {
    //         const datum = l.datum
    //           ? format(new Date(l.datum), 'yyyy.MM.dd')
    //           : `kein Datum`
    //         const geplant = l.geplant ? ', (geplant)' : ''
    //         const text = `${datum}, ID: ${l.id}${geplant}`
    //         return {
    //           url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', l.id],
    //           text,
    //         }
    //       }),
    //   eventsWithoutBeschreibung: async () =>
    //     await Promise.all(
    //       eventsSorted
    //         .filter((e) => e.kultur_id === kulturId)
    //         .filter((e) => !e.beschreibung)
    //         .map(async (ev) => {
    //           let kultur
    //           try {
    //             kultur = await ev.kultur.fetch()
    //           } catch {}
    //           let kulturLabel
    //           try {
    //             kulturLabel = await kultur.label()
    //           } catch {}
    //           return {
    //             url: ['Vermehrung', 'Kulturen', kulturId, 'Events', ev.id],
    //             text: `${kulturLabel ?? '(keine Kultur)'}, Event-ID: ${ev.id}`,
    //           }
    //         }),
    //     ),
    //   eventsWithoutDatum: async () =>
    //     await Promise.all(
    //       eventsSorted
    //         .filter((e) => e.kultur_id === kulturId)
    //         .filter((e) => !e.datum)
    //         .map(async (ev) => {
    //           let kultur
    //           try {
    //             kultur = await ev.kultur.fetch()
    //           } catch {}
    //           let kulturLabel
    //           try {
    //             kulturLabel = await kultur.label()
    //           } catch {}
    //           return {
    //             url: ['Vermehrung', 'Kulturen', kulturId, 'Events', ev.id],
    //             text: `${kulturLabel ?? '(keine Kultur)'}, Event-ID: ${ev.id}`,
    //           }
    //         }),
    //     ),
  }
}

export default createMessageFunctions
