import sortBy from 'lodash/sortBy'

const gvsSortByGarten = async (gvs) => {
  const gvsIdLabel = await Promise.all(
    gvs.map(async (gv) => {
      const label = await gv.gartenLabel?.()

      return {
        id: gv.id,
        label,
      }
    }),
  )
  return sortBy(gvs, (gv) => gvsIdLabel.find((o) => o.id === gv.id).label)
}

export default gvsSortByGarten
