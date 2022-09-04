import lieferungLabelFromLieferung from '../../../../../utils/lieferungLabelFromLieferung'

const sammelLieferungLieferungNodes = ({
  lieferung,
  lieferungIndex,
  sammelLieferungId,
  sammelLieferungIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'Lieferung',
  table: 'lieferung',
  id: `${sammelLieferungId}${lieferung.id}`,
  label: lieferungLabelFromLieferung({ lieferung }),
  url: ['Vermehrung', 'Sammel-Lieferungen', sammelLieferungId, 'Lieferungen', lieferung.id],
  sort: [1, 9, sammelLieferungIndex, 3, lieferungIndex],
  hasChildren: false,
  mono: true,
})

export default sammelLieferungLieferungNodes
