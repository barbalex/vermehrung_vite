import { dexie } from '../../dexieClient'
import addIndexableFields from '../addIndexableFields'

const stripTypename = (object) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __typename, ...rest } = object
  return rest
}

// TODO: do this in worker?
const processSubscriptionResult = async ({ data: dataIn, table, store }) => {
  // console.log('processTable, data:', data)
  const { setInitiallyQueried, setLastUpdated, setInitiallyQuerying } = store
  if (!dataIn.length) {
    setInitiallyQueried({ table })
    return
  }
  setInitiallyQuerying(table)

  // use a timeout to stagger the imports
  // reason: indexedDB creates indexes right after a table was imported
  // need to stagger imports to keep ui responsive between them
  setTimeout(async () => {
    console.log('processTable', { dexie, table, dexieTable: dexie[table] })
    const data = dataIn.map((d) => stripTypename(d))
    data?.forEach((object) => addIndexableFields({ table, object }))
    console.log('processTable:', { data, dataIn })

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
