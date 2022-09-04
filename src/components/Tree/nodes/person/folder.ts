const personFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Personen',
    id: 'personFolder',
    label: `Personen (${count})`,
    url: ['Vermehrung', 'Personen'],
    sort: [1, 11],
    hasChildren: true,
    childrenCount: count,
  },
]

export default personFolder
