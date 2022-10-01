import derivedFields from './derivedFields'
import { dexie } from '../dexieClient'
import Settings from '../components/Tree/Settings'

const addOwnForField = async ({ table, field, values, row }) => {
  if (derivedFields[table]?.[field]?.derive?.()) {
    values[field] = await derivedFields[table]?.[field]?.derive?.(row)
  }
}

const addToDerivedTables = async ({ table, row }) => {
  // 2. update other table's datasets if they depend on this one
  const otherTablesDependingOnThisRow = []
  // loop through all dependentTables
  // extract those dependent on passed in table
  // 2.1 loop all tables
  for (const entry of Object.values(derivedFields)) {
    const [tbl, fields] = entry
    // 2.2 loop all fields
    for (const field of Object.keys(fields ?? {})) {
      const dependentTables = field.dependentTables ?? []
      // 3. check dependentTables
      if (dependentTables.includes(table)) {
        // Field field of Table tbl depends on table
        otherTablesDependingOnThisRow.push(tbl)
      }
    }
  }
  // uniquify otherTables
  const otherTablesDependingOnThisRowUnique = [
    ...new Settings(otherTablesDependingOnThisRow),
  ]
  for (const otherTable of otherTablesDependingOnThisRowUnique) {
    const rowsInOtherTableReferencingThisRow = await dexie[`${otherTable}s`]
      .where({ [`${otherTable}_id`]: row.id })
      .toArray()
    rowsInOtherTableReferencingThisRow.forEach((row) =>
      addDerivedFieldsInDexie({ table: otherTable, id: row.id }),
    )
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
    addToDerivedTables({ table, row })
  }
  if (Object.entries(ownValues).length) {
    dexie[`${table}s`].update(id, ownValues)
  }
}

export default addDerivedFieldsInDexie
