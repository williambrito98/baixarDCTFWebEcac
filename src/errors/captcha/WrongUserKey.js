class WrongUserKey extends Error {
  constructor () {
    super('Wrong User Key')
    this.name = 'WrongUserKey'
  }
}

module.exports = WrongUserKey
