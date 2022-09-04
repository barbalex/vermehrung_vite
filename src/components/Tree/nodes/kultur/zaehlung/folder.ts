const kulturZaehlungFolder = ({ count, kulturIndex, kulturId }) => ({
  nodeType: 'folder',
  menuTitle: 'Zählungen',
  id: `${kulturId}ZaehlungFolder`,
  label: `Zählungen (${count})`,
  url: ['Vermehrung', 'Kulturen', kulturId, 'Zaehlungen'],
  sort: [1, 5, kulturIndex, 2],
  hasChildren: true,
  childrenCount: count,
})

export default kulturZaehlungFolder
