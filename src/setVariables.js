const { existsSync, rmSync, mkdirSync } = require('fs')
const { join } = require('path')

module.exports = (rootDir) => {
  const pathEntrada = join(rootDir, 'entrada')
  const pathTemp = join(rootDir, 'temp')
  const pathSaida = join(rootDir, 'saida')

  createDir(pathEntrada)
  createDir(pathTemp)
  createDir(pathSaida)

  global.pathEntrada = pathEntrada
  global.pathTemp = pathTemp
  global.pathSaida = pathSaida
}

function createDir (directory) {
  if (existsSync(directory)) {
    // rmSync(directory, { recursive: true, force: true })
    // mkdirSync(directory)
  } else {
    mkdirSync(directory)
  }
}
