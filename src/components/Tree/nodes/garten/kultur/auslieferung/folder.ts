const gartenKulturAuslieferungFolder = ({
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
  children,
}) => ({
  nodeType: 'folder',
  menuTitle: 'Aus-Lieferungen',
  id: `${gartenId}${kulturId}AusLieferungFolder`,
  label: `Aus-Lieferungen (${children.length})`,
  url: ['Vermehrung', 'Gaerten', gartenId, 'Kulturen', kulturId, 'Aus-Lieferungen'],
  sort: [1, 4, gartenIndex, 1, kulturIndex, 4],
  hasChildren: true,
  childrenCount: children.length,
})

export default gartenKulturAuslieferungFolder
