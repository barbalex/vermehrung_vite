import { first as first$ } from 'rxjs/operators'

const sammlungNodes = async ({ sammlung, index }) => {
  let label = ''
  try {
    label = await sammlung.label.pipe(first$()).toPromise()
  } catch {}

  return {
    nodeType: 'table',
    menuTitle: 'Sammlung',
    table: 'sammlung',
    id: sammlung.id,
    label,
    url: ['Vermehrung', 'Sammlungen', sammlung.id],
    sort: [1, 3, index],
    hasChildren: true,
  }
}

export default sammlungNodes
