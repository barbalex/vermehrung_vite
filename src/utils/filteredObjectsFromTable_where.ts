import camelCase from 'lodash/camelCase'

// import types from '../store/Filter/simpleTypes'
import exists from './exists'
import { dexie } from '../dexieClient'

const filteredObjectsFromTable = async ({ store, table, count }) => {
  if (!table) throw `no table passed`

  const storeFilter = store.filter[table]
  if (!storeFilter) throw `no filter found for table ${table}`

  const whereObject = {}

  Object.entries(storeFilter).forEach(([key, value]) => {
    if (exists(value)) whereObject[key] = value
  })

  // if a url is opened, a dataset should always show
  // even if it was filtered away
  const tableIdInActiveNodeArray =
    store[`${camelCase(table)}IdInActiveNodeArray`]
  if (tableIdInActiveNodeArray) {
    return count
      ? await dexie[`${table}s`]
          .where(whereObject)
          .or('id')
          .equals(tableIdInActiveNodeArray)
          .count()
      : await dexie[`${table}s`]
          .where(whereObject)
          .or('id')
          .equals(tableIdInActiveNodeArray)
  }

  return count
    ? await dexie[`${table}s`].where(whereObject).count()
    : await dexie[`${table}s`].where(whereObject)
}

export default filteredObjectsFromTable
