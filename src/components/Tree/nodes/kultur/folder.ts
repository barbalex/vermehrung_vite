const kulturFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Kulturen',
    id: 'kulturFolder',
    label: `Kulturen (${count})`,
    url: ['Vermehrung', 'Kulturen'],
    sort: [1, 5],
    hasChildren: true,
    childrenCount: count,
  },
]

export default kulturFolder
