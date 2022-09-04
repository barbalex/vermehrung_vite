import teilkulturLabelFromTeilkultur from '../../../../../../utils/teilkulturLabelFromTeilkultur'

const gartenKulturTeilkulturNodes = ({
  teilkultur,
  teilkulturIndex,
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'Teilkultur',
  table: 'teilkultur',
  id: `${gartenId}${kulturId}${teilkultur.id}`,
  label: teilkulturLabelFromTeilkultur({ teilkultur }),
  url: ['Vermehrung', 
    'Gaerten',
    gartenId,
    'Kulturen',
    kulturId,
    'Teilkulturen',
    teilkultur.id,
  ],
  sort: [1, 4, gartenIndex, 1, kulturIndex, 1, teilkulturIndex],
  hasChildren: false,
})

export default gartenKulturTeilkulturNodes
