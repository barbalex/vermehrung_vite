import * as ExcelJs from 'exceljs/dist/exceljs.min.js'
import { DateTime } from 'luxon'
// import { Q } from '@nozbe/watermelondb'
// import { first as first$ } from 'rxjs/operators'

import addWorksheetToExceljsWorkbook from '../../../../../utils/addWorksheetToExceljsWorkbook'
import herkunftLabelFromHerkunft from '../../../../../utils/herkunftLabelFromHerkunft'
import personLabelFromPerson from '../../../../../utils/personLabelFromPerson'
import downloadExceljsWorkbook from '../../../../../utils/downloadExceljsWorkbook'
import lieferungSort from '../../../../../utils/lieferungSort'

const buildExceljsWorksheetsForLieferungenOfYear = async ({ store, year }) => {
  const { db } = store
  const workbook = new ExcelJs.Workbook()

  let lieferungs = []
  try {
    lieferungs = [] // TODO: dexie
    // await db
    //   .get('lieferung')
    //   .query(Q.where('_deleted', false), Q.where('datum', Q.notEq(null)))
    //   .fetch()
  } catch {}
  const lieferungsSorted = lieferungs.sort(lieferungSort)

  const lieferungsdata = await Promise.all(
    lieferungsSorted
      .filter((l) => {
        const lYear = DateTime.fromSQL(l.datum).toFormat('yyyy')
        return lYear == year
      })
      .map(async (l) => {
        let lieferungPerson
        try {
          lieferungPerson = await l.person.fetch()
        } catch {}
        let vonSammlung
        try {
          vonSammlung = await l.sammlung.fetch()
        } catch {}
        const von_sammlung_label = await vonSammlung?.label()
        let vonSammlungPerson
        try {
          vonSammlungPerson = await vonSammlung?.person?.fetch()
        } catch {}
        let vonSammlungHerkunft
        try {
          vonSammlungHerkunft = await vonSammlung?.herkunft?.fetch()
        } catch {}
        const vonKultur = await l.von_kultur()
        const von_kultur_label = await vonKultur?.label()
        let vonKulturGarten
        try {
          vonKulturGarten = await vonKultur?.garten?.fetch()
        } catch {}
        const von_kultur_garten_label = await vonKulturGarten?.label()
        let vonKulturHerkunft
        try {
          vonKulturHerkunft = await vonKultur?.herkunft?.fetch()
        } catch {}
        let nachKultur
        try {
          nachKultur = await l.nach_kultur.pipe(first$()).toPromise()
        } catch {}
        const nach_kultur_label = await nachKultur?.label()
        let nachKulturGarten
        try {
          nachKulturGarten = await nachKultur?.garten?.fetch()
        } catch {}
        const nach_kultur_garten_label = nachKulturGarten?.label()
        let nachKulturHerkunft
        try {
          nachKulturHerkunft = await nachKultur?.herkunft?.fetch()
        } catch {}
        let art
        try {
          art = await l.art?.fetch()
        } catch {}
        const art_label = await art?.label()

        return {
          id: l.id,
          sammel_lieferung_id: l.sammel_lieferung_id,
          art_id: l.art_id,
          art_label,
          person_id: l.person_id,
          person_label: personLabelFromPerson({
            person: lieferungPerson,
          }),
          von_sammlung_id: l.von_sammlung_id,
          von_sammlung_label,
          von_sammlung_datum: vonSammlung?.datum ?? '',
          von_sammlung_herkunft_id: vonSammlung?.herkunft_id ?? '',
          von_sammlung_herkunft_nr: vonSammlungHerkunft?.nr ?? '',
          von_sammlung_person_id: vonSammlung?.person_id ?? '',
          von_sammlung_person_name: personLabelFromPerson({
            person: vonSammlungPerson,
          }),
          von_kultur_id: l.von_kultur_id,
          von_kultur_label,
          von_kultur_garten_id: vonKultur?.garten_id ?? '',
          von_kultur_garten_label,
          von_kultur_herkunft_id: vonKultur?.herkunft_id ?? '',
          von_kultur_herkunft_label: herkunftLabelFromHerkunft({
            herkunft: vonKulturHerkunft,
          }),
          von_kultur_herkunft_nr: vonKulturHerkunft?.nr ?? '',
          datum: l.datum,
          nach_kultur_id: l.nach_kultur_id,
          nach_kultur_label,
          nach_kultur_garten_id: nachKultur?.garten_id ?? '',
          nach_kultur_garten_label,
          nach_kultur_garten_name: nachKulturGarten?.name ?? '',
          nach_kultur_herkunft_id: nachKultur?.herkunft_id ?? '',
          nach_kultur_herkunft_nr: nachKulturHerkunft?.nr ?? '',
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
      }),
  )
  if (lieferungsdata.length) {
    addWorksheetToExceljsWorkbook({
      workbook,
      title: `Lieferungen ${year}`,
      data: lieferungsdata,
    })
  }
  downloadExceljsWorkbook({ store, fileName: `Lieferungen_${year}`, workbook })
}

export default buildExceljsWorksheetsForLieferungenOfYear
