const sammlungNodes = async ({ sammlung, index }) => {
  const label = await sammlung.label()

  return {
    nodeType: 'table',
    menuTitle: 'Sammlung',
    table: 'sammlung',
    id: sammlung.id,
    label,
    url: ['Vermehrung', 'Sammlungen', sammlung.id],
    sort: [1, 3, index],
    hasChildren: true,
  }
}

export default sammlungNodes
