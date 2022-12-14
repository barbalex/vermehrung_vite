const personGartenKulturFolder = ({
  gartenId,
  gartenIndex,
  personId,
  personIndex,
  count,
}) => ({
  nodeType: 'folder',
  menuTitle: 'Kulturen',
  id: `${personId}${gartenId}KulturFolder`,
  label: `Kulturen (${count})`,
  url: ['Vermehrung', 'Personen', personId, 'Gaerten', gartenId, 'Kulturen'],
  sort: [1, 11, personIndex, 2, gartenIndex, 1],
  hasChildren: true,
  childrenCount: count,
})

export default personGartenKulturFolder
