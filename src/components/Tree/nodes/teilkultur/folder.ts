const teilkulturFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Teilkulturen',
    id: 'teilkulturFolder',
    label: `Teilkulturen (${count})`,
    url: ['Vermehrung', 'Teilkulturen'],
    sort: [1, 6],
    hasChildren: true,
    childrenCount: count,
  },
]

export default teilkulturFolder
