const sammlungAuslieferungFolder = ({ count, sammlungIndex, sammlungId }) => ({
  nodeType: 'folder',
  menuTitle: 'Aus-Lieferungen',
  id: `${sammlungId}LieferungFolder`,
  label: `Aus-Lieferungen (${count})`,
  url: ['Vermehrung', 'Sammlungen', sammlungId, 'Aus-Lieferungen'],
  sort: [1, 3, sammlungIndex, 3],
  hasChildren: true,
  childrenCount: count,
})

export default sammlungAuslieferungFolder
