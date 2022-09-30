import camelCase from 'lodash/camelCase'

import types from '../store/Filter/simpleTypes'
import exists from './exists'
import addTotalCriteriaToWhere from './addTotalCriteriaToWhere'
import collectionFromTable from './collectionFromTable'

const filteredCollectionFromTable = ({ store, table, where = {}, filter }) => {
  if (!table) throw `no table passed`

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
      // console.log('filteredCollectionFromTable, objectValue:', objectValue)
      if (objectValue === undefined /*&& value !== undefined*/) {
        // console.log('filteredCollectionFromTable, false due to undefined')
        returnValue = false
        break
      }
      if (objectValue === null /*&& value !== null*/) {
        // console.log('filteredCollectionFromTable, false due to null')
        returnValue = false
        break
      }
      // console.log(
      //   'filteredCollectionFromTable, type === string',
      //   type === 'string',
      // )
      // console.log(
      //   'filteredCollectionFromTable, value?.toString()?.toLowerCase()',
      //   value?.toString()?.toLowerCase(),
      // )
      // console.log(
      //   'filteredCollectionFromTable, !objectValue.includes(value?.toString()?.toLowerCase())',
      //   !objectValue.includes(value?.toString()?.toLowerCase()),
      // )
      if (
        type === 'string' &&
        !!objectValue?.includes &&
        value?.toString?.()?.toLowerCase?.() &&
        !objectValue?.includes?.(value?.toString()?.toLowerCase())
      ) {
        // console.log(
        //   'filteredCollectionFromTable, false due to not including in lowercase',
        // )
        returnValue = false
        break
      } else if (type === 'string' && !objectValue?.includes?.(value)) {
        // console.log('filteredCollectionFromTable, false due to not including')
        returnValue = false
        break
      } else if (type !== 'string' && !(objectValue === value)) {
        // console.log('filteredCollectionFromTable, false due to not equal')
        // TODO: if is indexed field, add to where
        // watch out for booleans (use _indexable field and convert value)
        returnValue = false
        break
      }
    }

    return returnValue
  }

  const filteredCollection1 = collectionFromTable({
    table,
    where: addTotalCriteriaToWhere({ table, store, where }),
    filter,
  }).filter(filterFunction)

  // if a url is opened, a dataset should always show
  // even if it was filtered away
  // TODO: text
  const tableIdInActiveNodeArray =
    store[`${camelCase(table)}IdInActiveNodeArray`]
  const orIdInUrlAdder = (collection) =>
    tableIdInActiveNodeArray
      ? collection.or('id').equals(tableIdInActiveNodeArray)
      : collection
  const filteredCollection2 = orIdInUrlAdder(filteredCollection1)

  return filteredCollection2
}

export default filteredCollectionFromTable
