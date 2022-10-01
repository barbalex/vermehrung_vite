import derivedFields from './derivedFields'
import { dexie } from '../dexieClient'

const addDerivedFieldsInDexie = async ({ table, id }) => {
  if (!id) return
  const values = {}
  for (const key of Object.keys(derivedFields[table] ?? [])) {
    if (derivedFields[table]?.[key]?.()) {
      const row = await dexie[`${table}s`].get(id)
      if (!row) break
      // prefixed with __
      const value = await derivedFields[table]?.[key]?.(row)
      values.key = value
    }
  }
  if (Object.entries(values).length) {
    dexie[`${table}s`].update(id, values)
  }
}

export default addDerivedFieldsInDexie
