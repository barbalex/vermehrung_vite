import { dexie } from '../dexieClient'
import totalFilter from './totalFilter'

const hierarchyFilterForTable = async ({ store, table }) => {
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
          sammlungIdInActiveNodeArray,
        )

        return (s) => s.id === activeSammlung.herkunft_id
      }
      if (artIdInActiveNodeArray) {
        const sammlungsOfArt = await dexie.sammlungs
          .where({
            art_id: artIdInActiveNodeArray,
          })
          .filter((value) => totalFilter({ value, store, table: 'sammlung' }))
          .toArray()
        const herkunftIds = sammlungsOfArt.map((e) => e.herkunft_id)

        return (s) => herkunftIds.includes(s.id)
      }
      return () => true
      break
    }
    case 'sammlung': {
      if (artIdInActiveNodeArray) {
        return (s) => s.art_id === artIdInActiveNodeArray
      }
      if (herkunftIdInActiveNodeArray) {
        return (s) => s.herkunft_id === herkunftIdInActiveNodeArray
      }
      if (personIdInActiveNodeArray) {
        return (s) => s.person_id === personIdInActiveNodeArray
      }
      return () => true
      break
    }
    case 'garten': {
      if (personIdInActiveNodeArray) {
        return (c) => c.person_id === personIdInActiveNodeArray
      }
      return () => true
      break
    }
    case 'kultur': {
      if (gartenIdInActiveNodeArray) {
        return (c) => c.garten_id === gartenIdInActiveNodeArray
      }
      if (artIdInActiveNodeArray) {
        return (c) => c.art_id === artIdInActiveNodeArray
      }
      return () => true
      break
    }
    case 'teilkultur': {
      if (kulturIdInActiveNodeArray) {
        return (c) => c.kultur_id === kulturIdInActiveNodeArray
      }
      return () => true
      break
    }
    case 'zaehlung': {
      if (kulturIdInActiveNodeArray) {
        return (c) => c.kultur_id === kulturIdInActiveNodeArray
      }
      return () => true
      break
    }
    case 'lieferung': {
      if (kulturIdInActiveNodeArray) {
        // this should get kulturen connected by von_kultur_id or nach_kultur_id
        // depending on activeNodeArray[last] being 'An-Lieferung' or 'Aus-Lieferung'
        let kulturOnField = 'von_kultur_id'
        if (kulturIdInActiveNodeArray) {
          const lastAnAElement = activeNodeArray[activeNodeArray.length - 1]
          if (lastAnAElement === 'An-Lieferungen')
            kulturOnField = 'nach_kultur_id'
        }
        return (c) => c[kulturOnField] === kulturIdInActiveNodeArray
      }
      if (sammelLieferungIdInActiveNodeArray) {
        return (c) =>
          c.sammel_lieferung_id === sammelLieferungIdInActiveNodeArray
      }
      if (personIdInActiveNodeArray) {
        return (c) => c.person_id === personIdInActiveNodeArray
      }
      if (sammlungIdInActiveNodeArray) {
        return (c) => c.von_sammlung_id === sammlungIdInActiveNodeArray
      }
      return () => true
      break
    }
    case 'event': {
      if (kulturIdInActiveNodeArray) {
        return (c) => c.kultur_id === kulturIdInActiveNodeArray
      }
      return () => true
      break
    }

    default:
      return () => true
      break
  }
}

export default hierarchyFilterForTable
