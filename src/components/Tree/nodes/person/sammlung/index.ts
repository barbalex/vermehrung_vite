import { first as first$ } from 'rxjs/operators'

const personSammlungNodes = async ({
  sammlung,
  index,
  personId,
  personIndex,
}) => {
  let label = ''
  try {
    label = await sammlung.label.pipe(first$()).toPromise()
  } catch {}

  return {
    nodeType: 'table',
    menuTitle: 'Sammlung',
    table: 'sammlung',
    id: `${personId}${sammlung.id}`,
    label,
    url: ['Vermehrung', 'Personen', personId, 'Sammlungen', sammlung.id],
    sort: [1, 11, personIndex, 1, index],
    hasChildren: false,
  }
}

export default personSammlungNodes
