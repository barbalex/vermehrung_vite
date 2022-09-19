import sortBy from 'lodash/sortBy'

const avsSortByPerson = async (avs) => {
  const avsIdLabel = await Promise.all(
    avs.map(async (av) => {
      const label = await av.personLabel?.()

      return {
        id: av.id,
        label,
      }
    }),
  )
  return sortBy(avs, (av) => avsIdLabel.find((o) => o.id === av.id).label)
}

export default avsSortByPerson
