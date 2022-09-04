const gartenKulturEventFolder = ({
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
  count,
}) => ({
  nodeType: 'folder',
  menuTitle: 'Events',
  id: `${gartenId}${kulturId}EventFolder`,
  label: `Events (${count})`,
  url: ['Vermehrung', 'Gaerten', gartenId, 'Kulturen', kulturId, 'Events'],
  sort: [1, 4, gartenIndex, 1, kulturIndex, 5],
  hasChildren: true,
  childrenCount: count,
})

export default gartenKulturEventFolder
