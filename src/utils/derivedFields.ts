import { dexie } from '../dexieClient'
import sammlungLabelFromSammlung from './sammlungLabelFromSammlung'
import sammlungLabelFromSammlungUnderHerkunft from './sammlungLabelFromSammlungUnderHerkunft'

const derivedFields = {
  art: {},
  art_qk: {},
  av: {},
  event: {},
  garten: {},
  gv: {},
  herkunft: {},
  kultur: {},
  kultur_option: {},
  kultur_qk: {},
  lieferung: {},
  person: {},
  person_option: {},
  sammel_lieferung: {},
  sammlung: {
    __label: {
      derive: async (row) => {
        if (!row) return
        const [herkunft, art, person] = await Promise.all([
          dexie.herkunfts.get(
            row.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
          ),
          dexie.arts.get(row.art_id ?? '99999999-9999-9999-9999-999999999999'),
          dexie.persons.get(
            row.person_id ?? '99999999-9999-9999-9999-999999999999',
          ),
        ])
        const ae_art = await art?.aeArt()

        return sammlungLabelFromSammlung({
          sammlung: row,
          art,
          ae_art,
          person,
          herkunft,
        })
      },
      dependentTables: [
        'herkunft',
        'art',
        'person',
      ],
    },
    __labelUnderHerkunft: {
      derive: async (row) => {
        if (!row) return
        const [art, person] = await Promise.all([
          dexie.arts.get(row.art_id ?? '99999999-9999-9999-9999-999999999999'),
          dexie.persons.get(
            row.person_id ?? '99999999-9999-9999-9999-999999999999',
          ),
        ])
        const ae_art = await art?.aeArt()

        return sammlungLabelFromSammlungUnderHerkunft({
          sammlung: row,
          art,
          ae_art,
          person,
        })
      },
      dependentTables: (row) => ({
        art: row.art_id,
        person: row.person_id,
      }),
    },
  },
  teilkultur: {},
  teilzaehlung: {},
  zaehlung: {},
}

export default derivedFields
