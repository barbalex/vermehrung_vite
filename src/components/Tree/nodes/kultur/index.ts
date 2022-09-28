const kulturNodes = async ({ kultur, index }) => {
  const label = await kultur.label()

  return {
    nodeType: 'table',
    menuTitle: 'Kultur',
    table: 'kultur',
    id: kultur?.id,
    label,
    url: ['Vermehrung', 'Kulturen', kultur?.id],
    sort: [1, 5, index],
    hasChildren: true,
  }
}

export default kulturNodes
