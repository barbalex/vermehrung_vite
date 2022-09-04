const eventFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Events',
    id: 'eventFolder',
    label: `Events (${count})`,
    url: ['Vermehrung', 'Events'],
    sort: [1, 10],
    hasChildren: true,
    childrenCount: count,
  },
]

export default eventFolder
