const kulturTeilkulturFolder = ({ count, kulturIndex, kulturId }) => ({
  nodeType: 'folder',
  menuTitle: 'Teilkulturen',
  id: `${kulturId}TeilkulturFolder`,
  label: `Teilkulturen (${count})`,
  url: ['Vermehrung', 'Kulturen', kulturId, 'Teilkulturen'],
  sort: [1, 5, kulturIndex, 1],
  hasChildren: true,
  childrenCount: count,
})

export default kulturTeilkulturFolder
