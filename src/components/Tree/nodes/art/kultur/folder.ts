const artKulturFolder = ({ count, artIndex, artId }) => ({
  nodeType: 'folder',
  menuTitle: 'Kulturen',
  id: `${artId}KulturFolder`,
  label: `Kulturen (${count})`,
  url: ['Vermehrung', 'Arten', artId, 'Kulturen'],
  sort: [1, 1, artIndex, 3],
  hasChildren: true,
  childrenCount: count,
})

export default artKulturFolder
