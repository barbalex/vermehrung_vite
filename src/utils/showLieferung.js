const showLieferung = ({ userPersonOption, activeNodeArray }) =>
  // always show if url contains it
  userPersonOption?.tree_lieferung || activeNodeArray?.[0] === 'Lieferungen'

export default showLieferung
