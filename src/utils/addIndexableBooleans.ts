import indexableBooleans from './indexableBooleans.json'
import booleanToInteger from './booleanToInteger'

const addIndexableBooleans = ({ table, object }) => {
  Object.entries(object).forEach(([key, value]) => {
    if ((indexableBooleans[table] ?? []).includes(key)) {
      // _deleted becomes __deleted_indexable, aktiv becomes __aktiv_indexable
      object[`_${key.startsWith('_') ? key : `_${key}`}_indexable`] =
        booleanToInteger(value)
    }
  })
  return object 
}

export default addIndexableBooleans
