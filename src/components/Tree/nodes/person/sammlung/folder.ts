const personSammlungFolder = ({ count, personIndex, personId }) => ({
  nodeType: 'folder',
  menuTitle: 'Sammlungen',
  id: `${personId}SammlungFolder`,
  label: `Sammlungen (${count})`,
  url: ['Vermehrung', 'Personen', personId, 'Sammlungen'],
  sort: [1, 11, personIndex, 1],
  hasChildren: true,
  childrenCount: count,
})

export default personSammlungFolder
