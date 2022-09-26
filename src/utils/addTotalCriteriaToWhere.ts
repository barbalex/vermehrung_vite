// receives where = object with maybe existing criteria
// adds _deleted value according to set filter
// also adds aktiv value according to set filter if applicable
import booleanToInteger from './booleanToInteger'

const addTotalCriteriaToWhere = ({ table, where = {}, store }) => {
  if (store.filter?.[table] && 'aktiv' in store.filter[table]) {
    where.aktiv_indexable = booleanToInteger(store.filter?.[table]?.aktiv)
  }
  where._deleted_indexable = booleanToInteger(store.filter?.[table]?._deleted)

  return where
}

export default addTotalCriteriaToWhere
