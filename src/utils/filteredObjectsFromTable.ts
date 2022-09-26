import camelCase from 'lodash/camelCase'

import types from '../store/Filter/simpleTypes'
import exists from './exists'
import hierarchyConditionAdderForTable from './hierarchyConditionAdderForTable'
import addTotalCriteriaToWhere from './addTotalCriteriaToWhere'
import collectionFromTable from './collectionFromTable'

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

  // reduce filter to actually set criteria
  const whereObject = {}
  for (const el of Object.entries(storeFilter)) {
    const [key, value] = el
    if (key === 'aktiv') break
    if (key === '_deleted') break
    if (exists(value)) whereObject[key] = value
  }

  const filterFunction = (object) => {
    let returnValue = true
    for (const entry of Object.entries(whereObject)) {
      const [key, value] = entry
      const type = types[table][key] ?? 'string'
      const objectValue = object[key]
      if (object[key] === undefined) {
        returnValue = false
        break
      }
      if (object[key] === null) {
        returnValue = false
        break
      }
      if (
        type === 'string' &&
        objectValue?.includes &&
        value?.toString()?.toLowerCase() &&
        !objectValue.includes(value?.toString()?.toLowerCase())
      ) {
        returnValue = false
        break
      }
      if (
        type === 'string' &&
        objectValue?.includes &&
        !objectValue.includes(value)
      ) {
        returnValue = false
        break
      }
      if (!(objectValue === value)) {
        returnValue = false
        break
      }
    }

    return returnValue
  }

  const filteredCollection1 = collectionFromTable({
    table,
    where: addTotalCriteriaToWhere({ table, store }),
  }).filter(filterFunction)
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
