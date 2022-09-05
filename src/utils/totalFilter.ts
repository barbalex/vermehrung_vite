// TODO: respect active?

const totalFilter = ({ value, store, table }) =>
  value._deleted === store.filter[table]?._deleted ?? null

export default totalFilter
