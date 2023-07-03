class SemBotaoDeEmitirRecibo extends Error {
  constructor (error) {
    super(error)
    this.name = 'SemBotaoDeEmitirRecibo'
    this.message = error
  }
}

module.exports = SemBotaoDeEmitirRecibo
