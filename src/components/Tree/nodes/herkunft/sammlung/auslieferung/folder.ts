const herkunftSammlungAuslieferungFolder = ({
  sammlungId,
  sammlungIndex,
  herkunftId,
  herkunftIndex,
  children,
}) => ({
  nodeType: 'folder',
  menuTitle: 'Aus-Lieferungen',
  id: `${herkunftId}${sammlungId}SammlungLieferungFolder`,
  label: `Aus-Lieferungen (${children.length})`,
  url: ['Vermehrung', 'Herkuenfte', herkunftId, 'Sammlungen', sammlungId, 'Aus-Lieferungen'],
  sort: [1, 2, herkunftIndex, 2, sammlungIndex, 1],
  hasChildren: true,
  childrenCount: children.length,
})

export default herkunftSammlungAuslieferungFolder
