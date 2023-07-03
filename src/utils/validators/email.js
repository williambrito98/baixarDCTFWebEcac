const { isEmail } = require('validator').default
module.exports = function (value) {
  if (isEmail(value)) return true
  return false
}
