const sammlungHerkunftFolder = ({ count, sammlungIndex, sammlungId }) => ({
  nodeType: 'folder',
  menuTitle: 'Herkünfte',
  id: `${sammlungId}HerkunftFolder`,
  label: `Herkünfte (${count})`,
  url: ['Vermehrung', 'Sammlungen', sammlungId, 'Herkuenfte'],
  sort: [1, 3, sammlungIndex, 1],
  hasChildren: true,
  hasMenu: false,
  menuExplainerText:
    'Herkünfte können nur in ihrem eigenen Ast des Navigationsbaums neu geschaffen und gelöscht werden',
})

export default sammlungHerkunftFolder
