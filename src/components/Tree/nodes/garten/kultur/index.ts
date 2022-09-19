const gartenKulturNodes = async ({
  kultur,
  kulturIndex,
  gartenId,
  gartenIndex,
}) => {
  const label = await kultur.labelUnderGarten?.()

  return {
    nodeType: 'table',
    menuTitle: 'Kultur',
    table: 'kultur',
    id: `${gartenId}${kultur.id}`,
    label,
    url: ['Vermehrung', 'Gaerten', gartenId, 'Kulturen', kultur.id],
    sort: [1, 4, gartenIndex, 1, kulturIndex],
    hasChildren: true,
  }
}

export default gartenKulturNodes
