import sortBy from 'lodash/sortBy'

import personFullname from './personFullname'

const sammlungsSortedFromSammlungs = async (sammlungs) => {
  const sammlungSorters = await Promise.all(
    sammlungs.map(async (sammlung) => {
      const datum = sammlung?.datum ?? ''
      const herkunft = await sammlung.herkunft?.()
      const herkunftNr = herkunft?.nr
      const herkunftGemeinde = herkunft?.gemeinde
      const herkunftLokalname = herkunft?.lokalname
      const person = await sammlung?.person?.()
      const fullname = personFullname(person)
      const art = await sammlung.art?.()
      const artLabel = await art?.label?.()
      const sort = [
        datum,
        herkunftNr?.toString()?.toLowerCase(),
        herkunftGemeinde?.toString()?.toLowerCase(),
        herkunftLokalname?.toString()?.toLowerCase(),
        fullname?.toString()?.toLowerCase(),
        artLabel?.toString()?.toLowerCase(),
      ]

      return { id: sammlung.id, sort }
    }),
  )
  const sammlungsSorted = sortBy(
    sammlungs,
    (sammlung) => sammlungSorters.find((s) => s.id === sammlung.id).sort,
  )
  return sammlungsSorted
}

export default sammlungsSortedFromSammlungs
