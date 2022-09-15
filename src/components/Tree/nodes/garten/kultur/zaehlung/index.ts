const gartenKulturZaehlungNodes = async ({
  zaehlung,
  zaehlungIndex,
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
}) => {
  const label = await zaehlung.label()

  return {
    nodeType: 'table',
    menuTitle: 'Zählung',
    table: 'zaehlung',
    id: `${gartenId}${kulturId}${zaehlung.id}`,
    label,
    url: [
      'Vermehrung',
      'Gaerten',
      gartenId,
      'Kulturen',
      kulturId,
      'Zaehlungen',
      zaehlung.id,
    ],
    sort: [1, 4, gartenIndex, 1, kulturIndex, 2, zaehlungIndex],
    hasChildren: false,
    mono: true,
  }
}

export default gartenKulturZaehlungNodes
