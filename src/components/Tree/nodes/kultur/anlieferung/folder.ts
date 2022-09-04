const kulturAnlieferungFolder = ({ count, kulturIndex, kulturId }) => ({
  nodeType: 'folder',
  menuTitle: 'An-Lieferungen',
  id: `${kulturId}AnLieferungFolder`,
  label: `An-Lieferungen (${count})`,
  url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen'],
  sort: [1, 5, kulturIndex, 3],
  hasChildren: true,
  childrenCount: count,
})

export default kulturAnlieferungFolder
