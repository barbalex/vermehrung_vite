import { first as first$ } from 'rxjs/operators'

const herkunftSammlungNodes = async ({
  sammlung,
  sammlungIndex,
  herkunftId,
  herkunftIndex,
}) => {
  let label = ''
  try {
    label = await sammlung.labelUnderHerkunft.pipe(first$()).toPromise()
  } catch {}

  return {
    nodeType: 'table',
    menuTitle: 'Sammlung',
    table: 'sammlung',
    id: `${herkunftId}${sammlung.id}`,
    label,
    url: ['Vermehrung', 'Herkuenfte', herkunftId, 'Sammlungen', sammlung.id],
    sort: [1, 2, herkunftIndex, 2, sammlungIndex],
    hasChildren: true,
  }
}

export default herkunftSammlungNodes
