const personGartenKulturAnlieferungFolder = ({
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
  personId,
  personIndex,
  count,
}) => ({
  nodeType: 'folder',
  menuTitle: 'An-Lieferungen',
  id: `${personId}${gartenId}${kulturId}AnLieferungFolder`,
  label: `An-Lieferungen (${count})`,
  url: ['Vermehrung', 
    'Personen',
    personId,
    'Gaerten',
    gartenId,
    'Kulturen',
    kulturId,
    'An-Lieferungen',
  ],
  sort: [1, 11, personIndex, 2, gartenIndex, 1, kulturIndex, 3],
  hasChildren: true,
  childrenCount: count,
})

export default personGartenKulturAnlieferungFolder
