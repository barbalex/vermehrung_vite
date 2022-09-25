import { dexie } from '../../dexieClient'

// const stripTypename = (object) => {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const { __typename, ...rest } = object
//   return rest
// }

// TODO: do this in worker?
const processSubscriptionResult = async ({
  data: dataToCheck,
  table,
  store,
}) => {
  const { setInitiallyQueried, setLastUpdated, setInitiallyQuerying } = store
  if (!dataToCheck.length) {
    setInitiallyQueried({ table })
    return
  }
  setInitiallyQuerying(table)

  // use a timeout to stagger the imports
  // reason: indexedDB creates indexes right after a table was imported
  // need to stagger imports to keep ui responsive between them
  setTimeout(async () => {
    // TODO: strip out typeName
    console.log('processTable', { dexie, table, dexieTable: dexie[table] })
    try {
      await dexie[`${table}s`].bulkPut(dataToCheck)
    } catch (error) {
      console.log('Error in processSubscriptionResult > db.action:', error)
    }
    console.log('processTable setting initially queried:', table)
    setInitiallyQueried({ table })
  })
  setLastUpdated({ table })
}

export default processSubscriptionResult
