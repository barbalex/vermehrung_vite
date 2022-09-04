import lieferungLabelFromLieferung from '../../../../../../utils/lieferungLabelFromLieferung'

const herkunftSammlungAuslieferungNodes = ({
  lieferung,
  lieferungIndex,
  sammlungId,
  sammlungIndex,
  herkunftId,
  herkunftIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'Aus-Lieferung',
  table: 'lieferung',
  id: `${herkunftId}${sammlungId}${lieferung.id}`,
  label: lieferungLabelFromLieferung({ lieferung }),
  url: ['Vermehrung', 
    'Herkuenfte',
    herkunftId,
    'Sammlungen',
    sammlungId,
    'Aus-Lieferungen',
    lieferung.id,
  ],
  sort: [1, 2, herkunftIndex, 2, sammlungIndex, 1, lieferungIndex],
  hasChildren: false,
})

export default herkunftSammlungAuslieferungNodes
