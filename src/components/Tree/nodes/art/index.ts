import { first as first$ } from 'rxjs/operators'

const artNodes = async ({ art, index }) => {
  let label = ''
  try {
    label = await art.label.pipe(first$()).toPromise()
  } catch {}

  return {
    nodeType: 'table',
    menuTitle: 'Art',
    table: 'art',
    id: art.id,
    label,
    url: ['Vermehrung', 'Arten', art.id],
    sort: [1, 1, index],
    hasChildren: true,
  }
}

export default artNodes
