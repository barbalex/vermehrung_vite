const personGartenFolder = ({ count, personIndex, personId }) => ({
  nodeType: 'folder',
  menuTitle: 'Gärten',
  id: `${personId}GartenFolder`,
  label: `Gärten (${count})`,
  url: ['Vermehrung', 'Personen', personId, 'Gaerten'],
  sort: [1, 11, personIndex, 2],
  hasChildren: true,
  childrenCount: count,
})

export default personGartenFolder
