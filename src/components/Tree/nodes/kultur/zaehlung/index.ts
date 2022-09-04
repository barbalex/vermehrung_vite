import { first as first$ } from 'rxjs/operators'

const kulturZaehlungNodes = async ({
  zaehlung,
  zaehlungIndex,
  kulturId,
  kulturIndex,
}) => {
  let label = ''
  try {
    label = await zaehlung.label.pipe(first$()).toPromise()
  } catch {}

  return {
    nodeType: 'table',
    menuTitle: 'Zählung',
    table: 'zaehlung',
    id: `${kulturId}${zaehlung.id}`,
    label,
    url: ['Vermehrung', 'Kulturen', kulturId, 'Zaehlungen', zaehlung.id],
    sort: [1, 5, kulturIndex, 2, zaehlungIndex],
    hasChildren: false,
    mono: true,
  }
}

export default kulturZaehlungNodes
