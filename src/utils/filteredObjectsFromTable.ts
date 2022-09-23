import camelCase from 'lodash/camelCase'

import types from '../store/Filter/simpleTypes'
import exists from './exists'
import { dexie } from '../dexieClient'
import hierarchyConditionAdderForTable from './hierarchyConditionAdderForTable'

const filteredObjectsFromTable = async ({
  store,
  table,
  count,
  filterByHierarchy = true,
}) => {
  if (!table) throw `no table passed`

  const conditionAdder = filterByHierarchy
    ? await hierarchyConditionAdderForTable({ store, table })
    : (c) => c

  const storeFilter = store.filter[table]
  if (!storeFilter) throw `no filter found for table ${table}`

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
      if (object[key] === undefined) {
        returnValue = false
      } else if (object[key] === null) {
        returnValue = false
      } else if (
        type === 'string' &&
        objectValue?.includes &&
        value?.toString()?.toLowerCase()
      ) {
        if (!objectValue.includes(value?.toString()?.toLowerCase())) {
          returnValue = false
        }
      } else if (type === 'string' && objectValue?.includes) {
        if (!objectValue.includes(value)) {
          returnValue = false
        }
      } else if (!objectValue === value) {
        returnValue = false
      }
    })

    return returnValue
  }

  const filteredCollection1 = dexie[`${table}s`].filter(filterFunction)
  const filteredCollection2 = filterByHierarchy
    ? conditionAdder(filteredCollection1)
    : filteredCollection1

  // if a url is opened, a dataset should always show
  // even if it was filtered away
  const tableIdInActiveNodeArray =
    store[`${camelCase(table)}IdInActiveNodeArray`]
  const orIdInUrlAdder = (collection) =>
    tableIdInActiveNodeArray
      ? collection.or('id').equals(tableIdInActiveNodeArray)
      : collection
  const filteredCollection3 = orIdInUrlAdder(filteredCollection2)

  return count
    ? await filteredCollection3.count()
    : await filteredCollection3.toArray()
}

export default filteredObjectsFromTable
