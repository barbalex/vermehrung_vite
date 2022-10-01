import derivedFields from './derivedFields'

const addDerivedFields = async ({ table, object }) => {
  for (const key of Object.keys(derivedFields[table] ?? [])) {
    if (derivedFields[table]?.[key]?.derive?.()) {
      object[key] = await derivedFields[table]?.[key]?.derive?.(object)
    }
  }
}

export default addDerivedFields
