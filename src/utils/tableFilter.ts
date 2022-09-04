// import { Q } from '@nozbe/watermelondb'
import camelCase from 'lodash/camelCase'

import types from '../store/Filter/simpleTypes'
import exists from './exists'

const tableFilter = ({ store, table }) => {
  if (!table) throw `no table passed`

  const storeFilter = store.filter[table]
  if (!storeFilter) throw `no filter found for table ${table}`

  const filterEntries = Object.entries(storeFilter).filter(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([key, value]) => exists(value),
  )

  //console.log('tableFilter', { filter, table, filterEntries })

  const filter = {}

  filterEntries.forEach(([key, value]) => {
    filter[key] = value
  })

  // if a url is opened, a dataset should always show
  // even if it was filtered away
  const tableIdInActiveNodeArray =
    store[`${camelCase(table)}IdInActiveNodeArray`]
  if (tableIdInActiveNodeArray) {
    return 'TODO: dexie'
    // return [
    //   Q.or(Q.where('id', tableIdInActiveNodeArray), Q.and(...filterArray)),
    // ]
  }

  return filter
}

export default tableFilter
