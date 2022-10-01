import derivedFields from './derivedFields'
import { dexie } from '../dexieClient'

const addOwnForField = async ({ table, field, values, row }) => {
  if (derivedFields[table]?.[field]?.derive?.()) {
    values[field] = await derivedFields[table]?.[field]?.derive?.(row)
  }
}

const addToDerivedTables = async ({ table, field, row }) => {
  // 2. update other table's datasets if they depend on this one
  const dependentTables = derivedFields[table]?.[field]?.dependentTables
  if (!dependentTables) return
  for (const entry of Object.entries(dependentTables(row))) {
    const [dependentTable, id] = entry
    if (!dependentTable) break
    if (!id) break
    addDerivedFieldsInDexie({ table: dependentTable, id })
  }
}

const addDerivedFieldsInDexie = async ({ table, id }) => {
  if (!id) return
  const row = await dexie[`${table}s`].get(id)
  if (!row) return
  // 1. update derived fields of this row
  const ownValues = {}
  for (const field of Object.keys(derivedFields[table] ?? [])) {
    await addOwnForField({ table, field, values: ownValues, row })
    // 2. update other table's datasets if they depend on this one
    addToDerivedTables({ table, field, row })
  }
  if (Object.entries(ownValues).length) {
    dexie[`${table}s`].update(id, ownValues)
  }
}

export default addDerivedFieldsInDexie
