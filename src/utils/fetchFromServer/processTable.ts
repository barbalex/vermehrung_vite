import { dexie } from '../../dexieClient'
import addDerivedFields from '../addDerivedFields'

// TODO: do this in worker?
const processSubscriptionResult = async ({ data, table, store }) => {
  const { setInitiallyQueried, setLastUpdated, setInitiallyQuerying } = store
  if (!data.length) {
    setInitiallyQueried({ table })
    return
  }
  // console.log('processTable, dataIn:', dataIn)
  setInitiallyQuerying(table)

  // use a timeout to stagger the imports
  // reason: indexedDB creates indexes right after a table was imported
  // need to stagger imports to keep ui responsive between them
  setTimeout(async () => {
    for (const object of data) {
      await addDerivedFields({
        table,
        object,
      })
    }

    try {
      await dexie[`${table}s`].bulkPut(data)
    } catch (error) {
      console.log('Error in processSubscriptionResult > db.action:', error)
    }
    console.log('processTable setting initially queried:', table)
    setInitiallyQueried({ table })
  })
  setLastUpdated({ table })
}

export default processSubscriptionResult
