import { first as first$ } from 'rxjs/operators'

const artSammlungNodes = async ({
  sammlung,
  sammlungIndex,
  artId,
  artIndex,
}) => {
  let label = ''
  try {
    label = await sammlung.label.pipe(first$()).toPromise()
  } catch {}

  return {
    nodeType: 'table',
    menuTitle: 'Sammlung',
    table: 'sammlung',
    id: `${artId}${sammlung.id}`,
    label,
    url: ['Vermehrung', 'Arten', artId, 'Sammlungen', sammlung.id],
    hasChildren: true,
    sort: [1, 1, artIndex, 2, sammlungIndex],
  }
}

export default artSammlungNodes
