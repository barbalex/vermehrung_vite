// converts true to 1, false to 0
// returns undefined or null as is
const booleanToInteger = (value) =>
  [undefined, null].includes(value) ? value : value === true ? 1 : 0

export default booleanToInteger
