const gartenFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Gärten',
    id: 'gartenFolder',
    label: `Gärten (${count})`,
    url: ['Vermehrung', 'Gaerten'],
    sort: [1, 4],
    hasChildren: true,
    childrenCount: count,
  },
]

export default gartenFolder
