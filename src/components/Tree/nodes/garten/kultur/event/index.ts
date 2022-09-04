import eventLabelFromEvent from '../../../../../../utils/eventLabelFromEvent'

const gartenKulturEventNodes = ({
  event,
  eventIndex,
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
}) => ({
  nodeType: 'table',
  menuTitle: 'Event',
  table: 'event',
  id: `${gartenId}${kulturId}${event.id}`,
  label: eventLabelFromEvent({ event }),
  url: ['Vermehrung', 'Gaerten', gartenId, 'Kulturen', kulturId, 'Events', event.id],
  sort: [1, 4, gartenIndex, 1, kulturIndex, 5, eventIndex],
  hasChildren: false,
})

export default gartenKulturEventNodes
