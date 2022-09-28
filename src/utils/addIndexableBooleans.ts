import indexableBooleans from './indexableBooleans.json'
import booleanToInteger from './booleanToInteger'

const addIndexableBooleans = ({ table, object }) => { 
  Object.entries(object).forEach(([key, value]) => {
    if ((indexableBooleans[table] ?? []).includes(key)) {
      object[`${key}_indexable`] = booleanToInteger(value)
    }
  })
  return object
}

export default addIndexableBooleans
