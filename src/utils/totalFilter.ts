const totalFilter = ({ value, store, table }) => {
  if ('aktiv' in store.filter[table] ?? {}) {
    return (
      (value._deleted === store.filter[table]?._deleted ?? null) &&
      (value.aktiv === store.filter[table]?.aktiv ?? null)
    )
  }
  return value._deleted === store.filter[table]?._deleted ?? null
}

export default totalFilter
