const personGartenNodes = async ({ garten, index, personId, personIndex }) => {
  const label = await garten.label()

  return {
    nodeType: 'table',
    menuTitle: 'Garten',
    table: 'garten',
    id: `${personId}${garten.id}`,
    label,
    url: ['Vermehrung', 'Personen', personId, 'Gaerten', garten.id],
    sort: [1, 11, personIndex, 2, index],
    hasChildren: true,
  }
}

export default personGartenNodes
