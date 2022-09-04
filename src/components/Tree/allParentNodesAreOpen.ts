import isNodeOpen from './isNodeOpen'

const allParentNodesAreOpen = ({ store, url: urlPassed }) => {
  let parentUrls = []
  const node = [...urlPassed]
  for (let i = 1; i < node.length; i++) {
    parentUrls.push(node.slice(0, i))
  }
  // remove 'Projekte' as that is not contained in openNodes
  parentUrls = parentUrls.filter(
    (n) => !(n.length === 2 && n[1] === 'Projekte'),
  )
  if (parentUrls.length === 1) return true
  return parentUrls.every((url) => isNodeOpen({ store, url }))
}

export default allParentNodesAreOpen
