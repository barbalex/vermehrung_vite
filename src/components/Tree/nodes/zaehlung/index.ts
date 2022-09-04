import { first as first$ } from 'rxjs/operators'

const zaehlungNodes = async ({ zaehlung, index }) => {
  let label = ''
  try {
    label = await zaehlung.label.pipe(first$()).toPromise()
  } catch {}

  return {
    nodeType: 'table',
    menuTitle: 'Zählung',
    table: 'zaehlung',
    id: zaehlung.id,
    label,
    url: ['Vermehrung', 'Zaehlungen', zaehlung.id],
    sort: [1, 7, index],
    hasChildren: false,
    mono: true,
  }
}

export default zaehlungNodes
