import { dexie } from '../dexieClient'
import collectionFromTable from './collectionFromTable'
import addTotalCriteriaToWhere from './addTotalCriteriaToWhere'

const hierarchyWhereAndFilterForTable = async ({ store, table }) => {
  const {
    artIdInActiveNodeArray,
    gartenIdInActiveNodeArray,
    herkunftIdInActiveNodeArray,
    kulturIdInActiveNodeArray,
    personIdInActiveNodeArray,
    sammelLieferungIdInActiveNodeArray,
    sammlungIdInActiveNodeArray,
  } = store
  const { activeNodeArray } = store.tree

  switch (table) {
    case 'herkunft': {
      if (sammlungIdInActiveNodeArray) {
        const activeSammlung = await dexie.sammlungs.get(
          sammlungIdInActiveNodeArray ?? '99999999-9999-9999-9999-999999999999',
        )

        return { where: { id: activeSammlung.herkunft_id } }
      }
      if (artIdInActiveNodeArray) {
        const sammlungsOfArt = await collectionFromTable({
          table: 'sammlung',
          where: addTotalCriteriaToWhere({
            table: 'sammlung',
            store,
            where: {
              art_id:
                artIdInActiveNodeArray ??
                '99999999-9999-9999-9999-999999999999',
            },
          }),
        }).toArray()
        const herkunftIds = sammlungsOfArt.map((e) => e.herkunft_id)

        return { filter: (s) => herkunftIds.includes(s.id) }
      }
      return {}
      break
    }
    case 'sammlung': {
      if (artIdInActiveNodeArray) {
        return { where: { art_id: artIdInActiveNodeArray } }
      }
      if (herkunftIdInActiveNodeArray) {
        return { where: { herkunft_id: herkunftIdInActiveNodeArray } }
      }
      if (personIdInActiveNodeArray) {
        return { where: { person_id: personIdInActiveNodeArray } }
      }
      return {}
      break
    }
    case 'garten': {
      if (personIdInActiveNodeArray) {
        return { where: { person_id: personIdInActiveNodeArray } }
      }
      return {}
      break
    }
    case 'kultur': {
      if (gartenIdInActiveNodeArray) {
        return { where: { garten_id: gartenIdInActiveNodeArray } }
      }
      if (artIdInActiveNodeArray) {
        return { where: { art_id: artIdInActiveNodeArray } }
      }
      return {}
      break
    }
    case 'teilkultur': {
      if (kulturIdInActiveNodeArray) {
        return { where: { kultur_id: kulturIdInActiveNodeArray } }
      }
      return {}
      break
    }
    case 'zaehlung': {
      if (kulturIdInActiveNodeArray) {
        return { where: { kultur_id: kulturIdInActiveNodeArray } }
      }
      return {}
      break
    }
    case 'lieferung': {
      if (kulturIdInActiveNodeArray) {
        // this should get kulturen connected by von_kultur_id or nach_kultur_id
        // depending on activeNodeArray[last] being 'An-Lieferung' or 'Aus-Lieferung'
        let kulturOnField = 'von_kultur_id'
        const lastAnAElement = activeNodeArray[activeNodeArray.length - 1]
        if (lastAnAElement === 'An-Lieferungen')
          kulturOnField = 'nach_kultur_id'
        return { where: { [kulturOnField]: kulturIdInActiveNodeArray } }
      }
      if (sammelLieferungIdInActiveNodeArray) {
        return {
          where: { sammel_lieferung_id: sammelLieferungIdInActiveNodeArray },
        }
      }
      if (personIdInActiveNodeArray) {
        return { where: { person_id: personIdInActiveNodeArray } }
      }
      if (sammlungIdInActiveNodeArray) {
        return { where: { von_sammlung_id: sammlungIdInActiveNodeArray } }
      }
      return {}
      break
    }
    case 'event': {
      if (kulturIdInActiveNodeArray) {
        return { where: { kultur_id: kulturIdInActiveNodeArray } }
      }
      return {}
      break
    }

    default:
      return {}
      break
  }
}

export default hierarchyWhereAndFilterForTable
