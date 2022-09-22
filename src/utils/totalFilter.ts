const totalFilter = ({ value, store, table, conditionAdder = () => true }) => { 
  if (store.filter?.[table] && 'aktiv' in store.filter[table]) {
    return (
      (value._deleted === store.filter[table]?._deleted ?? null) &&
      (value.aktiv === store.filter[table]?.aktiv ?? null) &&
      conditionAdder(value)
    )
  }
  return (
    (value._deleted === store.filter[table]?._deleted ?? null) &&
    conditionAdder(value)
  )
}

export default totalFilter
