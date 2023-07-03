const XLSX = require('xlsx')
const fs = require('fs')
const { extname, join } = require('path')

module.exports = function parseXLSXToJson (pathfile, sheetName) {
  // XLSX.set_fs(fs)
  const fileName = fs
    .readdirSync(pathfile)
    .find(
      (filename) =>
        extname(filename) === '.xlsx' || extname(filename) === '.xls'
    )
  const workbook = XLSX.readFile(join(pathfile, fileName))
  const clientes = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
  return clientes.map((item) => {
    if (item.CNPJ) {
      item.CNPJ = item.CNPJ.toString().padStart(14, '0')
    }

    if (item.RAZAO) {
      item.RAZAO = item.RAZAO.replace(/\/|\.|\\/gim, '')
    }
    return item
  })
}
