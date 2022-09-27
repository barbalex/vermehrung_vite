import camelCase from 'lodash/camelCase'

import types from '../store/Filter/simpleTypes'
import exists from './exists'
import hierarchyConditionAdderForTable from './hierarchyConditionAdderForTable'
import addTotalCriteriaToWhere from './addTotalCriteriaToWhere'
import collectionFromTable from './collectionFromTable'

const filteredObjectsFromTable = async ({
  store,
  table,
  count = false,
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

  // console.log('filteredObjectsFromTable', { table, whereObject })

  const filterFunction = (object) => {
    let returnValue = true
    for (const entry of Object.entries(whereObject)) {
      const [key, value] = entry
      const type = types[table][key] ?? 'string'
      const objectValue = object[key]
      // console.log('filteredObjectsFromTable, objectValue:', objectValue)
      if (objectValue === undefined /*&& value !== undefined*/) {
        console.log('filteredObjectsFromTable, false due to undefined')
        returnValue = false
        break
      }
      if (objectValue === null /*&& value !== null*/) {
        // console.log('filteredObjectsFromTable, false due to null')
        returnValue = false
        break
      }
      // console.log(
      //   'filteredObjectsFromTable, type === string',
      //   type === 'string',
      // )
      // console.log(
      //   'filteredObjectsFromTable, value?.toString()?.toLowerCase()',
      //   value?.toString()?.toLowerCase(),
      // )
      // console.log(
      //   'filteredObjectsFromTable, !objectValue.includes(value?.toString()?.toLowerCase())',
      //   !objectValue.includes(value?.toString()?.toLowerCase()),
      // )
      if (
        type === 'string' &&
        !!objectValue?.includes &&
        value?.toString()?.toLowerCase() &&
        !objectValue?.includes?.(value?.toString()?.toLowerCase())
      ) {
        // console.log(
        //   'filteredObjectsFromTable, false due to not including in lowercase',
        // )
        returnValue = false
        break
      } else if (type === 'string' && !objectValue?.includes?.(value)) {
        // console.log('filteredObjectsFromTable, false due to not including')
        returnValue = false
        break
      } else if (type !== 'string' && !(objectValue === value)) {
        console.log('filteredObjectsFromTable, false due to not equal')
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
