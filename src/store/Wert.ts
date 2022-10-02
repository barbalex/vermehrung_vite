import { types } from 'mobx-state-tree'

export default types.model('Wert', {
  value: types.maybeNull(types.string, null),
  label: types.maybeNull(types.string, null),
})
