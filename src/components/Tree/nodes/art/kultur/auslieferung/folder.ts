const artKulturAuslieferungFolder = ({
  kulturId,
  kulturIndex,
  artId,
  artIndex,
  children,
}) => ({
  nodeType: 'folder',
  menuTitle: 'Aus-Lieferungen',
  id: `${artId}${kulturId}AusLieferungFolder`,
  label: `Aus-Lieferungen (${children.length})`,
  url: ['Vermehrung', 'Arten', artId, 'Kulturen', kulturId, 'Aus-Lieferungen'],
  sort: [1, 1, artIndex, 3, kulturIndex, 4],
  hasChildren: true,
  childrenCount: children.length,
})

export default artKulturAuslieferungFolder
