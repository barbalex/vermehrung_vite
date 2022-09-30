import tableFromTitleHash from '../../utils/tableFromTitleHash'
import { dexie } from '../../dexieClient'

const deleteModule = async ({ node, store }) => {
  const { activeNodeArray, setActiveNodeArray } = store.tree

  // console.log('deleteModule', { node })

  // get table and id from url
  const title = node.url.slice(-2)[0]
  const id = node.url.slice(-1)[0]
  if (!id) throw new Error(`Keine id gefunden`)
  const table = tableFromTitleHash[title]

  const me = await dexie[`${table}s`]?.get(id)
  if (!me?.delete) throw new Error(`Kein Modell für Tabelle ${table}s gefunden`)
  me.delete({ store })
  setActiveNodeArray(activeNodeArray.slice(0, -1))
}

export default deleteModule
