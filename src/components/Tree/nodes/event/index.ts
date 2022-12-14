import eventLabelFromEvent from '../../../../utils/eventLabelFromEvent'

const eventNodes = ({ event, index }) => ({
  nodeType: 'table',
  menuTitle: 'Event',
  table: 'event',
  id: event.id,
  label: eventLabelFromEvent({ event }),
  url: ['Vermehrung', 'Events', event.id],
  sort: [1, 10, index],
  hasChildren: false,
})
export default eventNodes
