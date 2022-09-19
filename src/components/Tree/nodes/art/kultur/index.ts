const artKulturNode = async ({ kultur, kulturIndex, artId, artIndex }) => {
  const label = await kultur.labelUnderArt()

  return {
    nodeType: 'table',
    menuTitle: 'Kultur',
    table: 'kultur',
    id: `${artId}${kultur.id}`,
    label,
    url: ['Vermehrung', 'Arten', artId, 'Kulturen', kultur.id],
    sort: [1, 1, artIndex, 3, kulturIndex],
    hasChildren: true,
  }
}

export default artKulturNode
