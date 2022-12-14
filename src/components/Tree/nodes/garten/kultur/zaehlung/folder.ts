const gartenKulturZaehlungFolder = ({
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
  children,
}) => ({
  nodeType: 'folder',
  menuTitle: 'Zählungen',
  id: `${gartenId}${kulturId}ZaehlungFolder`,
  label: `Zählungen (${children.length})`,
  url: ['Vermehrung', 'Gaerten', gartenId, 'Kulturen', kulturId, 'Zaehlungen'],
  sort: [1, 4, gartenIndex, 1, kulturIndex, 2],
  hasChildren: true,
  childrenCount: children.length,
})

export default gartenKulturZaehlungFolder
