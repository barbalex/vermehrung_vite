const artKulturZaehlungNodes = async ({
  zaehlung,
  zaehlungIndex,
  kulturId,
  kulturIndex,
  artId,
  artIndex,
  store,
}) => {
  const label = await zaehlung.label({ store })

  return {
    nodeType: 'table',
    menuTitle: 'Zählung',
    table: 'zaehlung',
    id: `${artId}${kulturId}${zaehlung.id}`,
    label,
    url: [
      'Vermehrung',
      'Arten',
      artId,
      'Kulturen',
      kulturId,
      'Zaehlungen',
      zaehlung.id,
    ],
    sort: [1, 1, artIndex, 3, kulturIndex, 2, zaehlungIndex],
    hasChildren: false,
    mono: true,
  }
}

export default artKulturZaehlungNodes
