import { dexie } from '../../dexieClient'
import addIndexableBooleans from '../addIndexableBooleans'

const stripTypename = (object) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __typename, ...rest } = object
  return rest
}

// TODO: do this in worker?
const processSubscriptionResult = async ({ data: dataIn, table, store }) => {
  const { setInitiallyQueried, setLastUpdated, setInitiallyQuerying } = store
  if (!dataIn.length) {
    setInitiallyQueried({ table })
    return
  }
  console.log('processTable, dataIn:', dataIn)
  setInitiallyQuerying(table)

  // use a timeout to stagger the imports
  // reason: indexedDB creates indexes right after a table was imported
  // need to stagger imports to keep ui responsive between them
  setTimeout(async () => {
    // console.log('processTable', {
    //   table,
    // })
    const data = dataIn.map((d) => stripTypename(d))
    data?.forEach((object) => addIndexableBooleans({ table, object }))

    // console.log('processTable', { data, table })

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
