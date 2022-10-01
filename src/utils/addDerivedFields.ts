import derivedFields from './derivedFields'

const addDerivedFields = async ({ table, object }) => {
  // console.log('addDerivedFields', {
  //   table,
  //   row,
  //   object,
  //   derivedFields,
  // })
  for (const key of Object.keys(derivedFields[table] ?? [])) {
    // console.log('addDerivedFields', {
    //   key,
    //   deriveFunction: derivedFields[table]?.[key]?.(),
    // })
    if (derivedFields[table]?.[key]?.()) {
      object[key] = await derivedFields[table]?.[key]?.(object)
    }
  }
}

export default addDerivedFields
