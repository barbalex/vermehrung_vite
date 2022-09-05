import camelCase from 'lodash/camelCase'

import types from '../store/Filter/simpleTypes'
import exists from './exists'
import { dexie } from '../dexieClient'

const filteredObjectsFromTable = async ({
  store,
  table,
  count,
  conditionAdder,
}) => {
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

  const filteredColection1 = dexie[`${table}s`].filter(filterFunction)

  // if a url is opened, a dataset should always show
  // even if it was filtered away
  const tableIdInActiveNodeArray =
    store[`${camelCase(table)}IdInActiveNodeArray`]
  const orIdInUrlAdder = (collection) =>
    tableIdInActiveNodeArray
      ? collection.or('id').equals(tableIdInActiveNodeArray)
      : collection
  const filteredCollection2 = orIdInUrlAdder(filteredColection1)

  const filteredCollection3 = conditionAdder
    ? await conditionAdder(filteredCollection2)
    : filteredCollection2

  return count
    ? await filteredCollection3.count()
    : await filteredCollection3.toArray()
}

export default filteredObjectsFromTable
