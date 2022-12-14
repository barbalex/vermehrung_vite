import addWorksheetToExceljsWorkbook from '../../../../../utils/addWorksheetToExceljsWorkbook'
import teilzaehlungsSortByTk from '../../../../../utils/teilzaehlungsSortByTk'
import {
  dexie,
  Teilzaehlung,
  Garten,
  Kultur,
  Zaehlung,
} from '../../../../../dexieClient'
// import exists from '../../../../../utils/exists'

/**
 * this function cann be used from higher up
 * that is why it receives a workbook and _can_ recieve calledFromHigherUp
 */
const buildExceljsWorksheetsForTzSums = async ({
  store,
  garten_id,
  workbook,
}) => {
  const garten: Garten = await dexie.gartens.get(garten_id)
  const allKulturs: Kultur[] = await garten?.kulturs({ store })
  const idsOfAllKulturs = allKulturs.map((k) => k.id)
  const allZaehlungs: Zaehlung[] = await dexie?.zaehlungs
    .where('[kultur_id+__deleted_indexable]')
    .anyOf(idsOfAllKulturs.map((id) => [id, 0]))
    .toArray()
  const idsOfAllZaehlungs = allZaehlungs.map((z) => z.id)

  const teilzaehlungs: Teilzaehlung[] = await dexie.teilzaehlungs
    .where('[zaehlung_id+__deleted_indexable]')
    .anyOf(idsOfAllZaehlungs.map((id) => [id, 0]))
    // .filter((tz) => exists(tz.anzahl_pflanzen))
    .toArray()
  const teilzaehlungsSorted = await teilzaehlungsSortByTk(teilzaehlungs)
  const teilzaehlungsData = await Promise.all(
    teilzaehlungsSorted.map(async (z) => {
      const teilkultur = await z.teilkultur()

      const newZ = {
        id: z.id,
        zaehlung_id: z.zaehlung_id,
        teilkultur_id: z.teilkultur_id,
        teilkultur_name: teilkultur?.name ?? '',
        anzahl_pflanzen: z.anzahl_pflanzen,
        anzahl_auspflanzbereit: z.anzahl_auspflanzbereit,
        anzahl_mutterpflanzen: z.anzahl_mutterpflanzen,
        andere_menge: z.andere_menge,
        auspflanzbereit_beschreibung: z.auspflanzbereit_beschreibung,
        bemerkungen: z.bemerkungen,
      }

      return newZ
    }),
  )

  addWorksheetToExceljsWorkbook({
    workbook,
    title: `teilzahlungen_von_garten_${garten_id}`,
    data: teilzaehlungsData,
  })

  return
}

export default buildExceljsWorksheetsForTzSums
