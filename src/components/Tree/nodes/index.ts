import { getSnapshot } from 'mobx-state-tree'
import buildArtSammlungFolder from './art/sammlung/folder'
import buildArtSammlung from './art/sammlung'
import buildArtSammlungAuslieferungFolder from './art/sammlung/auslieferung/folder'
import buildArtSammlungAuslieferung from './art/sammlung/auslieferung'
import buildArtHerkunftFolder from './art/herkunft/folder'
import buildArtHerkunft from './art/herkunft'
import buildArtKulturFolder from './art/kultur/folder'
import buildArtKultur from './art/kultur'
import buildArtKulturTeilkulturFolder from './art/kultur/teilkultur/folder'
import buildArtKulturTeilkultur from './art/kultur/teilkultur'
import buildArtKulturZaehlungFolder from './art/kultur/zaehlung/folder'
import buildArtKulturZaehlung from './art/kultur/zaehlung'
import buildArtKulturAnlieferungFolder from './art/kultur/anlieferung/folder'
import buildArtKulturAnlieferung from './art/kultur/anlieferung'
import buildArtKulturAuslieferungFolder from './art/kultur/auslieferung/folder'
import buildArtKulturAuslieferung from './art/kultur/auslieferung'
import buildArtKulturEventFolder from './art/kultur/event/folder'
import buildArtKulturEvent from './art/kultur/event'
import buildArtFolder from './art/folder'
import buildArt from './art'
import buildHerkunftFolder from './herkunft/folder'
import buildHerkunft from './herkunft'
import buildHerkunftSammlungFolder from './herkunft/sammlung/folder'
import buildHerkunftSammlung from './herkunft/sammlung'
import buildHerkunftSammlungAuslieferungFolder from './herkunft/sammlung/auslieferung/folder'
import buildHerkunftSammlungAuslieferung from './herkunft/sammlung/auslieferung'
import buildGartenFolder from './garten/folder'
import buildGarten from './garten'
import buildGartenKulturFolder from './garten/kultur/folder'
import buildGartenKultur from './garten/kultur'
import buildGartenKulturTeilkulturFolder from './garten/kultur/teilkultur/folder'
import buildGartenKulturTeilkultur from './garten/kultur/teilkultur'
import buildGartenKulturZaehlungFolder from './garten/kultur/zaehlung/folder'
import buildGartenKulturZaehlung from './garten/kultur/zaehlung'
import buildGartenKulturAnlieferungFolder from './garten/kultur/anlieferung/folder'
import buildGartenKulturAnlieferung from './garten/kultur/anlieferung'
import buildGartenKulturAuslieferungFolder from './garten/kultur/auslieferung/folder'
import buildGartenKulturAuslieferung from './garten/kultur/auslieferung'
import buildGartenKulturEventFolder from './garten/kultur/event/folder'
import buildGartenKulturEvent from './garten/kultur/event'
import buildKulturFolder from './kultur/folder'
import buildKultur from './kultur'
import buildKulturTeilkulturFolder from './kultur/teilkultur/folder'
import buildKulturTeilkultur from './kultur/teilkultur'
import buildKulturZaehlungFolder from './kultur/zaehlung/folder'
import buildKulturZaehlung from './kultur/zaehlung'
import buildKulturAuslieferungFolder from './kultur/auslieferung/folder'
import buildKulturAuslieferung from './kultur/auslieferung'
import buildKulturAnlieferungFolder from './kultur/anlieferung/folder'
import buildKulturAnlieferung from './kultur/anlieferung'
import buildKulturEventFolder from './kultur/event/folder'
import buildKulturEvent from './kultur/event'
import buildTeilkulturFolder from './teilkultur/folder'
import buildTeilkultur from './teilkultur'
import buildSammlungFolder from './sammlung/folder'
import buildSammlung from './sammlung'
import buildSammlungHerkunftFolder from './sammlung/herkunft/folder'
import buildSammlungHerkunft from './sammlung/herkunft'
import buildSammlungAuslieferungFolder from './sammlung/auslieferung/folder'
import buildSammlungAuslieferung from './sammlung/auslieferung'
import buildZaehlungFolder from './zaehlung/folder'
import buildZaehlung from './zaehlung'
import buildLieferungFolder from './lieferung/folder'
import buildLieferung from './lieferung'
import buildEventFolder from './event/folder'
import buildEvent from './event'
import buildPersonFolder from './person/folder'
import buildPerson from './person'
import buildPersonGartenFolder from './person/garten/folder'
import buildPersonGarten from './person/garten'
import buildPersonGartenKulturFolder from './person/garten/kultur/folder'
import buildPersonGartenKultur from './person/garten/kultur'
import buildPersonGartenKulturAnlieferungFolder from './person/garten/kultur/anlieferung/folder'
import buildPersonGartenKulturAnlieferung from './person/garten/kultur/anlieferung'
import buildPersonGartenKulturAuslieferungFolder from './person/garten/kultur/auslieferung/folder'
import buildPersonGartenKulturAuslieferung from './person/garten/kultur/auslieferung'
import buildPersonGartenKulturEventFolder from './person/garten/kultur/event/folder'
import buildPersonGartenKulturEvent from './person/garten/kultur/event'
import buildPersonGartenKulturTeilkulturFolder from './person/garten/kultur/teilkultur/folder'
import buildPersonGartenKulturTeilkultur from './person/garten/kultur/teilkultur'
import buildPersonGartenKulturZaehlungFolder from './person/garten/kultur/zaehlung/folder'
import buildPersonGartenKulturZaehlung from './person/garten/kultur/zaehlung'
import buildPersonLieferungFolder from './person/lieferung/folder'
import buildPersonLieferung from './person/lieferung'
import buildPersonSammlungFolder from './person/sammlung/folder'
import buildPersonSammlung from './person/sammlung'
import buildSammelLieferungFolder from './sammelLieferung/folder'
import buildSammelLieferung from './sammelLieferung'
import buildSammelLieferungLieferungFolder from './sammelLieferung/lieferung/folder'
import buildSammelLieferungLieferung from './sammelLieferung/lieferung'
import herkunftSort from '../../../utils/herkunftSort'
import teilkulturSort from '../../../utils/teilkulturSort'
import zaehlungSort from '../../../utils/zaehlungSort'
import lieferungSort from '../../../utils/lieferungSort'
import eventSort from '../../../utils/eventSort'
import personSort from '../../../utils/personSort'
import artsSortedFromArts from '../../../utils/artsSortedFromArts'
import kultursSortedFromKulturs from '../../../utils/kultursSortedFromKulturs'
import gartensSortedFromGartens from '../../../utils/gartensSortedFromGartens'
import sammlungsSortedFromSammlungs from '../../../utils/sammlungsSortedFromSammlungs'
import getShowArt from '../../../utils/showArt'
import getShowEvent from '../../../utils/showEvent'
import getShowGarten from '../../../utils/showGarten'
import getShowHerkunft from '../../../utils/showHerkunft'
import getShowKultur from '../../../utils/showKultur'
import getShowLieferung from '../../../utils/showLieferung'
import getShowPerson from '../../../utils/showPerson'
import getShowSammelLieferung from '../../../utils/showSammelLieferung'
import getShowSammlung from '../../../utils/showSammlung'
import getShowTeilkultur from '../../../utils/showTeilkultur'
import getShowZaehlung from '../../../utils/showZaehlung'
import addTotalCriteriaToWhere from '../../../utils/addTotalCriteriaToWhere'
import collectionFromTable from '../../../utils/collectionFromTable'
import filteredCollectionFromTable from '../../../utils/filteredCollectionFromTable'

const compare = (a, b) => {
  // sort a before, if it has no value at this index
  if (a !== 0 && !a) return -1
  // sort a after if b has no value at this index
  if (b !== 0 && !b) return 1
  // sort a before if its value is smaller
  return a - b
}

const buildNodes = async ({ store, userPersonOption = {}, userRole }) => {
  // console.log('building nodes')
  const { openNodes: openNodesRaw, activeNodeArray: activeNodeArrayRaw } =
    store.tree
  const openNodes = getSnapshot(openNodesRaw)
  const activeNodeArray = activeNodeArrayRaw.toJSON()

  const showArt = getShowArt({ userRole, activeNodeArray })
  const showEvent = getShowEvent({ userPersonOption, activeNodeArray })
  const showGarten = getShowGarten()
  const showHerkunft = getShowHerkunft({ userRole, activeNodeArray })
  const showKultur = getShowKultur({ userPersonOption, activeNodeArray })
  const showLieferung = getShowLieferung({ userPersonOption, activeNodeArray })
  const showPerson = getShowPerson()
  const showSammelLieferung = getShowSammelLieferung({
    userPersonOption,
    activeNodeArray,
  })
  const showSammlung = getShowSammlung({ userRole, activeNodeArray })
  const showTeilkultur = getShowTeilkultur({
    userPersonOption,
    activeNodeArray,
  })
  const showZaehlung = getShowZaehlung({ userPersonOption, activeNodeArray })

  let artFolderNodes = []
  let artNodes = []
  const artHerkunftFolderNodes = []
  const artHerkunftNodes = []
  const artKulturFolderNodes = []
  const artKulturNodes = []
  const artKulturTeilkulturFolderNodes = []
  const artKulturTeilkulturNodes = []
  const artKulturZaehlungFolderNodes = []
  const artKulturZaehlungNodes = []
  const artKulturAnlieferungFolderNodes = []
  const artKulturAnlieferungNodes = []
  const artKulturAuslieferungFolderNodes = []
  const artKulturAuslieferungNodes = []
  const artKulturEventFolderNodes = []
  const artKulturEventNodes = []
  const artSammlungFolderNodes = []
  const artSammlungNodes = []
  const artSammlungAuslieferungFolderNodes = []
  const artSammlungAuslieferungNodes = []
  let herkunftFolderNodes = []
  let herkunftNodes = []
  const herkunftSammlungFolderNodes = []
  const herkunftSammlungNodes = []
  const herkunftSammlungAuslieferungFolderNodes = []
  const herkunftSammlungAuslieferungNodes = []
  let sammlungFolderNodes = []
  let sammlungNodes = []
  const sammlungHerkunftFolderNodes = []
  const sammlungHerkunftNodes = []
  const sammlungAuslieferungFolderNodes = []
  const sammlungAuslieferungNodes = []
  let gartenFolderNodes = []
  let gartenNodes = []
  const gartenKulturFolderNodes = []
  const gartenKulturNodes = []
  const gartenKulturTeilkulturFolderNodes = []
  const gartenKulturTeilkulturNodes = []
  const gartenKulturZaehlungFolderNodes = []
  const gartenKulturZaehlungNodes = []
  const gartenKulturAnlieferungFolderNodes = []
  const gartenKulturAnlieferungNodes = []
  const gartenKulturAuslieferungFolderNodes = []
  const gartenKulturAuslieferungNodes = []
  const gartenKulturEventFolderNodes = []
  const gartenKulturEventNodes = []
  let kulturFolderNodes = []
  let kulturNodes = []
  const kulturTeilkulturFolderNodes = []
  const kulturTeilkulturNodes = []
  const kulturZaehlungFolderNodes = []
  const kulturZaehlungNodes = []
  const kulturAnlieferungFolderNodes = []
  const kulturAnlieferungNodes = []
  const kulturAuslieferungFolderNodes = []
  const kulturAuslieferungNodes = []
  const kulturEventFolderNodes = []
  const kulturEventNodes = []
  let teilkulturFolderNodes = []
  let teilkulturNodes = []
  let zaehlungFolderNodes = []
  let zaehlungNodes = []
  let lieferungFolderNodes = []
  let lieferungNodes = []
  let eventFolderNodes = []
  let eventNodes = []
  let personFolderNodes = []
  let personNodes = []
  const personGartenFolderNodes = []
  const personGartenNodes = []
  const personGartenKulturFolderNodes = []
  const personGartenKulturNodes = []
  const personGartenKulturAnlieferungFolderNodes = []
  const personGartenKulturAnlieferungNodes = []
  const personGartenKulturAuslieferungFolderNodes = []
  const personGartenKulturAuslieferungNodes = []
  const personGartenKulturEventFolderNodes = []
  const personGartenKulturEventNodes = []
  const personGartenKulturTeilkulturFolderNodes = []
  const personGartenKulturTeilkulturNodes = []
  const personGartenKulturZaehlungFolderNodes = []
  const personGartenKulturZaehlungNodes = []
  const personLieferungFolderNodes = []
  const personLieferungNodes = []
  const personSammlungFolderNodes = []
  const personSammlungNodes = []
  let sammelLieferungFolderNodes = []
  let sammelLieferungNodes = []
  const sammelLieferungLieferungFolderNodes = []
  const sammelLieferungLieferungNodes = []

  // 1 art
  if (showArt) {
    const artCollection = await filteredCollectionFromTable({
      store,
      table: 'art',
    })
    const artCount = await artCollection.count()
    artFolderNodes = buildArtFolder({ count: artCount })
    const artFolderIsOpen = openNodes.some(
      (n) => n.length === 2 && n[1] === 'Arten',
    )
    if (artFolderIsOpen) {
      // build art nodes
      const arts = await artCollection.toArray()
      const artsSorted = await artsSortedFromArts(arts)
      artNodes = await Promise.all(
        artsSorted.map(
          async (art, index) => await buildArt({ store, art, index }),
        ),
      )

      // on to child nodes
      const openArtNodes = openNodes.filter(
        (n) => n[1] === 'Arten' && n.length === 3,
      )
      for (const artNode of openArtNodes) {
        const artId = artNode[2]
        const art = artsSorted.find((a) => a.id === artId)
        if (!art) break
        const artIndex = artNodes.findIndex((a) => a.id === artId)

        // 1.1 art > Herkunft
        const sammlungsOfArt = await filteredCollectionFromTable({
          store,
          table: 'sammlung',
          where: { art_id: artId },
        }).toArray()
        const sammlungsOfArtHerkunftIds = sammlungsOfArt.map(
          (s) => s.herkunft_id,
        )
        // somehow using where('id')anyOf(sammlungsOfArtHerkunftIds) gives to few results ???!!!
        const herkunftsCollection = filteredCollectionFromTable({
          table: 'herkunft',
          store,
        }).filter((value) => sammlungsOfArtHerkunftIds.includes(value.id))
        const herkunftCount = await herkunftsCollection.count()
        artHerkunftFolderNodes.push(
          buildArtHerkunftFolder({
            count: herkunftCount,
            artIndex,
            artId,
          }),
        )

        const artHerkunftFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Arten' &&
            n[2] === artId &&
            n[3] === 'Herkuenfte',
        )
        if (artHerkunftFolderIsOpen) {
          const herkunfts = await herkunftsCollection.toArray()
          const herkunftsSorted = herkunfts.sort(herkunftSort)
          const newArtHerkunftNodes = await Promise.all(
            herkunftsSorted.map(
              async (herkunft, herkunftIndex) =>
                await buildArtHerkunft({
                  herkunft,
                  herkunftIndex,
                  artId,
                  artIndex,
                }),
            ),
          )
          artHerkunftNodes.push(...newArtHerkunftNodes)
        }

        // 1.2 art > sammlung
        const sammlungCount = await sammlungsOfArt.length
        artSammlungFolderNodes.push(
          buildArtSammlungFolder({
            count: sammlungCount,
            artIndex,
            artId,
          }),
        )

        const artSammlungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Arten' &&
            n[2] === artId &&
            n[3] === 'Sammlungen',
        )
        if (artSammlungFolderIsOpen) {
          const sammlungsSorted = await sammlungsSortedFromSammlungs(
            sammlungsOfArt,
          )
          const newArtSammlungNodes = await Promise.all(
            sammlungsSorted.map(
              async (sammlung, sammlungIndex) =>
                await buildArtSammlung({
                  sammlung,
                  sammlungIndex,
                  artId,
                  artIndex,
                }),
            ),
          )
          artSammlungNodes.push(...newArtSammlungNodes)
          const openArtSammlungNodes = openNodes.filter(
            (n) =>
              n[1] === 'Arten' &&
              n[2] === artId &&
              n[3] === 'Sammlungen' &&
              n.length === 5,
          )
          for (const artSammlungNode of openArtSammlungNodes) {
            const sammlungId = artSammlungNode[4]
            const sammlung = sammlungsSorted.find((s) => s.id === sammlungId)
            if (!sammlung) break
            const sammlungIndex = newArtSammlungNodes.findIndex(
              (s) => s.id === `${artId}${sammlungId}`,
            )
            const lieferungs = await filteredCollectionFromTable({
              store,
              table: 'lieferung',
              where: { von_sammlung_id: sammlungId },
            }).toArray()
            artSammlungAuslieferungFolderNodes.push(
              buildArtSammlungAuslieferungFolder({
                sammlungId,
                sammlungIndex,
                artId,
                artIndex,
                children: lieferungs,
              }),
            )
            const artSammlungAuslieferungFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Arten' &&
                n[2] === artId &&
                n[3] === 'Sammlungen' &&
                n[4] === sammlungId &&
                n[5] === 'Aus-Lieferungen',
            )
            if (artSammlungAuslieferungFolderIsOpen) {
              const lieferungsSorted = lieferungs.sort(lieferungSort)
              const newArtSammlungAuslieferungNodes = lieferungsSorted.map(
                (lieferung, lieferungIndex) =>
                  buildArtSammlungAuslieferung({
                    lieferung,
                    lieferungIndex,
                    sammlungId,
                    sammlungIndex,
                    artId,
                    artIndex,
                  }),
              )
              artSammlungAuslieferungNodes.push(
                ...newArtSammlungAuslieferungNodes,
              )
            }
          }
        }

        // 1.3 art > kultur
        const artKulturCollection = filteredCollectionFromTable({
          where: { art_id: artId },
          store,
          table: 'kultur',
        })
        const kulturCount = await artKulturCollection.count()
        artKulturFolderNodes.push(
          buildArtKulturFolder({
            count: kulturCount,
            artIndex,
            artId,
          }),
        )
        const artKulturFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Arten' &&
            n[2] === artId &&
            n[3] === 'Kulturen',
        )
        if (artKulturFolderIsOpen) {
          const kulturs = await artKulturCollection.toArray()
          const kultursSorted = await kultursSortedFromKulturs(kulturs)
          const newArtKulturNodes = await Promise.all(
            kultursSorted.map(
              async (kultur, kulturIndex) =>
                await buildArtKultur({ kultur, kulturIndex, artId, artIndex }),
            ),
          )
          artKulturNodes.push(...newArtKulturNodes)
          const openArtKulturNodes = openNodes.filter(
            (n) =>
              n[1] === 'Arten' &&
              n[2] === artId &&
              n[3] === 'Kulturen' &&
              n.length === 5,
          )
          for (const artKulturNode of openArtKulturNodes) {
            const kulturId = artKulturNode[4]
            const kultur = kultursSorted.find((s) => s.id === kulturId)
            if (!kultur) break
            const kulturIndex = newArtKulturNodes.findIndex(
              (s) => s.id === `${artId}${kulturId}`,
            )

            // teilkultur nodes
            const kulturOption = await kultur.kulturOption()
            if (kulturOption?.tk) {
              const teilkulturs = await filteredCollectionFromTable({
                where: { kultur_id: kultur.id },
                store,
                table: 'teilkultur',
              }).toArray()
              artKulturTeilkulturFolderNodes.push(
                buildArtKulturTeilkulturFolder({
                  kulturId,
                  kulturIndex,
                  artId,
                  artIndex,
                  children: teilkulturs,
                }),
              )
              const artKulturTeilkulturFolderIsOpen = openNodes.some(
                (n) =>
                  n.length === 6 &&
                  n[1] === 'Arten' &&
                  n[2] === artId &&
                  n[3] === 'Kulturen' &&
                  n[4] === kulturId &&
                  n[5] === 'Teilkulturen',
              )
              if (artKulturTeilkulturFolderIsOpen) {
                const teilkultursSorted = teilkulturs.sort(teilkulturSort)
                const newArtKulturTeilkulturNodes = teilkultursSorted.map(
                  (teilkultur, teilkulturIndex) =>
                    buildArtKulturTeilkultur({
                      teilkultur,
                      teilkulturIndex,
                      kulturId,
                      kulturIndex,
                      artId,
                      artIndex,
                    }),
                )
                artKulturTeilkulturNodes.push(...newArtKulturTeilkulturNodes)
              }
            }

            // zaehlung nodes
            const artKulturZaehlungCollection = filteredCollectionFromTable({
              where: { kultur_id: kultur.id },
              store,
              table: 'zaehlung',
            })
            const zaehlungsCount = await artKulturZaehlungCollection.count()
            artKulturZaehlungFolderNodes.push(
              buildArtKulturZaehlungFolder({
                kulturId,
                kulturIndex,
                artId,
                artIndex,
                count: zaehlungsCount,
              }),
            )
            const artKulturZaehlungFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Arten' &&
                n[2] === artId &&
                n[3] === 'Kulturen' &&
                n[4] === kulturId &&
                n[5] === 'Zaehlungen',
            )
            if (artKulturZaehlungFolderIsOpen) {
              const zaehlungs = await artKulturZaehlungCollection.toArray()
              const zaehlungsSorted = zaehlungs.sort(zaehlungSort)
              const newArtKulturZaehlungNodes = await Promise.all(
                zaehlungsSorted.map(
                  async (zaehlung, zaehlungIndex) =>
                    await buildArtKulturZaehlung({
                      zaehlung,
                      zaehlungIndex,
                      kulturId,
                      kulturIndex,
                      artId,
                      artIndex,
                      store,
                    }),
                ),
              )
              artKulturZaehlungNodes.push(...newArtKulturZaehlungNodes)
            }

            // anlieferung nodes
            const anlieferungs = await filteredCollectionFromTable({
              where: { von_kultur_id: kultur.id },
              store,
              table: 'lieferung',
            }).toArray()
            artKulturAnlieferungFolderNodes.push(
              buildArtKulturAnlieferungFolder({
                kulturId,
                kulturIndex,
                artId,
                artIndex,
                children: anlieferungs,
              }),
            )
            const artKulturAnlieferungFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Arten' &&
                n[2] === artId &&
                n[3] === 'Kulturen' &&
                n[4] === kulturId &&
                n[5] === 'An-Lieferungen',
            )
            if (artKulturAnlieferungFolderIsOpen) {
              const anlieferungsSorted = anlieferungs.sort(lieferungSort)
              const newArtKulturAnlieferungNodes = anlieferungsSorted.map(
                (lieferung, lieferungIndex) =>
                  buildArtKulturAnlieferung({
                    lieferung,
                    lieferungIndex,
                    kulturId,
                    kulturIndex,
                    artId,
                    artIndex,
                  }),
              )
              artKulturAnlieferungNodes.push(...newArtKulturAnlieferungNodes)
            }

            // auslieferung nodes
            const auslieferungs = await filteredCollectionFromTable({
              where: { nach_kultur_id: kultur.id },
              store,
              table: 'lieferung',
            }).toArray()
            artKulturAuslieferungFolderNodes.push(
              buildArtKulturAuslieferungFolder({
                kulturId,
                kulturIndex,
                artId,
                artIndex,
                children: auslieferungs,
              }),
            )
            const artKulturAuslieferungFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Arten' &&
                n[2] === artId &&
                n[3] === 'Kulturen' &&
                n[4] === kulturId &&
                n[5] === 'Aus-Lieferungen',
            )
            if (artKulturAuslieferungFolderIsOpen) {
              const auslieferungsSorted = auslieferungs.sort(lieferungSort)
              const newArtKulturAuslieferungNodes = auslieferungsSorted.map(
                (lieferung, lieferungIndex) =>
                  buildArtKulturAuslieferung({
                    lieferung,
                    lieferungIndex,
                    kulturId,
                    kulturIndex,
                    artId,
                    artIndex,
                  }),
              )
              artKulturAuslieferungNodes.push(...newArtKulturAuslieferungNodes)
            }

            // event nodes
            const eventsCollection = filteredCollectionFromTable({
              where: { kultur_id: kultur.id },
              store,
              table: 'event',
            })
            const eventsCount = await eventsCollection.count()
            artKulturEventFolderNodes.push(
              buildArtKulturEventFolder({
                kulturId,
                kulturIndex,
                artId,
                artIndex,
                count: eventsCount,
              }),
            )
            const artKulturEventFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Arten' &&
                n[2] === artId &&
                n[3] === 'Kulturen' &&
                n[4] === kulturId &&
                n[5] === 'Events',
            )
            if (artKulturEventFolderIsOpen) {
              const events = await eventsCollection.toArray()
              const eventsSorted = events.sort(eventSort)
              const newArtKulturEventNodes = eventsSorted.map(
                (event, eventIndex) =>
                  buildArtKulturEvent({
                    event,
                    eventIndex,
                    kulturId,
                    kulturIndex,
                    artId,
                    artIndex,
                  }),
              )
              artKulturEventNodes.push(...newArtKulturEventNodes)
            }
          }
        }
      }
    }
  }

  // 2 herkunft
  if (showHerkunft) {
    const herkunftCollection = filteredCollectionFromTable({
      store,
      table: 'herkunft',
    })
    const herkunftCount = await herkunftCollection.count()
    herkunftFolderNodes = buildHerkunftFolder({ count: herkunftCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Herkuenfte')) {
      const herkunfts = await herkunftCollection.toArray()
      const herkunftsSorted = herkunfts.sort(herkunftSort)
      herkunftNodes = herkunftsSorted.map((herkunft, index) =>
        buildHerkunft({ herkunft, index }),
      )

      // on to child nodes
      const openHerkunftNodes = openNodes.filter(
        (n) => n[1] === 'Herkuenfte' && n.length === 3,
      )
      for (const herkunftNode of openHerkunftNodes) {
        const herkunftId = herkunftNode[2]
        const herkunft = herkunftsSorted.find((a) => a.id === herkunftId)
        if (!herkunft) break

        const herkunftIndex = herkunftNodes.findIndex(
          (a) => a.id === herkunftId,
        )

        // 2.1 herkunft > sammlung
        const herkunftSammlungCollection = filteredCollectionFromTable({
          where: { herkunft_id: herkunft.id },
          store,
          table: 'sammlung',
        })
        const sammlungsCount = await herkunftSammlungCollection.count()
        herkunftSammlungFolderNodes.push(
          buildHerkunftSammlungFolder({
            count: sammlungsCount,
            herkunftIndex,
            herkunftId,
          }),
        )
        const herkunftSammlungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Herkuenfte' &&
            n[2] === herkunftId &&
            n[3] === 'Sammlungen',
        )
        if (herkunftSammlungFolderIsOpen) {
          const sammlungs = await herkunftSammlungCollection.toArray()
          const sammlungsSorted = await sammlungsSortedFromSammlungs(sammlungs)
          const newHerkunftSammlungNodes = await Promise.all(
            sammlungsSorted.map(
              async (sammlung, sammlungIndex) =>
                await buildHerkunftSammlung({
                  sammlung,
                  sammlungIndex,
                  herkunftId,
                  herkunftIndex,
                }),
            ),
          )
          herkunftSammlungNodes.push(...newHerkunftSammlungNodes)
          const openHerkunftSammlungNodes = openNodes.filter(
            (n) =>
              n[1] === 'Herkuenfte' &&
              n[2] === herkunftId &&
              n[3] === 'Sammlungen' &&
              n.length === 5,
          )
          for (const herkunftSammlungNode of openHerkunftSammlungNodes) {
            const sammlungId = herkunftSammlungNode[4]
            const sammlung = sammlungsSorted.find((s) => s.id === sammlungId)
            if (!sammlung) break
            const sammlungIndex = newHerkunftSammlungNodes.findIndex(
              (s) => s.id === `${herkunftId}${sammlungId}`,
            )
            const lieferungs = await filteredCollectionFromTable({
              where: { von_sammlung_id: sammlung.id },
              store,
              table: 'lieferung',
            }).toArray()
            herkunftSammlungAuslieferungFolderNodes.push(
              buildHerkunftSammlungAuslieferungFolder({
                sammlungId,
                sammlungIndex,
                herkunftId,
                herkunftIndex,
                children: lieferungs,
              }),
            )
            const herkunftSammlungAuslieferungFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Herkuenfte' &&
                n[2] === herkunftId &&
                n[3] === 'Sammlungen' &&
                n[4] === sammlungId &&
                n[5] === 'Aus-Lieferungen',
            )
            if (herkunftSammlungAuslieferungFolderIsOpen) {
              const lieferungsSorted = lieferungs.sort(lieferungSort)
              const newHerkunftSammlungAuslieferungNodes = lieferungsSorted.map(
                (lieferung, lieferungIndex) =>
                  buildHerkunftSammlungAuslieferung({
                    lieferung,
                    lieferungIndex,
                    sammlungId,
                    sammlungIndex,
                    herkunftId,
                    herkunftIndex,
                  }),
              )
              herkunftSammlungAuslieferungNodes.push(
                ...newHerkunftSammlungAuslieferungNodes,
              )
            }
          }
        }
      }
    }
  }

  // 3 sammlung
  if (showSammlung) {
    const sammlungCollection = filteredCollectionFromTable({
      store,
      table: 'sammlung',
    })
    const sammlungCount = await sammlungCollection.count()
    sammlungFolderNodes = buildSammlungFolder({ count: sammlungCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Sammlungen')) {
      const sammlungs = await sammlungCollection.toArray()
      const sammlungsSorted = await sammlungsSortedFromSammlungs(sammlungs)
      sammlungNodes = await Promise.all(
        sammlungsSorted.map(
          async (sammlung, index) => await buildSammlung({ sammlung, index }),
        ),
      )

      // on to child nodes
      const openSammlungNodes = openNodes.filter(
        (n) => n.length === 3 && n[1] === 'Sammlungen',
      )
      for (const sammlungNode of openSammlungNodes) {
        const sammlungId = sammlungNode[2]
        const sammlung = sammlungsSorted.find((a) => a.id === sammlungId)
        if (!sammlung) break
        const sammlungIndex = sammlungNodes.findIndex(
          (a) => a.id === sammlungId,
        )

        // 2.1 sammlung > herkunft
        const herkunft = await sammlung?.herkunft?.()
        sammlungHerkunftFolderNodes.push(
          buildSammlungHerkunftFolder({
            count: [herkunft].length,
            sammlungIndex,
            sammlungId,
          }),
        )
        const sammlungHerkunftFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Sammlungen' &&
            n[2] === sammlungId &&
            n[3] === 'Herkuenfte',
        )
        if (sammlungHerkunftFolderIsOpen) {
          sammlungHerkunftNodes.push(
            buildSammlungHerkunft({
              herkunft,
              sammlungId,
              sammlungIndex,
            }),
          )
        }

        // 2.1 sammlung > auslieferung
        const sammlungLieferungCollection = filteredCollectionFromTable({
          where: { von_sammlung_id: sammlung.id },
          store,
          table: 'lieferung',
        })
        const sammlungLieferungCount = await sammlungLieferungCollection.count()
        sammlungAuslieferungFolderNodes.push(
          buildSammlungAuslieferungFolder({
            count: sammlungLieferungCount,
            sammlungIndex,
            sammlungId,
          }),
        )
        const sammlungAuslieferungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Sammlungen' &&
            n[2] === sammlungId &&
            n[3] === 'Aus-Lieferungen',
        )
        if (sammlungAuslieferungFolderIsOpen) {
          const lieferungs = await sammlungLieferungCollection.toArray()
          const lieferungsSorted = lieferungs.sort(lieferungSort)
          const newSammlungAuslieferungNodes = lieferungsSorted.map(
            (lieferung, lieferungIndex) =>
              buildSammlungAuslieferung({
                lieferung,
                lieferungIndex,
                sammlungId,
                sammlungIndex,
              }),
          )
          sammlungAuslieferungNodes.push(...newSammlungAuslieferungNodes)
        }
      }
    }
  }

  // 4 garten
  if (showGarten) {
    const gartenCollection = filteredCollectionFromTable({
      table: 'garten',
      store,
    })
    const gartenCount = await gartenCollection.count()
    gartenFolderNodes = buildGartenFolder({ count: gartenCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Gaerten')) {
      const gartens = await gartenCollection.toArray()
      const gartensSorted = await gartensSortedFromGartens(gartens)
      gartenNodes = await Promise.all(
        gartensSorted.map(
          async (garten, index) => await buildGarten({ garten, index }),
        ),
      )

      // on to child nodes
      const openGartenNodes = openNodes.filter(
        (n) => n[1] === 'Gaerten' && n.length === 3,
      )
      for (const gartenNode of openGartenNodes) {
        const gartenId = gartenNode[2]
        const garten = gartensSorted.find((a) => a.id === gartenId)
        if (!garten) break
        const gartenIndex = gartenNodes.findIndex((a) => a.id === gartenId)

        // 2.1 garten > kultur
        const gartenKulturCollection = filteredCollectionFromTable({
          table: 'kultur',
          store,
          where: { garten_id: garten.id },
        })
        const gartenKulturCount = await gartenKulturCollection.count()
        gartenKulturFolderNodes.push(
          buildGartenKulturFolder({
            count: gartenKulturCount,
            gartenIndex,
            gartenId,
          }),
        )
        const gartenKulturFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Gaerten' &&
            n[2] === gartenId &&
            n[3] === 'Kulturen',
        )
        if (gartenKulturFolderIsOpen) {
          const kulturs = await gartenKulturCollection.toArray()
          const kultursSorted = await kultursSortedFromKulturs(kulturs)
          const newGartenKulturNodes = await Promise.all(
            kultursSorted.map(
              async (kultur, kulturIndex) =>
                await buildGartenKultur({
                  kultur,
                  kulturIndex,
                  gartenId,
                  gartenIndex,
                }),
            ),
          )
          gartenKulturNodes.push(...newGartenKulturNodes)

          const openGartenKulturNodes = openNodes.filter(
            (n) =>
              n[1] === 'Gaerten' &&
              n[2] === gartenId &&
              n[3] === 'Kulturen' &&
              n.length === 5,
          )
          for (const gartenKulturNode of openGartenKulturNodes) {
            const kulturId = gartenKulturNode[4]
            const kultur = kultursSorted.find((s) => s.id === kulturId)
            if (!kultur) break

            const kulturIndex = newGartenKulturNodes.findIndex(
              (s) => s.id === `${gartenId}${kulturId}`,
            )

            // garten > kultur > teilkultur
            const kulturOption = await kultur.kulturOption()
            if (kulturOption?.tk) {
              const teilkulturs = await filteredCollectionFromTable({
                store,
                where: { kultur_id: kultur.id },
                table: 'teilkultur',
              }).toArray()
              gartenKulturTeilkulturFolderNodes.push(
                buildGartenKulturTeilkulturFolder({
                  kulturId,
                  kulturIndex,
                  gartenId,
                  gartenIndex,
                  children: teilkulturs,
                }),
              )
              const gartenKulturTeilkulturFolderIsOpen = openNodes.some(
                (n) =>
                  n.length === 6 &&
                  n[1] === 'Gaerten' &&
                  n[2] === gartenId &&
                  n[3] === 'Kulturen' &&
                  n[4] === kulturId &&
                  n[5] === 'Teilkulturen',
              )
              if (gartenKulturTeilkulturFolderIsOpen) {
                const teilkultursSorted = teilkulturs.sort(teilkulturSort)
                const newGartenKulturTeilkulturNodes = teilkultursSorted.map(
                  (teilkultur, teilkulturIndex) =>
                    buildGartenKulturTeilkultur({
                      teilkultur,
                      teilkulturIndex,
                      kulturId,
                      kulturIndex,
                      gartenId,
                      gartenIndex,
                    }),
                )
                gartenKulturTeilkulturNodes.push(
                  ...newGartenKulturTeilkulturNodes,
                )
              }
            }

            // garten > kultur > zaehlung
            const zaehlungs = await filteredCollectionFromTable({
              table: 'zaehlung',
              store,
              where: { kultur_id: kultur.id },
            }).toArray()
            gartenKulturZaehlungFolderNodes.push(
              buildGartenKulturZaehlungFolder({
                kulturId,
                kulturIndex,
                gartenId,
                gartenIndex,
                children: zaehlungs,
              }),
            )
            const gartenKulturZaehlungFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Gaerten' &&
                n[2] === gartenId &&
                n[3] === 'Kulturen' &&
                n[4] === kulturId &&
                n[5] === 'Zaehlungen',
            )
            if (gartenKulturZaehlungFolderIsOpen) {
              const zaehlungsSorted = zaehlungs.sort(zaehlungSort)
              const newGartenKulturZaehlungNodes = await Promise.all(
                zaehlungsSorted.map(
                  async (zaehlung, zaehlungIndex) =>
                    await buildGartenKulturZaehlung({
                      zaehlung,
                      zaehlungIndex,
                      kulturId,
                      kulturIndex,
                      gartenId,
                      gartenIndex,
                      store,
                    }),
                ),
              )
              gartenKulturZaehlungNodes.push(...newGartenKulturZaehlungNodes)
            }

            // garten > kultur > anlieferung
            const anlieferungs = await filteredCollectionFromTable({
              table: 'lieferung',
              store,
              where: { nach_kultur_id: kultur.id },
            }).toArray()
            gartenKulturAnlieferungFolderNodes.push(
              buildGartenKulturAnlieferungFolder({
                kulturId,
                kulturIndex,
                gartenId,
                gartenIndex,
                children: anlieferungs,
              }),
            )
            const gartenKulturAnlieferungFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Gaerten' &&
                n[2] === gartenId &&
                n[3] === 'Kulturen' &&
                n[4] === kulturId &&
                n[5] === 'An-Lieferungen',
            )
            if (gartenKulturAnlieferungFolderIsOpen) {
              const anlieferungsSorted = anlieferungs.sort(lieferungSort)
              const newGartenKulturAnlieferungNodes = anlieferungsSorted.map(
                (lieferung, lieferungIndex) =>
                  buildGartenKulturAnlieferung({
                    lieferung,
                    lieferungIndex,
                    kulturId,
                    kulturIndex,
                    gartenId,
                    gartenIndex,
                  }),
              )
              gartenKulturAnlieferungNodes.push(
                ...newGartenKulturAnlieferungNodes,
              )
            }

            // garten > kultur > auslieferung
            const auslieferungs = await filteredCollectionFromTable({
              table: 'lieferung',
              store,
              where: { von_kultur_id: kultur.id },
            }).toArray()
            gartenKulturAuslieferungFolderNodes.push(
              buildGartenKulturAuslieferungFolder({
                kulturId,
                kulturIndex,
                gartenId,
                gartenIndex,
                children: auslieferungs,
              }),
            )
            const gartenKulturAuslieferungFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Gaerten' &&
                n[2] === gartenId &&
                n[3] === 'Kulturen' &&
                n[4] === kulturId &&
                n[5] === 'Aus-Lieferungen',
            )
            if (gartenKulturAuslieferungFolderIsOpen) {
              const auslieferungsSorted = auslieferungs.sort(lieferungSort)
              const newGartenKulturAuslieferungNodes = auslieferungsSorted.map(
                (lieferung, lieferungIndex) =>
                  buildGartenKulturAuslieferung({
                    lieferung,
                    lieferungIndex,
                    kulturId,
                    kulturIndex,
                    gartenId,
                    gartenIndex,
                  }),
              )
              gartenKulturAuslieferungNodes.push(
                ...newGartenKulturAuslieferungNodes,
              )
            }

            // garten > kultur > event
            const gartenKulturEventCollection = filteredCollectionFromTable({
              store,
              where: { kultur_id: kultur.id },
              table: 'event',
            })
            const gartenKulturEventCount =
              await gartenKulturEventCollection.count()
            gartenKulturEventFolderNodes.push(
              buildGartenKulturEventFolder({
                kulturId,
                kulturIndex,
                gartenId,
                gartenIndex,
                count: gartenKulturEventCount,
              }),
            )
            const gartenKulturEventFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Gaerten' &&
                n[2] === gartenId &&
                n[3] === 'Kulturen' &&
                n[4] === kulturId &&
                n[5] === 'Events',
            )
            if (gartenKulturEventFolderIsOpen) {
              const events = await gartenKulturEventCollection.toArray()
              const eventsSorted = events.sort(eventSort)
              const newGartenKulturEventNodes = eventsSorted.map(
                (event, eventIndex) =>
                  buildGartenKulturEvent({
                    event,
                    eventIndex,
                    kulturId,
                    kulturIndex,
                    gartenId,
                    gartenIndex,
                  }),
              )
              gartenKulturEventNodes.push(...newGartenKulturEventNodes)
            }
          }
        }
      }
    }
  }

  // 5 kultur
  if (showKultur) {
    const kulturCollection = collectionFromTable({
      table: 'kultur',
      where: addTotalCriteriaToWhere({ store, table: 'kultur' }),
    })
    const kulturCount = await kulturCollection.count()
    kulturFolderNodes = buildKulturFolder({ count: kulturCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Kulturen')) {
      const kulturs = await kulturCollection.toArray()
      const kultursSorted = await kultursSortedFromKulturs(kulturs)
      kulturNodes = await Promise.all(
        kultursSorted.map(
          async (kultur, index) => await buildKultur({ kultur, index }),
        ),
      )

      // on to child nodes
      const openKulturNodes = openNodes.filter(
        (n) => n[1] === 'Kulturen' && n.length === 3,
      )
      for (const kulturNode of openKulturNodes) {
        const kulturId = kulturNode[2]
        const kultur = kultursSorted.find((a) => a.id === kulturId)
        if (!kultur) break
        const kulturIndex = kulturNodes.findIndex((a) => a.id === kulturId)

        // 2.1 kultur > teilkultur
        const kulturOption = await kultur.kulturOption()
        if (kulturOption?.tk) {
          const kulturTeilkulturCollection = collectionFromTable({
            table: 'teilkultur',
            where: addTotalCriteriaToWhere({
              store,
              table: 'teilkultur',
              where: { kultur_id: kultur.id },
            }),
          })
          const kulturTeilkulturCount = await kulturTeilkulturCollection.count()
          kulturTeilkulturFolderNodes.push(
            buildKulturTeilkulturFolder({
              count: kulturTeilkulturCount,
              kulturIndex,
              kulturId,
            }),
          )

          const kulturTeilkulturFolderIsOpen = openNodes.some(
            (n) =>
              n.length === 4 &&
              n[1] === 'Kulturen' &&
              n[2] === kulturId &&
              n[3] === 'Teilkulturen',
          )
          if (kulturTeilkulturFolderIsOpen) {
            const teilkulturs = await kulturTeilkulturCollection.toArray()
            const teilkultursSorted = teilkulturs.sort(teilkulturSort)
            const newKulturTeilkulturNodes = teilkultursSorted.map(
              (teilkultur, teilkulturIndex) =>
                buildKulturTeilkultur({
                  teilkultur,
                  teilkulturIndex,
                  kulturId,
                  kulturIndex,
                }),
            )
            kulturTeilkulturNodes.push(...newKulturTeilkulturNodes)
          }
        }

        // 2.1 kultur > zaehlung
        const kulturZaehlungCollection = collectionFromTable({
          table: 'zaehlung',
          where: addTotalCriteriaToWhere({
            store,
            table: 'zaehlung',
            where: { kultur_id: kultur.id },
          }),
        })
        const kulturZaehlungCount = await kulturZaehlungCollection.count()
        kulturZaehlungFolderNodes.push(
          buildKulturZaehlungFolder({
            count: kulturZaehlungCount,
            kulturIndex,
            kulturId,
          }),
        )

        const kulturZaehlungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Kulturen' &&
            n[2] === kulturId &&
            n[3] === 'Zaehlungen',
        )
        if (kulturZaehlungFolderIsOpen) {
          const zaehlungs = await kulturZaehlungCollection.toArray()
          const zaehlungsSorted = zaehlungs.sort(zaehlungSort)
          const newKulturZaehlungNodes = await Promise.all(
            zaehlungsSorted.map(
              async (zaehlung, zaehlungIndex) =>
                await buildKulturZaehlung({
                  zaehlung,
                  zaehlungIndex,
                  kulturId,
                  kulturIndex,
                  store,
                }),
            ),
          )
          kulturZaehlungNodes.push(...newKulturZaehlungNodes)
        }

        // kultur > anlieferung
        const kulturAnlieferungCollection = collectionFromTable({
          table: 'lieferung',
          where: addTotalCriteriaToWhere({
            store,
            table: 'lieferung',
            where: { nach_kultur_id: kultur.id },
          }),
        })
        const kulturAnlieferungCount = await kulturAnlieferungCollection.count()
        kulturAnlieferungFolderNodes.push(
          buildKulturAnlieferungFolder({
            count: kulturAnlieferungCount,
            kulturIndex,
            kulturId,
          }),
        )
        const kulturAnlieferungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Kulturen' &&
            n[2] === kulturId &&
            n[3] === 'An-Lieferungen',
        )
        if (kulturAnlieferungFolderIsOpen) {
          const anlieferungs = await kulturAnlieferungCollection.toArray()
          const anlieferungsSorted = anlieferungs.sort(lieferungSort)
          const newKulturAnlieferungNodes = anlieferungsSorted.map(
            (lieferung, lieferungIndex) =>
              buildKulturAnlieferung({
                lieferung,
                lieferungIndex,
                kulturId,
                kulturIndex,
              }),
          )
          kulturAnlieferungNodes.push(...newKulturAnlieferungNodes)
        }

        // kultur > auslieferung
        const kulturAuslieferungCollection = collectionFromTable({
          table: 'lieferung',
          where: addTotalCriteriaToWhere({
            store,
            table: 'lieferung',
            where: { von_kultur_id: kultur.id },
          }),
        })
        const kulturAuslieferungCount =
          await kulturAuslieferungCollection.count()
        kulturAuslieferungFolderNodes.push(
          buildKulturAuslieferungFolder({
            count: kulturAuslieferungCount,
            kulturIndex,
            kulturId,
          }),
        )
        const kulturAuslieferungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Kulturen' &&
            n[2] === kulturId &&
            n[3] === 'Aus-Lieferungen',
        )
        if (kulturAuslieferungFolderIsOpen) {
          const auslieferungs = await kulturAuslieferungCollection.toArray()
          const auslieferungsSorted = auslieferungs.sort(lieferungSort)
          const newKulturAuslieferungNodes = auslieferungsSorted.map(
            (lieferung, lieferungIndex) =>
              buildKulturAuslieferung({
                lieferung,
                lieferungIndex,
                kulturId,
                kulturIndex,
              }),
          )
          kulturAuslieferungNodes.push(...newKulturAuslieferungNodes)
        }

        // kultur > event
        const kulturEventCollection = collectionFromTable({
          table: 'event',
          where: addTotalCriteriaToWhere({
            store,
            table: 'event',
            where: { kultur_id: kultur.id },
          }),
        })
        const kulturEventCount = await kulturEventCollection.count()
        kulturEventFolderNodes.push(
          buildKulturEventFolder({
            count: kulturEventCount,
            kulturIndex,
            kulturId,
          }),
        )
        const kulturEventFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Kulturen' &&
            n[2] === kulturId &&
            n[3] === 'Events',
        )
        if (kulturEventFolderIsOpen) {
          const events = await kulturEventCollection.toArray()
          const eventsSorted = events.sort(eventSort)
          const newKulturEventNodes = eventsSorted.map((event, eventIndex) =>
            buildKulturEvent({
              event,
              eventIndex,
              kulturId,
              kulturIndex,
            }),
          )
          kulturEventNodes.push(...newKulturEventNodes)
        }
      }
    }
  }

  // 6 teilkultur
  if (showTeilkultur) {
    const teilkulturCollection = collectionFromTable({
      table: 'teilkultur',
      where: addTotalCriteriaToWhere({ store, table: 'teilkultur' }),
    })
    const teilkulturCount = await teilkulturCollection.count()
    teilkulturFolderNodes = buildTeilkulturFolder({ count: teilkulturCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Teilkulturen')) {
      const teilkulturs = await teilkulturCollection.toArray()
      const teilkultursSorted = teilkulturs.sort(teilkulturSort)
      teilkulturNodes = teilkultursSorted.map((teilkultur, index) =>
        buildTeilkultur({ teilkultur, index }),
      )
    }
  }

  // 7 zaehlung
  if (showZaehlung) {
    const zaehlungCollection = collectionFromTable({
      table: 'zaehlung',
      where: addTotalCriteriaToWhere({ store, table: 'zaehlung' }),
    })
    const zaehlungCount = await zaehlungCollection.count()
    zaehlungFolderNodes = buildZaehlungFolder({ count: zaehlungCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Zaehlungen')) {
      const zaehlungs = await zaehlungCollection.toArray()
      const zaehlungsSorted = zaehlungs.sort(zaehlungSort)
      zaehlungNodes = await Promise.all(
        zaehlungsSorted.map(
          async (zaehlung, index) =>
            await buildZaehlung({ zaehlung, index, store }),
        ),
      )
    }
  }

  // 8 lieferung
  if (showLieferung) {
    const lieferungCollection = collectionFromTable({
      table: 'lieferung',
      where: addTotalCriteriaToWhere({ store, table: 'lieferung' }),
    })
    const lieferungCount = await lieferungCollection.count()
    lieferungFolderNodes = buildLieferungFolder({ count: lieferungCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Lieferungen')) {
      const lieferungs = await lieferungCollection.toArray()
      const lieferungsSorted = lieferungs.sort(lieferungSort)
      lieferungNodes = lieferungsSorted.map((lieferung, index) =>
        buildLieferung({ lieferung, index }),
      )
    }
  }

  // 9 sammelLieferung
  if (showSammelLieferung) {
    const sammelLieferungCollection = collectionFromTable({
      table: 'sammel_lieferung',
      where: addTotalCriteriaToWhere({ store, table: 'sammel_lieferung' }),
    })
    const sammelLieferungCount = await sammelLieferungCollection.count()
    sammelLieferungFolderNodes = buildSammelLieferungFolder({
      count: sammelLieferungCount,
    })
    if (
      openNodes.some((n) => n.length === 2 && n[1] === 'Sammel-Lieferungen')
    ) {
      const sammelLieferungs = await sammelLieferungCollection.toArray()
      const sammelLieferungsSorted = sammelLieferungs.sort(lieferungSort)
      sammelLieferungNodes = await Promise.all(
        sammelLieferungsSorted.map(
          async (sammelLieferung, index) =>
            await buildSammelLieferung({
              sammelLieferung,
              index,
            }),
        ),
      )

      // on to child nodes
      const openSammelLieferungNodes = openNodes.filter(
        (n) => n.length === 3 && n[1] === 'Sammel-Lieferungen',
      )
      for (const sammelLieferungNode of openSammelLieferungNodes) {
        const sammelLieferungId = sammelLieferungNode[2]
        const sammelLieferung = sammelLieferungsSorted.find(
          (a) => a.id === sammelLieferungId,
        )
        if (!sammelLieferung) break
        const sammelLieferungIndex = sammelLieferungNodes.findIndex(
          (a) => a.id === sammelLieferungId,
        )

        // 2.1 sammelLieferung > lieferung
        const lieferungs = await collectionFromTable({
          table: 'lieferung',
          where: addTotalCriteriaToWhere({
            store,
            table: 'lieferung',
            where: { sammel_lieferung_id: sammelLieferung.id },
          }),
        }).toArray()
        const lieferungsSorted = lieferungs.sort(lieferungSort)
        sammelLieferungLieferungFolderNodes.push(
          buildSammelLieferungLieferungFolder({
            children: lieferungsSorted,
            sammelLieferungIndex,
            sammelLieferungId,
          }),
        )
        const sammelLieferungLieferungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Sammel-Lieferungen' &&
            n[2] === sammelLieferungId &&
            n[3] === 'Lieferungen',
        )
        if (sammelLieferungLieferungFolderIsOpen) {
          const newSammelLieferungLieferungNodes = lieferungsSorted.map(
            (lieferung, lieferungIndex) =>
              buildSammelLieferungLieferung({
                lieferung,
                lieferungIndex,
                sammelLieferungId,
                sammelLieferungIndex,
              }),
          )
          sammelLieferungLieferungNodes.push(
            ...newSammelLieferungLieferungNodes,
          )
        }
      }
    }
  }

  // 10 event
  if (showEvent) {
    const eventCollection = collectionFromTable({
      table: 'event',
      where: addTotalCriteriaToWhere({ store, table: 'event' }),
    })
    const eventCount = await eventCollection.count()
    eventFolderNodes = buildEventFolder({ count: eventCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Events')) {
      const events = await eventCollection.toArray()
      const eventsSorted = events.sort(eventSort)
      eventNodes = eventsSorted.map((event, index) =>
        buildEvent({ event, index }),
      )
    }
  }

  // 11 person
  if (showPerson) {
    const personCollection = collectionFromTable({
      table: 'person',
      where: addTotalCriteriaToWhere({ store, table: 'person' }),
    })
    const personCount = await personCollection.count()
    personFolderNodes = buildPersonFolder({ count: personCount })
    if (openNodes.some((n) => n.length === 2 && n[1] === 'Personen')) {
      const persons = await personCollection.toArray()
      const personsSorted = persons.sort(personSort)
      personNodes = personsSorted.map((person, index) =>
        buildPerson({ person, index }),
      )

      // on to child nodes
      const openPersonNodes = openNodes.filter(
        (n) => n[1] === 'Personen' && n.length === 3,
      )
      for (const personNode of openPersonNodes) {
        const personId = personNode[2]
        const person = personsSorted.find((a) => a.id === personId)
        if (!person) break
        const personIndex = personNodes.findIndex((a) => a.id === personId)

        // person > sammlung
        const personSammlungCollection = collectionFromTable({
          table: 'sammlung',
          where: addTotalCriteriaToWhere({
            store,
            table: 'sammlung',
            where: { person_id: person.id },
          }),
        })
        const personSammlungCount = await personSammlungCollection.count()
        personSammlungFolderNodes.push(
          buildPersonSammlungFolder({
            count: personSammlungCount,
            personIndex,
            personId,
          }),
        )

        const personSammlungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Personen' &&
            n[2] === personId &&
            n[3] === 'Sammlungen',
        )
        if (personSammlungFolderIsOpen) {
          const sammlungs = await personSammlungCollection.toArray()
          const sammlungsSorted = await sammlungsSortedFromSammlungs(sammlungs)
          const newPersonSammlungNodes = await Promise.all(
            sammlungsSorted.map(
              async (sammlung, index) =>
                await buildPersonSammlung({
                  sammlung,
                  index,
                  personId,
                  personIndex,
                }),
            ),
          )
          personSammlungNodes.push(...newPersonSammlungNodes)
        }

        // person > garten
        const personGartenCollection = collectionFromTable({
          table: 'garten',
          where: addTotalCriteriaToWhere({
            store,
            table: 'garten',
            where: { person_id: person.id },
          }),
        })
        const personGartenCount = await personGartenCollection.count()
        personGartenFolderNodes.push(
          buildPersonGartenFolder({
            count: personGartenCount,
            personIndex,
            personId,
          }),
        )
        const personGartenFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Personen' &&
            n[2] === personId &&
            n[3] === 'Gaerten',
        )
        if (personGartenFolderIsOpen) {
          const gartens = await personGartenCollection.toArray()
          const gartensSorted = await gartensSortedFromGartens(gartens)
          const newPersonGartenNodes = await Promise.all(
            gartensSorted.map(
              async (garten, index) =>
                await buildPersonGarten({
                  garten,
                  index,
                  personId,
                  personIndex,
                }),
            ),
          )
          personGartenNodes.push(...newPersonGartenNodes)

          const openPersonGartenNodes = openNodes.filter(
            (n) =>
              n[1] === 'Personen' &&
              n[2] === personId &&
              n[3] === 'Gaerten' &&
              n.length === 5,
          )
          for (const personGartenNode of openPersonGartenNodes) {
            const gartenId = personGartenNode[4]
            const garten = gartensSorted.find((s) => s.id === gartenId)
            if (!garten) break
            const gartenIndex = newPersonGartenNodes.findIndex(
              (s) => s.id === `${personId}${gartenId}`,
            )

            // person > garten > kultur nodes
            const gartenKulturCollection = collectionFromTable({
              table: 'kultur',
              where: addTotalCriteriaToWhere({
                store,
                table: 'kultur',
                where: { garten_id: garten.id },
              }),
            })
            const gartenKulturCount = await gartenKulturCollection.count()
            personGartenKulturFolderNodes.push(
              buildPersonGartenKulturFolder({
                gartenId,
                gartenIndex,
                personId,
                personIndex,
                count: gartenKulturCount,
              }),
            )
            const personGartenKulturFolderIsOpen = openNodes.some(
              (n) =>
                n.length === 6 &&
                n[1] === 'Personen' &&
                n[2] === personId &&
                n[3] === 'Gaerten' &&
                n[4] === gartenId &&
                n[5] === 'Kulturen',
            )
            if (personGartenKulturFolderIsOpen) {
              const kulturs = await gartenKulturCollection.toArray()
              const kultursSorted = await kultursSortedFromKulturs(kulturs)
              const newPersonGartenKulturNodes = await Promise.all(
                kultursSorted.map(
                  async (kultur, kulturIndex) =>
                    await buildPersonGartenKultur({
                      kultur,
                      kulturIndex,
                      gartenId,
                      gartenIndex,
                      personId,
                      personIndex,
                    }),
                ),
              )
              personGartenKulturNodes.push(...newPersonGartenKulturNodes)

              const openPersonGartenKulturNodes = openNodes.filter(
                (n) =>
                  n.length === 7 &&
                  n[1] === 'Personen' &&
                  n[2] === personId &&
                  n[3] === 'Gaerten' &&
                  n[4] === gartenId &&
                  n[5] === 'Kulturen',
              )
              for (const personGartenKulturNode of openPersonGartenKulturNodes) {
                const kulturId = personGartenKulturNode[6]
                const kultur = kultursSorted.find((s) => s.id === kulturId)
                if (!kultur) break
                const kulturIndex = newPersonGartenKulturNodes.findIndex(
                  (s) => s.id === `${personId}${gartenId}${kulturId}`,
                )

                // teilkultur nodes
                const kulturOption = await kultur.kulturOption()
                if (kulturOption?.tk) {
                  const teilkulturCollection = collectionFromTable({
                    table: 'teilkultur',
                    where: addTotalCriteriaToWhere({
                      store,
                      table: 'teilkultur',
                      where: { kultur_id: kultur.id },
                    }),
                  })
                  const teilkulturCount = await teilkulturCollection.count()
                  personGartenKulturTeilkulturFolderNodes.push(
                    buildPersonGartenKulturTeilkulturFolder({
                      kulturId,
                      kulturIndex,
                      gartenId,
                      gartenIndex,
                      personId,
                      personIndex,
                      count: teilkulturCount,
                    }),
                  )
                  const personGartenKulturTeilkulturFolderIsOpen =
                    openNodes.some(
                      (n) =>
                        n.length === 8 &&
                        n[1] === 'Personen' &&
                        n[2] === personId &&
                        n[3] === 'Gaerten' &&
                        n[4] === gartenId &&
                        n[5] === 'Kulturen' &&
                        n[6] === kulturId &&
                        n[7] === 'Teilkulturen',
                    )

                  if (personGartenKulturTeilkulturFolderIsOpen) {
                    const teilkulturs = await teilkulturCollection.toArray()
                    const teilkultursSorted = teilkulturs.sort(teilkulturSort)
                    const newPersonGartenKulturTeilkulturNodes =
                      teilkultursSorted.map((teilkultur, teilkulturIndex) =>
                        buildPersonGartenKulturTeilkultur({
                          teilkultur,
                          teilkulturIndex,
                          kulturId,
                          kulturIndex,
                          gartenId,
                          gartenIndex,
                          personId,
                          personIndex,
                        }),
                      )
                    personGartenKulturTeilkulturNodes.push(
                      ...newPersonGartenKulturTeilkulturNodes,
                    )
                  }
                }

                // zaehlung nodes
                const zaehlungCollection = collectionFromTable({
                  table: 'zaehlung',
                  where: addTotalCriteriaToWhere({
                    store,
                    table: 'zaehlung',
                    where: { kultur_id: kultur.id },
                  }),
                })
                const zaehlungCount = await zaehlungCollection.count()
                personGartenKulturZaehlungFolderNodes.push(
                  buildPersonGartenKulturZaehlungFolder({
                    kulturId,
                    kulturIndex,
                    gartenId,
                    gartenIndex,
                    personId,
                    personIndex,
                    count: zaehlungCount,
                  }),
                )
                const personGartenKulturZaehlungFolderIsOpen = openNodes.some(
                  (n) =>
                    n.length === 8 &&
                    n[1] === 'Personen' &&
                    n[2] === personId &&
                    n[3] === 'Gaerten' &&
                    n[4] === gartenId &&
                    n[5] === 'Kulturen' &&
                    n[6] === kulturId &&
                    n[7] === 'Zaehlungen',
                )

                if (personGartenKulturZaehlungFolderIsOpen) {
                  const zaehlungs = await zaehlungCollection.toArray()
                  const zaehlungsSorted = zaehlungs.sort(zaehlungSort)
                  const newPersonGartenKulturZaehlungNodes = await Promise.all(
                    zaehlungsSorted.map(
                      async (zaehlung, zaehlungIndex) =>
                        await buildPersonGartenKulturZaehlung({
                          zaehlung,
                          zaehlungIndex,
                          kulturId,
                          kulturIndex,
                          gartenId,
                          gartenIndex,
                          personId,
                          personIndex,
                          store,
                        }),
                    ),
                  )
                  personGartenKulturZaehlungNodes.push(
                    ...newPersonGartenKulturZaehlungNodes,
                  )
                }

                // anlieferung nodes
                const anlieferungCollection = collectionFromTable({
                  table: 'lieferung',
                  where: addTotalCriteriaToWhere({
                    store,
                    table: 'lieferung',
                    where: { nach_kultur_id: kultur.id },
                  }),
                })
                const anlieferungCount = await anlieferungCollection.count()
                personGartenKulturAnlieferungFolderNodes.push(
                  buildPersonGartenKulturAnlieferungFolder({
                    kulturId,
                    kulturIndex,
                    gartenId,
                    gartenIndex,
                    personId,
                    personIndex,
                    count: anlieferungCount,
                  }),
                )
                const personGartenKulturAnlieferungFolderIsOpen =
                  openNodes.some(
                    (n) =>
                      n.length === 8 &&
                      n[1] === 'Personen' &&
                      n[2] === personId &&
                      n[3] === 'Gaerten' &&
                      n[4] === gartenId &&
                      n[5] === 'Kulturen' &&
                      n[6] === kulturId &&
                      n[7] === 'An-Lieferungen',
                  )

                if (personGartenKulturAnlieferungFolderIsOpen) {
                  const anlieferungs = await anlieferungCollection.toArray()
                  const anlieferungsSorted = anlieferungs.sort(lieferungSort)
                  const newPersonGartenKulturAnlieferungNodes =
                    anlieferungsSorted.map((lieferung, lieferungIndex) =>
                      buildPersonGartenKulturAnlieferung({
                        lieferung,
                        lieferungIndex,
                        kulturId,
                        kulturIndex,
                        gartenId,
                        gartenIndex,
                        personId,
                        personIndex,
                      }),
                    )
                  personGartenKulturAnlieferungNodes.push(
                    ...newPersonGartenKulturAnlieferungNodes,
                  )
                }

                // auslieferung nodes
                const auslieferungCollection = collectionFromTable({
                  table: 'lieferung',
                  where: addTotalCriteriaToWhere({
                    store,
                    table: 'lieferung',
                    where: { von_kultur_id: kultur.id },
                  }),
                })
                const auslieferungCount = await auslieferungCollection.count()
                personGartenKulturAuslieferungFolderNodes.push(
                  buildPersonGartenKulturAuslieferungFolder({
                    kulturId,
                    kulturIndex,
                    gartenId,
                    gartenIndex,
                    personId,
                    personIndex,
                    count: auslieferungCount,
                  }),
                )
                const personGartenKulturAuslieferungFolderIsOpen =
                  openNodes.some(
                    (n) =>
                      n.length === 8 &&
                      n[1] === 'Personen' &&
                      n[2] === personId &&
                      n[3] === 'Gaerten' &&
                      n[4] === gartenId &&
                      n[5] === 'Kulturen' &&
                      n[6] === kulturId &&
                      n[7] === 'Aus-Lieferungen',
                  )

                if (personGartenKulturAuslieferungFolderIsOpen) {
                  const auslieferungs = await auslieferungCollection.toArray()
                  const auslieferungsSorted = auslieferungs.sort(lieferungSort)
                  const newPersonGartenKulturAuslieferungNodes =
                    auslieferungsSorted.map((lieferung, lieferungIndex) =>
                      buildPersonGartenKulturAuslieferung({
                        lieferung,
                        lieferungIndex,
                        kulturId,
                        kulturIndex,
                        gartenId,
                        gartenIndex,
                        personId,
                        personIndex,
                      }),
                    )
                  personGartenKulturAuslieferungNodes.push(
                    ...newPersonGartenKulturAuslieferungNodes,
                  )
                }

                // event nodes
                const eventCollection = collectionFromTable({
                  table: 'event',
                  where: addTotalCriteriaToWhere({
                    store,
                    table: 'event',
                    where: { kultur_id: kultur.id },
                  }),
                })
                const eventCount = await eventCollection.count()
                personGartenKulturEventFolderNodes.push(
                  buildPersonGartenKulturEventFolder({
                    kulturId,
                    kulturIndex,
                    gartenId,
                    gartenIndex,
                    personId,
                    personIndex,
                    count: eventCount,
                  }),
                )
                const personGartenKulturEventFolderIsOpen = openNodes.some(
                  (n) =>
                    n.length === 8 &&
                    n[1] === 'Personen' &&
                    n[2] === personId &&
                    n[3] === 'Gaerten' &&
                    n[4] === gartenId &&
                    n[5] === 'Kulturen' &&
                    n[6] === kulturId &&
                    n[7] === 'Events',
                )

                if (personGartenKulturEventFolderIsOpen) {
                  const events = await eventCollection.toArray()
                  const eventsSorted = events.sort(eventSort)
                  const newPersonGartenKulturEventNodes = eventsSorted.map(
                    (event, eventIndex) =>
                      buildPersonGartenKulturEvent({
                        event,
                        eventIndex,
                        kulturId,
                        kulturIndex,
                        gartenId,
                        gartenIndex,
                        personId,
                        personIndex,
                      }),
                  )
                  personGartenKulturEventNodes.push(
                    ...newPersonGartenKulturEventNodes,
                  )
                }
              }
            }
          }
        }

        // person > lieferung
        const personLieferungCollection = collectionFromTable({
          table: 'lieferung',
          where: addTotalCriteriaToWhere({
            store,
            table: 'lieferung',
            where: { person_id: person.id },
          }),
        })
        const personLieferungCount = await personLieferungCollection.count()
        personLieferungFolderNodes.push(
          buildPersonLieferungFolder({
            count: personLieferungCount,
            personIndex,
            personId,
          }),
        )
        const personLieferungFolderIsOpen = openNodes.some(
          (n) =>
            n.length === 4 &&
            n[1] === 'Personen' &&
            n[2] === personId &&
            n[3] === 'Lieferungen',
        )
        if (personLieferungFolderIsOpen) {
          const lieferungs = await personLieferungCollection.toArray()
          const lieferungsSorted = lieferungs.sort(lieferungSort)
          const newPersonLieferungNodes = lieferungsSorted.map(
            (lieferung, index) =>
              buildPersonLieferung({
                lieferung,
                index,
                personId,
                personIndex,
              }),
          )
          personLieferungNodes.push(...newPersonLieferungNodes)
        }
      }
    }
  }

  /*console.log('buildNodesWm', {
    artSammlungAuslieferungNodes,
    artSammlungAuslieferungFolderNodes,
  })*/
  const nodes = [
    ...artFolderNodes,
    ...artNodes,
    ...artSammlungFolderNodes,
    ...artSammlungNodes,
    ...artSammlungAuslieferungFolderNodes,
    ...artSammlungAuslieferungNodes,
    ...artHerkunftFolderNodes,
    ...artHerkunftNodes,
    ...artKulturFolderNodes,
    ...artKulturNodes,
    ...artKulturTeilkulturFolderNodes,
    ...artKulturTeilkulturNodes,
    ...artKulturZaehlungFolderNodes,
    ...artKulturZaehlungNodes,
    ...artKulturAnlieferungFolderNodes,
    ...artKulturAnlieferungNodes,
    ...artKulturAuslieferungFolderNodes,
    ...artKulturAuslieferungNodes,
    ...artKulturEventFolderNodes,
    ...artKulturEventNodes,
    ...herkunftFolderNodes,
    ...herkunftNodes,
    ...herkunftSammlungFolderNodes,
    ...herkunftSammlungNodes,
    ...herkunftSammlungAuslieferungFolderNodes,
    ...herkunftSammlungAuslieferungNodes,
    ...sammlungFolderNodes,
    ...sammlungNodes,
    ...sammlungHerkunftFolderNodes,
    ...sammlungHerkunftNodes,
    ...sammlungAuslieferungFolderNodes,
    ...sammlungAuslieferungNodes,
    ...gartenFolderNodes,
    ...gartenNodes,
    ...gartenKulturFolderNodes,
    ...gartenKulturNodes,
    ...gartenKulturTeilkulturFolderNodes,
    ...gartenKulturTeilkulturNodes,
    ...gartenKulturZaehlungFolderNodes,
    ...gartenKulturZaehlungNodes,
    ...gartenKulturAnlieferungFolderNodes,
    ...gartenKulturAnlieferungNodes,
    ...gartenKulturAuslieferungFolderNodes,
    ...gartenKulturAuslieferungNodes,
    ...gartenKulturEventFolderNodes,
    ...gartenKulturEventNodes,
    ...kulturFolderNodes,
    ...kulturNodes,
    ...kulturTeilkulturFolderNodes,
    ...kulturTeilkulturNodes,
    ...kulturZaehlungFolderNodes,
    ...kulturZaehlungNodes,
    ...kulturAnlieferungFolderNodes,
    ...kulturAnlieferungNodes,
    ...kulturAuslieferungFolderNodes,
    ...kulturAuslieferungNodes,
    ...kulturEventFolderNodes,
    ...kulturEventNodes,
    ...teilkulturFolderNodes,
    ...teilkulturNodes,
    ...zaehlungFolderNodes,
    ...zaehlungNodes,
    ...lieferungFolderNodes,
    ...lieferungNodes,
    ...eventFolderNodes,
    ...eventNodes,
    ...personFolderNodes,
    ...personNodes,
    ...personGartenFolderNodes,
    ...personGartenNodes,
    ...personGartenKulturFolderNodes,
    ...personGartenKulturNodes,
    ...personGartenKulturAnlieferungFolderNodes,
    ...personGartenKulturAnlieferungNodes,
    ...personGartenKulturAuslieferungFolderNodes,
    ...personGartenKulturAuslieferungNodes,
    ...personGartenKulturEventFolderNodes,
    ...personGartenKulturEventNodes,
    ...personGartenKulturTeilkulturFolderNodes,
    ...personGartenKulturTeilkulturNodes,
    ...personGartenKulturZaehlungFolderNodes,
    ...personGartenKulturZaehlungNodes,
    ...personLieferungFolderNodes,
    ...personLieferungNodes,
    ...personSammlungFolderNodes,
    ...personSammlungNodes,
    ...sammelLieferungFolderNodes,
    ...sammelLieferungNodes,
    ...sammelLieferungLieferungFolderNodes,
    ...sammelLieferungLieferungNodes,
  ]

  const nodesSorted = nodes.sort(
    (a, b) =>
      compare(a.sort[0], b.sort[0]) ||
      compare(a.sort[1], b.sort[1]) ||
      compare(a.sort[2], b.sort[2]) ||
      compare(a.sort[3], b.sort[3]) ||
      compare(a.sort[4], b.sort[4]) ||
      compare(a.sort[5], b.sort[5]) ||
      compare(a.sort[6], b.sort[6]) ||
      compare(a.sort[7], b.sort[7]) ||
      compare(a.sort[8], b.sort[8]) ||
      compare(a.sort[9], b.sort[9]) ||
      compare(a.sort[10], b.sort[10]) ||
      compare(a.sort[11], b.sort[11]),
  )
  //console.log('buildNodes, nodes:', nodesSorted)
  store.tree.setLoadingNode(null)
  return nodesSorted
}

export default buildNodes
