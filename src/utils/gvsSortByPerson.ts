import sortBy from 'lodash/sortBy'

const gvsSortByPerson = async (gvs) => {
  const gvsIdLabel = await Promise.all(
    gvs.map(async (gv) => {
      const label = await gv.personLabel?.()

      return {
        id: gv.id,
        label,
      }
    }),
  )
  return sortBy(gvs, (gv) => gvsIdLabel.find((o) => o.id === gv.id).label)
}

export default gvsSortByPerson
