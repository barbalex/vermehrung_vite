const artNodes = async ({ art, index }) => {
  const label = await art.label()

  return {
    nodeType: 'table',
    menuTitle: 'Art',
    table: 'art',
    id: art.id,
    label,
    url: ['Vermehrung', 'Arten', art.id],
    sort: [1, 1, index],
    hasChildren: true,
  }
}

export default artNodes
