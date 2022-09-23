const removeMetadata = (d) => {
  delete d.__typename
  delete d._conflicts
  delete d._deleted
  delete d._depth
  delete d._rev
  delete d._parent_rev
  delete d._revisions

  return d
}

const removeMetadataFromDataset = (d) => {
  if (!d) return null
  console.log('removeMetadataFromDataset, d:', d)
  const datasetRaw = { ...d }
  const dataset = removeMetadata(datasetRaw)
  if (Object.keys(dataset).length) return dataset
  return null
}

export default removeMetadataFromDataset
