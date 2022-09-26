const zaehlungNodes = async ({ zaehlung, index, store }) => {
  const label = await zaehlung.label({ store })

  return {
    nodeType: 'table',
    menuTitle: 'Zählung',
    table: 'zaehlung',
    id: zaehlung.id,
    label,
    url: ['Vermehrung', 'Zaehlungen', zaehlung.id],
    sort: [1, 7, index],
    hasChildren: false,
    mono: true,
  }
}

export default zaehlungNodes
