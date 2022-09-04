import camelCase from 'lodash/camelCase'

import types from '../store/Filter/simpleTypes'
import exists from './exists'
import { dexie } from '../dexieClient'

const filteredObjectsFromTable = async ({ store, table, count }) => {
  if (!table) throw `no table passed`

  const storeFilter = store.filter[table]
  if (!storeFilter) throw `no filter found for table ${table}`

  // console.log('filteredObjectsFromTable running for table:', table)

  const whereObject = {}

  Object.entries(storeFilter).forEach(([key, value]) => {
    if (exists(value)) whereObject[key] = value
  })

  const filterFunction = (object) => {
    let returnValue = true
    Object.entries(whereObject).forEach(([key, value]) => {
      // include if string, exact if else
      const type = types[table][key] ?? 'string'
      const objectValue = object[key]
      if (type === 'string' && value?.toString()?.toLowerCase()) {
        if (!objectValue.includes(value?.toString()?.toLowerCase())) {
          returnValue = false
        }
      } else if (type === 'string') {
        if (!objectValue.includes(value)) {
          returnValue = false
        }
      } else if (!objectValue === value) {
        returnValue = false
      }
    })

    return returnValue
  }

  // if a url is opened, a dataset should always show
  // even if it was filtered away
  const tableIdInActiveNodeArray =
    store[`${camelCase(table)}IdInActiveNodeArray`]
  if (tableIdInActiveNodeArray) {
    return count
      ? await dexie[`${table}s`]
          .filter(filterFunction)
          .or('id')
          .equals(tableIdInActiveNodeArray)
          .count()
      : await dexie[`${table}s`]
          .filter(filterFunction)
          .or('id')
          .equals(tableIdInActiveNodeArray)
          .toArray()
  }

  return count
    ? await dexie[`${table}s`].filter(filterFunction).count()
    : await dexie[`${table}s`].filter(filterFunction).toArray()
}

export default filteredObjectsFromTable
