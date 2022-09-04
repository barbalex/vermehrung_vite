const sammlungFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Sammlungen',
    id: 'sammlungFolder',
    label: `Sammlungen (${count})`,
    url: ['Vermehrung', 'Sammlungen'],
    sort: [1, 3],
    hasChildren: true,
    childrenCount: count,
  },
]

export default sammlungFolder
