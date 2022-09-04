const personGartenKulturTeilkulturFolder = ({
  kulturId,
  kulturIndex,
  gartenId,
  gartenIndex,
  personId,
  personIndex,
  count,
}) => ({
  nodeType: 'folder',
  menuTitle: 'Teilkulturen',
  id: `${personId}${gartenId}${kulturId}TeilkulturFolder`,
  label: `Teilkulturen (${count})`,
  url: ['Vermehrung', 
    'Personen',
    personId,
    'Gaerten',
    gartenId,
    'Kulturen',
    kulturId,
    'Teilkulturen',
  ],
  sort: [1, 11, personIndex, 2, gartenIndex, 1, kulturIndex, 1],
  hasChildren: true,
  childrenCount: count,
})

export default personGartenKulturTeilkulturFolder
