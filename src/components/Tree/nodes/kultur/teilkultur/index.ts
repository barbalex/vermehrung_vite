import teilkulturLabelFromTeilkultur from '../../../../../utils/teilkulturLabelFromTeilkultur'

const kulturTeilkulturNodes = ({
  teilkultur,
  teilkulturIndex,
  kulturId,
  kulturIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'Teilkultur',
  table: 'teilkultur',
  id: `${kulturId}${teilkultur.id}`,
  label: teilkulturLabelFromTeilkultur({ teilkultur }),
  url: ['Vermehrung', 'Kulturen', kulturId, 'Teilkulturen', teilkultur.id],
  sort: [1, 5, kulturIndex, 1, teilkulturIndex],
  hasChildren: false,
})

export default kulturTeilkulturNodes
