const kulturZaehlungNodes = async ({
  zaehlung,
  zaehlungIndex,
  kulturId,
  kulturIndex,
}) => {
  const label = await zaehlung.label()

  return {
    nodeType: 'table',
    menuTitle: 'Zählung',
    table: 'zaehlung',
    id: `${kulturId}${zaehlung.id}`,
    label,
    url: ['Vermehrung', 'Kulturen', kulturId, 'Zaehlungen', zaehlung.id],
    sort: [1, 5, kulturIndex, 2, zaehlungIndex],
    hasChildren: false,
    mono: true,
  }
}

export default kulturZaehlungNodes
