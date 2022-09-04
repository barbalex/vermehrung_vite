const zaehlungFolder = ({ count }) => [
  {
    nodeType: 'folder',
    menuTitle: 'Zählungen',
    id: 'zaehlungFolder',
    label: `Zählungen (${count})`,
    url: ['Vermehrung', 'Zaehlungen'],
    sort: [1, 7],
    hasChildren: true,
    childrenCount: count,
  },
]

export default zaehlungFolder
