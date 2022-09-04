const kulturEventFolder = ({ count, kulturIndex, kulturId }) => ({
  nodeType: 'folder',
  menuTitle: 'Events',
  id: `${kulturId}EventFolder`,
  label: `Events (${count})`,
  url: ['Vermehrung', 'Kulturen', kulturId, 'Events'],
  sort: [1, 5, kulturIndex, 5],
  hasChildren: true,
  childrenCount: count,
})

export default kulturEventFolder
