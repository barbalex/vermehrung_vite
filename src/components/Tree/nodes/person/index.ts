import personLabelFromPerson from '../../../../utils/personLabelFromPerson'

const personNodes = ({ person, index }) => ({
  nodeType: 'table',
  menuTitle: 'Person',
  table: 'person',
  id: person.id,
  label: personLabelFromPerson({ person }),
  url: ['Vermehrung', 'Personen', person.id],
  sort: [1, 11, index],
  hasChildren: true,
})

export default personNodes
