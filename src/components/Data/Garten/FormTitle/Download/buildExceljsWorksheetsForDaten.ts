import addWorksheetToExceljsWorkbook from '../../../../../utils/addWorksheetToExceljsWorkbook'
import buildExceljsWorksheetsForKultur from '../../../Kultur/FormTitle/buildExceljsWorksheets'
import removeMetadataFromDataset from '../../../../../utils/removeMetadataFromDataset'
import kultursSortedFromKulturs from '../../../../../utils/kultursSortedFromKulturs'
import { dexie } from '../../../../../dexieClient'
import collectionFromTable from '../../../../../utils/collectionFromTable'
import addTotalCriteriaToWhere from '../../../../../utils/addTotalCriteriaToWhere'

/**
 * this function cann be used from higher up
 * that is why it receives a workbook and _can_ recieve calledFromHigherUp
 */
const buildExceljsWorksheetsForDaten = async ({
  store,
  garten_id,
  workbook,
  calledFromHigherUp,
}) => {
  // 1. Get Garten
  const garten = await dexie.gartens.get(garten_id)
  const person = await garten?.person()
  const newGarten = {
    id: garten.id,
    name: garten.name,
    person_id: garten.person_id,
    person_name: person?.fullname() ?? '',
    person_rohdaten: removeMetadataFromDataset(person),
    strasse: garten.strasse,
    plz: garten.plz,
    ort: garten.ort,
    geom_point: garten.geom_point,
    wgs84_lat: garten.wgs84_lat,
    wgs84_long: garten.wgs84_long,
    lv95_x: garten.lv95_x,
    lv95_y: garten.lv95_y,
    aktiv: garten.aktiv,
    bemerkungen: garten.bemerkungen,
    changed: garten.changed,
    changed_by: garten.changed_by,
  }
  addWorksheetToExceljsWorkbook({
    workbook,
    title: calledFromHigherUp ? `Garten_${garten_id}` : 'Garten',
    data: [newGarten],
  })
  // 2. Get Kulturen
  const kultursOfGarten = await collectionFromTable({
    table: 'kultur',
    where: addTotalCriteriaToWhere({
      table: 'kultur',
      store,
      where: { garten_id },
    }),
  }).toArray()
  const kultursOfGartenSorted = await kultursSortedFromKulturs(kultursOfGarten)
  const kulturData = await Promise.all(
    kultursOfGartenSorted.map(async (kultur) => {
      const art = await kultur?.art()
      const artLabel = await art?.label()
      const aeArt = await art?.aeArt()
      const herkunft = await kultur?.herkunft()

      const newK = {
        id: kultur.id,
        art_id: kultur.art_id,
        art_ae_id: aeArt?.id ?? '',
        art_ae_name: artLabel,
        herkunft_id: kultur.herkunft_id,
        herkunft_nr: herkunft?.nr ?? '',
        herkunft_rohdaten: removeMetadataFromDataset(herkunft),
        garten_id: kultur.garten_id,
        garten_name: garten?.name ?? '',
        garten_rohdaten: removeMetadataFromDataset(garten),
        zwischenlager: kultur.zwischenlager,
        erhaltungskultur: kultur.erhaltungskultur,
        von_anzahl_individuen: kultur.von_anzahl_individuen,
        bemerkungen: kultur.bemerkungen,
        aktiv: kultur.aktiv,
        changed: kultur.changed,
        changed_by: kultur.changed_by,
      }
      return newK
    }),
  )
  if (kulturData.length) {
    addWorksheetToExceljsWorkbook({
      workbook,
      title: calledFromHigherUp ? `Garten_${garten_id}_Kulturen` : 'Kulturen',
      data: kulturData,
    })
    // 3. for all kulturen, call Kultur/buildExceljsWorksheets
    const myKulturIds = kulturData.map((k) => k.id)
    // need to pass index
    // as explained in https://stackoverflow.com/a/34349073/712005
    // because excel limits length of names and uuid is too long
    for (const [index, kultur_id] of myKulturIds.entries()) {
      await buildExceljsWorksheetsForKultur({
        store,
        kultur_id,
        kultur_name: index + 1,
        workbook,
        calledFromHigherUp: true,
      })
    }
  }
  return
}

export default buildExceljsWorksheetsForDaten
