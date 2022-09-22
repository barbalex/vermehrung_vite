import { dexie } from '../dexieClient'

const hierarchyConditionAdderForTable = async ({ store, table }) => {
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

        return (collection) =>
          collection.and('id').equals(activeSammlung.herkunft_id)
      }
      if (artIdInActiveNodeArray) {
        const sammlungsOfArt = await dexie.sammlungs
          .where({
            art_id:
              artIdInActiveNodeArray ?? '99999999-9999-9999-9999-999999999999',
          })
          .toArray()
        return (collection) => {
          const herkunftIds = sammlungsOfArt.map((e) => e.herkunft_id)

          return collection.filter((s) => herkunftIds.includes(s.id))
        }
      }
      return (c) => c
      break
    }
    case 'sammlung': {
      if (artIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((s) => s.art_id === artIdInActiveNodeArray)
      }
      if (herkunftIdInActiveNodeArray) {
        return (collection) =>
          collection.filter(
            (s) => s.herkunft_id === herkunftIdInActiveNodeArray,
          )
      }
      if (personIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((s) => s.person_id === personIdInActiveNodeArray)
      }
      return (c) => c
      break
    }
    case 'garten': {
      if (personIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((c) => c.person_id === personIdInActiveNodeArray)
      }
      return (c) => c
      break
    }
    case 'kultur': {
      if (gartenIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((c) => c.garten_id === gartenIdInActiveNodeArray)
      }
      if (artIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((c) => c.art_id === artIdInActiveNodeArray)
      }
      return (c) => c
      break
    }
    case 'teilkultur': {
      if (kulturIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((c) => c.kultur_id === kulturIdInActiveNodeArray)
      }
      return (c) => c
      break
    }
    case 'zaehlung': {
      if (kulturIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((c) => c.kultur_id === kulturIdInActiveNodeArray)
      }
      return (c) => c
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
        return (collection) =>
          collection.filter(
            (c) => c[kulturOnField] === kulturIdInActiveNodeArray,
          )
      }
      if (sammelLieferungIdInActiveNodeArray) {
        return (collection) =>
          collection.filter(
            (c) => c.sammel_lieferung_id === sammelLieferungIdInActiveNodeArray,
          )
      }
      if (personIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((c) => c.person_id === personIdInActiveNodeArray)
      }
      if (sammlungIdInActiveNodeArray) {
        return (collection) =>
          collection.filter(
            (c) => c.von_sammlung_id === sammlungIdInActiveNodeArray,
          )
      }
      return (c) => c
      break
    }
    case 'event': {
      if (kulturIdInActiveNodeArray) {
        return (collection) =>
          collection.filter((c) => c.kultur_id === kulturIdInActiveNodeArray)
      }
      return (c) => c
      break
    }

    default:
      return (c) => c
      break
  }
}

export default hierarchyConditionAdderForTable
