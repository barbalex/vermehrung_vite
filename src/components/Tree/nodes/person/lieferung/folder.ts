const personLieferungFolder = ({ count, personIndex, personId }) => ({
  nodeType: 'folder',
  menuTitle: 'Lieferungen',
  id: `${personId}LieferungFolder`,
  label: `Lieferungen (${count})`,
  url: ['Vermehrung', 'Personen', personId, 'Lieferungen'],
  sort: [1, 11, personIndex, 3],
  hasChildren: true,
  childrenCount: count,
})

export default personLieferungFolder
