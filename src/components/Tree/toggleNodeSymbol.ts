import isNodeOpen from './isNodeOpen'
import isNodeInActiveNodePath from './isNodeInActiveNodePath'

const toggleNodeSymbol = ({ node, store }) => {
  if (!node.url) {
    console.log('passsed node has no url:', node)
    return addNotification({
      message: 'Fehler: Dem Knoten im Navigationsbaum fehlt die url',
    })
  }
  const { addNotification } = store
  const {
    addOpenNode,
    setActiveNodeArray,
    activeNodeArray,
    removeOpenNodeWithChildren,
    setLastActiveNodeArray,
    setLoadingNode,
  } = store.tree

  store.filter.setShow(false)
  // TODO: tell user if childrenCount is 0 he can create
  if (isNodeOpen({ store, url: node.url })) {
    // removeOpenNodeWithChildren(node.url)
    if (isNodeInActiveNodePath({ node, activeNodeArray })) {
      // when a user closes a folder in the active node path
      // the active node should swith to the node's parent
      const newActiveNodeArray = [...node.url]
      newActiveNodeArray.pop()
      setActiveNodeArray(newActiveNodeArray)
    } else {
      // need to explicitly remove open node as activeNodeArray is not changed
      removeOpenNodeWithChildren(node.url)
    }
  } else {
    setLoadingNode(node.id)
    // need to explicitly add open node as activeNodeArray is not changed
    addOpenNode(node.url)
  }
  setLastActiveNodeArray(node.url)
}

export default toggleNodeSymbol
