const activeFormFromActiveNodeArray = (url) => {
  //console.log('acitveFormFromActiveNodeArray, url:', url.slice())
  if (url.length === 1) {
    return 'root'
  }
  if (url.length === 2 && url[1] === 'Arten') {
    return 'arten'
  }
  if (url.length === 2 && url[1] === 'Events') {
    return 'events'
  }
  if (url.length === 2 && url[1] === 'Gaerten') {
    return 'gaerten'
  }
  if (url.length === 2 && url[1] === 'Herkuenfte') {
    return 'herkuenfte'
  }
  if (url.length === 2 && url[1] === 'Kulturen') {
    return 'kulturen'
  }
  if (url.length === 2 && url[1] === 'Lieferungen') {
    return 'lieferungen'
  }
  if (url.length === 2 && url[1] === 'Personen') {
    return 'personen'
  }
  if (url.length === 2 && url[1] === 'Sammel-Lieferungen') {
    return 'sammelLieferungen'
  }
  if (url.length === 2 && url[1] === 'Sammlungen') {
    return 'sammlungen'
  }
  if (url.length === 2 && url[1] === 'Teilkulturen') {
    return 'teilkulturen'
  }
  if (url.length === 2 && url[1] === 'Zaehlungen') {
    return 'zaehlungen'
  }
  if (url.length === 2) {
    return null
  }

  if (url.length === 3 && url[1] === 'Arten') {
    return 'art'
  }
  if (url.length === 3 && url[1] === 'Gaerten') {
    return 'garten'
  }
  if (url.length === 3 && url[1] === 'Herkuenfte') {
    return 'herkunft'
  }
  if (url.length === 3 && url[1] === 'Lieferungen') {
    return 'lieferung'
  }
  if (url.length === 3 && url[1] === 'Sammel-Lieferungen') {
    return 'sammel_lieferung'
  }
  if (url.length === 3 && url[1] === 'Teilkulturen') {
    return 'teilkultur'
  }
  if (url.length === 3 && url[1] === 'Zaehlungen') {
    return 'zaehlung'
  }
  if (url.length === 3 && url[1] === 'Events') {
    return 'event'
  }
  if (url.length === 3 && url[1] === 'Personen') {
    return 'person'
  }
  if (url.length === 3 && url[1] === 'Sammlungen') {
    return 'sammlung'
  }
  if (url.length === 3 && url[1] === 'Kulturen') {
    return 'kultur'
  }

  if (
    url.length === 4 &&
    url[1] === 'Sammel-Lieferungen' &&
    url[3] === 'Lieferungen'
  ) {
    return 'lieferungen'
  }
  if (url.length === 4 && url[1] === 'Sammlungen' && url[3] === 'Herkuenfte') {
    return 'herkuenfte'
  }
  if (
    url.length === 4 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen'
  ) {
    return 'lieferungen'
  }
  if (url.length === 4 && url[1] === 'Arten' && url[3] === 'Kulturen') {
    return 'kulturen'
  }
  if (url.length === 4 && url[1] === 'Arten' && url[3] === 'Sammlungen') {
    return 'sammlungen'
  }
  if (url.length === 4 && url[1] === 'Arten' && url[3] === 'Herkuenfte') {
    return 'herkuenfte'
  }
  if (url.length === 4 && url[1] === 'Gaerten' && url[3] === 'Kulturen') {
    return 'kulturen'
  }
  if (url.length === 4 && url[1] === 'Herkuenfte' && url[3] === 'Sammlungen') {
    return 'sammlungen'
  }
  if (url.length === 4 && url[1] === 'Kulturen' && url[3] === 'Events') {
    return 'events'
  }
  if (
    url.length === 4 &&
    url[1] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[3])
  ) {
    return 'lieferungen'
  }
  if (url.length === 4 && url[1] === 'Kulturen' && url[3] === 'Teilkulturen') {
    return 'teilkulturen'
  }
  if (url.length === 4 && url[1] === 'Kulturen' && url[3] === 'Zaehlungen') {
    return 'zaehlungen'
  }
  if (url.length === 4 && url[1] === 'Personen' && url[3] === 'Gaerten') {
    return 'gaerten'
  }
  if (url.length === 4 && url[1] === 'Personen' && url[3] === 'Sammlungen') {
    return 'sammlungen'
  }
  if (url.length === 4 && url[1] === 'Personen' && url[3] === 'Lieferungen') {
    return 'lieferungen'
  }

  if (url.length === 5 && url[1] === 'Arten' && url[3] === 'Kulturen') {
    return 'kultur'
  }
  if (url.length === 5 && url[1] === 'Arten' && url[3] === 'Sammlungen') {
    return 'sammlung'
  }
  if (url.length === 5 && url[1] === 'Arten' && url[3] === 'Herkuenfte') {
    return 'herkunft'
  }
  if (url.length === 5 && url[1] === 'Gaerten' && url[3] === 'Kulturen') {
    return 'kultur'
  }
  if (url.length === 5 && url[1] === 'Herkuenfte' && url[3] === 'Sammlungen') {
    return 'sammlung'
  }
  if (url.length === 5 && url[1] === 'Personen' && url[3] === 'Gaerten') {
    return 'garten'
  }
  if (url.length === 5 && url[1] === 'Personen' && url[3] === 'Sammlungen') {
    return 'sammlung'
  }
  if (url.length === 5 && url[1] === 'Sammlungen' && url[3] === 'Herkuenfte') {
    return 'herkunft'
  }
  if (url.length === 5 && url[1] === 'Sammlungen' && url[3] === 'Kulturen') {
    return 'kultur'
  }
  if (
    url.length === 5 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen'
  ) {
    return 'lieferung'
  }
  if (
    url.length === 5 &&
    url[1] === 'Sammel-Lieferungen' &&
    url[3] === 'Lieferungen'
  ) {
    return 'lieferung'
  }
  if (url.length === 5 && url[1] === 'Kulturen' && url[3] === 'Zaehlungen') {
    return 'zaehlung'
  }
  if (
    url.length === 5 &&
    url[1] === 'Kulturen' &&
    url[3] === 'An-Lieferungen'
  ) {
    return 'lieferung'
  }
  if (
    url.length === 5 &&
    url[1] === 'Kulturen' &&
    url[3] === 'Aus-Lieferungen'
  ) {
    return 'lieferung'
  }
  if (url.length === 5 && url[1] === 'Kulturen' && url[3] === 'Events') {
    return 'event'
  }
  if (url.length === 5 && url[1] === 'Kulturen' && url[3] === 'Teilkulturen') {
    return 'teilkultur'
  }
  if (url.length === 5 && url[1] === 'Personen' && url[3] === 'Lieferungen') {
    return 'lieferung'
  }

  if (
    url.length === 6 &&
    url[1] === 'Arten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Events'
  ) {
    return 'events'
  }
  if (
    url.length === 6 &&
    url[1] === 'Arten' &&
    url[3] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[5])
  ) {
    return 'lieferungen'
  }
  if (
    url.length === 6 &&
    url[1] === 'Arten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Teilkulturen'
  ) {
    return 'teilkulturen'
  }
  if (
    url.length === 6 &&
    url[1] === 'Arten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Zaehlungen'
  ) {
    return 'zaehlungen'
  }
  if (url.length === 6 && url[1] === 'Arten' && url[3] === 'Kulturen') {
    return 'kultur'
  }
  if (
    url.length === 6 &&
    url[1] === 'Gaerten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Events'
  ) {
    return 'events'
  }
  if (
    url.length === 6 &&
    url[1] === 'Gaerten' &&
    url[3] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[5])
  ) {
    return 'lieferungen'
  }
  if (
    url.length === 6 &&
    url[1] === 'Gaerten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Teilkulturen'
  ) {
    return 'teilkulturen'
  }
  if (
    url.length === 6 &&
    url[1] === 'Gaerten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Zaehlungen'
  ) {
    return 'zaehlungen'
  }
  if (url.length === 6 && url[1] === 'Gaerten' && url[3] === 'Kulturen') {
    return 'kultur'
  }
  if (
    url.length === 6 &&
    url[1] === 'Arten' &&
    url[3] === 'Sammlungen' &&
    url[5] === 'Aus-Lieferungen'
  ) {
    return 'lieferungen'
  }
  if (
    url.length === 6 &&
    url[1] === 'Herkuenfte' &&
    url[3] === 'Sammlungen' &&
    url[5] === 'Aus-Lieferungen'
  ) {
    return 'lieferungen'
  }
  if (
    url.length === 6 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen'
  ) {
    return 'kulturen'
  }
  if (
    url.length === 6 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen'
  ) {
    return 'lieferung'
  }
  if (
    url.length === 7 &&
    url[1] === 'Arten' &&
    url[3] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[5])
  ) {
    return 'lieferung'
  }
  if (
    url.length === 7 &&
    url[1] === 'Arten' &&
    url[3] === 'Sammlungen' &&
    url[5] === 'Aus-Lieferungen'
  ) {
    return 'lieferung'
  }
  if (
    url.length === 7 &&
    url[1] === 'Arten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Zaehlungen'
  ) {
    return 'zaehlung'
  }
  if (
    url.length === 7 &&
    url[1] === 'Arten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Events'
  ) {
    return 'event'
  }
  if (
    url.length === 7 &&
    url[1] === 'Arten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Teilkulturen'
  ) {
    return 'teilkultur'
  }
  if (
    url.length === 7 &&
    url[1] === 'Gaerten' &&
    url[3] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[5])
  ) {
    return 'lieferung'
  }
  if (
    url.length === 7 &&
    url[1] === 'Gaerten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Zaehlungen'
  ) {
    return 'zaehlung'
  }
  if (
    url.length === 7 &&
    url[1] === 'Gaerten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Events'
  ) {
    return 'event'
  }
  if (
    url.length === 7 &&
    url[1] === 'Gaerten' &&
    url[3] === 'Kulturen' &&
    url[5] === 'Teilkulturen'
  ) {
    return 'teilkultur'
  }
  if (
    url.length === 7 &&
    url[1] === 'Herkuenfte' &&
    url[3] === 'Sammlungen' &&
    url[5] === 'Aus-Lieferungen'
  ) {
    return 'lieferung'
  }
  if (
    url.length === 7 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen'
  ) {
    return 'kultur'
  }
  if (
    url.length === 7 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen'
  ) {
    return 'kultur'
  }

  if (
    url.length === 8 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Events'
  ) {
    return 'events'
  }
  if (
    url.length === 8 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[7])
  ) {
    return 'lieferungen'
  }
  if (
    url.length === 8 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Teilkulturen'
  ) {
    return 'teilkulturen'
  }
  if (
    url.length === 8 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Zaehlungen'
  ) {
    return 'zaehlungen'
  }
  if (
    url.length === 8 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Events'
  ) {
    return 'events'
  }
  if (
    url.length === 8 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[7])
  ) {
    return 'lieferungen'
  }
  if (
    url.length === 8 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Teilkulturen'
  ) {
    return 'teilkulturen'
  }
  if (
    url.length === 8 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Zaehlungen'
  ) {
    return 'zaehlungen'
  }
  if (
    url.length === 8 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen'
  ) {
    return 'kultur'
  }

  if (
    url.length === 9 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[7])
  ) {
    return 'lieferung'
  }
  if (
    url.length === 9 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Zaehlungen'
  ) {
    return 'zaehlung'
  }
  if (
    url.length === 9 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Events'
  ) {
    return 'event'
  }
  if (
    url.length === 9 &&
    url[1] === 'Personen' &&
    url[3] === 'Gaerten' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Teilkulturen'
  ) {
    return 'teilkultur'
  }
  if (
    url.length === 9 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen' &&
    ['An-Lieferungen', 'Aus-Lieferungen'].includes(url[7])
  ) {
    return 'lieferung'
  }
  if (
    url.length === 9 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Zaehlungen'
  ) {
    return 'zaehlung'
  }
  if (
    url.length === 9 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Events'
  ) {
    return 'event'
  }
  if (
    url.length === 9 &&
    url[1] === 'Sammlungen' &&
    url[3] === 'Aus-Lieferungen' &&
    url[5] === 'Kulturen' &&
    url[7] === 'Teilkulturen'
  ) {
    return 'teilkultur'
  }
  return null
}

export default activeFormFromActiveNodeArray
