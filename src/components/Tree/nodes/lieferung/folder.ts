const lieferungFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Lieferungen',
    id: 'lieferungFolder',
    label: `Lieferungen (${count})`,
    url: ['Vermehrung', 'Lieferungen'],
    sort: [1, 8],
    hasChildren: true,
    childrenCount: count,
  },
]

export default lieferungFolder
