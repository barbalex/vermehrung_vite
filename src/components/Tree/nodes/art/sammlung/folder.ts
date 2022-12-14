const artSammlungFolder = ({ count, artIndex, artId }) => ({
  nodeType: 'folder',
  menuTitle: 'Sammlungen',
  id: `${artId}SammlungFolder`,
  label: `Sammlungen (${count})`,
  url: ['Vermehrung', 'Arten', artId, 'Sammlungen'],
  sort: [1, 1, artIndex, 2],
  hasChildren: true,
  childrenCount: count,
})

export default artSammlungFolder
