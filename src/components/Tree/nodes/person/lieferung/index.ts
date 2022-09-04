import lieferungLabelFromLieferung from '../../../../../utils/lieferungLabelFromLieferung'

const personLieferungNodes = ({ lieferung, index, personId, personIndex }) => ({
  nodeType: 'table',
  menuTitle: 'Lieferung',
  table: 'lieferung',
  id: `${personId}${lieferung.id}`,
  label: lieferungLabelFromLieferung({ lieferung }),
  url: ['Vermehrung', 'Personen', personId, 'Lieferungen', lieferung.id],
  sort: [1, 11, personIndex, 3, index],
  hasChildren: false,
  mono: true,
})

export default personLieferungNodes
