const herkunftFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Herkünfte',
    id: 'herkunftFolder',
    label: `Herkünfte (${count})`,
    url: ['Vermehrung', 'Herkuenfte'],
    sort: [1, 2],
    hasChildren: true,
    childrenCount: count,
  },
]

export default herkunftFolder
