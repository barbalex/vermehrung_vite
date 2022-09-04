const gartenKulturTeilkulturFolder = ({
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
  children,
}) => ({
  nodeType: 'folder',
  menuTitle: 'Teilkulturen',
  id: `${gartenId}${kulturId}TeilkulturFolder`,
  label: `Teilkulturen (${children.length})`,
  url: ['Vermehrung', 'Gaerten', gartenId, 'Kulturen', kulturId, 'Teilkulturen'],
  sort: [1, 4, gartenIndex, 1, kulturIndex, 1],
  hasChildren: true,
  childrenCount: children.length,
})

export default gartenKulturTeilkulturFolder
