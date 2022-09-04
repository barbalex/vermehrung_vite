const herkunftSammlungFolder = ({ count, herkunftIndex, herkunftId }) => ({
  nodeType: 'folder',
  menuTitle: 'Sammlungen',
  id: `${herkunftId}SammlungFolder`,
  label: `Sammlungen (${count})`,
  url: ['Vermehrung', 'Herkuenfte', herkunftId, 'Sammlungen'],
  sort: [1, 2, herkunftIndex, 2],
  hasChildren: true,
  childrenCount: count,
})

export default herkunftSammlungFolder
