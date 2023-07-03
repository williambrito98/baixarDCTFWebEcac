const { cnpj, cpf } = require('cpf-cnpj-validator')

module.exports = function (value) {
  if (cpf.isValid(value || cnpj.isValid(value))) return true
  return false
}
