import lieferungLabelFromLieferung from '../../../../../utils/lieferungLabelFromLieferung'

const kulturAuslieferungNodes = ({
  lieferung,
  lieferungIndex,
  kulturId,
  kulturIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'Aus-Lieferung',
  table: 'lieferung',
  id: `${kulturId}${lieferung.id}`,
  label: lieferungLabelFromLieferung({ lieferung }),
  url: ['Vermehrung', 'Kulturen', kulturId, 'Aus-Lieferungen', lieferung.id],
  sort: [1, 5, kulturIndex, 4, lieferungIndex],
  hasChildren: false,
  mono: true,
})

export default kulturAuslieferungNodes
