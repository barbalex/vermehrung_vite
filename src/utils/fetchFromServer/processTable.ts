import { dexie } from '../../dexieClient'
import addIndexableBooleans from '../addIndexableBooleans'
import addDerivedFields from '../addDerivedFields'

const stripTypename = (object) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __typename, ...rest } = object
  delete object.__typename
  return rest
}

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
    // console.log('processTable', {
    //   table,
    // })
    for (const object of data) {
      delete object.__typename
      addIndexableBooleans({ table, object })
      await addDerivedFields({
        table,
        object,
      })
      table === 'sammlung' &&
        console.log(
          'processTable, object after stripping typename, adding indexable booleans and derived fields:',
          object,
        )
    }

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
