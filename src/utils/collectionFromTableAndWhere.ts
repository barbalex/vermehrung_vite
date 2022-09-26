import { dexie } from '../dexieClient'

// Problem:
// is possible to not have a where clause (depending on filter settings)
// thus need to be able to not call .where()
// that is what this function is for

const collectionFromTableAndWhere = ({ table, where }) => {
  if (where && Object.keys(where) && Object.keys(where).length) {
    return dexie[`${table}s`].where(where)
  }
  return dexie[`${table}s`].toCollection()
}

export default collectionFromTableAndWhere
