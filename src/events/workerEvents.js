const { parentPort } = require('worker_threads')
/**
 *
 * @param events {string[]}
 * @param callback {Function}
 */
module.exports = function (events, callback) {
  parentPort.on('message', async (message) => {
    if (message === 'close') {
      if (events.inclues('close')) await callback()
      process.exit()
    }
  })
}
