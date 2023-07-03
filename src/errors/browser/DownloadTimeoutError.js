class DownloadTimeoutError extends Error {
  constructor (error) {
    super(error)
    this.name = 'DownloadTimeoutError'
    this.message = error
  }
}

module.exports = DownloadTimeoutError
