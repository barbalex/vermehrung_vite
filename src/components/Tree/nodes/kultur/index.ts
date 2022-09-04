import { first as first$ } from 'rxjs/operators'

const kulturNodes = async ({ kultur, index }) => {
  let label = ''
  try {
    label = await kultur.label.pipe(first$()).toPromise()
  } catch {}

  return {
    nodeType: 'table',
    menuTitle: 'Kultur',
    table: 'kultur',
    id: kultur.id,
    label,
    url: ['Vermehrung', 'Kulturen', kultur.id],
    sort: [1, 5, index],
    hasChildren: true,
  }
}

export default kulturNodes
