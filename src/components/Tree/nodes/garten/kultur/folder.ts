const gartenKulturFolder = ({ count, gartenIndex, gartenId }) => ({
  nodeType: 'folder',
  menuTitle: 'Kulturen',
  id: `${gartenId}KulturFolder`,
  label: `Kulturen (${count})`,
  url: ['Vermehrung', 'Gaerten', gartenId, 'Kulturen'],
  sort: [1, 4, gartenIndex, 1],
  hasChildren: true,
  childrenCount: count,
})

export default gartenKulturFolder
