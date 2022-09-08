import format from 'date-fns/format'
import groupBy from 'lodash/groupBy'

import exists from '../../../../../../utils/exists'

import artsSortedFromArts from '../../../../../../utils/artsSortedFromArts'
import gartensSortedFromGartens from '../../../../../../utils/gartensSortedFromGartens'
import kultursSortedFromKulturs from '../../../../../../utils/kultursSortedFromKulturs'
import sammlungsSortedFromSammlungs from '../../../../../../utils/sammlungsSortedFromSammlungs'
import eventSort from '../../../../../../utils/eventSort'
import herkunftSort from '../../../../../../utils/herkunftSort'
import lieferungSort from '../../../../../../utils/lieferungSort'
import personSort from '../../../../../../utils/personSort'
import teilkulturSort from '../../../../../../utils/teilkulturSort'
import zaehlungSort from '../../../../../../utils/zaehlungSort'
import personFullname from '../../../../../../utils/personFullname'
import { dexie } from '../../../../../../dexieClient'
import totalFilter from '../../../../../../utils/totalFilter'

const createMessageFunctions = async ({ artId, store }) => {
  const year = +format(new Date(), 'yyyy')
  const startYear = `${year}-01-01`
  const startNextYear = `${year + 1}-01-01`

  const arts = await dexie.arts
    .filter((value) => totalFilter({ value, store, table: 'art' }))
    .toArray()
  const artsSorted = await artsSortedFromArts(arts)

  const avs = await dexie.avs
    .filter((value) => totalFilter({ value, store, table: 'av' }))
    .toArray()

  const herkunfts = await dexie.herkunfts
    .filter((value) => totalFilter({ value, store, table: 'herkunft' }))
    .toArray()
  const herkunftsSorted = herkunfts.sort(herkunftSort)

  const kulturs = await dexie.kulturs
    .filter(
      (value) =>
        totalFilter({ value, store, table: 'kultur' }) &&
        value.art_id === artId,
    )
    .toArray()
  const kultursSorted = await kultursSortedFromKulturs(kulturs)
  const kulturIds = kultursSorted.map((k) => k.id)

  const lieferungs = await dexie.lieferungs
    .filter((value) => totalFilter({ value, store, table: 'lieferung' }))
    .toArray()
  const lieferungsSorted = lieferungs.sort(lieferungSort)

  const persons = await dexie.persons
    .filter((value) => totalFilter({ value, store, table: 'person' }))
    .toArray()
  const personsSorted = persons.sort(personSort)

  const sammlungsOfArt = await dexie.sammlungs
    .filter(
      (value) =>
        totalFilter({ value, store, table: 'sammlung' }) &&
        value.art_id === artId,
    )
    .toArray()
  const sammlungsOfArtSorted = await sammlungsSortedFromSammlungs(
    sammlungsOfArt,
  )

  const zaehlungsOfArt = await dexie.zaehlungs
    .where('kultur_id')
    .anyOf(kulturIds)
    .and((value) => totalFilter({ value, store, table: 'zaehlung' }))
    .toArray()
  const zaehlungsOfArtSorted = zaehlungsOfArt.sort(zaehlungSort)
  const zaehlungIds = zaehlungsOfArtSorted.map((z) => z.id)

  const teilzaehlungsOfArt = await dexie.teilzaehlungs
    .where('zaehlung_id')
    .anyOf(zaehlungIds)
    .and((value) => totalFilter({ value, store, table: 'teilzaehlung' }))
    .toArray()

  const teilkulturs = await dexie.teilkulturs
    .where('kultur_id')
    .anyOf(kulturIds)
    .and((value) => totalFilter({ value, store, table: 'teilkultur' }))
    .toArray()
  const teilkultursSorted = teilkulturs.sort(teilkulturSort)

  const events = await dexie.events
    .where('kultur_id')
    .anyOf(kulturIds)
    .and((value) => totalFilter({ value, store, table: 'event' }))
    .toArray()
  const eventsSorted = events.sort(eventSort)

  return {
    personsWithNonUniqueNr: async () => {
      const pGroupedByNr = groupBy(
        personsSorted.filter((p) => exists(p.nr)),
        (h) => h.nr,
      )
      return Object.values(pGroupedByNr)
        .filter((v) => v.length > 1)
        .flatMap((vs) =>
          vs.map((v) => {
            const fullname = personFullname(v)

            return {
              url: ['Vermehrung', 'Personen', v.id],
              text: `${v.nr}${fullname ? `, ${fullname}` : ''}`,
            }
          }),
        )
    },
    herkunftsWithNonUniqueNr: async () => {
      const hkGroupedByNr = groupBy(herkunftsSorted, (h) => h.nr)

      return Object.values(hkGroupedByNr)
        .filter((v) => v.length > 1)
        .flatMap((vs) =>
          vs.map((v) => ({
            url: ['Vermehrung', 'Herkuenfte', v.id],
            text: `${v.nr}${v.lokalname ? `, ${v.lokalname}` : ''}${
              v.gemeinde ? `, ${v.gemeinde}` : ''
            }`,
          })),
        )
    },
    artsOhneAv: async () =>
      await Promise.all(
        artsSorted
          .filter((a) => a.id === artId)
          .filter(
            (a) =>
              !avs
                .filter((av) => av.art_id === a.id)
                .filter((av) => !av._deleted).length,
          )
          .map(async (a) => {
            const text = await a.label()

            return {
              url: ['Vermehrung', 'Arten', a.id],
              text,
            }
          }),
      ),
    sammlungsWithoutLieferung: async () =>
      await Promise.all(
        sammlungsOfArtSorted
          .filter((s) => s.art_id === artId)
          .filter(
            (s) => !lieferungsSorted.find((l) => l.von_sammlung_id === s.id),
          )
          .map(async (s) => {
            const text = await s.label()

            return {
              url: ['Vermehrung', 'Sammlungen', s.id],
              text,
            }
          }),
      ),
    sammlungsWithNonUniqueNr: async () => {
      const sGroupedByNr = groupBy(
        sammlungsOfArtSorted.filter((s) => s.art_id === artId),
        (h) => h.nr,
      )

      return await Promise.all(
        Object.values(sGroupedByNr)
          .filter((s) => s.length > 1)
          .flatMap((vs) =>
            vs.map(async (s) => {
              const text = await s.label()

              return {
                url: ['Vermehrung', 'Sammlungen', s.id],
                text,
              }
            }),
          ),
      )
    },
    sammlungsWithoutNr: async () =>
      await Promise.all(
        sammlungsOfArtSorted
          .filter((s) => s.art_id === artId)
          .filter((s) => !exists(s.nr))
          .map(async (s) => {
            const text = await s.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Sammlungen', s.id],
              text,
            }
          }),
      ),
    sammlungsWithoutHerkunft: async () =>
      await Promise.all(
        sammlungsOfArtSorted
          .filter((s) => s.art_id === artId)
          .filter((s) => !s.herkunft_id)
          .map(async (s) => {
            const text = await s.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Sammlungen', s.id],
              text,
            }
          }),
      ),
    sammlungsWithoutPerson: async () =>
      await Promise.all(
        sammlungsOfArtSorted
          .filter((s) => s.art_id === artId)
          .filter((s) => !s.person_id)
          .map(async (s) => {
            const text = await s.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Sammlungen', s.id],
              text,
            }
          }),
      ),
    sammlungsWithoutDatum: async () =>
      await Promise.all(
        sammlungsOfArtSorted
          .filter((s) => s.art_id === artId)
          .filter((s) => !s.datum)
          .map(async (s) => {
            const text = await s.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Sammlungen', s.id],
              text,
            }
          }),
      ),
    sammlungsWithoutAnzahlPflanzen: async () =>
      await Promise.all(
        sammlungsOfArtSorted
          .filter((s) => s.art_id === artId)
          .filter((s) => !exists(s.anzahl_pflanzen))
          .map(async (s) => {
            const text = await s.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Sammlungen', s.id],
              text,
            }
          }),
      ),
    sammlungsWithoutVonAnzahlIdividuen: async () =>
      await Promise.all(
        sammlungsOfArtSorted
          .filter((s) => s.art_id === artId)
          .filter((s) => !exists(s.von_anzahl_individuen))
          .map(async (s) => {
            const text = await s.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Sammlungen', s.id],
              text,
            }
          }),
      ),
    // gartensAllKultursInactive: async () => {
    //   let kulturs = []
    //   try {
    //     kulturs = await db
    //       .get('kultur')
    //       .query(Q.where('art_id', Q.eq(artId)), Q.where('_deleted', false))
    //       .fetch()
    //   } catch {}

    //   const gartenIds = kulturs
    //     .filter((s) => !!s.garten_id)
    //     .map((k) => k.garten_id)
    //   const uniqueGartenIds = [...new Set(gartenIds)]

    //   let gartens = []
    //   try {
    //     gartens = await db
    //       .get('garten')
    //       .query(
    //         Q.where('_deleted', false),
    //         Q.where('aktiv', true),
    //         Q.where('id', Q.oneOf(uniqueGartenIds)),
    //       )
    //       .fetch()
    //   } catch {}
    //   const gartensOfArt = await gartensSortedFromGartens(gartens)
    //   const filterPromiseArray = gartensOfArt.map(async (g) => {
    //     let kulturs = []
    //     try {
    //       kulturs = await g.kulturs.extend(Q.where('_deleted', false)).fetch()
    //     } catch {}

    //     return !!kulturs.length && kulturs.every((k) => !k.aktiv)
    //   })
    //   const gartensFiltered = gartensOfArt.filter(
    //     (g, i) => filterPromiseArray[i] && g.aktiv,
    //   )
    //   return await Promise.all(
    //     gartensFiltered.map(async (g) => {
    //       const text = await g.label()

    //       return {
    //         url: ['Vermehrung', 'Gaerten', g.id],
    //         text,
    //       }
    //     }),
    //   )
    // },
    kultursWithoutVonAnzahlIndividuen: async () =>
      await Promise.all(
        kultursSorted
          .filter((s) => !exists(s.von_anzahl_individuen))
          .map(async (k) => {
            const text = await k.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Kulturen', k.id],
              text,
            }
          }),
      ),
    kultursWithoutGarten: async () =>
      await Promise.all(
        kultursSorted
          .filter((s) => !s.garten_id)
          .map(async (k) => {
            const text = await k.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Kulturen', k.id],
              text,
            }
          }),
      ),
    kultursWithoutHerkunft: async () =>
      await Promise.all(
        kultursSorted
          .filter((s) => !s.herkunft_id)
          .map(async (k) => {
            const text = await k.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Kulturen', k.id],
              text,
            }
          }),
      ),
    kultursWithoutZaehlungThisYear: async () =>
      await Promise.all(
        kultursSorted
          .filter(
            (k) =>
              zaehlungsOfArt
                .filter((z) => z.id === k.zaehlung_id)
                .filter((z) => !z._deleted)
                .filter(
                  (z) =>
                    z.datum && z.datum > startYear && z.datum < startNextYear,
                ).length === 0,
          )
          .map(async (k) => {
            const text = await k.label()

            return {
              url: ['Vermehrung', 'Arten', artId, 'Kulturen', k.id],
              text,
            }
          }),
      ),
    teilkultursWithoutName: async () =>
      await Promise.all(
        teilkultursSorted
          .filter((tk) => !tk.name)
          .map(async (tk) => {
            const kultur = await dexie.kulturs.get(tk.kultur_id)
            const kulturLabel = await kultur?.label()
            const text = `${kulturLabel ?? '(keine Kultur)'}, Teilkultur-ID: ${
              tk.id
            }`

            return {
              url: [
                'Vermehrung',
                'Arten',
                artId,
                'Kulturen',
                kultur?.id,
                'Teilkulturen',
                tk.id,
              ],
              text,
            }
          }),
      ),
    // zaehlungsInFutureNotPrognose: async () => {
    //   const zaehlungs = await db
    //     .get('zaehlung')
    //     .query(
    //       Q.experimentalNestedJoin('kultur', 'art'),
    //       Q.on('kultur', Q.on('art', 'id', artId)),
    //       Q.where(
    //         '_deleted',
    //         Q.oneOf(
    //           filter.zaehlung._deleted === false
    //             ? [false]
    //             : filter.zaehlung._deleted === true
    //             ? [true]
    //             : [true, false, null],
    //         ),
    //       ),
    //       Q.where('datum', Q.notEq(null)),
    //       Q.where('datum', Q.gte(format(new Date(), 'yyyy-mm-dd'))),
    //     )
    //     .fetch()

    //   return await Promise.all(
    //     zaehlungs.map(async (z) => {
    //       let kultur
    //       try {
    // kultur = await dexie.kulturs.get(z.kultur_id)
    //       } catch {}
    //       const kulturLabel = await kultur?.label()
    //       const text = `${kulturLabel ?? '(keine kultur)'}, Zählung-ID: ${z.id}`

    //       return {
    //         url: [
    //           'Vermehrung',
    //           'Arten',
    //           artId,
    //           'Kulturen',
    //           z.id,
    //           'Zaehlungen',
    //           z.id,
    //         ],
    //         text,
    //       }
    //     }),
    //   )
    // },
    // zaehlungsWithoutDatum: async () => {
    //   let zaehlungs = []
    //   try {
    //     zaehlungs = await db
    //       .get('zaehlung')
    //       .query(
    //         Q.experimentalNestedJoin('kultur', 'art'),
    //         Q.on('kultur', Q.on('art', 'id', artId)),
    //         Q.where(
    //           '_deleted',
    //           Q.oneOf(
    //             filter.zaehlung._deleted === false
    //               ? [false]
    //               : filter.zaehlung._deleted === true
    //               ? [true]
    //               : [true, false, null],
    //           ),
    //         ),
    //         Q.where('datum', Q.notEq(null)),
    //       )
    //       .fetch()
    //   } catch {}

    //   return await Promise.all(
    //     zaehlungs.map(async (z) => {
    //       let kultur
    //       try {
    // kultur = await dexie.kulturs.get(z.kultur_id)
    //       } catch {}
    //       const kulturLabel = await kultur?.label()
    //       const text = `${kulturLabel ?? '(keine Kultur)'}, Zählung-ID: ${z.id}`

    //       return {
    //         url: [
    //           'Vermehrung',
    //           'Arten',
    //           artId,
    //           'Kulturen',
    //           z.id,
    //           'Zaehlungen',
    //           z.id,
    //         ],
    //         text,
    //       }
    //     }),
    //   )
    // },
    zaehlungsWithoutAnzahlPflanzen: async () =>
      await Promise.all(
        zaehlungsOfArtSorted
          .filter(
            (z) =>
              teilzaehlungsOfArt
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted)
                .filter((tz) => !exists(tz.anzahl_pflanzen)).length,
          )
          .map(async (z) => {
            const kultur = await dexie.kulturs.get(z.kultur_id)
            const kulturLabel = await kultur.label()
            const zaehlung = z.datum
              ? `Zählung vom ${format(new Date(z.datum), 'yyyy.MM.dd')}`
              : `Zählung-ID: ${z.id}`
            const anzTz = teilzaehlungsOfArt
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
                artId,
                'Kulturen',
                kultur.id,
                'Zaehlungen',
                z.id,
              ],
              text,
            }
          }),
      ),
    zaehlungsWithoutAnzahlAuspflanzbereit: async () =>
      await Promise.all(
        zaehlungsOfArtSorted
          .filter(
            (z) =>
              teilzaehlungsOfArt
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted)
                .filter((tz) => !exists(tz.anzahl_auspflanzbereit)).length,
          )
          .map(async (z) => {
            const kultur = await dexie.kulturs.get(z.kultur_id)
            const kulturLabel = await kultur?.label()
            const zaehlung = z.datum
              ? `Zählung vom ${format(new Date(z.datum), 'yyyy.MM.dd')}`
              : `Zählung-ID: ${z.id}`
            const anzTz = teilzaehlungsOfArt
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
                artId,
                'Kulturen',
                kultur.id,
                'Zaehlungen',
                z.id,
              ],
              text,
            }
          }),
      ),
    zaehlungsWithoutAnzahlMutterpflanzen: async () =>
      await Promise.all(
        zaehlungsOfArtSorted
          .filter(
            (z) =>
              teilzaehlungsOfArt
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted)
                .filter((tz) => !exists(tz.anzahl_mutterpflanzen)).length,
          )
          .map(async (z) => {
            const kultur = await dexie.kulturs.get(z.kultur_id)
            const kulturLabel = await kultur?.label()
            const zaehlung = z.datum
              ? `Zählung vom ${format(new Date(z.datum), 'yyyy.MM.dd')}`
              : `Zählung-ID: ${z.id}`
            const anzTz = teilzaehlungsOfArt
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
                artId,
                'Kulturen',
                kultur?.id,
                'Zaehlungen',
                z.id,
              ],
              text,
            }
          }),
      ),
    // zaehlungsWithTeilzaehlungsWithoutTeilkulturThoughTeilkulturIsChoosen:
    //   async () => {
    //     let zaehlungsOfArt = []
    //     try {
    //       zaehlungsOfArt = await db
    //         .get('zaehlung')
    //         .query(
    //           Q.experimentalNestedJoin('kultur', 'art'),
    //           Q.on('kultur', Q.on('art', 'id', artId)),
    //           Q.experimentalNestedJoin('kultur', 'kultur_option'),
    //           Q.on('kultur', Q.on('kultur_option', 'tk', true)),
    //           Q.where(
    //             '_deleted',
    //             Q.oneOf(
    //               filter.zaehlung._deleted === false
    //                 ? [false]
    //                 : filter.zaehlung._deleted === true
    //                 ? [true]
    //                 : [true, false, null],
    //             ),
    //           ),
    //         )
    //         .fetch()
    //     } catch {}
    //     const zaehlungsOfArtSorted = zaehlungsOfArt.sort(zaehlungSort)
    //     return await Promise.all(
    //       zaehlungsOfArtSorted
    //         .filter((z) => {
    //           const tz = teilzaehlungsOfArt
    //             .filter((tz) => tz.zaehlung_id === z.id)
    //             .filter((tz) => !tz._deleted)
    //           return tz.length && tz.filter((tz) => !tz.teilkultur_id).length
    //         })
    //         .map(async (z) => {
    //           const kultur = await dexie.kulturs.get(z.kultur_id)
    //           const kulturLabel = await kultur?.label()
    //           const zaehlung = z.datum
    //             ? `Zählung vom ${format(new Date(z.datum), 'yyyy.MM.dd')}`
    //             : `Zählung-ID: ${z.id}`
    //           const anzTz = teilzaehlungsOfArt
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
    //               artId,
    //               'Kulturen',
    //               kultur?.id,
    //               'Zaehlungen',
    //               z.id,
    //             ],
    //             text,
    //           }
    //         }),
    //     )
    //   },
    lieferungsWithMultipleVon: async () =>
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => !!l.von_sammlung_id)
        .filter((l) => !!l.von_kultur_id)
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
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => l.nach_ausgepflanzt)
        .filter((l) => !!l.nach_kultur_id)
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
    lieferungsWithoutAnzahlPflanzen: async () =>
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => !exists(l.anzahl_pflanzen))
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
    lieferungsWithoutAnzahlAuspflanzbereit: async () =>
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => !exists(l.anzahl_auspflanzbereit))
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
    lieferungsWithoutVonAnzahlIndividuen: async () =>
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => !exists(l.von_anzahl_individuen))
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
    lieferungsWithoutVon: async () =>
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => !l.von_kultur_id)
        .filter((l) => !l.von_sammlung_id)
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
    lieferungsWithoutNach: async () =>
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => !!l.von_kultur_id || !!l.von_sammlung_id)
        .filter((l) => !l.nach_kultur_id)
        .filter((l) => !l.nach_ausgepflanzt)
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
    lieferungsWithoutDatum: async () =>
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => !l.datum)
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
    lieferungsWithoutPerson: async () =>
      lieferungsSorted
        .filter((l) => l.art_id === artId)
        .filter((l) => !l.person_id)
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
    eventsWithoutBeschreibung: async () =>
      await Promise.all(
        eventsSorted
          .filter((e) => !e.beschreibung)
          .map(async (e) => {
            const kultur = await dexie.kulturs.get(e.kultur_id)
            const kulturLabel = await kultur?.label()
            const text = `${kulturLabel ?? '(keine Kultur)'}, Event-ID: ${e.id}`

            return {
              url: [
                'Vermehrung',
                'Arten',
                artId,
                'Kulturen',
                kultur?.id,
                'Events',
                e.id,
              ],
              text,
            }
          }),
      ),
    eventsWithoutDatum: async () =>
      await Promise.all(
        eventsSorted
          .filter((e) => !e.datum)
          .map(async (e) => {
            const kultur = await dexie.kulturs.get(e.kultur_id)
            const kulturLabel = await kultur?.label()
            const text = `${kulturLabel ?? '(keine Kultur)'}, Event-ID: ${e.id}`

            return {
              url: [
                'Vermehrung',
                'Arten',
                artId,
                'Kulturen',
                kultur.id,
                'Events',
                e.id,
              ],
              text,
            }
          }),
      ),
  }
}

export default createMessageFunctions
