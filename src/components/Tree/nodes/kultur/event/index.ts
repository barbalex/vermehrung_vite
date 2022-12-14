import eventLabelFromEvent from '../../../../../utils/eventLabelFromEvent'

const kulturEventNodes = ({ event, eventIndex, kulturId, kulturIndex }) => ({
  nodeType: 'table',
  menuTitle: 'Event',
  table: 'event',
  id: `${kulturId}${event.id}`,
  label: eventLabelFromEvent({ event }),
  url: ['Vermehrung', 'Kulturen', kulturId, 'Events', event.id],
  sort: [1, 5, kulturIndex, 5, eventIndex],
  hasChildren: false,
})

export default kulturEventNodes
