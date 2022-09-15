const gartenNodes = async ({ garten, index }) => {
  const label = await garten.label()

  return {
    nodeType: 'table',
    menuTitle: 'Garten',
    table: 'garten',
    id: garten.id,
    label,
    url: ['Vermehrung', 'Gaerten', garten.id],
    sort: [1, 4, index],
    hasChildren: true,
  }
}

export default gartenNodes
