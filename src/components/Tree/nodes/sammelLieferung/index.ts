const sammelLieferungNodes = async ({ sammelLieferung, index }) => {
  const label = await sammelLieferung.label()

  return {
    nodeType: 'table',
    menuTitle: 'Sammel-Lieferung',
    table: 'sammel_lieferung',
    id: sammelLieferung.id,
    label,
    url: ['Vermehrung', 'Sammel-Lieferungen', sammelLieferung.id],
    sort: [1, 9, index],
    hasChildren: true,
    mono: true,
  }
}

export default sammelLieferungNodes
