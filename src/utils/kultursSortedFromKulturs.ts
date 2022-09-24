import sortBy from 'lodash/sortBy'

import gartenLabelFromGarten from './gartenLabelFromGarten'
import { Kultur } from '../dexieClient'

const kultursSortedFromKulturs = async (kulturs) => {
  const kulturSorters = await Promise.all(
    kulturs.map(async (kultur: Kultur) => {
      const art = await kultur.art()
      const artLabel = await art?.label()
      const herkunft = await kultur.herkunft()
      const herkunftNr = herkunft?.nr
      const herkunftGemeinde = herkunft?.gemeinde
      const herkunftLokalname = herkunft?.lokalname
      const garten = await kultur.garten()
      const gartenPerson = await kultur.gartenPerson()
      const gartenLabel = await gartenLabelFromGarten({
        garten,
        person: gartenPerson,
        kein: 'kein Garten',
      })
      const sort = [
        artLabel?.toString()?.toLowerCase(),
        herkunftNr?.toString()?.toLowerCase(),
        herkunftGemeinde?.toString()?.toLowerCase(),
        herkunftLokalname?.toString()?.toLowerCase(),
        gartenLabel?.toString()?.toLowerCase(),
      ]

      return { id: kultur.id, sort }
    }),
  )
  const kultursSorted = sortBy(
    kulturs,
    (kultur) => kulturSorters.find((s) => s.id === kultur.id).sort,
  )
  return kultursSorted
}

export default kultursSortedFromKulturs
