const personGartenKulturNodes = async ({
  kultur,
  kulturIndex,
  gartenId,
  gartenIndex,
  personId,
  personIndex,
}) => {
  const label = await kultur.label()

  return {
    nodeType: 'table',
    menuTitle: 'Kultur',
    table: 'kultur',
    id: `${personId}${gartenId}${kultur.id}`,
    label,
    url: [
      'Vermehrung',
      'Personen',
      personId,
      'Gaerten',
      gartenId,
      'Kulturen',
      kultur.id,
    ],
    sort: [1, 11, personIndex, 2, gartenIndex, 1, kulturIndex],
    hasChildren: true,
  }
}

export default personGartenKulturNodes
