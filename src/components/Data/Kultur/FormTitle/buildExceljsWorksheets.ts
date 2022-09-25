import sum from 'lodash/sum'

import addWorksheetToExceljsWorkbook from '../../../../utils/addWorksheetToExceljsWorkbook'
import removeMetadataFromDataset from '../../../../utils/removeMetadataFromDataset'
import exists from '../../../../utils/exists'
import teilzaehlungsSortByTk from '../../../../utils/teilzaehlungsSortByTk'
import zaehlungSort from '../../../../utils/zaehlungSort'
import lieferungSort from '../../../../utils/lieferungSort'
import eventSort from '../../../../utils/eventSort'
import personFullname from '../../../../utils/personFullname'
import {
  dexie,
  Lieferung,
  Art,
  Kultur,
  Herkunft,
} from '../../../../dexieClient'
import totalFilter from '../../../../utils/totalFilter'

/**
 * this function cann be used from higher up
 * that is why it receives a workbook and _can_ recieve calledFromHigherUp
 */
const buildExceljsWorksheets = async ({
  store,
  kultur_id,
  kultur_name,
  workbook,
  calledFromHigherUp,
}) => {
  // 1. Get Kultur
  if (!calledFromHigherUp) {
    const kultur: Kultur = await dexie.kulturs.get(kultur_id)
    const art: Art = await kultur.art()
    const artName = await art?.label()
    const herkunft: Herkunft = await kultur?.herkunft()
    const garten = await kultur.garten()

    const newK = {
      id: kultur.id,
      art_id: kultur.art_id,
      art_name: artName,
      herkunft_id: kultur.herkunft_id,
      herkunft_nr: herkunft?.nr,
      herkunft_rohdaten: removeMetadataFromDataset(herkunft),
      garten_id: kultur.garten_id,
      garten_name: garten?.name,
      garten_rohdaten: removeMetadataFromDataset(garten),
      zwischenlager: kultur.zwischenlager,
      erhaltungskultur: kultur.erhaltungskultur,
      von_anzahl_individuen: kultur.von_anzahl_individuen,
      bemerkungen: kultur.bemerkungen,
      aktiv: kultur.aktiv,
      changed: kultur.changed,
      changed_by: kultur.changed_by,
    }
    addWorksheetToExceljsWorkbook({
      workbook,
      title: calledFromHigherUp ? `Kultur_${kultur_id}` : 'Kultur',
      data: [newK],
    })
  }
  // 2. Get Zählungen
  const zaehlungs = await dexie.zaehlungs
    .where({ kultur_id })
    .filter((value) => totalFilter({ value, store, table: 'zaehlung' }))
    .toArray()
  const idsOfZaehlungs = zaehlungs.map((z) => z.id)
  const zaehlungsSorted = zaehlungs.sort(zaehlungSort)
  const zaehlungen = await Promise.all(
    zaehlungsSorted.map(async (z) => {
      const tzs = await z.teilzaehlungs()
      const tzsSorted = await teilzaehlungsSortByTk(tzs)
      const newZ = {
        id: z.id,
        kultur_id: z.kultur_id,
        datum: z.datum,
        prognose: z.prognose,
        bemerkungen: z.bemerkungen,
        teilzaehlungen_anzahl: tzsSorted
          .map((tz) => tz.anzahl_pflanzen)
          .filter((a) => exists(a)).length,
        teilzaehlungen_anzahl_pflanzen: sum(
          tzsSorted.map((tz) => tz.anzahl_pflanzen).filter((a) => exists(a)),
        ),
        teilzaehlungen_anzahl_auspflanzbereit: sum(
          tzsSorted
            .map((tz) => tz.anzahl_auspflanzbereit)
            .filter((a) => exists(a)),
        ),
        teilzaehlungen_anzahl_mutterpflanzen: sum(
          tzsSorted
            .map((tz) => tz.anzahl_mutterpflanzen)
            .filter((a) => exists(a)),
        ),
        /*teilzaehlungen_ids: tknodes
        .filter((tk) => !!tk?.id)
        .map((tk) => tk?.id)
        .join(', '),
      teilzaehlungen_teilkulturen: tknodes
        .filter((tk) => {
          return !!tk?.teilkultur?.name
        })
        .map((tk) => {
          return tk?.teilkultur?.name
        })
        .join(', '),
      teilzaehlungen_andere_mengen: tknodes
        .filter((tk) => !!tk?.andere_menge)
        .map((tk) => tk?.andere_menge)
        .join(', '),*/
      }
      return newZ
    }),
  )
  if (zaehlungen.length) {
    addWorksheetToExceljsWorkbook({
      workbook,
      title: calledFromHigherUp
        ? `Kultur_${kultur_name}_Zaehlungen`
        : 'Zaehlungen',
      data: zaehlungen,
    })

    // 3. Get Teil-Zählungen
    const teilzaehlungs = await dexie.teilzaehlungs
      .where('zaehlung_id')
      .anyOf(idsOfZaehlungs)
      .filter((value) => totalFilter({ value, store, table: 'teilzaehlung' }))
      .toArray()
    const teilzaehlungsSorted = await teilzaehlungsSortByTk(teilzaehlungs)
    const teilzaehlungData = await Promise.all(
      teilzaehlungsSorted.map(async (t) => {
        const teilkultur = await t.teilkultur()
        const newZ = {
          id: t.id,
          zaehlung_id: t.zaehlung_id,
          teilkultur_id: t.teilkultur_id,
          teilkultur_name: teilkultur?.name,
          anzahl_pflanzen: t.anzahl_pflanzen,
          anzahl_auspflanzbereit: t.anzahl_auspflanzbereit,
          anzahl_mutterpflanzen: t.anzahl_mutterpflanzen,
          andere_menge: t.andere_menge,
          auspflanzbereit_beschreibung: t.auspflanzbereit_beschreibung,
          bemerkungen: t.bemerkungen,
        }
        return newZ
      }),
    )
    if (teilzaehlungData.length) {
      addWorksheetToExceljsWorkbook({
        workbook,
        title: calledFromHigherUp
          ? `Kultur_${kultur_name}_Teilzaehlungen`
          : 'Teilzaehlungen',
        data: teilzaehlungData,
      })
    }
  }
  // 4. Get An-Lieferungen
  const anlieferungs = await dexie.lieferungs
    .where({ nach_kultur_id: kultur_id })
    .filter((value) => totalFilter({ value, store, table: 'lieferung' }))
    .toArray()
  const lieferungsSorted = anlieferungs.sort(lieferungSort)
  const anlieferungData = await Promise.all(
    lieferungsSorted.map(async (l: Lieferung) => {
      const art = await l.art()
      const artName = await art?.label()
      const aeArt = await art?.aeArt()
      const lieferungPerson = await l.person()
      const vonSammlung = await l.sammlung()
      const vonSammlungPerson = await vonSammlung?.person()
      const vonSammlungHerkunft = await vonSammlung?.herkunft()
      const vonKultur = await l.vonKultur()
      const vonKulturGarten = await vonKultur?.garten()
      const vonKulturHerkunft = await vonKultur?.herkunft()
      const nachKultur = await l.nachKultur()
      const nachKulturGarten = await nachKultur?.garten()
      const nachKulturHerkunft = await nachKultur?.herkunft()
      const sammelLieferung = await l.sammelLieferung()

      const newZ = {
        id: l.id,
        sammel_lieferung_id: l.sammel_lieferung_id,
        sammel_lieferung_rohdaten: removeMetadataFromDataset(sammelLieferung),
        art_id: l.art_id,
        art_ae_id: aeArt?.id,
        art_ae_name: artName,
        person_id: l.person_id,
        person_name: personFullname(lieferungPerson),
        person_rohdaten: removeMetadataFromDataset(lieferungPerson),
        von_sammlung_id: l.von_sammlung_id,
        von_sammlung_datum: vonSammlung?.datum,
        von_sammlung_herkunft_id: vonSammlung?.herkunft_id,
        von_sammlung_herkunft_nr: vonSammlungHerkunft?.nr,
        von_sammlung_person_id: vonSammlung?.person_id,
        von_sammlung_person_name: personFullname(vonSammlungPerson),
        von_sammlung_rohdaten: removeMetadataFromDataset(vonSammlung),
        von_kultur_id: l.von_kultur_id,
        von_kultur_garten_id: vonKultur?.garten_id,
        von_kultur_garten_name: vonKulturGarten?.name,
        von_kultur_herkunft_id: vonKultur?.herkunft_id,
        von_kultur_herkunft_nr: vonKulturHerkunft?.nr,
        von_kultur_rohdaten: removeMetadataFromDataset(vonKultur),
        datum: l.datum,
        nach_kultur_id: l.nach_kultur_id,
        nach_kultur_garten_id: nachKultur?.garten_id,
        nach_kultur_garten_name: nachKulturGarten?.name,
        nach_kultur_herkunft_id: nachKultur?.herkunft_id,
        nach_kultur_herkunft_nr: nachKulturHerkunft?.nr,
        nach_kultur_rohdaten: removeMetadataFromDataset(nachKultur),
        nach_ausgepflanzt: l.nach_ausgepflanzt,
        von_anzahl_individuen: l.von_anzahl_individuen,
        anzahl_pflanzen: l.anzahl_pflanzen,
        anzahl_auspflanzbereit: l.anzahl_auspflanzbereit,
        gramm_samen: l.gramm_samen,
        andere_menge: l.andere_menge,
        geplant: l.geplant,
        bemerkungen: l.bemerkungen,
        changed: l.changed,
        changed_by: l.changed_by,
      }
      return newZ
    }),
  )
  if (anlieferungData.length) {
    addWorksheetToExceljsWorkbook({
      workbook,
      title: calledFromHigherUp
        ? `Kultur_${kultur_name}_Anlieferungen`
        : 'Anlieferungen',
      data: anlieferungData,
    })
  }
  // 5. Get Aus-Lieferungen
  const auslieferungs = await dexie.lieferungs
    .where({ von_kultur_id: kultur_id })
    .filter((value) => totalFilter({ value, store, table: 'lieferung' }))
    .toArray()
  const auslieferungsSorted = auslieferungs.sort(lieferungSort)
  const auslieferungen = await Promise.all(
    auslieferungsSorted.map(async (l: Lieferung) => {
      const art: Art = await l.art()
      const artName = await art?.label()
      const aeArt = await art?.aeArt()
      const lieferungPerson = await l.person()
      const vonSammlung = await l.sammlung()
      const vonSammlungPerson = await vonSammlung?.person()
      const vonSammlungHerkunft = await vonSammlung?.herkunft()
      const vonKultur = await l.vonKultur()
      const vonKulturGarten = await vonKultur?.garten()
      const vonKulturHerkunft = await vonKultur?.herkunft()
      const nachKultur = await l.nachKultur()
      const nachKulturGarten = await nachKultur?.garten()
      const nachKulturHerkunft = await nachKultur?.herkunft()
      const sammelLieferung = await l.sammelLieferung()

      const newZ = {
        id: l.id,
        sammel_lieferung_id: l.sammel_lieferung_id,
        sammel_lieferung_rohdaten: removeMetadataFromDataset(sammelLieferung),
        art_id: l.art_id,
        art_ae_id: aeArt?.id,
        art_ae_name: artName,
        person_id: l.person_id,
        person_name: personFullname(lieferungPerson),
        person_rohdaten: removeMetadataFromDataset(lieferungPerson),
        von_sammlung_id: l.von_sammlung_id,
        von_sammlung_datum: vonSammlung?.datum,
        von_sammlung_herkunft_id: vonSammlung?.herkunft_id,
        von_sammlung_herkunft_nr: vonSammlungHerkunft?.nr,
        von_sammlung_person_id: vonSammlung?.person_id,
        von_sammlung_person_name: personFullname(vonSammlungPerson),
        von_sammlung_rohdaten: removeMetadataFromDataset(vonSammlung),
        von_kultur_id: l.von_kultur_id,
        von_kultur_garten_id: vonKultur?.garten_id,
        von_kultur_garten_name: vonKulturGarten?.name,
        von_kultur_herkunft_id: vonKultur?.herkunft_id,
        von_kultur_herkunft_nr: vonKulturHerkunft?.nr,
        von_kultur_rohdaten: removeMetadataFromDataset(vonKultur),
        datum: l.datum,
        nach_kultur_id: l.nach_kultur_id,
        nach_kultur_garten_id: nachKultur?.garten_id,
        nach_kultur_garten_name: nachKulturGarten?.name,
        nach_kultur_herkunft_id: nachKultur?.herkunft_id,
        nach_kultur_herkunft_nr: nachKulturHerkunft?.nr,
        nach_kultur_rohdaten: removeMetadataFromDataset(nachKultur),
        nach_ausgepflanzt: l.nach_ausgepflanzt,
        von_anzahl_individuen: l.von_anzahl_individuen,
        anzahl_pflanzen: l.anzahl_pflanzen,
        anzahl_auspflanzbereit: l.anzahl_auspflanzbereit,
        gramm_samen: l.gramm_samen,
        andere_menge: l.andere_menge,
        geplant: l.geplant,
        bemerkungen: l.bemerkungen,
        changed: l.changed,
        changed_by: l.changed_by,
      }
      return newZ
    }),
  )
  if (auslieferungen.length) {
    addWorksheetToExceljsWorkbook({
      workbook,
      title: calledFromHigherUp
        ? `Kultur_${kultur_name}_Auslieferungen`
        : 'Auslieferungen',
      data: auslieferungen,
    })
  }
  // 6. Get Events
  const events = await dexie.events
    .where({ kultur_id })
    .filter((value) => totalFilter({ value, store, table: 'event' }))
    .toArray()
  const eventsSorted = events.sort(eventSort)
  const eventsData = await Promise.all(
    eventsSorted.map(async (e) => {
      const teilkultur = await e.teilkultur()
      const person = await e.person()

      const newZ = {
        id: e.id,
        kultur_id: e.kultur_id,
        teilkultur_id: e.teilkultur_id,
        teilkultur_name: teilkultur?.name,
        teilkultur_rohdaten: removeMetadataFromDataset(teilkultur),
        person_id: e.person_id,
        person_name: personFullname(person),
        person_rohdaten: removeMetadataFromDataset(person),
        beschreibung: e.beschreibung,
        geplant: e.geplant,
        datum: e.datum,
        changed: e.changed,
        changed_by: e.changed_by,
      }
      delete e.teilkultur
      return newZ
    }),
  )
  if (eventsData.length) {
    addWorksheetToExceljsWorkbook({
      workbook,
      title: calledFromHigherUp ? `Kultur_${kultur_name}_Events` : 'Events',
      data: eventsData,
    })
  }
  return
}

export default buildExceljsWorksheets
