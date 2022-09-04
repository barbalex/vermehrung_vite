import lieferungLabelFromLieferung from '../../../../utils/lieferungLabelFromLieferung'

const lieferungNodes = ({ lieferung, index }) => ({
  nodeType: 'table',
  menuTitle: 'Lieferung',
  table: 'lieferung',
  id: lieferung.id,
  label: lieferungLabelFromLieferung({ lieferung }),
  url: ['Vermehrung', 'Lieferungen', lieferung.id],
  sort: [1, 8, index],
  hasChildren: false,
  mono: true,
})

export default lieferungNodes
