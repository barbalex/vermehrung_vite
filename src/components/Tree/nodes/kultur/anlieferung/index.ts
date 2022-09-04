import lieferungLabelFromLieferung from '../../../../../utils/lieferungLabelFromLieferung'

const kulturAnlieferungNodes = ({
  lieferung,
  lieferungIndex,
  kulturId,
  kulturIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'An-Lieferung',
  table: 'lieferung',
  id: `${kulturId}${lieferung.id}`,
  label: lieferungLabelFromLieferung({ lieferung }),
  url: ['Vermehrung', 'Kulturen', kulturId, 'An-Lieferungen', lieferung.id],
  sort: [1, 5, kulturIndex, 3, lieferungIndex],
  hasChildren: false,
  mono: true,
})

export default kulturAnlieferungNodes
