import sortBy from 'lodash/sortBy'

const teilzaehlungsSortByZaehlungTk = async (tzs) => {
  const tzsIdLabel = await Promise.all(
    tzs.map(async (tz) => {
      let zaehlung
      try {
        zaehlung = 'TODO: dexie'
        // await tz.zaehlung.observe().pipe(first$()).toPromise()
      } catch {}
      const zaehlungDatum = zaehlung?.datum ?? ''
      const label = await tz.label?.()

      return {
        id: tz.id,
        sort: [zaehlungDatum, label ?? ''],
      }
    }),
  )
  return sortBy(tzs, (tz) => tzsIdLabel.find((o) => o.id === tz.id).sort)
}

export default teilzaehlungsSortByZaehlungTk
