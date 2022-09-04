import herkunftLabelFromHerkunft from '../../../../utils/herkunftLabelFromHerkunft'

const herkunftNodes = ({ herkunft, index }) => ({
  nodeType: 'table',
  menuTitle: 'Herkunft',
  table: 'herkunft',
  id: herkunft.id,
  label: herkunftLabelFromHerkunft({ herkunft }),
  url: ['Vermehrung', 'Herkuenfte', herkunft.id],
  sort: [1, 2, index],
  hasChildren: true,
})

export default herkunftNodes
