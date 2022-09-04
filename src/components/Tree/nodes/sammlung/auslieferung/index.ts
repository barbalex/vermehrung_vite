import lieferungLabelFromLieferung from '../../../../../utils/lieferungLabelFromLieferung'

const sammlungAuslieferungNodes = ({
  lieferung,
  lieferungIndex,
  sammlungId,
  sammlungIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'Aus-Lieferung',
  table: 'lieferung',
  id: `${sammlungId}${lieferung.id}`,
  label: lieferungLabelFromLieferung({ lieferung: lieferung }),
  url: ['Vermehrung', 'Sammlungen', sammlungId, 'Aus-Lieferungen', lieferung.id],
  sort: [1, 3, sammlungIndex, 3, lieferungIndex],
  hasChildren: false,
  mono: true,
})
export default sammlungAuslieferungNodes
