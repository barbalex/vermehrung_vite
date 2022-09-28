import { dexie } from '../dexieClient'

// Problem:
// is possible to not have a where clause (depending on filter settings)
// thus need to be able to not call .where()
// that is what this function is for

const collectionFromTable = ({ table, where, filter }) => {
  let collection
  if (where && Object.keys(where) && Object.keys(where).length) {
    collection = dexie[`${table}s`].where(where)
  } else {
    collection = dexie[`${table}s`].toCollection()
  }
  return filter ? collection.filter(filter) : collection
}

export default collectionFromTable
