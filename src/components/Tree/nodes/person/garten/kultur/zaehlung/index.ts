const personGartenKulturZaehlungNodes = async ({
  zaehlung,
  zaehlungIndex,
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
  personId,
  personIndex,
  store,
}) => {
  const label = await zaehlung.label({ store })

  return {
    nodeType: 'table',
    menuTitle: 'Zählung',
    table: 'zaehlung',
    id: `${personId}${gartenId}${kulturId}${zaehlung.id}`,
    label,
    url: [
      'Vermehrung',
      'Personen',
      personId,
      'Gaerten',
      gartenId,
      'Kulturen',
      kulturId,
      'Zaehlungen',
      zaehlung.id,
    ],
    sort: [
      1,
      11,
      personIndex,
      2,
      gartenIndex,
      1,
      kulturIndex,
      2,
      zaehlungIndex,
    ],
    hasChildren: false,
    mono: true,
  }
}

export default personGartenKulturZaehlungNodes
