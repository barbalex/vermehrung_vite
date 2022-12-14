const kulturAuslieferungFolder = ({ count, kulturIndex, kulturId }) => ({
  nodeType: 'folder',
  menuTitle: 'Aus-Lieferungen',
  id: `${kulturId}AusLieferungFolder`,
  label: `Aus-Lieferungen (${count})`,
  url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen'],
  sort: [1, 5, kulturIndex, 4],
  hasChildren: true,
  childrenCount: count,
})

export default kulturAuslieferungFolder
