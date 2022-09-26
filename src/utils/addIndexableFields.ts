import indexableFields from './indexableFields'
import booleanToInteger from './booleanToInteger'

const addIndexableFields = ({ table, object }) => {
  Object.entries(object).forEach(([key, value]) => {
    if (indexableFields[table]?.includes(key)) {
      object[`${key}_indexable`] = booleanToInteger(value)
    }
  })
  return object
}

export default addIndexableFields
