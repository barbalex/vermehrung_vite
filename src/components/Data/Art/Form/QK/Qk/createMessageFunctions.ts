import format from 'date-fns/format'
import groupBy from 'lodash/groupBy'

import exists from '../../../../../../utils/exists'

import gartensSortedFromGartens from '../../../../../../utils/gartensSortedFromGartens'
import kultursSortedFromKulturs from '../../../../../../utils/kultursSortedFromKulturs'
import eventSort from '../../../../../../utils/eventSort'
import lieferungSort from '../../../../../../utils/lieferungSort'
import personSort from '../../../../../../utils/personSort'
import teilkulturSort from '../../../../../../utils/teilkulturSort'
import zaehlungSort from '../../../../../../utils/zaehlungSort'
import personFullname from '../../../../../../utils/personFullname'
import { dexie, Art, Av, Herkunft } from '../../../../../../dexieClient'
import collectionFromTable from '../../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../../utils/addTotalCriteriaToWhere'

const createMessageFunctions = async ({ artId, store }) => {
  const year = +format(new Date(), 'yyyy')
  const startYear = `${year}-01-01`
  const startNextYear = `${year + 1}-01-01`

  const art: Art = await dexie.arts.get(
    artId ?? '99999999-9999-9999-9999-999999999999',
  )

  const avs: Av[] = await collectionFromTable({
    table: 'av',
    where: addTotalCriteriaToWhere({
      store,
      table: 'av',
      where: { art_id: artId },
    }),
  }).toArray()

  const allHerkunfts: Herkunft[] = await collectionFromTable({
    table: 'herkunft',
    where: addTotalCriteriaToWhere({ store, table: 'herkunft' }),
  }).toArray()

  const kulturs = await collectionFromTable({
    table: 'kultur',
    where: addTotalCriteriaToWhere({
      store,
      table: 'kultur',
      where: { art_id: artId },
    }),
  }).toArray()
  const kultursSorted = await kultursSortedFromKulturs(kulturs)
  const kulturIds = kultursSorted.map((k) => k.id)

  const lieferungs = await collectionFromTable({
    table: 'lieferung',
    where: addTotalCriteriaToWhere({
      store,
      table: 'lieferung',
      where: { art_id: artId },
    }),
  }).toArray()
  const lieferungsSorted = lieferungs.sort(lieferungSort)

  const persons = await collectionFromTable({
    table: 'person',
    where: addTotalCriteriaToWhere({ store, table: 'person' }),
  }).toArray()
  const personsSorted = persons.sort(personSort)

  const sammlungsOfArt = await art.sammlungs({ store })

  const zaehlungsOfArt = await dexie.zaehlungs
    .where('[kultur_id+__deleted_indexable]')
    .anyOf(kulturIds.map((id) => [id, 0]))
    .toArray()
  const zaehlungsOfArtSorted = zaehlungsOfArt.sort(zaehlungSort)
  const zaehlungIds = zaehlungsOfArtSorted.map((z) => z.id)

  const teilzaehlungsOfArt = await dexie.teilzaehlungs
    .where('[zaehlung_id+__deleted_indexable]')
    .anyOf(zaehlungIds.map((id) => [id, 0]))
    .toArray()

  const teilkulturs = await dexie.teilkulturs
    .where('[kultur_id+__deleted_indexable]')
    .anyOf(kulturIds.map((id) => [id, 0]))
    .toArray()
  const teilkultursSorted = teilkulturs.sort(teilkulturSort)

  const events = await dexie.events
    .where('[kultur_id+__deleted_indexable]')
    .anyOf(kulturIds.map((id) => [id, 0]))
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
      const hkGroupedByNr = groupBy(allHerkunfts, (h) => h.nr)

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
    artsOhneAv: async () => {
      if (!avs.length) return []
      return await Promise.all(
        [art].map(async (a) => {
          const text = await a.label()

          return {
            url: ['Vermehrung', 'Arten', a.id],
            text,
          }
        }),
      )
    },
    sammlungsWithoutLieferung: async () =>
      await Promise.all(
        sammlungsOfArt
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
        sammlungsOfArt.filter((s) => s.art_id === artId),
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
        sammlungsOfArt
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
        sammlungsOfArt
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
        sammlungsOfArt
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
        sammlungsOfArt
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
        sammlungsOfArt
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
        sammlungsOfArt
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
    gartensAllKultursInactive: async () => {
      const gartenIds = kulturs
        .filter((s) => !!s.garten_id)
        .map((k) => k.garten_id)
      const uniqueGartenIds = [...new Set(gartenIds)]

      const gartens = await dexie.gartens
        .where('[id+__aktiv_indexable+__deleted_indexable]')
        .anyOf(uniqueGartenIds.map((id) => [id, 1, 0]))
        .toArray()
      const gartensSorted = await gartensSortedFromGartens(gartens)
      const filterPromiseArray = gartensSorted.map(async (g) => {
        const kulturs = await collectionFromTable({
          table: 'kultur',
          where: { garten_id: g.id, __deleted_indexable: 0 },
        }).toArray()

        return !!kulturs.length && kulturs.every((k) => !k.aktiv)
      })
      const gartensFiltered = gartensSorted.filter(
        (g, i) => filterPromiseArray[i] && g.aktiv,
      )
      return await Promise.all(
        gartensFiltered.map(async (g) => {
          const text = await g.label()

          return {
            url: ['Vermehrung', 'Gaerten', g.id],
            text,
          }
        }),
      )
    },
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
            const kultur = await tk.kultur()
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
    zaehlungsInFutureNotPrognose: async () => {
      const zaehlungs = await dexie.zaehlungs
        .where('[kultur_id+__deleted_indexable]')
        .anyOf(kulturIds.map((id) => [id, 0]))
        .filter(
          (z) =>
            z.datum !== null && z.datum >= format(new Date(), 'yyyy-mm-dd'),
        )
        .toArray()

      return await Promise.all(
        zaehlungs.map(async (z) => {
          const kultur = await z.kultur()
          const kulturLabel = await kultur?.label()
          const text = `${kulturLabel ?? '(keine kultur)'}, Zählung-ID: ${z.id}`

          return {
            url: [
              'Vermehrung',
              'Arten',
              artId,
              'Kulturen',
              z.id,
              'Zaehlungen',
              z.id,
            ],
            text,
          }
        }),
      )
    },
    zaehlungsWithoutDatum: async () => {
      const zaehlungs = await dexie.zaehlungs
        .where('[kultur_id+__deleted_indexable]')
        .anyOf(kulturIds.map((id) => [id, 0]))
        .filter((z) => !z.datum)
        .toArray()

      return await Promise.all(
        zaehlungs.map(async (z) => {
          const kultur = await z.kultur()
          const kulturLabel = await kultur?.label()
          const text = `${kulturLabel ?? '(keine Kultur)'}, Zählung-ID: ${z.id}`

          return {
            url: [
              'Vermehrung',
              'Arten',
              artId,
              'Kulturen',
              z.id,
              'Zaehlungen',
              z.id,
            ],
            text,
          }
        }),
      )
    },
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
            const kultur = await z.kultur()
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
            const kultur = await z.kultur()
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
            const kultur = await z.kultur()
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
    zaehlungsWithTeilzaehlungsWithoutTeilkulturThoughTeilkulturIsChoosen:
      async () => {
        const kulturOptionsWithTkSet = await dexie.kultur_options
          .filter((o) => o.tk === true)
          .toArray()
        const idsOfKultursWithTkSet = kulturOptionsWithTkSet.map((o) => o.id)
        const kulturs = await dexie.kulturs
          .where('[id+art_id+__aktiv_indexable+__deleted_indexable]')
          .anyOf(idsOfKultursWithTkSet.map((id) => [id, artId, 1, 0]))
          .toArray()
        const kulturIds = kulturs.map((k) => k.id)
        const zaehlungs = await dexie.zaehlungs
          .where('[kultur_id+__deleted_indexable]')
          .anyOf(kulturIds.map((id) => [id, 0]))
          .toArray()
        const zaehlungsSorted = zaehlungs.sort(zaehlungSort)

        return await Promise.all(
          zaehlungsSorted
            .filter((z) => {
              const tz = teilzaehlungsOfArt
                .filter((tz) => tz.zaehlung_id === z.id)
                .filter((tz) => !tz._deleted)
              return tz.length && tz.filter((tz) => !tz.teilkultur_id).length
            })
            .map(async (z) => {
              const kultur = await z.kultur()
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
        )
      },
    lieferungsWithMultipleVon: async () =>
      lieferungsSorted
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
            const kultur = await e.kultur()
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
            const kultur = await e.kultur()
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
