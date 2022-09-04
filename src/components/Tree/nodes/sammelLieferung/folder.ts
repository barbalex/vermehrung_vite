const sammelLieferungFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Sammel-Lieferungen',
    id: 'sammelLieferungFolder',
    label: `Sammel-Lieferungen (${count})`,
    url: ['Vermehrung', 'Sammel-Lieferungen'],
    sort: [1, 9],
    hasChildren: true,
    childrenCount: count,
  },
]

export default sammelLieferungFolder
