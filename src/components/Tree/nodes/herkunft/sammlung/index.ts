const herkunftSammlungNodes = async ({
  sammlung,
  sammlungIndex,
  herkunftId,
  herkunftIndex,
}) => {
  const label = await sammlung.labelUnderHerkunft?.()

  return {
    nodeType: 'table',
    menuTitle: 'Sammlung',
    table: 'sammlung',
    id: `${herkunftId}${sammlung.id}`,
    label,
    url: ['Vermehrung', 'Herkuenfte', herkunftId, 'Sammlungen', sammlung.id],
    sort: [1, 2, herkunftIndex, 2, sammlungIndex],
    hasChildren: true,
  }
}

export default herkunftSammlungNodes
