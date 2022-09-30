// receives where = object with maybe existing criteria
// adds _deleted value according to set filter
// also adds aktiv value according to set filter if applicable

const addTotalCriteriaToWhere = ({ table, where = {}, store }) => {
  // default: true, 1
  if (store.filter[table]?.aktiv === true) {
    where.__aktiv_indexable = 1
  }
  if (store.filter[table]?.aktiv === false) {
    where.__aktiv_indexable = 0
  }
  // default false, 0
  if (store.filter[table]?._deleted === false) {
    where.__deleted_indexable = 0
  }
  if (store.filter[table]?._deleted === true) {
    where.__deleted_indexable = 1
  }
  // some tables have no filter setting (av, gv...)
  if (!(table in store.filter)) {
    where.__deleted_indexable = 0
  }
  // Problem:
  // is possible to not have a where clause (depending on filter settings)
  // thus collectionFromTableAndWhere is needed
  return where
}

export default addTotalCriteriaToWhere
