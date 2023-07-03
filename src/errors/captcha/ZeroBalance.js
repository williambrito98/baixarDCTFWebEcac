class ZeroBalance extends Error {
  constructor () {
    super('Zero Balance')
    this.name = 'ZeroBalance'
  }
}
module.exports = ZeroBalance
