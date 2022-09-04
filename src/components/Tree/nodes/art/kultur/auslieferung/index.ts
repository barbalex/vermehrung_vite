import lieferungLabelFromLieferung from '../../../../../../utils/lieferungLabelFromLieferung'

const artKulturAuslieferungNodes = ({
  lieferung,
  lieferungIndex,
  kulturId,
  kulturIndex,
  artId,
  artIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'Auslieferung',
  table: 'lieferung',
  id: `${artId}${kulturId}${lieferung.id}`,
  label: lieferungLabelFromLieferung({ lieferung }),
  url: ['Vermehrung', 'Arten', artId, 'Kulturen', kulturId, 'Aus-Lieferungen', lieferung.id],
  sort: [1, 1, artIndex, 3, kulturIndex, 4, lieferungIndex],
  hasChildren: false,
  mono: true,
})
export default artKulturAuslieferungNodes
