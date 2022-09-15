const zaehlungNodes = async ({ zaehlung, index }) => {
  const label = await zaehlung.label()

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
